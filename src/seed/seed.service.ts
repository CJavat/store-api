import { Injectable, NotImplementedException } from '@nestjs/common';
import { prisma } from 'src/lib/prisma';

import { initialData } from './data/seed-data';
import { countries } from './data/seed-countries';

@Injectable()
export class SeedService {
  async runSeed() {
    await this.deleteTables();

    await this.insertCountries();

    await this.inserUsers();

    await this.insertCategories();

    await this.insertProducts();

    return {
      success: true,
      message: 'Seed executed.',
    };
  }

  private async deleteTables() {
    await prisma.couponUsage.deleteMany();
    await prisma.coupon.deleteMany();

    await prisma.productImage.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();

    await prisma.userAddress.deleteMany();
    await prisma.country.deleteMany();
    await prisma.userImage.deleteMany();
    await prisma.user.deleteMany();

    return;
  }

  private async insertCountries() {
    await prisma.country.createMany({ data: countries });

    return;
  }

  private async inserUsers() {
    const seedUsers = initialData.users;
    await prisma.user.createMany({
      data: seedUsers,
    });

    return;
  }

  private async insertCategories() {
    const seedCategories = initialData.categories;
    await prisma.category.createMany({
      data: seedCategories,
    });

    return;
  }

  private async insertProducts() {
    const seedProducts = initialData.products;
    await prisma.product.createMany({
      data: seedProducts,
    });
  }
}
