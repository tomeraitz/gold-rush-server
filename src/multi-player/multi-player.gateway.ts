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
  }

  handleConnection(client: Socket) {
    const id = client.id.split('#')[1];
    this.logger.log(`${id} connoted`);
    client.emit('messageToClient', { connected: true });
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
    // this.logger.log(message);
    if (message.funcName === 'join') {
      if (!message.id) return;
      else {
        socket.roomId = `${message.id}`;
        socket.join(`${message.id}`);
        const room = this.wss.adapter.rooms[`${socket.roomId}`];
        socket.emit('messageToClient', {
          room: message.id,
          canPlay: room.length > 1,
        });
      }
    }
    const room = this.wss.adapter.rooms[`${socket.roomId}`];
    if (message.funcName === 'readyToPlay') {
      const state = await this.goldRushGameController.startGameMultiGame(room);
      this.sedToRoom(`${socket.roomId}`, state);
    }
    const socketObject = { func: null, client: room };
    if (message.funcName.includes('move')) {
      // this.logger.log(room);
      const state = this.goldRushGameController.playerMove(
        socketObject,
        message.funcName,
        message.player,
      );
      this.logger.log(state);
      this.sedToRoom(`${socket.roomId}`, state);
    }

    // if (message.funcName === 'nextLevel') {
    //   if (!message.endGameStatus.includes('won')) client.level -= 1;
    //   this.goldRushGameController.startGame({
    //     func: this.sedToRoom.bind(this),
    //     client,
    //     isSpeedDecrease: message.endGameStatus.includes('won'),
    //   });
    // }
  }
}
