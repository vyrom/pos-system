import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PosModule } from './modules/pos/pos.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
