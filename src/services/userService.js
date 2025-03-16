const { prisma } = require('../lib/prisma');
const bcrypt = require('bcrypt');

const userService = {
  async createUser(username, email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    return prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });
  },

  async getUserByUsername(username) {
    return prisma.user.findUnique({
      where: { username },
    });
  },

  async getUserByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  async getUserById(id) {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  async updateUser(id, data) {
    return prisma.user.update({
      where: { id },
      data,
    });
  },

  async deleteUser(id) {
    return prisma.user.delete({
      where: { id },
    });
  }
};

module.exports = { userService };
