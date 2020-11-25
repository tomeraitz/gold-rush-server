import { Module } from '@nestjs/common';
import { GoldRushGameService } from './gold-rush-game.service';
import { GoldRushGameController } from './gold-rush-game.controller';
import { GameEngineLogicService } from './game-engine-logic.service';

@Module({
  imports: [],
  controllers: [GoldRushGameController],
  providers: [GoldRushGameService, GameEngineLogicService],
  exports: [GoldRushGameService, GameEngineLogicService],
})
export class GoldRushGameModule {}
