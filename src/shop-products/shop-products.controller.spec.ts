import { Test, TestingModule } from '@nestjs/testing';
import { ShopProductsController } from './shop-products.controller';

describe('ShopProductsController', () => {
  let controller: ShopProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShopProductsController],
    }).compile();

    controller = module.get<ShopProductsController>(ShopProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
