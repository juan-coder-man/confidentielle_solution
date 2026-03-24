import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class CustomerDto {
  @ApiProperty({ example: 'Ana López' })
  @IsString()
  @MaxLength(200)
  fullName!: string;

  @ApiProperty({ example: 'ana@example.com' })
  @IsEmail()
  @MaxLength(200)
  email!: string;

  @ApiProperty({ example: '+573001234567' })
  @IsString()
  @MaxLength(40)
  phone!: string;
}

export class DeliveryDto {
  @ApiProperty({ example: 'Calle 123 #45-67' })
  @IsString()
  @MaxLength(300)
  addressLine!: string;

  @ApiProperty({ example: 'Bogotá' })
  @IsString()
  @MaxLength(120)
  city!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  notes?: string;
}

export class CreateTransactionDto {
  @ApiProperty()
  @IsUUID()
  productId!: string;

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiProperty({ type: CustomerDto })
  @ValidateNested()
  @Type(() => CustomerDto)
  customer!: CustomerDto;

  @ApiProperty({ type: DeliveryDto })
  @ValidateNested()
  @Type(() => DeliveryDto)
  delivery!: DeliveryDto;
}
