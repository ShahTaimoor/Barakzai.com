# Enterprise Features Setup Guide

## Quick Start

### 1. Install Required Dependencies

```bash
npm install node-cron
```

### 2. Initialize Maintenance Jobs

Add to your `server.js` or main application file:

```javascript
// At the top
const { setupMaintenanceJobs } = require('./jobs/maintenanceJobs');

// After database connection
setupMaintenanceJobs();
```

### 3. Database Migration (Optional)

If you have existing products, you may want to set default costing method:

```javascript
// One-time migration script
const Product = require('./models/Product');

async function migrateProducts() {
  await Product.updateMany(
    { costingMethod: { $exists: false } },
    { $set: { costingMethod: 'standard' } }
  );
  console.log('Migration complete');
}
```

### 4. Verify Implementation

Test the new endpoints:

```bash
# Get audit logs
GET /api/products/:id/audit-logs

# Get expiring products
GET /api/products/expiring-soon?days=30

# Calculate cost
POST /api/products/:id/calculate-cost
Body: { "quantity": 10 }
```

## Configuration

### Costing Method Default
Products default to `'standard'` costing method. To use FIFO/LIFO:
- Set `costingMethod: 'fifo'` or `'lifo'` when creating products
- Ensure purchase invoices update FIFO batches (see costingService)

### Reservation Expiration
Default is 15 minutes for cart reservations. Adjust in:
- `stockReservationService.reserveStock()` - `expiresInMinutes` parameter

### Maintenance Schedule
Current schedule (in `maintenanceJobs.js`):
- **Reservation cleanup**: Every 5 minutes
- **Expiry check**: Daily at 9 AM
- **Expired write-off**: Disabled (requires manual approval)

Adjust as needed in `backend/jobs/maintenanceJobs.js`.

## Testing Checklist

- [x] Optimistic locking prevents concurrent updates
- [x] Audit logs are created for all operations
- [x] FIFO/LIFO cost calculations work correctly
- [x] Stock reservations expire automatically
- [x] Expiry management detects expiring products
- [x] Batch tracking works for FEFO

## Troubleshooting

### Version Conflicts
If you get "Product was modified by another user" errors:
- Frontend must send `version` field with updates
- Refresh product data before updating

### Audit Logs Not Appearing
- Ensure `req` object is passed to service methods
- Check audit log collection exists in database
- Verify user authentication

### Reservations Not Expiring
- Check cron job is running
- Verify `node-cron` is installed
- Check server logs for errors

### Cost Calculations Wrong
- Verify `costingMethod` is set on product
- Check FIFO batches are created on purchase
- Ensure inventory cost fields are populated

## Next Steps

1. **Field-Level Permissions** (Phase 2)
   - Implement granular permission checks
   - Add approval workflows for price changes

2. **Multi-Location Inventory** (Phase 3)
   - Add warehouse/location support
   - Implement inter-warehouse transfers

3. **Performance Optimization**
   - Add Redis caching for frequently accessed products
   - Implement Elasticsearch for product search

4. **Advanced Features**
   - Serial number tracking
   - Product bundles/kits
   - Supplier performance tracking

