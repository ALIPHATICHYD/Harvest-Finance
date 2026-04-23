import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Vault, VaultStatus } from '../database/entities/vault.entity';
import { Deposit, DepositStatus } from '../database/entities/deposit.entity';
import { Withdrawal, WithdrawalStatus } from '../database/entities/withdrawal.entity';
import { DepositDto } from './dto/deposit.dto';
import {
  DepositVaultResponseDto,
  VaultResponseDto,
  DepositResponseDto,
} from './dto/vault-response.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../database/entities/notification.entity';
import { CustomLoggerService } from '../logger/custom-logger.service';
import { VaultGateway } from '../realtime/vault.gateway';

@Injectable()
export class VaultsService {
  constructor(
    @InjectRepository(Vault)
    private vaultRepository: Repository<Vault>,
    @InjectRepository(Deposit)
    private depositRepository: Repository<Deposit>,
    @InjectRepository(Withdrawal)
    private withdrawalRepository: Repository<Withdrawal>,
    private dataSource: DataSource,
    private notificationsService: NotificationsService,
    private logger: CustomLoggerService,
    private vaultGateway: VaultGateway,
  ) {}

  async getVaultById(vaultId: string): Promise<Vault> {
    const vault = await this.vaultRepository.findOne({
      where: { id: vaultId },
      relations: ['deposits', 'owner'],
    });

    if (!vault) {
      throw new NotFoundException('Vault not found');
    }

    return vault;
  }

  async depositToVault(
    vaultId: string,
    depositDto: DepositDto,
  ): Promise<DepositVaultResponseDto> {
    const { userId, amount } = depositDto;

    if (amount <= 0) {
      throw new BadRequestException('Deposit amount must be greater than 0');
    }

    const vault = await this.getVaultById(vaultId);

    if (vault.status !== VaultStatus.ACTIVE) {
      throw new BadRequestException('Vault is not active for deposits');
    }

    if (vault.isFullCapacity) {
      throw new BadRequestException('Vault has reached maximum capacity');
    }

    if (amount > vault.availableCapacity) {
      throw new BadRequestException(
        `Deposit amount exceeds available vault capacity. Available: ${vault.availableCapacity}`,
      );
    }

    const deposit = this.depositRepository.create({
      userId,
      vaultId,
      amount,
      status: DepositStatus.PENDING,
      transactionHash: null,
      stellarTransactionId: null,
      confirmedAt: null,
    });

    const result = await this.dataSource.transaction(async (manager) => {
      const savedDeposit = await manager.save(deposit);

      await manager.increment(Vault, { id: vaultId }, 'totalDeposits', amount);

      const updatedVault = await manager.findOne(Vault, {
        where: { id: vaultId },
      });

      if (updatedVault && updatedVault.isFullCapacity) {
        await manager.update(
          Vault,
          { id: vaultId },
          { status: VaultStatus.FULL_CAPACITY },
        );
      }

      return { deposit: savedDeposit, vault: updatedVault };
    });

    if (amount >= 10000) {
      await this.notificationsService.create({
        title: 'Large Deposit Alert',
        message: `A large deposit of ${amount} has been initiated for vault ${vault.vaultName}.`,
        type: NotificationType.LARGE_TRANSACTION,
        adminOnly: true,
      });
    }

    const confirmedDeposit = await this.confirmDeposit(result.deposit.id);

    const userTotalDeposits = await this.getUserTotalDeposits(userId);

    this.logger.log(`Deposit of ${amount} confirmed into vault ${vaultId} by user ${userId}`, 'VaultsService');

    this.vaultGateway.emitDeposit({
      vaultId,
      vaultName: vault.vaultName,
      amount,
      userId,
      newBalance: result.vault ? Number(result.vault.totalDeposits) : 0,
    });

    return {
      vault: result.vault ? this.mapVaultToResponse(result.vault) : null,
      deposit: this.mapDepositToResponse(confirmedDeposit),
      userTotalDeposits,
    };
  }

  private async confirmDeposit(depositId: string): Promise<Deposit> {
    const deposit = await this.depositRepository.findOne({
      where: { id: depositId },
    });

    if (!deposit) {
      throw new NotFoundException('Deposit not found');
    }

    await this.depositRepository.update(depositId, {
      status: DepositStatus.CONFIRMED,
      confirmedAt: new Date(),
      transactionHash: `mock_tx_${Date.now()}`,
      stellarTransactionId: `mock_stellar_${Date.now()}`,
    });

    const updatedDeposit = await this.depositRepository.findOne({
      where: { id: depositId },
    });

    if (!updatedDeposit) {
      throw new NotFoundException('Deposit not found after confirmation');
    }

    await this.notificationsService.create({
      userId: updatedDeposit.userId,
      title: 'Deposit Confirmed',
      message: `Your deposit of ${updatedDeposit.amount} into vault ${updatedDeposit.vaultId} has been confirmed.`,
      type: NotificationType.DEPOSIT,
    });

    return updatedDeposit;
  }

  async getUserTotalDeposits(userId: string): Promise<number> {
    const result = await this.depositRepository
      .createQueryBuilder('deposit')
      .select('SUM(deposit.amount)', 'total')
      .where('deposit.userId = :userId', { userId })
      .andWhere('deposit.status = :status', { status: DepositStatus.CONFIRMED })
      .getRawOne();

    return result?.total ? parseFloat(result.total) : 0;
  }

  async getUserVaults(userId: string): Promise<VaultResponseDto[]> {
    const vaults = await this.vaultRepository.find({
      where: { ownerId: userId },
      relations: ['deposits'],
      order: { createdAt: 'DESC' },
    });

    return vaults.map((vault) => this.mapVaultToResponse(vault));
  }

  async getPublicVaults(): Promise<VaultResponseDto[]> {
    const vaults = await this.vaultRepository.find({
      where: { isPublic: true },
      relations: ['deposits'],
      order: { createdAt: 'DESC' },
    });

    return vaults.map((vault) => this.mapVaultToResponse(vault));
  }

  mapVaultToResponse(vault: Vault): VaultResponseDto {
    return {
      id: vault.id,
      ownerId: vault.ownerId,
      type: vault.type,
      status: vault.status,
      vaultName: vault.vaultName,
      description: vault.description,
      totalDeposits: Number(vault.totalDeposits),
      maxCapacity: Number(vault.maxCapacity),
      availableCapacity: vault.availableCapacity,
      utilizationPercentage: vault.utilizationPercentage,
      interestRate: Number(vault.interestRate),
      maturityDate: vault.maturityDate,
      lockPeriodEnd: vault.lockPeriodEnd,
      isPublic: vault.isPublic,
      createdAt: vault.createdAt,
      updatedAt: vault.updatedAt,
    };
  }

  async withdrawFromVault(
    vaultId: string,
    userId: string,
    amount: number,
  ): Promise<{ withdrawal: Withdrawal; vault: VaultResponseDto }> {
    if (amount <= 0) {
      throw new BadRequestException('Withdrawal amount must be greater than 0');
    }

    const vault = await this.getVaultById(vaultId);

    const userTotalDeposits = await this.getUserTotalDeposits(userId);
    if (amount > userTotalDeposits) {
      throw new BadRequestException('Insufficient balance for withdrawal');
    }

    const withdrawal = this.withdrawalRepository.create({
      userId,
      vaultId,
      amount,
      status: WithdrawalStatus.PENDING,
    });

    const result = await this.dataSource.transaction(async (manager) => {
      const savedWithdrawal = await manager.save(withdrawal);

      await manager.decrement(Vault, { id: vaultId }, 'totalDeposits', amount);

      const updatedVault = await manager.findOne(Vault, {
        where: { id: vaultId },
      });

      if (updatedVault && updatedVault.status === VaultStatus.FULL_CAPACITY) {
        await manager.update(Vault, { id: vaultId }, { status: VaultStatus.ACTIVE });
        updatedVault.status = VaultStatus.ACTIVE;
      }

      return { withdrawal: savedWithdrawal, vault: updatedVault };
    });

    await this.withdrawalRepository.update(result.withdrawal.id, {
      status: WithdrawalStatus.CONFIRMED,
      confirmedAt: new Date(),
      transactionHash: `mock_withdraw_tx_${Date.now()}`,
    });

    const confirmedWithdrawal = await this.withdrawalRepository.findOne({
      where: { id: result.withdrawal.id },
    });

    if (!confirmedWithdrawal) {
      throw new NotFoundException('Withdrawal not found after confirmation');
    }

    await this.notificationsService.create({
      userId,
      title: 'Withdrawal Confirmed',
      message: `Your withdrawal of ${amount} from vault ${vault.vaultName} has been confirmed.`,
      type: NotificationType.DEPOSIT,
    });

    this.logger.log(`Withdrawal of ${amount} confirmed from vault ${vaultId} by user ${userId}`, 'VaultsService');

    this.vaultGateway.emitWithdrawal({
      vaultId,
      vaultName: vault.vaultName,
      amount,
      userId,
      newBalance: result.vault ? Number(result.vault.totalDeposits) : 0,
    });

    return {
      withdrawal: confirmedWithdrawal,
      vault: result.vault ? this.mapVaultToResponse(result.vault) : this.mapVaultToResponse(vault),
    };
  }

  private mapDepositToResponse(deposit: Deposit): DepositResponseDto {
    return {
      id: deposit.id,
      userId: deposit.userId,
      vaultId: deposit.vaultId,
      status: deposit.status,
      amount: Number(deposit.amount),
      transactionHash: deposit.transactionHash,
      createdAt: deposit.createdAt,
      confirmedAt: deposit.confirmedAt,
    };
  }
}
