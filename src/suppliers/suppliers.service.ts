import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  private logger = new Logger();
  //TODO: TERMINAR.
  create(createSupplierDto: CreateSupplierDto) {
    try {
    } catch (error) {
      this.handleErrorException(error);
    }
  }

  findAll() {
    return `This action returns all suppliers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} supplier`;
  }

  update(id: number, updateSupplierDto: UpdateSupplierDto) {
    return `This action updates a #${id} supplier`;
  }

  remove(id: number) {
    return `This action removes a #${id} supplier`;
  }

  private handleErrorException(error: any) {
    // Si el error ES una excepción de Nest → relánzala
    if (error instanceof HttpException) {
      this.logger.error(error);
      throw error;
    }

    // Errores inesperados → manejar normalmente
    this.logger.fatal(`Ocurrió un error inesperado: ${error}`);
    throw new InternalServerErrorException(
      `Ocurrió un error inesperado: ${error}`,
    );
  }
}
