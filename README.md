
## Install node_modules packages in main api folder:
```bash
npm install
```


## Config .env in main api folder
### Create .env file:

```bash
PORT=3000
DATABASE_URL="mysql://root:@localhost:3306/NUpak"
```

### Generate JWT_SECRET 
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
## en caso de no hacer la migracion de los datos ejecutar:
```bash
npm run seed
```

## Others comands for migrate
### Create others migrations:
```bash
npx prisma migrate dev --name name_migrate
```
### Prisma generate client
```bash
npx prisma generate 
```
### Prisma studio for manage DB
```bash
npx prisma studio 
```