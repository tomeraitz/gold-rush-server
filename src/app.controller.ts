import { Controller, Get, Param } from '@nestjs/common';

@Controller()
export class AppController {
  private roomId = 0;
  @Get()
  getHello(): { status: string } {
    return { status: 'I am live!' };
  }

  @Get('CreateRoom')
  CreateRoom(): { roomId: number; player: string } {
    this.roomId++;
    return { roomId: this.roomId, player: 'player1' };
  }

  @Get('joinRoom/:id')
  joinRoom(@Param('id') id): { roomId: number; player: string } {
    return { roomId: id, player: 'player2' };
  }
}
