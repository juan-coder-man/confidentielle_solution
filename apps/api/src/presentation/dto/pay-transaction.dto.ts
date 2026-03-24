import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class PayTransactionDto {
  @ApiProperty({
    description: 'Token de tarjeta emitido por el API de pagos (no PAN/CVV)',
  })
  @IsString()
  @MinLength(4)
  @MaxLength(512)
  cardToken!: string;
}
