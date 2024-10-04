
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
