import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { MulterModule } from '@nestjs/platform-express';
import multer from 'multer'
import { generateRandomFilename } from 'src/shared/helper';
import { existsSync, mkdirSync } from 'fs';
import { UPLOAD_DIR } from 'src/shared/constants/other.constant';
import { S3Service } from 'src/shared/services/s3.service';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR)
  },
  filename: function (req, file, cb) {
    // console.log(file)
    const newFilename = generateRandomFilename(file.originalname)
    cb(null, newFilename)
  },
})
@Module({
  imports: [
    MulterModule.register({
     storage,
    }),
  ],
  controllers: [MediaController],
  providers: [MediaService,S3Service]
})
export class MediaModule {
  constructor() {
    if (!existsSync(UPLOAD_DIR)) {
      mkdirSync(UPLOAD_DIR, { recursive: true })
    }
  }
}
