import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Auth } from 'src/auth/decorators';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get('find-all-coupons')
  @Auth('admin')
  findAll(@Query('isActive') isActive?: string) {
    const active =
      isActive === 'true' ? true : isActive === 'false' ? false : undefined;

    return this.couponsService.findAll(active);
  }

  @Get('find-coupon/:id')
  @Auth('admin')
  findOne(@Param('id') id: string) {
    return this.couponsService.findOne(id);
  }

  @Get('coupons-by-user')
  @Auth()
  findCouponsByUser(@Req() request: Express.Request) {
    return this.couponsService.couponsByUser(request);
  }

  @Post('create-coupon')
  @Auth('admin')
  create(@Body() createCouponDto: CreateCouponDto) {
    return this.couponsService.create(createCouponDto);
  }

  @Patch('update-coupon/:id')
  @Auth('admin')
  update(@Param('id') id: string, @Body() updateCouponDto: UpdateCouponDto) {
    return this.couponsService.update(id, updateCouponDto);
  }

  @Delete('delete-coupon/:id')
  @Auth('admin')
  remove(@Param('id') id: string) {
    return this.couponsService.remove(id);
  }
}
