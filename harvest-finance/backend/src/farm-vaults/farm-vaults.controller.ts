import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { FarmVaultsService } from './farm-vaults.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Farm Vaults')
@Controller('api/v1/farm-vaults')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FarmVaultsController {
  constructor(private readonly farmVaultsService: FarmVaultsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a personal farm savings vault' })
  async createVault(@Request() req: any, @Body() data: any) {
    return this.farmVaultsService.createVault(req.user.id, data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all personal farm vaults for the user' })
  async getUserVaults(@Request() req: any) {
    return this.farmVaultsService.getUserVaults(req.user.id);
  }

  @Post(':id/deposit')
  @ApiOperation({ summary: 'Deposit funds into a personal farm vault' })
  async deposit(
    @Param('id') id: string,
    @Request() req: any,
    @Body('amount') amount: number,
  ) {
    return this.farmVaultsService.deposit(id, req.user.id, amount);
  }

  @Get('crop-cycles')
  @ApiOperation({ summary: 'Get all available crop cycles' })
  async getCropCycles() {
    return this.farmVaultsService.getCropCycles();
  }
}
