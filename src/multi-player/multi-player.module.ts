import { Module } from '@nestjs/common';
import { GoldRushGameController } from '../gold-rush-game/gold-rush-game.controller';
import { GoldRushGameModule } from '../gold-rush-game/gold-rush-game.module';

@Module({
  imports: [GoldRushGameModule],
  providers: [GoldRushGameController],
  exports: [GoldRushGameController],
})
export class MultiPlayerModule {}
