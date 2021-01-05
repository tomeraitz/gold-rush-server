import { Controller, Get, Param } from '@nestjs/common';
import { MultiPlayerGateway } from './multi-player/multi-player.gateway';

@Controller()
export class AppController {
  constructor(private readonly multiPlayerGateway: MultiPlayerGateway) {}
  @Get()
  getHello(): { status: string } {
    return { status: 'I am live!' };
  }

  @Get('CreateRoom')
  CreateRoom(): { roomId: string; player: string } {
    return {
      roomId: (Math.random() + 1).toString(36).substring(2),
      player: 'player1',
    };
  }

  @Get('joinRoom/:id')
  joinRoom(
    @Param('id') id,
  ): { roomId?: string; player?: string; error?: string } {
    const room = this.multiPlayerGateway.findRoom(id);
    if (room && room.length < 2) {
      return { roomId: id, player: 'player2' };
    } else if (!room) {
      return { error: `id doesn't exist` };
    } else if (room.length === 2) {
      return { error: `The room is full` };
    }
  }
}
