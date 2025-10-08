import { Injectable } from "@nestjs/common";
import { PrismaService } from "../services/prisma.service";
import { OrderStatus } from "../constants/order.constant";
import { PaymentStatus } from "../constants/payment.constant";

@Injectable()
export class SharedPaymentRepository {
    constructor(private readonly prismaService: PrismaService) { }

    async cancelPaymentAndOrder(paymentId: number) {
        const payment = await this.prismaService.payment.findUnique({
            where: {
                id: paymentId
            },
            include: {
                orders: {
                    include: {
                        items: true
                    }
                }
            }
        })
        if (!payment) {
            throw Error('Payment not found')
        }
        const { orders } = payment
        const productSKUSnapshots = orders.map((order) => order.items).flat()
        await this.prismaService.$transaction(async (tx) => {
            const updateOrder$ = tx.order.updateMany({
                where: {
                    id: {
                        in: orders.map(order => order.id)
                    },
                    status: OrderStatus.PENDING_PAYMENT,
                    deletedAt: null
                },
                data: {
                    status: OrderStatus.CANCELLED
                }
            })
            const updateSkus$ = await Promise.all(
                // update quantiy tăng sau khi bị hủy thanh toán
                productSKUSnapshots.filter((sku) => sku.skuId)
                    .map((item) => {
                        tx.sKU.update({
                            where: {
                                id: item.skuId as number
                            },
                            data: {
                                stock: {
                                    increment: item.quantity
                                }
                            }
                        })
                    })
            )
            const updatePayment$ = tx.payment.updateMany({
                where: {
                    id: paymentId
                },
                data: {
                    status: PaymentStatus.FAILED
                }
            })
            return await Promise.all([updateOrder$, updateSkus$, updatePayment$])
        })



    }
}