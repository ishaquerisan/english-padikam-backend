'use strict';
const path = require('path');
const categories = require('./data/categories.json');

module.exports = {
  up: async (queryInterface) => {
    const formattedCategories = categories.map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      malayalamName: c.malayalamName,
      icon: c.icon || 'MessageCircle',
      description: c.description || null,
      orderNumber: c.orderNumber || 0,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await queryInterface.bulkInsert('categories', formattedCategories, {
      updateOnDuplicate: ['name', 'slug', 'malayalamName', 'icon', 'description', 'orderNumber', 'status']
    });
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('categories', null, {});
  }
};
