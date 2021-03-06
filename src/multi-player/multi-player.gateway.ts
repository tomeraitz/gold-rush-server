import { Logger } from '@nestjs/common';
import {
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GoldRushGameController } from '../gold-rush-game/gold-rush-game.controller';

@WebSocketGateway({ namespace: '/multiPlayer' })
export class MultiPlayerGateway implements OnGatewayInit {
  constructor(
    private readonly goldRushGameController: GoldRushGameController,
  ) {}
  private logger: Logger = new Logger('multiPlayer');
  @WebSocketServer() wss: Server;

  afterInit() {
    this.logger.log('Init');
  }

  handleDisconnect(client: Socket) {
    const id = client.id.split('#')[1];
    this.logger.log(`${id} disconnected`);
    const room = this.findRoom(client.roomId);
    this.sedToRoom(`${client.roomId}`, { userLeft: true });
    if (room) room.userLeft = true;
  }

  handleConnection(client: Socket) {
    const id = client.id.split('#')[1];
    this.logger.log(`${id} connoted`);
    client.emit('messageToClient', { connected: true });
  }

  findRoom(id: string): any {
    return this.wss.adapter.rooms[id];
  }

  sedToRoom(roomId: string, message: any) {
    this.wss.to(roomId).emit('messageToClient', message);
  }

  @SubscribeMessage('messageToServer')
  async getFromClient(
    socket: Socket,
    message: {
      funcName: string;
      player?: string;
      endGameStatus?: string;
      id: number;
    },
  ) {
    const expression = message.funcName.includes('move')
      ? 'move'
      : message.funcName;
    switch (expression) {
      case 'join':
        if (!message.id) return;
        else {
          const roomJoin = this.wss.adapter.rooms[`${message.id}`];
          let error = false;
          if (!roomJoin) error = false;
          else if (roomJoin && roomJoin.length < 2) error = false;
          else error = true;
          if (!error) {
            socket.roomId = `${message.id}`;
            socket.join(`${message.id}`);
            this.sedToRoom(`${socket.roomId}`, {
              room: message.id,
              canPlay: this.wss.adapter.rooms[`${message.id}`].length > 1,
            });
          } else {
            socket.emit('messageToClient', {
              error: 'too many users in the room',
            });
          }
        }
        break;
      case 'readyToPlay':
        const roomPaly = this.wss.adapter.rooms[`${socket.roomId}`];
        if (roomPaly.userLeft) {
          this.sedToRoom(`${socket.roomId}`, { userLeft: true });
          return;
        }
        if (!roomPaly.readyToPlay) {
          roomPaly.readyToPlay = 1;
        } else {
          roomPaly.readyToPlay = 2;
        }
        if (roomPaly.readyToPlay === 2) {
          delete roomPaly.readyToPlay;
          const statePlay = await this.goldRushGameController.startGameMultiGame(
            roomPaly,
          );
          this.sedToRoom(`${socket.roomId}`, statePlay);
        }
        break;
      case 'move':
        const roomMove = this.wss.adapter.rooms[`${socket.roomId}`];
        if (roomMove.userLeft) {
          this.sedToRoom(`${socket.roomId}`, { userLeft: true });
          return;
        }
        const socketObject = { func: null, client: roomMove };
        const stateMove = this.goldRushGameController.playerMove(
          socketObject,
          message.funcName,
          message.player,
        );
        if (!stateMove.endGameStatus)
          this.sedToRoom(`${socket.roomId}`, stateMove);
        else {
          Object.keys(roomMove.sockets).forEach((socketId, index) => {
            if (index > 0) {
              if (stateMove.endGameStatus.includes('won'))
                stateMove.endGameStatus = 'you lost!';
              else if (stateMove.endGameStatus.includes('lost'))
                stateMove.endGameStatus = 'you won!';
            }
            this.wss.to(socketId).emit('messageToClient', stateMove);
          });
        }

      default:
        break;
    }
  }
}
