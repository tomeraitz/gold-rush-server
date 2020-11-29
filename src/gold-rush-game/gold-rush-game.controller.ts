import { Controller } from '@nestjs/common';
import { GoldRushGameService } from './gold-rush-game.service';
import { Logger } from '@nestjs/common';

@Controller('gold-rush-game')
export class GoldRushGameController {
  private logger: Logger = new Logger('gold-rush-game-controller');
  constructor(private readonly goldRushGameService: GoldRushGameService) {}

  playerMove = (socketObject: any, moveDirection: string, player: string) => {
    const { func, client } = socketObject;
    if (client.endGame) return;
    const state = this.goldRushGameService[moveDirection](client.state, player);
    client.state = { ...state };
    func(client, client.state);
    if (this.goldRushGameService.checkIfGameEnded(client.state)) {
      client.endGame = true;
      this.StopGameEngine(socketObject);
      // eslint-disable-next-line prettier/prettier
      const endGameStatus = this.goldRushGameService.endGameStatus(client.state);
      func(client, endGameStatus);
    }
    return client.state;
  };

  async startGame(socketObject: any) {
    const { func, client, isSpeedDecrease } = socketObject;
    client.level = this.findLevel(client);
    client.endGame = false;
    const state = await this.goldRushGameService.initializeState(client.level);
    client.state = { ...state };
    func(client, client.state);
    if (client.gridPath) delete client.gridPath;
    await this.goldRushGameService.aStarMatrix(client);
    client.gameSpeed = client.gameSpeed
      ? client.gameSpeed > 300
        ? isSpeedDecrease
          ? client.gameSpeed - 20
          : client.gameSpeed
        : 200
      : 1000;
    client.gameInterval = setInterval(() => {
      this.startGameEngine(socketObject);
    }, client.gameSpeed);
    return client.state;
  }

  findLevel = (client: any) => (client.level ? client.level + 1 : 1);

  StopGameEngine(socketObject: any): any {
    const { client } = socketObject;
    if (client.endGame) {
      clearInterval(client.gameInterval);
      // For testing
      client.gameInterval = null;
      // setTimeout(() => {
      //   this.startGame(socketObject);
      // }, 200);
      return {};
    }
  }

  startGameEngine(socketObject: any): any {
    this.StopGameEngine(socketObject);
    const { client } = socketObject;
    // eslint-disable-next-line prettier/prettier
    const moveDirection = this.goldRushGameService.findPath(client);
    // this.logger.log(`moveDirection : ${moveDirection}`);
    this.playerMove(socketObject, moveDirection, 'player2');
  }
}
