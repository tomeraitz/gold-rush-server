import { Module } from '@nestjs/common';
import { SinglePlayerGateway } from './single-player/single-player.gateway';
import { SinglePlayerModule } from './single-player/single-player.module';
import { MultiPlayerGateway } from './multi-player/multi-player.gateway';
import { MultiPlayerModule } from './multi-player/multi-player.module';
import { GoldRushGameService } from './gold-rush-game/gold-rush-game.service';
import { AppController } from './app.controller';

@Module({
  imports: [SinglePlayerModule, MultiPlayerModule],
  controllers: [AppController],
  providers: [SinglePlayerGateway, GoldRushGameService, MultiPlayerGateway],
})
export class AppModule {}
