<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# API Store

## Dev

1. Instalar las dependencias del proyecto con `yarn install`.
2. Diplicar archivo `.env.template` y renombrarlo a `.env` y configurar las variables de entorno.
3. Correr la base de datos con `docker composer up -d`
4. Ejecutar el Seed :
   ```
   http://localhost:3000/api/seed
   ```
5. Correr el proyecto. `yarn start:dev`.

## Prima ORM [Docs](https://www.prisma.io/docs/getting-started/prisma-orm/quickstart/postgresql)

- Ejecutar las migraciones
  ```
  npx prisma migrate dev
  ```
- Generar cliente de prisma
  ```
  npx prisma generate
  ```
- Crear una migración
  ```
  npx prisma migrate dev --name migration_name
  ```

## Cloudinary

-

## Estrucutra Del Pryecto

```
/src
 ├── auth/
 ├── users/
 ├── customers/
 ├── products/
 ├── categories/
 ├── inventory/
 ├── sales/
 ├── orders/
 ├── cash-register/
 ├── suppliers/
 ├── purchase-orders/
 ├── reports/
 ├── common/
 ├── prisma/
 └── app.module.ts

```
