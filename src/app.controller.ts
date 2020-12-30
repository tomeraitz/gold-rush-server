import { Controller, Get, Param } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): { status: string } {
    return { status: 'I am live!' };
  }

  @Get('CreateRoom')
  CreateRoom(): { roomId: string; player: string } {
    return {
      roomId: Math.random().toString(36).substring(2),
      player: 'player1',
    };
  }

  @Get('joinRoom/:id')
  joinRoom(@Param('id') id): { roomId: string; player: string } {
    return { roomId: id, player: 'player2' };
  }
}
