import path from 'node:path';
import { defineConfig } from 'prisma/config';

const dbUrl =
  process.env.TURSO_DATABASE_URL ||
  process.env.DATABASE_URL ||
  'file:/tmp/dev.db';

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'backend/prisma/schema.prisma'),
  datasource: {
    url: dbUrl,
  },
  migrate: {
    async adapter() {
      const { PrismaLibSql } = await import('@prisma/adapter-libsql');
      const authToken = process.env.TURSO_AUTH_TOKEN;
      return new PrismaLibSql({
        url: dbUrl,
        ...(authToken ? { authToken } : {}),
      });
    },
  },
});
