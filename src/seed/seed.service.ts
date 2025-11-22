import { Injectable, NotImplementedException } from '@nestjs/common';
import { prisma } from 'src/lib/prisma';

import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
  async runSeed() {
    await this.deleteTables();

    await this.inserUsers();

    return {
      success: true,
      message: 'Seed executed.',
    };
  }

  private async deleteTables() {
    await prisma.user.deleteMany();

    return;
  }

  private async inserUsers() {
    const seedUsers = initialData.users;
    await prisma.user.createMany({
      data: seedUsers,
    });

    return;
  }
}
