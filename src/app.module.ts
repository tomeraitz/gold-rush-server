import { Module } from '@nestjs/common';
import { SinglePlayerGateway } from './single-player/single-player.gateway';
import { SinglePlayerModule } from './single-player/single-player.module';
import { GoldRushGameService } from './gold-rush-game/gold-rush-game.service';
import { AppController } from './app.controller';

@Module({
  imports: [SinglePlayerModule],
  controllers: [AppController],
  providers: [SinglePlayerGateway, GoldRushGameService],
})
export class AppModule {}
