
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ZodResponse, ZodSerializerDto } from 'nestjs-zod'
import {
    CreateProductBodyDTO,
    GetProductDetailResDTO,
    GetProductParamsDTO,
    GetProductsQueryDTO,
    GetProductsResDTO,
    ProductDTO,
    UpdateProductBodyDTO,
} from 'src/routes/product/product.dto'
import { ProductService } from 'src/routes/product/product.service'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { IsPublic } from 'src/shared/decorators/auth.decorator'
import { MessageResDTO } from 'src/shared/dtos/reponse.dto'


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

