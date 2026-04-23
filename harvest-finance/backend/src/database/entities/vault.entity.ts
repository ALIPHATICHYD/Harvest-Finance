import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Deposit } from './deposit.entity';
import { User } from './user.entity';

export enum VaultType {
  CROP_PRODUCTION = 'CROP_PRODUCTION',
  EQUIPMENT_FINANCING = 'EQUIPMENT_FINANCING',
  LAND_ACQUISITION = 'LAND_ACQUISITION',
  INSURANCE_FUND = 'INSURANCE_FUND',
  EMERGENCY_FUND = 'EMERGENCY_FUND',
}

export enum VaultStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  FROZEN = 'FROZEN',
  FULL_CAPACITY = 'FULL_CAPACITY',
}

@Entity('vaults')
@Index('idx_vaults_owner', ['ownerId'])
@Index('idx_vaults_type', ['type'])
@Index('idx_vaults_status', ['status'])
export class Vault {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'owner_id' })
  ownerId: string;

  @Column({ type: 'enum', enum: VaultType, default: VaultType.CROP_PRODUCTION })
  type: VaultType;

  @Column({ type: 'enum', enum: VaultStatus, default: VaultStatus.ACTIVE })
  status: VaultStatus;

  @Column({ name: 'vault_name', length: 100 })
  vaultName: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  totalDeposits: number;

  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  maxCapacity: number;

  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  interestRate: number;

  @Column({ type: 'timestamp with time zone', name: 'maturity_date', nullable: true })
  maturityDate: Date | null;

  @Column({ type: 'timestamp with time zone', name: 'lock_period_end', nullable: true })
  lockPeriodEnd: Date | null;

  @Column({ name: 'is_public', default: true })
  isPublic: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToMany(() => Deposit, (deposit) => deposit.vault)
  deposits: Deposit[];

  get availableCapacity(): number {
    return Number(this.maxCapacity) - Number(this.totalDeposits);
  }

  get utilizationPercentage(): number {
    if (Number(this.maxCapacity) === 0) return 0;
    return (Number(this.totalDeposits) / Number(this.maxCapacity)) * 100;
  }

  get isFullCapacity(): boolean {
    return Number(this.totalDeposits) >= Number(this.maxCapacity);
  }
}
