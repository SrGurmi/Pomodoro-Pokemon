import path from 'node:path';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'prisma/schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL || 'file:./dev.db',
  },
  migrate: {
    async adapter() {
      const { PrismaLibSQL } = await import('@prisma/adapter-libsql');
      const { createClient } = await import('@libsql/client');
      const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
      const client = createClient({ url: dbUrl });
      return new PrismaLibSQL(client);
    },
  },
});
