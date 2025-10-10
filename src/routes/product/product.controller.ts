
import { Controller, Get, Param, Query } from '@nestjs/common'
import { ZodResponse } from 'nestjs-zod'
import {
    GetProductDetailResDTO,
    GetProductParamsDTO,
    GetProductsQueryDTO,
    GetProductsResDTO,
} from 'src/routes/product/product.dto'
import { ProductService } from 'src/routes/product/product.service'
import { IsPublic } from 'src/shared/decorators/auth.decorator'



@Controller('products')
export class ProductController {
    constructor(private readonly productService: ProductService) { }

    @Get()
    @IsPublic()
    @ZodResponse({type:GetProductsResDTO})
    list(@Query() query: GetProductsQueryDTO) {
        return this.productService.list({ query })
    }

    @Get(':productId')
    @IsPublic()
    @ZodResponse({type:GetProductDetailResDTO})
    findById(@Param() params: GetProductParamsDTO) {
        return this.productService.getDetail({ productId: params.productId })
    }

   
}

