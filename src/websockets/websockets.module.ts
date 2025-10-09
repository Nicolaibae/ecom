import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { PaymentGateway } from './payment.gateway';
import { WebsocketAdapter } from './websocket.adapter';

@Module({
  controllers: [],
  providers: [ChatGateway,PaymentGateway]
})
export class WebsocketsModule {}
