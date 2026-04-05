const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

// 1. Na V7, o adaptador do SQLite só precisa receber a string com a URL
const adapter = new PrismaBetterSqlite3({
  url: "file:./prisma/dev.db"
});

// 2. Passamos o adaptador obrigatoriamente para o Prisma Client
const prisma = new PrismaClient({ adapter });

module.exports = prisma;