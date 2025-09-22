import { Injectable } from '@nestjs/common';
import { CreateProductBodyType, GetProductsQueryType, UpdateProductBodyType } from './product.model';
import { ProductRepo } from './product.repo';
import { I18nContext } from 'nestjs-i18n';
import { NotFoundRecordException } from 'src/shared/error';
import { isNotFoundPrismaError } from 'src/shared/helper';

@Injectable()
export class ProductService {
    constructor(private productRepo: ProductRepo) {}

  async list(query: GetProductsQueryType) {
    const data = await this.productRepo.list(query, I18nContext.current()?.lang as string)
    return data
  }

  async findById(id: number) {
    const product = await this.productRepo.findById(id, I18nContext.current()?.lang as string)
    if (!product) {
      throw NotFoundRecordException
    }
    return product
  }

  create({ data, createdById }: { data: CreateProductBodyType; createdById: number }) {
    return this.productRepo.create({
      createdById,
      data,
    })
  }

  async update({ id, data, updatedById }: { id: number; data: UpdateProductBodyType; updatedById: number }) {
    try {
      const product = await this.productRepo.update({
        id,
        updatedById,
        data,
      })
      return product
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.productRepo.delete({
        id,
        deletedById,
      })
      return {
        message: 'Delete successfully',
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}
