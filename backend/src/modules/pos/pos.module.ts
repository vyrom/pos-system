import { Module } from '@nestjs/common';
import { PosController } from './pos.controller';
import { PosService } from './pos.service';
import { ImageProcessorService } from './services/image-processor.service';

@Module({
  controllers: [PosController],
  providers: [PosService, ImageProcessorService],
  exports: [PosService, ImageProcessorService],
})
export class PosModule {}
