const BaseRepository = require('../BaseRepository');
const developerSchema = require('../../models/master/Developer');
const mongoose = require('mongoose');

class DeveloperRepository extends BaseRepository {
  constructor() {
    // Initialize model - check if it already exists, otherwise create it
    let Developer;
    if (mongoose.models.Developer) {
      Developer = mongoose.models.Developer;
    } else {
      Developer = mongoose.model('Developer', developerSchema);
    }
    super(Developer);
  }

  /**
   * Find developer by email
   * @param {string} email - Developer email
   * @returns {Promise<Developer|null>}
   */
  async findByEmail(email) {
    return await this.findOne({ email: email.toLowerCase().trim() });
  }

  /**
   * Find developer by email with password (for login)
   * @param {string} email - Developer email
   * @returns {Promise<Developer|null>}
   */
  async findByEmailWithPassword(email) {
    return await this.findOne({ email: email.toLowerCase().trim() }, {
      select: '+password'
    });
  }

  /**
   * Find developer by ID with password
   * @param {string} id - Developer ID
   * @returns {Promise<Developer|null>}
   */
  async findByIdWithPassword(id) {
    return await this.findOne({ _id: id }, {
      select: '+password'
    });
  }

  /**
   * Check if email exists
   * @param {string} email - Developer email
   * @returns {Promise<boolean>}
   */
  async emailExists(email) {
    const count = await this.count({ email: email.toLowerCase().trim() });
    return count > 0;
  }

  /**
   * Update developer password
   * @param {string} developerId - Developer ID
   * @param {string} newPassword - New password
   * @returns {Promise<void>}
   */
  async updatePassword(developerId, newPassword) {
    const Developer = this.model;
    const developer = await Developer.findById(developerId);
    if (!developer) {
      throw new Error('Developer not found');
    }
    
    developer.password = newPassword;
    await developer.save();
  }
}

module.exports = new DeveloperRepository();
