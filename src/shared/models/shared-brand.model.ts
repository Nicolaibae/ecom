
import { z } from 'zod'
import { BrandTranslationSchema } from './shared-brand-translation.model'

export const BrandSchema = z.object({
  id: z.number(),
  name: z.string().max(500),
  logo: z.string().max(1000),

  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export const BrandIncludeTranslationSchema = BrandSchema.extend({
  brandTranslations: z.array(BrandTranslationSchema),
})