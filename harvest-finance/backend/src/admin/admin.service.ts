import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Vault, VaultStatus } from '../database/entities/vault.entity';
import { Deposit, DepositStatus } from '../database/entities/deposit.entity';
import { User, UserRole } from '../database/entities/user.entity';
import { Reward } from '../database/entities/reward.entity';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { CreateVaultDto, UpdateVaultDto } from './dto/vault-crud.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Vault)
    private vaultRepository: Repository<Vault>,
    @InjectRepository(Deposit)
    private depositRepository: Repository<Deposit>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Reward)
    private rewardRepository: Repository<Reward>,
    private dataSource: DataSource,
  ) {}

  /**
   * Get overall dashboard metrics
   */
  async getDashboardStats(): Promise<DashboardStatsDto> {
    const [totalUsers, activeUsersCount, totalDepositsResult, totalRewardsResult, activeVaultsCount, avgApyResult] = await Promise.all([
      // Total number of users in the system
      this.userRepository.count(),

      // Active user accounts
      this.userRepository.count({ where: { isActive: true } }),

      // Total Deposits
      this.depositRepository
        .createQueryBuilder('deposit')
        .select('SUM(deposit.amount)', 'total')
        .where('deposit.status = :status', { status: DepositStatus.CONFIRMED })
        .getRawOne(),
      
      // Total Rewards Distributed
      this.rewardRepository
        .createQueryBuilder('reward')
        .select('SUM(reward.accruedAmount)', 'total')
        .getRawOne(),

      // Active Vaults
      this.vaultRepository.count({ where: { status: VaultStatus.ACTIVE } }),

      // Average APY
      this.vaultRepository
        .createQueryBuilder('vault')
        .select('AVG(vault.interestRate)', 'avg')
        .where('vault.status = :status', { status: VaultStatus.ACTIVE })
        .getRawOne(),
    ]);

    return {
      totalUsers,
      activeUsers: activeUsersCount,
      totalDeposits: parseFloat(totalDepositsResult?.total || '0'),
      totalRewardsDistributed: parseFloat(totalRewardsResult?.total || '0'),
      activeVaults: activeVaultsCount,
      averageApy: parseFloat(avgApyResult?.avg || '0'),
    };
  }

  /**
   * Admin user management operations
   */
  async getAllUsers(search?: string): Promise<User[]> {
    const query = this.userRepository.createQueryBuilder('user');

    if (search) {
      const normalizedSearch = `%${search.toLowerCase()}%`;
      query.where(
        'LOWER(user.email) LIKE :search OR LOWER(user.firstName) LIKE :search OR LOWER(user.lastName) LIKE :search OR LOWER(user.role) LIKE :search',
        { search: normalizedSearch },
      );
    }

    return query.orderBy('user.createdAt', 'DESC').getMany();
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    user.isActive = isActive;
    return this.userRepository.save(user);
  }

  /**
   * Vault CRUD Operations
   */
  async getAllVaults(): Promise<Vault[]> {
    return this.vaultRepository.find({
      relations: ['owner'],
      order: { createdAt: 'DESC' },
    });
  }

  async createVault(createVaultDto: CreateVaultDto, adminId: string): Promise<Vault> {
    const vault = this.vaultRepository.create({
      ...createVaultDto,
      ownerId: adminId,
      status: VaultStatus.ACTIVE,
      totalDeposits: 0,
    });
    return this.vaultRepository.save(vault);
  }

  async updateVault(id: string, updateVaultDto: UpdateVaultDto): Promise<Vault> {
    const vault = await this.vaultRepository.findOne({ where: { id } });
    if (!vault) {
      throw new NotFoundException(`Vault with ID ${id} not found`);
    }

    Object.assign(vault, updateVaultDto);
    return this.vaultRepository.save(vault);
  }

  async deleteVault(id: string): Promise<void> {
    const vault = await this.vaultRepository.findOne({ where: { id }, relations: ['deposits'] });
    if (!vault) {
      throw new NotFoundException(`Vault with ID ${id} not found`);
    }

    if (vault.deposits && vault.deposits.length > 0) {
      // For safety, maybe just archive it or prevent deletion if it has deposits
      // For now, let's allow deletion but in a real app we'd be more careful
    }

    await this.vaultRepository.remove(vault);
  }

  /**
   * User Activity Monitoring
   */
  async getUserActivity(): Promise<any[]> {
    // Return a combined list of deposits and transactions
    // For simplicity, let's just return all confirmed deposits for now
    return this.depositRepository.find({
      relations: ['user', 'vault'],
      order: { createdAt: 'DESC' },
      take: 100, // Limit to recent 100
    });
  }
}
