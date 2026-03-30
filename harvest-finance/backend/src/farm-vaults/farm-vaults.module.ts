import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FarmVaultsService } from './farm-vaults.service';
import { FarmVaultsController } from './farm-vaults.controller';
import { FarmVault } from '../database/entities/farm-vault.entity';
import { CropCycle } from '../database/entities/crop-cycle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FarmVault, CropCycle])],
  controllers: [FarmVaultsController],
  providers: [FarmVaultsService],
  exports: [FarmVaultsService],
})
export class FarmVaultsModule {}
