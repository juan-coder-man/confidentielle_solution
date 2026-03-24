import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListProductsUseCase } from '@api/application/use-cases/list-products.use-case';
import { CreatePendingTransactionUseCase } from '@api/application/use-cases/create-pending-transaction.use-case';
import { GetTransactionUseCase } from '@api/application/use-cases/get-transaction.use-case';
import { ProcessPaymentUseCase } from '@api/application/use-cases/process-payment.use-case';
import {
  CHECKOUT_FINALIZE_PORT,
  CUSTOMER_REPOSITORY,
  DELIVERY_REPOSITORY,
  PRODUCT_REPOSITORY,
  STORE_TRANSACTION_REPOSITORY,
  confidentielle_PAYMENT_PORT,
} from '@api/application/tokens';
import { CustomerEntity } from '@api/infrastructure/persistence/entities/customer.entity';
import { DeliveryEntity } from '@api/infrastructure/persistence/entities/delivery.entity';
import { ProductEntity } from '@api/infrastructure/persistence/entities/product.entity';
import { StoreTransactionEntity } from '@api/infrastructure/persistence/entities/store-transaction.entity';
import { SeedService } from '@api/infrastructure/persistence/seed.service';
import { TypeOrmCheckoutFinalizeAdapter } from '@api/infrastructure/persistence/typeorm-checkout-finalize.adapter';
import { TypeOrmCustomerRepository } from '@api/infrastructure/persistence/typeorm-customer.repository';
import { TypeOrmDeliveryRepository } from '@api/infrastructure/persistence/typeorm-delivery.repository';
import { TypeOrmProductRepository } from '@api/infrastructure/persistence/typeorm-product.repository';
import { TypeOrmStoreTransactionRepository } from '@api/infrastructure/persistence/typeorm-store-transaction.repository';
import { confidentielleHttpPaymentAdapter } from '@api/infrastructure/confidentielle/confidentielle-http-payment.adapter';
import { confidentielleMockPaymentAdapter } from '@api/infrastructure/confidentielle/confidentielle-mock-payment.adapter';
import { ProductsController } from '@api/presentation/products.controller';
import { TransactionsController } from '@api/presentation/transactions.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DATABASE_HOST', 'localhost'),
        port: Number(config.get<string>('DATABASE_PORT', '5432')),
        username: config.get<string>('DATABASE_USER', 'checkout'),
        password: config.get<string>('DATABASE_PASSWORD', 'checkout'),
        database: config.get<string>('DATABASE_NAME', 'checkout_db'),
        entities: [ProductEntity, CustomerEntity, DeliveryEntity, StoreTransactionEntity],
        synchronize: config.get<string>('DATABASE_SYNC', 'true') === 'true',
        logging: config.get<string>('DATABASE_LOGGING', 'false') === 'true',
      }),
    }),
    TypeOrmModule.forFeature([
      ProductEntity,
      CustomerEntity,
      DeliveryEntity,
      StoreTransactionEntity,
    ]),
  ],
  controllers: [ProductsController, TransactionsController],
  providers: [
    SeedService,
    ListProductsUseCase,
    CreatePendingTransactionUseCase,
    GetTransactionUseCase,
    ProcessPaymentUseCase,
    { provide: PRODUCT_REPOSITORY, useClass: TypeOrmProductRepository },
    { provide: CUSTOMER_REPOSITORY, useClass: TypeOrmCustomerRepository },
    { provide: DELIVERY_REPOSITORY, useClass: TypeOrmDeliveryRepository },
    { provide: STORE_TRANSACTION_REPOSITORY, useClass: TypeOrmStoreTransactionRepository },
    { provide: CHECKOUT_FINALIZE_PORT, useClass: TypeOrmCheckoutFinalizeAdapter },
    {
      provide: confidentielle_PAYMENT_PORT,
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const mock = cfg.get<string>('confidentielle_MOCK', 'false') === 'true';
        const key = cfg.get<string>('confidentielle_PRIVATE_KEY', '');
        if (mock || !key) {
          return new confidentielleMockPaymentAdapter();
        }
        return new confidentielleHttpPaymentAdapter(cfg);
      },
    },
  ],
})
export class CheckoutModule {}
