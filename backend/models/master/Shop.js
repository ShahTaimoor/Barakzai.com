const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../../utils/encryption');

const shopSchema = new mongoose.Schema({
  shopId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  shopName: {
    type: String,
    required: true,
    trim: true
  },
  adminEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  databaseUrl: {
    type: String,
    required: true,
    // Encrypted MongoDB Atlas connection string
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
    index: true
  },
  // Subscription fields
  planId: {
    type: String,
    ref: 'Plan',
    index: true
  },
  subscriptionStart: {
    type: Date,
    default: null
  },
  subscriptionEnd: {
    type: Date,
    default: null,
    index: true
  },
  paymentStatus: {
    type: String,
    enum: ['PAID', 'UNPAID', 'OVERDUE'],
    default: 'UNPAID',
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Developer'
  }
}, {
  timestamps: true,
  collection: 'shops'
});

// Indexes (removed duplicates - already defined in schema fields with index: true)
// shopSchema.index({ shopId: 1 }); // Already indexed in schema
// shopSchema.index({ adminEmail: 1 }); // Already indexed in schema
// shopSchema.index({ status: 1 }); // Already indexed in schema

// Virtual to get decrypted database URL
shopSchema.virtual('decryptedDatabaseUrl').get(function() {
  try {
    return decrypt(this.databaseUrl);
  } catch (error) {
    return null;
  }
});

// Pre-save middleware to encrypt database URL
shopSchema.pre('save', async function(next) {
  if (this.isModified('databaseUrl') && this.databaseUrl) {
    try {
      // Only encrypt if not already encrypted (check if it's a valid base64 encrypted string)
      // Simple check: if it doesn't start with mongodb:// or mongodb+srv://, assume it's encrypted
      if (!this.databaseUrl.startsWith('mongodb://') && !this.databaseUrl.startsWith('mongodb+srv://')) {
        // Already encrypted, skip
        return next();
      }
      this.databaseUrl = encrypt(this.databaseUrl);
    } catch (error) {
      return next(new Error(`Failed to encrypt database URL: ${error.message}`));
    }
  }
  next();
});

// Method to get decrypted database URL
shopSchema.methods.getDecryptedDatabaseUrl = function() {
  try {
    return decrypt(this.databaseUrl);
  } catch (error) {
    throw new Error(`Failed to decrypt database URL: ${error.message}`);
  }
};

// Method to get shop without sensitive data
shopSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.databaseUrl; // Never expose encrypted URL
  return obj;
};

module.exports = shopSchema;
