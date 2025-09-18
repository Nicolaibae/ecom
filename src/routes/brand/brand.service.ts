import { Injectable } from '@nestjs/common';
import { PaginationQueryType } from 'src/shared/models/request.model';
import { BrandRepo } from './brand.repo';
import { NotFoundRecordException } from 'src/shared/error';
import { CreateBrandBodyType, UpdateBrandBodyType } from './brand.model';
import { isNotFoundPrismaError } from 'src/shared/helper';

@Injectable()
export class BrandService {
    constructor(private readonly brandRepository: BrandRepo) { }
    list(pagination: PaginationQueryType) {
        return this.brandRepository.list(pagination)
    }
    async findById(id: number) {
        const brand = await this.brandRepository.findById(id)
        if (!brand) {
            throw NotFoundRecordException
        }
        return brand
    }
    async create({ data, createdById }: { data: CreateBrandBodyType, createdById: number }) {
        return this.brandRepository.create({
            createdById,
            data,
        })
    }
    async update({ id, data, updatedById }: { id: number; data: UpdateBrandBodyType; updatedById: number }) {
    try {
      const brand = await this.brandRepository.update({
        id,
        updatedById,
        data,
      })
      return brand
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.brandRepository.delete({
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
