import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

export interface VaultActivityEvent {
  type: 'deposit' | 'withdrawal' | 'milestone' | 'ai_insight';
  vaultId: string;
  vaultName: string;
  amount?: number;
  userId?: string;
  milestone?: string;
  insight?: string;
  newBalance?: number;
  timestamp: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'vault-activity',
})
export class VaultGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(VaultGateway.name);

  afterInit() {
    this.logger.log('VaultGateway WebSocket initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe:vault')
  handleSubscribeVault(
    @MessageBody() vaultId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`vault:${vaultId}`);
    this.logger.log(`Client ${client.id} subscribed to vault:${vaultId}`);
  }

  @SubscribeMessage('unsubscribe:vault')
  handleUnsubscribeVault(
    @MessageBody() vaultId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`vault:${vaultId}`);
  }

  emitVaultActivity(event: VaultActivityEvent) {
    // Emit to vault-specific room
    this.server.to(`vault:${event.vaultId}`).emit('vault:activity', event);
    // Also broadcast to all connected clients for the global activity feed
    this.server.emit('vault:activity:global', event);
  }

  emitDeposit(data: {
    vaultId: string;
    vaultName: string;
    amount: number;
    userId: string;
    newBalance: number;
  }) {
    const event: VaultActivityEvent = {
      type: 'deposit',
      vaultId: data.vaultId,
      vaultName: data.vaultName,
      amount: data.amount,
      userId: data.userId,
      newBalance: data.newBalance,
      timestamp: new Date().toISOString(),
    };
    this.emitVaultActivity(event);
  }

  emitWithdrawal(data: {
    vaultId: string;
    vaultName: string;
    amount: number;
    userId: string;
    newBalance: number;
  }) {
    const event: VaultActivityEvent = {
      type: 'withdrawal',
      vaultId: data.vaultId,
      vaultName: data.vaultName,
      amount: data.amount,
      userId: data.userId,
      newBalance: data.newBalance,
      timestamp: new Date().toISOString(),
    };
    this.emitVaultActivity(event);
  }

  emitMilestone(data: {
    vaultId: string;
    vaultName: string;
    milestone: string;
    userId: string;
  }) {
    const event: VaultActivityEvent = {
      type: 'milestone',
      vaultId: data.vaultId,
      vaultName: data.vaultName,
      milestone: data.milestone,
      userId: data.userId,
      timestamp: new Date().toISOString(),
    };
    this.emitVaultActivity(event);
  }

  emitAiInsight(data: {
    vaultId: string;
    vaultName: string;
    insight: string;
  }) {
    const event: VaultActivityEvent = {
      type: 'ai_insight',
      vaultId: data.vaultId,
      vaultName: data.vaultName,
      insight: data.insight,
      timestamp: new Date().toISOString(),
    };
    this.emitVaultActivity(event);
  }
}
