import { Controller, Get, Body, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello() {
    return 'Hello ShopEzo API';
  }

  @Post()
  saveInfo(@Body() body: any): string {
    return {
      ...body
    };
  }
}
