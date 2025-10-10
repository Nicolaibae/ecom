import { Injectable } from '@nestjs/common'
import { PaymentRepo } from 'src/routes/payment/payment.repo'
import { WebhookPaymentBodyType } from 'src/routes/payment/payment.model'
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server } from 'socket.io'
import { SharedWebsocketRepository } from 'src/shared/repositories/share-websocket.repo'
import { tryCatch } from 'bullmq'
import { generateRoomUserId } from 'src/shared/helper'



@WebSocketGateway({ namespace: 'payment' })
@Injectable()
export class PaymentService {
   @WebSocketServer()
  server: Server
  constructor(private readonly paymentRepo: PaymentRepo,
     private readonly sharedWebsocketRepository: SharedWebsocketRepository,

  ) {}

   async receiver(body: WebhookPaymentBodyType) {
    const userId = await this.paymentRepo.receiver(body)
     this.server.to(generateRoomUserId(userId)).emit('payment', {
      status: 'success',
    })
   
    // try {
    //   const websocket =  await this.sharedWebsocketRepository.findMany(userId)
    //   websocket.forEach((ws)=>{
    //     this.server.to(ws.id).emit('payment', {
    //       status: 'success',
    //     })
    //   })
    // } catch (error) {
    //    console.log(error)
    // }
     return {
      message: 'Payment received successfully',
    }
  }
}