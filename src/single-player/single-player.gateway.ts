import { Logger } from '@nestjs/common';
import {
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GoldRushGameController } from '../gold-rush-game/gold-rush-game.controller';

@WebSocketGateway({ namespace: '/singlePlayer' })
export class SinglePlayerGateway implements OnGatewayInit {
  constructor(
    private readonly goldRushGameController: GoldRushGameController,
  ) {}
  private logger: Logger = new Logger('singlePlayer');
  @WebSocketServer() wss: Server;

  afterInit() {
    this.logger.log('Init');
  }

  handleDisconnect(client: Socket) {
    const id = client.id.split('#')[1];
    this.logger.log(`${id} disconnected`);
    this.goldRushGameController.StopGameEngine({ client });
  }

  handleConnection(client: Socket) {
    const id = client.id.split('#')[1];
    this.logger.log(`${id} connoted`);
    this.goldRushGameController.startGame({
      func: this.sendClient.bind(this),
      client,
    });
  }

  // @SubscribeMessage('messageToServer')
  sendClient(client: Socket, message: string) {
    // this.logger.log(message);
    message['level'] = client.level;
    client.emit('messageToClient', message);
  }

  @SubscribeMessage('messageToServer')
  getFromClient(
    client: Socket,
    message: { funcName: string; player: string; endGameStatus: string },
  ) {
    const socketObject = { func: this.sendClient.bind(this), client };
    if (message.funcName.includes('move'))
      this.goldRushGameController.playerMove(
        socketObject,
        message.funcName,
        message.player,
      );
    if (message.funcName === 'nextLevel') {
      if (!message.endGameStatus.includes('won')) client.level -= 1;
      this.goldRushGameController.startGame({
        func: this.sendClient.bind(this),
        client,
        isSpeedDecrease: message.endGameStatus.includes('won'),
      });
    }
  }
}
