import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/shared/services/prisma.service";
import { CreateOrderBodyType, CreateOrderResType, GetOrderListQueryType, GetOrderListResType } from "./order.model";
import { Prisma } from "@prisma/client";
import { NotFoundCartItemException, OutOfStockSKUException, ProductNotFoundException, SKUNotBelongToShopException } from "./order.error";

@Injectable()
export class OrderRepo {
    constructor(private readonly prismaService: PrismaService) { }
    async list(userId: number, query: GetOrderListQueryType): Promise<GetOrderListResType> {
        const { page, limit, status } = query
        const skip = (page - 1) * limit
        const take = limit
        const where: Prisma.OrderWhereInput = {
            userId,
            status
        }
        // Đếm tổng số order
        const totalItems$ = this.prismaService.order.count({ where })
        // Lấy list order
        const data$ = this.prismaService.order.findMany({
            where,
            include: {
                items: true
            },
            orderBy: {
                createdAt: "desc"
            }
        })
        const [data, totalItems] = await Promise.all([data$, totalItems$])
        return {
            data,
            page,
            limit,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
        }

    }
    async create(userId: number, body: CreateOrderBodyType): Promise<CreateOrderResType> {
        // 1. Kiểm tra xem tất cả cartItemIds có tồn tại trong cơ sở dữ liệu hay không
        // 2. Kiểm tra số lượng mua có lớn hơn số lượng tồn kho hay không
        // 3. Kiểm tra xem tất cả sản phẩm mua có sản phẩm nào bị xóa hay ẩn không
        // 4. Kiểm tra xem các skuId trong cartItem gửi lên có thuộc về shopid gửi lên không
        // 5. Tạo order
        // 6. Xóa cartItem
        const allBodyCartItemIds = body.map((item) => item.cartItemIds).flat()
        const cartItems = await this.prismaService.cartItem.findMany({
            where: {
                id: { in: allBodyCartItemIds },
                userId
            },
            include: {
                sku: {
                    include: {
                        product: {
                            include: {
                                productTranslations: true
                            }
                        }
                    }
                }

            }
        })
        // 1. Kiểm tra xem tất cả cartItemIds có tồn tại trong cơ sở dữ liệu hay không
        if (cartItems.length !== allBodyCartItemIds.length) {
            throw NotFoundCartItemException
        }
        // 2. Kiểm tra số lượng mua có lớn hơn số lượng tồn kho hay không
        const isOutOfStock = cartItems.some((item) => {
            return item.quantity > item.sku.stock
        })
        if (isOutOfStock) {
            throw OutOfStockSKUException
        }
        // 3. Kiểm tra xem tất cả sản phẩm mua có sản phẩm nào bị xóa hay ẩn không
        const isExistNotReadyProduct = cartItems.some((item) => {
            item.sku.product.deletedAt !== null ||
                item.sku.product.publishedAt === null ||
                item.sku.product.publishedAt > new Date()
        })
        if (isExistNotReadyProduct) {
            throw ProductNotFoundException
        }
        // 4. Kiểm tra xem các skuId trong cartItem gửi lên có thuộc về shopid gửi lên không
        const cartItemMap = new Map<number, (typeof cartItems)[0]>() //  skuId trong cartItem
        cartItems.forEach((item) => {
            cartItemMap.set(item.id, item)
        })
        const isValidShop = body.every((item) => {
            const bodyCartItemIds = item.cartItemIds
            return bodyCartItemIds.every((cartItemId) => {
                const cartItem = cartItemMap.get(cartItemId)!
                return item.shopId === cartItem.sku.product.createdById
            })
        })
        if (!isValidShop) {
            throw SKUNotBelongToShopException
        }
        // 5. Tạo order và xóa cartItem trong transaction để đảm bảo tính toàn vẹn dữ liệu
        const orderCreates$ = await this.prismaService.$transaction(async (tx) => {})






    }
}