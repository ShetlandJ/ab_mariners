import { prisma } from '../lib/prisma';

export const vesselService = {
  async createVessel(userId: number, data: any) {
    return prisma.vessel.create({
      data: {
        ...data,
        user_id: userId,
      },
    });
  },

  async getVesselById(id: number) {
    return prisma.vessel.findUnique({
      where: { id },
    });
  },

  async getVesselsByUserId(userId: number) {
    return prisma.vessel.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
  },

  async updateVessel(id: number, data: any) {
    return prisma.vessel.update({
      where: { id },
      data,
    });
  },

  async deleteVessel(id: number) {
    return prisma.vessel.delete({
      where: { id },
    });
  }
};
