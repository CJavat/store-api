import * as bcrypt from 'bcrypt';

type validRoles = 'admin' | 'user';

interface SeedUserInterface {
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  password: string;
  role: validRoles;
  imageUrl?: string;
}

interface SeedData {
  users: SeedUserInterface[];
  //TODO: Terminar de expandirlo...
}

export const initialData: SeedData = {
  users: [
    {
      firstName: 'Daniel',
      lastName: 'Plascencia',
      email: 'da.plascencia@test.com',
      emailVerified: true,
      password: bcrypt.hashSync('Abc123', 10),
      role: 'admin',
    },
    {
      firstName: 'Carlos',
      lastName: 'Mercado',
      email: 'ca.mercado@test.com',
      emailVerified: true,
      password: bcrypt.hashSync('Abc123', 10),
      role: 'user',
    },
  ],
};
