const { prisma } = require('../lib/prisma');

const observationService = {
  async createObservation(userId, data) {
    return prisma.observation.create({
      data: {
        ...data,
        user_id: userId,
      },
    });
  },

  async getObservationById(id) {
    return prisma.observation.findUnique({
      where: { id },
      include: {
        vessel: true,
      },
    });
  },

  async getObservationsByUserId(userId) {
    return prisma.observation.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      include: {
        vessel: true,
      },
    });
  },

  async getObservationsByVesselId(vesselId) {
    return prisma.observation.findMany({
      where: { vessel_id: vesselId },
      orderBy: { created_at: 'desc' },
    });
  },

  async updateObservation(id, data) {
    return prisma.observation.update({
      where: { id },
      data,
    });
  },

  async deleteObservation(id) {
    return prisma.observation.delete({
      where: { id },
    });
  },

  async getNearbyObservations(latitude, longitude, radiusInKm = 10) {
    // Convert approximate distance formula to Prisma query
    // This is a simplified version, for production you'd want to use PostGIS with Prisma
    const latitudeDelta = radiusInKm / 111.0; // 1 degree latitude ~= 111km
    const longitudeDelta = radiusInKm / (111.0 * Math.cos(latitude * Math.PI / 180.0));
    
    return prisma.observation.findMany({
      where: {
        latitude: {
          gte: latitude - latitudeDelta,
          lte: latitude + latitudeDelta,
        },
        longitude: {
          gte: longitude - longitudeDelta,
          lte: longitude + longitudeDelta,
        },
      },
      orderBy: { created_at: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        vessel: true,
      },
    });
  }
};

module.exports = { observationService };
