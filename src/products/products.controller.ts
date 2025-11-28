import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  Req,
  UploadedFile,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Auth } from 'src/auth/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from 'src/common/helpers/file-filter';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('find-all-products')
  findAll(@Query() paginationDto: PaginationDto) {
    return this.productsService.findAll(paginationDto);
  }

  @Get('search-term/:searchTerm')
  findByTerm(
    @Param('searchTerm') searchTerm: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.productsService.searchByTerm(searchTerm, paginationDto);
  }

  @Get('find-product/:id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Get('find-by-category/:categoryId')
  findByCategoryId(
    @Param('categoryId') categoryId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.productsService.findProductsByCategory(
      categoryId,
      paginationDto,
    );
  }

  @Post('create-product')
  @Auth('admin')
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Patch('update-product/:id')
  @Auth('admin')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Patch('update-image-user/:id')
  @Auth('admin')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
    }),
  )
  updateImageProduct(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.productsService.updateProductImage(id, file);
  }

  @Delete('delete-product/:id')
  @Auth('admin')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
