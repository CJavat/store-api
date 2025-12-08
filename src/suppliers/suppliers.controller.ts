import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Auth } from 'src/auth/decorators';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}
  //TODO: TERMINAR.
  @Post('create')
  @Auth('admin')
  create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.suppliersService.create(createSupplierDto);
  }

  @Get()
  @Auth('admin')
  findAll() {
    return this.suppliersService.findAll();
  }

  @Get(':id')
  @Auth('admin')
  findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(+id);
  }

  @Patch(':id')
  @Auth('admin')
  update(
    @Param('id') id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return this.suppliersService.update(+id, updateSupplierDto);
  }

  @Delete(':id')
  @Auth('admin')
  remove(@Param('id') id: string) {
    return this.suppliersService.remove(+id);
  }
}
