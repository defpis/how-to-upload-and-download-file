import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as dayjs from 'dayjs';

@Injectable()
export class AppService {
  static STATIC_FOLDER = path.resolve(process.cwd(), 'static');
  static UPLOAD_FOLDER = path.resolve(process.cwd(), 'upload');

  constructor() {
    if (!fs.existsSync(AppService.UPLOAD_FOLDER)) {
      fs.mkdirSync(AppService.UPLOAD_FOLDER);
    }
  }

  download(filename: string) {
    const filePath = path.resolve(AppService.STATIC_FOLDER, filename);

    if (!fs.existsSync(filePath)) {
      throw new BadRequestException('文件不存在');
    }

    return fs.createReadStream(filePath);
  }

  upload(file: Express.Multer.File) {
    const { name, ext } = path.parse(file.originalname);
    const timestamp = dayjs().format('YYYYMMDDHHmmss');

    const filePath = path.resolve(
      AppService.UPLOAD_FOLDER,
      `${name}_${timestamp}${ext}`,
    );

    if (fs.existsSync(filePath)) {
      throw new BadRequestException('文件已存在');
    }

    const stream = fs.createWriteStream(filePath);
    stream.write(file.buffer);
    stream.end();
  }
}
