











module.exports = { prisma };const prisma = globalForPrisma.prisma;}  globalForPrisma.prisma = new PrismaClient();if (!globalForPrisma.prisma) {const globalForPrisma = global;// Create a singleton PrismaClient instanceconst { PrismaClient } = require('@prisma/client');