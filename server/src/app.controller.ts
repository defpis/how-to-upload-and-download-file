import {
  Controller,
  Get,
  Res,
  Post,
  UseInterceptors,
  UploadedFile,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

function delay(second: number) {
  return new Promise((res) => setTimeout(res, second * 1000));
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // @Get('download/:filename')
  // async download(@Res() res: Response, @Param('filename') filename: string) {
  //   await delay(1);

  //   res.set({
  //     'Content-Type': 'application/json',
  //     'Content-Disposition': `attachment; filename="${filename}"`,
  //   });
  //   this.appService.download(filename).pipe(res);
  // }

  @Get('download')
  async download(@Res() res: Response, @Query('filename') filename: string) {
    await delay(1);

    if (filename.split('/').some((s) => s === '..')) {
      throw new BadRequestException('文件名非法');
    }

    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    this.appService.download(filename).pipe(res);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    await delay(1);

    this.appService.upload(file);
    return { msg: 'ok' };
  }
}
