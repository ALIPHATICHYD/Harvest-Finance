import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { AppDataSource } from './src/database/index';
import { Notification, NotificationType } from './src/database/entities/notification.entity';
import { User } from './src/database/entities/user.entity';

config();

async function runDemoSeed() {
  console.log('🚀 Starting Demo Seed...');
  
  try {
    const dataSource: DataSource = await AppDataSource.initialize();
    console.log('✅ Database connected');

    const userRepository = dataSource.getRepository(User);
    const notificationRepository = dataSource.getRepository(Notification);

    // Find a user to attach notifications to
    const user = await userRepository.findOne({ where: { email: 'admin@harvest.finance' } });
    
    if (!user) {
      console.log('❌ Admin user not found. Please run "npm run seed" first.');
      await dataSource.destroy();
      return;
    }

    console.log(`👤 Found user: ${user.firstName} ${user.lastName} (${user.id})`);

    // Create some demo notifications
    const demoNotifications = [
      {
        userId: user.id,
        title: 'Welcome to Harvest Finance',
        message: 'Your account has been successfully set up. Welcome to the future of agricultural trade!',
        type: NotificationType.SYSTEM,
        isRead: false,
      },
      {
        userId: user.id,
        title: 'New Vault Created',
        message: 'A new high-yield maize vault has been created. Check it out now!',
        type: NotificationType.VAULT_CREATED,
        isRead: false,
      },
      {
        userId: user.id,
        title: 'Large Transaction Alert',
        message: 'A transaction of 50,000 USDC was detected on the network.',
        type: NotificationType.LARGE_TRANSACTION,
        isRead: false,
      },
      {
        userId: user.id,
        title: 'Reward Received',
        message: 'You have received 120.5 HF tokens as staking rewards.',
        type: NotificationType.REWARD,
        isRead: true,
      }
    ];

    for (const data of demoNotifications) {
      const notification = notificationRepository.create(data);
      await notificationRepository.save(notification);
      console.log(`🔔 Created notification: ${data.title}`);
    }

    await dataSource.destroy();
    console.log('\n✅ Demo Seed completed successfully!');
  } catch (error) {
    console.error('\n❌ Demo Seed failed:', error);
  }
}

runDemoSeed();
