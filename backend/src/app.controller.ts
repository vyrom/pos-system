import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('System')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Check system health status' })
  @ApiResponse({ status: 200, description: 'System health information' })
  getHealth() {
    return this.appService.getHealthStatus();
  }
}
