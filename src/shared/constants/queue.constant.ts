export const PAYMENT_QUEUE_NAME = 'payment'
export const CANCEL_PAYMENT_JOB_NAME = 'cancel-payment'
export const generateCancelPaymentJobId = (paymentId: number) => {
  return `paymentId-${paymentId}`
}