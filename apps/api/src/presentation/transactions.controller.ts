import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CreatePendingTransactionUseCase } from '@api/application/use-cases/create-pending-transaction.use-case';
import { GetTransactionUseCase } from '@api/application/use-cases/get-transaction.use-case';
import { ProcessPaymentUseCase } from '@api/application/use-cases/process-payment.use-case';
import { CreateTransactionDto } from '@api/presentation/dto/create-transaction.dto';
import { PayTransactionDto } from '@api/presentation/dto/pay-transaction.dto';
import { unwrapResult } from '@api/presentation/http/map-checkout-error';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly createPending: CreatePendingTransactionUseCase,
    private readonly getTransaction: GetTransactionUseCase,
    private readonly processPayment: ProcessPaymentUseCase,
  ) {}

  @Post()
  @ApiOkResponse({ description: 'Crea transacción interna en estado PENDING' })
  async create(@Body() body: CreateTransactionDto) {
    const result = await this.createPending.execute({
      productId: body.productId,
      quantity: body.quantity,
      customer: body.customer,
      delivery: body.delivery,
    });
    return unwrapResult(result);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Detalle para reanudar flujo tras refresh' })
  async getOne(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.getTransaction.execute(id);
    return unwrapResult(result);
  }

  @Post(':id/pay')
  @ApiHeader({ name: 'idempotency-key', required: true })
  @ApiOkResponse({ description: 'Ejecuta cobro con token de tarjeta' })
  async pay(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: PayTransactionDto,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
  ) {
    if (!idempotencyKey || idempotencyKey.trim().length < 8) {
      throw new HttpException('Encabezado Idempotency-Key requerido', HttpStatus.BAD_REQUEST);
    }
    const result = await this.processPayment.execute({
      transactionId: id,
      cardToken: body.cardToken,
      idempotencyKey: idempotencyKey.trim(),
    });
    return unwrapResult(result);
  }
}
