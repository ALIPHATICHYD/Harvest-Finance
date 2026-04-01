import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { StellarService } from '../services/stellar.service';

describe('StellarService (unit)', () => {
  let service: StellarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StellarService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'STELLAR_NETWORK') return 'testnet';
              if (key === 'STELLAR_PLATFORM_PUBLIC_KEY') return 'GTESTPUBLICKEY';
              if (key === 'STELLAR_PLATFORM_SECRET_KEY') return 'STESTSECRETKEY';
              return undefined;
            },
          },
        },
      ],
    }).compile();

    service = module.get<StellarService>(StellarService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
