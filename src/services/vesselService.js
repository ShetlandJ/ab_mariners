const { prisma } = require('../lib/prisma');

const vesselService = {
  async createVessel(userId, data) {
    return prisma.vessel.create({
      data: {
        ...data,
        user_id: userId,
      },
    });
  },

  async getVesselById(id) {
    return prisma.vessel.findUnique({
      where: { id },
    });
  },

  async getVesselsByUserId(userId) {
    return prisma.vessel.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
  },

  async updateVessel(id, data) {
    return prisma.vessel.update({
      where: { id },
      data,
    });
  },

  async deleteVessel(id) {
    return prisma.vessel.delete({
      where: { id },
    });
  }
};

module.exports = { vesselService };
