import { Controller, Post, Body } from '@nestjs/common'
import { PaymentService } from './payment.service'

import { ZodResponse, ZodSerializerDto } from 'nestjs-zod'
import { IsPublic } from 'src/shared/decorators/auth.decorator'

import { MessageResDTO } from 'src/shared/dtos/reponse.dto'
import { WebhookPaymentBodyDTO } from './payment.dto'

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('/receiver')
  @ZodResponse({type:MessageResDTO})
  @IsPublic()
  receiver(@Body() body: WebhookPaymentBodyDTO) {
    return this.paymentService.receiver(body)
  }
}