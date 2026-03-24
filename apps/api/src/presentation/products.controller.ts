import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ListProductsUseCase } from '@api/application/use-cases/list-products.use-case';
import { unwrapResult } from '@api/presentation/http/map-checkout-error';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly listProducts: ListProductsUseCase) {}

  @Get()
  @ApiOkResponse({ description: 'Listado de productos con stock' })
  async list() {
    const result = await this.listProducts.execute();
    return unwrapResult(result);
  }
}
