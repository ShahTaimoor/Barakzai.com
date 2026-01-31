const BaseRepository = require('../BaseRepository');
const shopSchema = require('../../models/master/Shop');
const mongoose = require('mongoose');

class ShopRepository extends BaseRepository {
  constructor() {
    // Initialize model - check if it already exists, otherwise create it
    let Shop;
    if (mongoose.models.Shop) {
      Shop = mongoose.models.Shop;
    } else {
      Shop = mongoose.model('Shop', shopSchema);
    }
    super(Shop);
  }

  /**
   * Find shop by shopId
   * @param {string} shopId - Shop ID
   * @returns {Promise<Shop|null>}
   */
  async findByShopId(shopId) {
    return await this.findOne({ shopId });
  }

  /**
   * Find shop by admin email
   * @param {string} email - Admin email
   * @returns {Promise<Shop|null>}
   */
  async findByAdminEmail(email) {
    return await this.findOne({ adminEmail: email.toLowerCase().trim() });
  }

  /**
   * Find active shops
   * @param {object} query - Additional query filters
   * @returns {Promise<Array>}
   */
  async findActiveShops(query = {}) {
    return await this.findAll({ ...query, status: 'active' });
  }

  /**
   * Check if shopId exists
   * @param {string} shopId - Shop ID
   * @returns {Promise<boolean>}
   */
  async shopIdExists(shopId) {
    const count = await this.count({ shopId });
    return count > 0;
  }

  /**
   * Check if admin email exists
   * @param {string} email - Admin email
   * @returns {Promise<boolean>}
   */
  async adminEmailExists(email) {
    const count = await this.count({ adminEmail: email.toLowerCase().trim() });
    return count > 0;
  }

  /**
   * Update shop status
   * @param {string} shopId - Shop ID
   * @param {string} status - New status
   * @returns {Promise<Shop>}
   */
  async updateStatus(shopId, status) {
    const shop = await this.findByShopId(shopId);
    if (!shop) {
      throw new Error('Shop not found');
    }
    return await this.updateById(
      shop._id,
      { status, updatedAt: new Date() }
    );
  }
}

module.exports = new ShopRepository();
