import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class StellarChallengeDto {
  @ApiProperty({
    description: 'Stellar public key of the client requesting authentication',
    example: 'GC5X3FML4S25HDAMJYZJYAC3CKLDWV2Z6YPV3IZXOSHSQKNSKUNQFXQN',
  })
  @IsString()
  @IsNotEmpty()
  public_key: string;
}

export class StellarChallengeResponseDto {
  @ApiProperty({
    description: 'Server Stellar public key for client verification',
    example: 'GCWHSK5KNLKB77NAEA3CKDKLY5GTMNKHXQRPUF6STZOD3J6VYVVZNBRV',
  })
  @IsString()
  server_public_key: string;

  @ApiProperty({
    description: 'Challenge transaction XDR (base64 encoded)',
    example: 'AAAAAK7clQAAAA...',
  })
  @IsString()
  @IsNotEmpty()
  transaction: string;

  @ApiProperty({
    description: 'Network passphrase',
    example: 'Test SDF Network ; September 2015',
  })
  @IsString()
  network_passphrase: string;
}

export class StellarVerifyDto {
  @ApiProperty({
    description: 'Signed challenge transaction XDR (base64 encoded)',
    example: 'AAAAAK7clQAAAA...',
  })
  @IsString()
  @IsNotEmpty()
  transaction: string;
}

export class StellarAuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  access_token: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  refresh_token: string;

  @ApiProperty({
    description: 'User information',
    example: {
      id: 'uuid-string',
      stellar_address: 'GC5X3FML4S25HDAMJYZJYAC3CKLDWV2Z6YPV3IZXOSHSQKNSKUNQFXQN',
      role: 'USER',
      full_name: 'Stellar User',
    },
  })
  user: {
    id: string;
    stellar_address: string;
    role: string;
    full_name: string;
  };
}
