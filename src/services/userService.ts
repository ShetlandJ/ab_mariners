import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';

export const userService = {
  async createUser(username: string, email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    return prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });
  },

  async getUserByUsername(username: string) {
    return prisma.user.findUnique({
      where: { username },
    });
  },

  async getUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  async getUserById(id: number) {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  async updateUser(id: number, data: any) {
    return prisma.user.update({
      where: { id },
      data,
    });
  },

  async deleteUser(id: number) {
    return prisma.user.delete({
      where: { id },
    });
  }
};
