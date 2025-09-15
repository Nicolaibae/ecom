import { Prisma } from '@prisma/client';
import { randomInt } from 'crypto';
import path from 'path';

import { v4 as uuidv4 } from 'uuid'

// Type Predicate
export function isUniqueConstraintPrismaError(error: any): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
}

export function isNotFoundPrismaError(error: any): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025'
}
export function isForeignKeyConstraintPrismaError(error: any): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003'
}
export const generateOtp =()=>{
  return String(randomInt(100000, 1000000));
}

export const generateRandomFilename = (fileName: string)=>{
  const extFileName = path.extname(fileName)
   return `${uuidv4()}${extFileName}`
}