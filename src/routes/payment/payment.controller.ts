import { Controller, Post, Body } from '@nestjs/common'
import { PaymentService } from './payment.service'
import { Auth } from 'src/shared/decorators/auth.decorator'
import { MessageResDTO } from 'src/shared/dtos/reponse.dto'
import { WebhookPaymentBodyDTO } from './payment.dto'
import { ZodResponse } from 'nestjs-zod'

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('/receiver')
  @ZodResponse({type:MessageResDTO})
  @Auth(['PaymentApiKey'])
  receiver(@Body() body: WebhookPaymentBodyDTO) {
   
    return this.paymentService.receiver(body)
  }
}