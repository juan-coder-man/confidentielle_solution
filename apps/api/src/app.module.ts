import { Module } from '@nestjs/common';
import { CheckoutModule } from '@api/checkout.module';

@Module({
  imports: [CheckoutModule],
})
export class AppModule {}
