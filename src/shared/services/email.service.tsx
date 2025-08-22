import { Injectable } from "@nestjs/common";
import { Resend } from "resend";
import envConfig from "../config";
import fs from 'fs'
import path from "path";
import {OTPEmail} from "emails/otp"
import * as React from "react";
// const otpTemplate = fs.readFileSync(path.resolve('src/shared/email-templates/otp.html'), {
//    encoding: "utf-8"
// })

@Injectable()
export class EmailService {
   private resend: Resend
   constructor() {
      this.resend = new Resend(envConfig.RESEND_API_KEY)
   }
   sendOtp(payload: { email: string, code: string }) {

      const subject = 'Mã OTP'
      return this.resend.emails.send({
         from: 'Nestjs Ecommerce <No-reply@thaivinh.io.vn>',
         to: [payload.email],
         subject,
         react: <OTPEmail otpCode={payload.code} title={subject} />,
         // html: otpTemplate.replaceAll('{{subject}}', subject).replaceAll('{{code}}', payload.code),
      });
   }
}