import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { VaultsService } from './vaults.service';
import { Vault, VaultStatus } from '../database/entities/vault.entity';
import { Deposit, DepositStatus } from '../database/entities/deposit.entity';
import { Withdrawal, WithdrawalStatus } from '../database/entities/withdrawal.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { CustomLoggerService } from '../logger/custom-logger.service';
import { VaultGateway } from '../realtime/vault.gateway';

describe('VaultsService', () => {
  let service: VaultsService;

  const mockVault = {
    id: 'vault-1',
    ownerId: 'user-1',
    vaultName: 'Test Vault',
    status: VaultStatus.ACTIVE,
    totalDeposits: 1000,
    maxCapacity: 10000,
    isFullCapacity: false,
    availableCapacity: 9000,
    deposits: [],
  };

  const mockEntityManager = {
    save: jest.fn(),
    increment: jest.fn(),
    decrement: jest.fn(),
    update: jest.fn(),
    findOne: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn((cb: (em: typeof mockEntityManager) => unknown) => cb(mockEntityManager)),
  };

  const mockVaultRepository = { findOne: jest.fn(), find: jest.fn() };
  const mockDepositRepository = {
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
  const mockWithdrawalRepository = {
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };
  const mockNotificationsService = { create: jest.fn().mockResolvedValue(undefined) };
  const mockLogger = { log: jest.fn(), error: jest.fn(), warn: jest.fn() };
  const mockVaultGateway = { emitDeposit: jest.fn(), emitWithdrawal: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VaultsService,
        { provide: getRepositoryToken(Vault), useValue: mockVaultRepository },
        { provide: getRepositoryToken(Deposit), useValue: mockDepositRepository },
        { provide: getRepositoryToken(Withdrawal), useValue: mockWithdrawalRepository },
        { provide: DataSource, useValue: mockDataSource },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: CustomLoggerService, useValue: mockLogger },
        { provide: VaultGateway, useValue: mockVaultGateway },
      ],
    }).compile();

    service = module.get<VaultsService>(VaultsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('withdrawFromVault', () => {
    const buildQB = (total: string | null) => ({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ total }),
    });

    it('should successfully withdraw funds', async () => {
      const updatedVault = { ...mockVault, totalDeposits: 900 };
      const pendingWithdrawal = { id: 'w-1', userId: 'user-1', vaultId: 'vault-1', amount: 100, status: WithdrawalStatus.PENDING };
      const confirmedWithdrawal = { ...pendingWithdrawal, status: WithdrawalStatus.CONFIRMED, confirmedAt: new Date() };

      mockVaultRepository.findOne.mockResolvedValue(mockVault);
      mockDepositRepository.createQueryBuilder.mockReturnValue(buildQB('1000'));
      mockWithdrawalRepository.create.mockReturnValue(pendingWithdrawal);
      mockEntityManager.save.mockResolvedValue(pendingWithdrawal);
      mockEntityManager.decrement.mockResolvedValue(undefined);
      mockEntityManager.findOne.mockResolvedValue(updatedVault);
      mockWithdrawalRepository.update.mockResolvedValue(undefined);
      mockWithdrawalRepository.findOne.mockResolvedValue(confirmedWithdrawal);

      const result = await service.withdrawFromVault('vault-1', 'user-1', 100);

      expect(result.withdrawal.status).toBe(WithdrawalStatus.CONFIRMED);
      expect(mockEntityManager.decrement).toHaveBeenCalledWith(Vault, { id: 'vault-1' }, 'totalDeposits', 100);
    });

    it('should throw NotFoundException if vault not found', async () => {
      mockVaultRepository.findOne.mockResolvedValue(null);

      await expect(service.withdrawFromVault('nonexistent', 'user-1', 100)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if insufficient user balance', async () => {
      mockVaultRepository.findOne.mockResolvedValue(mockVault);
      mockDepositRepository.createQueryBuilder.mockReturnValue(buildQB('50'));

      await expect(service.withdrawFromVault('vault-1', 'user-1', 100)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if amount is zero', async () => {
      await expect(service.withdrawFromVault('vault-1', 'user-1', 0)).rejects.toThrow(BadRequestException);
    });
  });

  describe('depositToVault', () => {
    it('should throw BadRequestException if vault is not active', async () => {
      mockVaultRepository.findOne.mockResolvedValue({ ...mockVault, status: VaultStatus.INACTIVE });

      await expect(
        service.depositToVault('vault-1', { userId: 'user-1', amount: 100 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if vault not found', async () => {
      mockVaultRepository.findOne.mockResolvedValue(null);

      await expect(
        service.depositToVault('vault-1', { userId: 'user-1', amount: 100 }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
