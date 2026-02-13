const CustomerBalanceService = require('../services/customerBalanceService');
const AccountingService = require('../services/accountingService');
const ReturnRepository = require('../repositories/postgres/ReturnRepository');
const SalesRepository = require('../repositories/SalesRepository');
const SalesOrderRepository = require('../repositories/SalesOrderRepository');
const PurchaseInvoiceRepository = require('../repositories/PurchaseInvoiceRepository');
const PurchaseOrderRepository = require('../repositories/PurchaseOrderRepository');
const ProductRepository = require('../repositories/postgres/ProductRepository');
const CustomerRepository = require('../repositories/postgres/CustomerRepository');
const SupplierRepository = require('../repositories/postgres/SupplierRepository');
const InventoryRepository = require('../repositories/postgres/InventoryRepository');
const StockMovementRepository = require('../repositories/StockMovementRepository');

class ReturnManagementService {
  constructor() {
    this.returnReasons = [
      'defective', 'wrong_item', 'not_as_described', 'damaged_shipping',
      'changed_mind', 'duplicate_order', 'size_issue', 'quality_issue',
      'late_delivery', 'other'
    ];

    this.returnActions = [
      'refund', 'exchange', 'store_credit', 'repair', 'replace'
    ];
  }

  /** Fetch order from Postgres and normalize to shape expected by return logic (customer, supplier, items with _id and product). */
  async fetchAndNormalizeOrder(orderId, isPurchaseReturn) {
    let row = null;
    if (isPurchaseReturn) {
      row = await PurchaseInvoiceRepository.findById(orderId);
      if (!row) row = await PurchaseOrderRepository.findById(orderId);
    } else {
      row = await SalesRepository.findById(orderId);
      if (!row) row = await SalesOrderRepository.findById(orderId);
    }
    if (!row) return null;

    const id = row.id || row._id;
    let items = row.items;
    if (typeof items === 'string') items = JSON.parse(items);
    if (!Array.isArray(items)) items = [];

    const normalizedItems = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const productId = it.product || it.product_id;
      const product = productId ? await ProductRepository.findById(typeof productId === 'object' ? (productId.id || productId._id) : productId) : null;
      normalizedItems.push({
        ...it,
        _id: it.id || it._id || `${id}-${i}`,
        id: it.id || it._id || `${id}-${i}`,
        product: product || (productId ? { _id: productId, id: productId } : null)
      });
    }

    let customer = null;
    let supplier = null;
    if (row.customer_id) customer = await CustomerRepository.findById(row.customer_id);
    if (row.supplier_id) supplier = await SupplierRepository.findById(row.supplier_id);

    return {
      _id: id,
      id,
      customer_id: row.customer_id,
      supplier_id: row.supplier_id,
      customer: customer || row.customer_id,
      supplier: supplier || row.supplier_id,
      items: normalizedItems,
      createdAt: row.created_at || row.createdAt,
      orderDate: row.order_date || row.sale_date || row.invoice_date,
      orderNumber: row.order_number || row.so_number || row.invoice_number || row.po_number
    };
  }

  // Create a new return request (persisted in PostgreSQL)
  async createReturn(returnData, requestedBy) {
    const isPurchaseReturn = returnData.origin === 'purchase';

    const originalOrder = await this.fetchAndNormalizeOrder(returnData.originalOrder, isPurchaseReturn);

    if (!originalOrder) {
      throw new Error('Original order not found');
    }

    if (!isPurchaseReturn) {
      const eligibility = await this.checkReturnEligibility(originalOrder, returnData.items);
      if (!eligibility.eligible) {
        throw new Error(eligibility.reason);
      }
      await this.validateReturnItems(originalOrder, returnData.items);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Plain object for calculations (same shape as Mongo doc for calculateRefundAmounts)
    const returnRequest = {
      ...returnData,
      customer: isPurchaseReturn ? null : (originalOrder.customer?._id || originalOrder.customer),
      supplier: isPurchaseReturn ? (originalOrder.supplier?._id || originalOrder.supplier) : null,
      requestedBy,
      returnDate: today,
      status: 'completed',
      processedBy: requestedBy,
      receivedBy: requestedBy,
      policy: returnData.policy || { restockingFeePercent: 0 },
      items: returnData.items.map(item => ({ ...item }))
    };

    await this.calculateRefundAmounts(returnRequest);

    const totalRefundAmount = returnRequest.items.reduce((s, i) => s + (Number(i.refundAmount) || 0), 0);
    const totalRestockingFee = returnRequest.items.reduce((s, i) => s + (Number(i.restockingFee) || 0), 0);
    const netRefundAmount = totalRefundAmount - totalRestockingFee;
    returnRequest.totalRefundAmount = totalRefundAmount;
    returnRequest.totalRestockingFee = totalRestockingFee;
    returnRequest.netRefundAmount = netRefundAmount;

    const returnNumber = await ReturnRepository.getNextReturnNumber();

    const referenceId = originalOrder.id ? String(originalOrder.id) : String(originalOrder._id);
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const custId = originalOrder.customer?._id || originalOrder.customer;
    const suppId = originalOrder.supplier?._id || originalOrder.supplier;
    const customerId = custId && uuidRegex.test(String(custId)) ? String(custId) : null;
    const supplierId = suppId && uuidRegex.test(String(suppId)) ? String(suppId) : null;
    const createdBy = requestedBy?.id || requestedBy?._id || requestedBy;

    const itemsForPostgres = returnRequest.items.map(item => ({
      product: item.product?._id ? String(item.product._id) : String(item.product),
      originalOrderItem: item.originalOrderItem ? String(item.originalOrderItem) : null,
      quantity: item.quantity,
      originalPrice: item.originalPrice,
      returnReason: item.returnReason,
      returnReasonDetail: item.returnReasonDetail,
      condition: item.condition,
      action: item.action,
      refundAmount: item.refundAmount,
      restockingFee: item.restockingFee,
      generalNotes: item.generalNotes
    }));

    const created = await ReturnRepository.create({
      returnNumber,
      returnType: isPurchaseReturn ? 'purchase_return' : 'sale_return',
      referenceId,
      customerId: customerId || null,
      supplierId: supplierId || null,
      returnDate: today,
      items: itemsForPostgres,
      totalAmount: netRefundAmount,
      reason: null,
      status: 'completed',
      createdBy
    });

    const createdReturn = created && (typeof created.items === 'string' ? { ...created, items: JSON.parse(created.items) } : created);

    const returnRequestForDownstream = {
      _id: createdReturn.id,
      id: createdReturn.id,
      returnNumber: createdReturn.return_number,
      origin: isPurchaseReturn ? 'purchase' : 'sales',
      returnType: returnData.returnType || 'return',
      status: 'completed',
      items: returnRequest.items.map(item => ({
        ...item,
        product: item.product?.name ? item.product : (originalOrder.items?.find(oi => oi.product?._id?.toString() === String(item.product))?.product || item.product)
      })),
      originalOrder: originalOrder.id || originalOrder._id,
      customer: originalOrder.customer,
      supplier: originalOrder.supplier,
      netRefundAmount,
      totalRefundAmount,
      totalRestockingFee,
      refundMethod: returnData.refundMethod || 'original_payment',
      inspection: null
    };

    await this.updateInventoryForReturn(returnRequestForDownstream);

    if (returnRequestForDownstream.returnType === 'return') {
      await this.processRefund(returnRequestForDownstream);
    } else if (returnRequestForDownstream.returnType === 'exchange') {
      await this.processExchange(returnRequestForDownstream);
    }

    await this.notifyCustomer(returnRequestForDownstream, 'return_completed');

    return returnRequestForDownstream;
  }

  // Check if order is eligible for return
  async checkReturnEligibility(order, returnItems) {
    const now = new Date();
    const daysSinceOrder = Math.floor((now - order.createdAt) / (1000 * 60 * 60 * 24));

    // Check return window (default 30 days)
    const returnWindow = 30; // This could be configurable per product/category
    if (daysSinceOrder > returnWindow) {
      return {
        eligible: false,
        reason: `Return window has expired. Order is ${daysSinceOrder} days old.`
      };
    }

    // Check if items are returnable
    for (const returnItem of returnItems) {
      const orderItem = order.items.find(item =>
        String(item._id || item.id) === String(returnItem.originalOrderItem)
      );

      if (!orderItem) {
        return {
          eligible: false,
          reason: 'Item not found in original order'
        };
      }

      // Check if return quantity exceeds order quantity (allows multiple returns as long as total doesn't exceed)
      const alreadyReturnedQuantity = await this.getAlreadyReturnedQuantity(
        order._id,
        returnItem.originalOrderItem
      );

      const remainingQuantity = orderItem.quantity - alreadyReturnedQuantity;

      if (remainingQuantity <= 0) {
        return {
          eligible: false,
          reason: `All ${orderItem.quantity} items have already been returned.`
        };
      }

      if (returnItem.quantity > remainingQuantity) {
        return {
          eligible: false,
          reason: `Cannot return ${returnItem.quantity} items. Only ${remainingQuantity} item(s) available for return (${alreadyReturnedQuantity} already returned out of ${orderItem.quantity} sold).`
        };
      }
    }

    return { eligible: true };
  }

  // Validate return items
  async validateReturnItems(originalOrder, returnItems) {
    for (const returnItem of returnItems) {
      const orderItem = originalOrder.items.find(item =>
        String(item._id || item.id) === String(returnItem.originalOrderItem)
      );

      if (!orderItem) {
        throw new Error(`Order item not found: ${returnItem.originalOrderItem}`);
      }

      const productId = orderItem.product && (orderItem.product.id || orderItem.product._id);
      const product = productId ? await ProductRepository.findById(productId) : null;
      if (!product) {
        throw new Error(`Product not found: ${productId || orderItem.product}`);
      }

      // Always set original price from order (override any frontend value)
      // Sales/Orders use unitPrice, legacy might use price
      returnItem.originalPrice = Number(orderItem.unitPrice || orderItem.price) || 0;
      console.log(`Set originalPrice for item ${returnItem.product}: ${returnItem.originalPrice}`);

      // Always set default values for optional fields (override any frontend value)
      // Handle string "undefined" or actual undefined values
      returnItem.refundAmount = Number(returnItem.refundAmount) || 0;
      returnItem.restockingFee = Number(returnItem.restockingFee) || 0;
      console.log(`Set refundAmount: ${returnItem.refundAmount}, restockingFee: ${returnItem.restockingFee} for item ${returnItem.product}`);
    }
  }

  // Calculate refund amounts for return items
  async calculateRefundAmounts(returnRequest) {
    console.log('Calculating refund amounts for return items...');
    for (const item of returnRequest.items) {
      console.log(`Processing item: ${item.product}, originalPrice: ${item.originalPrice}, quantity: ${item.quantity}`);

      // Calculate restocking fee based on condition and policy
      const baseFee = Number(returnRequest.policy?.restockingFeePercent) || 0;
      const restockingFeePercent = this.calculateRestockingFee(
        item.condition,
        item.returnReason,
        baseFee
      );

      console.log(`Restocking fee percent: ${restockingFeePercent}%`);

      item.restockingFee = (item.originalPrice * item.quantity * restockingFeePercent) / 100;

      // Calculate refund amount
      item.refundAmount = (item.originalPrice * item.quantity) - item.restockingFee;

      console.log(`Calculated amounts - refundAmount: ${item.refundAmount}, restockingFee: ${item.restockingFee}`);
    }

    console.log('All item amounts calculated. Return totals will be calculated in pre-save middleware.');
  }

  // Calculate restocking fee based on various factors
  calculateRestockingFee(condition, returnReason, baseFeePercent) {
    let feePercent = baseFeePercent || 0;

    // Adjust fee based on condition
    switch (condition) {
      case 'new':
      case 'like_new':
        feePercent *= 0.5; // Reduce fee for good condition
        break;
      case 'good':
        break; // No adjustment
      case 'fair':
        feePercent *= 1.5; // Increase fee for fair condition
        break;
      case 'poor':
      case 'damaged':
        feePercent *= 2; // Double fee for poor condition
        break;
    }

    // Adjust fee based on return reason
    switch (returnReason) {
      case 'defective':
      case 'wrong_item':
      case 'damaged_shipping':
        feePercent = 0; // No fee for store error
        break;
      case 'changed_mind':
        feePercent *= 1.5; // Higher fee for change of mind
        break;
    }

    return Math.min(feePercent, 100); // Cap at 100%
  }

  // Get already returned quantity for an order item
  async getAlreadyReturnedQuantity(orderId, orderItemId) {
    const returns = await ReturnRepository.findAll({
      referenceId: String(orderId)
    });

    const excludeStatus = ['rejected', 'cancelled'];
    let totalReturned = 0;
    const orderItemStr = String(orderItemId);
    (returns || []).forEach(returnDoc => {
      if (excludeStatus.includes(returnDoc.status)) return;
      (returnDoc.items || []).forEach(item => {
        if (String(item.originalOrderItem) === orderItemStr) {
          totalReturned += item.quantity || 0;
        }
      });
    });

    return totalReturned;
  }

  // Approve return request
  async approveReturn(returnId, approvedBy, notes = null) {
    try {
      const returnRequest = await ReturnRepository.findById(returnId);
      if (!returnRequest) {
        throw new Error('Return request not found');
      }

      const status = returnRequest.status || returnRequest.status;
      if (status !== 'pending') {
        throw new Error('Return request cannot be approved in current status');
      }

      await ReturnRepository.update(returnId, { status: 'approved', updatedBy: approvedBy });

      const updated = await ReturnRepository.findById(returnId);
      await this.notifyCustomer(updated || returnRequest, 'return_approved');

      return updated || returnRequest;
    } catch (error) {
      console.error('Error approving return:', error);
      throw error;
    }
  }

  // Reject return request
  async rejectReturn(returnId, rejectedBy, reason) {
    try {
      const returnRequest = await ReturnRepository.findById(returnId);
      if (!returnRequest) {
        throw new Error('Return request not found');
      }

      const currentStatus = returnRequest.status;
      if (currentStatus !== 'pending') {
        throw new Error('Return request cannot be rejected in current status');
      }

      await ReturnRepository.update(returnId, { status: 'rejected', updatedBy: rejectedBy });

      const updated = await ReturnRepository.findById(returnId);
      await this.notifyCustomer(updated || returnRequest, 'return_rejected');

      return updated || returnRequest;
    } catch (error) {
      console.error('Error rejecting return:', error);
      throw error;
    }
  }

  // Process received return with full accounting integration
  async processReceivedReturn(returnId, receivedBy, inspectionData = {}) {
    try {
      const returnRequest = await ReturnRepository.findById(returnId);

      if (!returnRequest) {
        throw new Error('Return request not found');
      }

      const status = returnRequest.status;
      if (!['approved', 'processing', 'received'].includes(status)) {
        throw new Error('Return cannot be processed in current status');
      }

      await ReturnRepository.update(returnId, { status: 'received' });

      if (inspectionData && Object.keys(inspectionData).length > 0) {
        const inspection = {
          ...inspectionData,
          inspectedBy: receivedBy,
          inspectionDate: new Date()
        };
        await ReturnRepository.update(returnId, { inspection, updatedBy: receivedBy });
      }

      const returnForInventory = await this.buildReturnRequestForDownstream(returnRequest);
      await this.updateInventoryForReturn(returnForInventory);

      if ((returnRequest.return_type || returnRequest.returnType) === 'sale_return' || (returnRequest.return_type || returnRequest.returnType) === 'return') {
        await this.processRefund(returnForInventory);
      } else if ((returnRequest.return_type || returnRequest.returnType) === 'exchange') {
        await this.processExchange(returnForInventory);
      }

      await ReturnRepository.update(returnId, { status: 'completed', updatedBy: receivedBy });

      const updated = await ReturnRepository.findById(returnId);
      await this.notifyCustomer(updated || returnRequest, 'return_completed');

      return updated || returnRequest;
    } catch (error) {
      console.error('Error processing return:', error);
      throw error;
    }
  }

  async buildReturnRequestForDownstream(returnRow) {
    const items = typeof returnRow.items === 'string' ? JSON.parse(returnRow.items) : (returnRow.items || []);
    return {
      _id: returnRow.id,
      id: returnRow.id,
      returnNumber: returnRow.return_number,
      origin: (returnRow.return_type || '').includes('purchase') ? 'purchase' : 'sales',
      returnType: (returnRow.return_type || '').includes('purchase') ? 'purchase_return' : 'return',
      status: returnRow.status,
      items,
      originalOrder: returnRow.reference_id,
      customer: returnRow.customer_id,
      supplier: returnRow.supplier_id,
      netRefundAmount: parseFloat(returnRow.total_amount) || 0,
      totalRefundAmount: parseFloat(returnRow.total_amount) || 0,
      refundMethod: 'original_payment',
      inspection: null
    };
  }

  // Update inventory for returned items with proper cost tracking
  async updateInventoryForReturn(returnRequest) {
    const isPurchaseReturn = returnRequest.origin === 'purchase';

    for (const item of returnRequest.items) {
      const productId = item.product && (item.product.id || item.product._id) || item.product;
      let inventory = await InventoryRepository.findOne({ product: productId, productId });

      if (!inventory) {
        inventory = await InventoryRepository.create({
          product: productId,
          productId,
          currentStock: 0,
          reservedStock: 0,
          reorderPoint: 0,
          reorderQuantity: 0
        });
      }

      const originalOrder = await this.getOriginalOrder(returnRequest.originalOrder || returnRequest.reference_id, isPurchaseReturn);
      const originalItem = originalOrder && originalOrder.items && originalOrder.items.find(oi =>
        String(oi._id || oi.id) === String(item.originalOrderItem)
      );

      const unitCost = originalItem?.unit_cost || originalItem?.unitCost || originalItem?.costPerUnit || originalItem?.unitPrice || originalItem?.unit_price || 0;
      const returnCost = unitCost * item.quantity;
      const currentStock = Number(inventory.current_stock ?? inventory.currentStock ?? 0);

      if (isPurchaseReturn) {
        if (currentStock < item.quantity) {
          throw new Error(`Insufficient stock for product ${item.product?.name || productId}. Available: ${currentStock}, Required: ${item.quantity}`);
        }
        await this.logInventoryMovement(
          item,
          'out',
          item.quantity,
          returnCost,
          returnRequest.returnNumber || returnRequest.return_number,
          returnRequest.id || returnRequest._id
        );
      } else {
        if (!returnRequest.inspection || returnRequest.inspection.resellable !== false) {
          await this.logInventoryMovement(
            item,
            'return',
            item.quantity,
            returnCost,
            returnRequest.returnNumber || returnRequest.return_number,
            returnRequest.id || returnRequest._id
          );
        }
      }
    }
  }

  // Helper to get original order with populated items (from Postgres)
  async getOriginalOrder(orderId, isPurchaseReturn) {
    return this.fetchAndNormalizeOrder(orderId, isPurchaseReturn);
  }

  // Log inventory movement with proper cost tracking (Postgres)
  async logInventoryMovement(item, type, quantity, cost, reference, returnId = null) {
    try {
      const productId = item.product && (item.product.id || item.product._id) || item.product;
      const inventory = await InventoryRepository.findOne({ product: productId, productId });
      if (!inventory) return;

      let movementType = type === 'return' ? (quantity > 0 ? 'return' : 'out') : type;
      const qty = Math.abs(quantity);
      const currentStock = Number(inventory.current_stock ?? inventory.currentStock ?? 0);
      const newStock = movementType === 'return' ? currentStock + qty : Math.max(0, currentStock - qty);

      if (movementType !== 'return' && currentStock < qty) {
        return; // Don't throw - inventory update is more critical
      }

      const product = await ProductRepository.findById(productId);
      await StockMovementRepository.create({
        productId,
        productName: product?.name,
        productSku: product?.sku,
        movementType: movementType,
        quantity: qty,
        unitCost: cost / qty || 0,
        totalValue: cost || 0,
        previousStock: currentStock,
        newStock,
        referenceType: 'Return',
        referenceId: returnId,
        referenceNumber: reference || 'Return',
        status: 'completed'
      });

      await InventoryRepository.updateById(inventory.id, {
        currentStock: newStock,
        availableStock: Math.max(0, newStock - (inventory.reserved_stock ?? inventory.reservedStock ?? 0))
      });
    } catch (error) {
      console.error('Error logging inventory movement:', error);
    }
  }

  // Process refund with proper accounting entries
  async processRefund(returnRequest) {
    try {
      const isPurchaseReturn = returnRequest.origin === 'purchase';
      const netAmount = returnRequest.netRefundAmount || 0;

      if (isPurchaseReturn) {
        // Purchase Return: Process supplier refund/credit
        await this.processPurchaseReturnRefund(returnRequest, netAmount);
      } else {
        // Sale Return: Process customer refund
        await this.processSaleReturnRefund(returnRequest, netAmount);
      }

      const refundDetails = {
        refundDate: new Date(),
        refundReference: returnRequest.return_number || returnRequest.returnNumber
      };
      await ReturnRepository.update(returnRequest.id || returnRequest._id, { refundDetails });
      returnRequest.refund_details = refundDetails;
      returnRequest.refundDetails = refundDetails;

      return returnRequest;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }

  // Process Sale Return refund with accounting entries
  async processSaleReturnRefund(returnRequest, refundAmount) {
    try {
      const accountCodes = await AccountingService.getDefaultAccountCodes();

      const originalSale = await this.getOriginalOrder(
        returnRequest.originalOrder || returnRequest.reference_id,
        false
      );
      if (!originalSale) {
        throw new Error('Original sale not found');
      }

      // Calculate COGS adjustment (reverse COGS for returned items)
      const cogsAdjustment = await this.calculateCOGSAdjustment(returnRequest, originalSale);

      // Create accounting entries based on refund method
      const refundMethod = returnRequest.refundMethod || 'original_payment';

      if (refundMethod === 'cash' || refundMethod === 'original_payment') {
        // Cash refund: Dr Sales Return, Cr Cash
        await this.createDoubleEntry(
          {
            accountCode: await AccountingService.getAccountCode('Sales Returns', 'revenue', 'sales_revenue').catch(() => accountCodes.salesRevenue),
            debitAmount: refundAmount,
            creditAmount: 0,
            description: `Sale Return ${returnRequest.returnNumber}`,
            reference: returnRequest.returnNumber,
            returnId: returnRequest._id
          },
          {
            accountCode: accountCodes.cash,
            debitAmount: 0,
            creditAmount: refundAmount,
            description: `Cash Refund for Return ${returnRequest.returnNumber}`,
            reference: returnRequest.returnNumber,
            returnId: returnRequest._id
          }
        );
      } else if (refundMethod === 'store_credit') {
        // Store credit: Dr Sales Return, Cr Accounts Receivable
        await this.createDoubleEntry(
          {
            accountCode: await AccountingService.getAccountCode('Sales Returns', 'revenue', 'sales_revenue').catch(() => accountCodes.salesRevenue),
            debitAmount: refundAmount,
            creditAmount: 0,
            description: `Sale Return ${returnRequest.returnNumber}`,
            reference: returnRequest.returnNumber,
            returnId: returnRequest._id
          },
          {
            accountCode: accountCodes.accountsReceivable || '1100',
            debitAmount: 0,
            creditAmount: refundAmount,
            description: `Store Credit - Return ${returnRequest.returnNumber}`,
            reference: returnRequest.returnNumber,
            returnId: returnRequest._id
          }
        );

        // Adjust customer balance (credit)
        await CustomerBalanceService.recordRefund(
          returnRequest.customer,
          refundAmount,
          returnRequest.originalOrder,
          null,
          { returnId: returnRequest._id, returnNumber: returnRequest.returnNumber }
        );
      } else {
        // Bank transfer or other: Dr Sales Return, Cr Bank
        await this.createDoubleEntry(
          {
            accountCode: await AccountingService.getAccountCode('Sales Returns', 'revenue', 'sales_revenue').catch(() => accountCodes.salesRevenue),
            debitAmount: refundAmount,
            creditAmount: 0,
            description: `Sale Return ${returnRequest.returnNumber}`,
            reference: returnRequest.returnNumber,
            returnId: returnRequest._id
          },
          {
            accountCode: accountCodes.bank,
            debitAmount: 0,
            creditAmount: refundAmount,
            description: `Bank Refund for Return ${returnRequest.returnNumber}`,
            reference: returnRequest.returnNumber,
            returnId: returnRequest._id
          }
        );
      }

      // COGS Adjustment: Dr Inventory, Cr COGS (reverse the original COGS)
      if (cogsAdjustment > 0) {
        await this.createDoubleEntry(
          {
            accountCode: accountCodes.inventory,
            debitAmount: cogsAdjustment,
            creditAmount: 0,
            description: `Inventory Restored - Return ${returnRequest.returnNumber}`,
            reference: returnRequest.returnNumber,
            returnId: returnRequest._id
          },
          {
            accountCode: accountCodes.costOfGoodsSold,
            debitAmount: 0,
            creditAmount: cogsAdjustment,
            description: `COGS Reversed - Return ${returnRequest.returnNumber}`,
            reference: returnRequest.returnNumber,
            returnId: returnRequest._id
          }
        );
      }

      // Update customer balance if sale was on credit
      if (originalSale.payment?.status === 'pending' || originalSale.payment?.status === 'partial') {
        await CustomerBalanceService.recordRefund(
          returnRequest.customer,
          refundAmount,
          returnRequest.originalOrder,
          null,
          { returnId: returnRequest._id, returnNumber: returnRequest.returnNumber }
        );
      }

    } catch (error) {
      console.error('Error processing sale return refund:', error);
      throw error;
    }
  }

  // Process Purchase Return refund with accounting entries
  async processPurchaseReturnRefund(returnRequest, refundAmount) {
    try {
      const accountCodes = await AccountingService.getDefaultAccountCodes();

      const originalInvoice = await this.getOriginalOrder(
        returnRequest.originalOrder || returnRequest.reference_id,
        true
      );
      if (!originalInvoice) {
        throw new Error('Original purchase invoice not found');
      }

      // Calculate COGS adjustment (reverse COGS for returned items)
      const cogsAdjustment = await this.calculatePurchaseCOGSAdjustment(returnRequest, originalInvoice);

      // Accounting Entry: Dr Supplier Accounts Payable, Cr Purchase Returns
      await this.createDoubleEntry(
        {
          accountCode: accountCodes.accountsPayable,
          debitAmount: refundAmount,
          creditAmount: 0,
          description: `Purchase Return ${returnRequest.returnNumber} - Supplier Credit`,
          reference: returnRequest.returnNumber,
          returnId: returnRequest._id,
          supplierId: returnRequest.supplier
        },
        {
          accountCode: await AccountingService.getAccountCode('Purchase Returns', 'expense', 'cost_of_goods_sold').catch(() => accountCodes.costOfGoodsSold),
          debitAmount: 0,
          creditAmount: refundAmount,
          description: `Purchase Return ${returnRequest.returnNumber}`,
          reference: returnRequest.returnNumber,
          returnId: returnRequest._id
        }
      );

      // COGS Adjustment: Dr COGS, Cr Inventory (reverse inventory increase)
      if (cogsAdjustment > 0) {
        await this.createDoubleEntry(
          {
            accountCode: accountCodes.costOfGoodsSold,
            debitAmount: cogsAdjustment,
            creditAmount: 0,
            description: `COGS Adjusted - Purchase Return ${returnRequest.returnNumber}`,
            reference: returnRequest.returnNumber,
            returnId: returnRequest._id
          },
          {
            accountCode: accountCodes.inventory,
            debitAmount: 0,
            creditAmount: cogsAdjustment,
            description: `Inventory Reduced - Purchase Return ${returnRequest.returnNumber}`,
            reference: returnRequest.returnNumber,
            returnId: returnRequest._id
          }
        );
      }

      // Handle payment method
      const refundMethod = returnRequest.refundMethod || 'original_payment';
      if (refundMethod === 'cash' || refundMethod === 'bank_transfer') {
        // If cash/bank refund received from supplier
        const cashAccount = refundMethod === 'cash' ? accountCodes.cash : accountCodes.bank;

        await this.createDoubleEntry(
          {
            accountCode: cashAccount,
            debitAmount: refundAmount,
            creditAmount: 0,
            description: `Cash/Bank Refund Received - Purchase Return ${returnRequest.returnNumber}`,
            reference: returnRequest.returnNumber,
            returnId: returnRequest._id
          },
          {
            accountCode: accountCodes.accountsPayable,
            debitAmount: 0,
            creditAmount: refundAmount,
            description: `Supplier Payable Reduced - Purchase Return ${returnRequest.returnNumber}`,
            reference: returnRequest.returnNumber,
            returnId: returnRequest._id
          }
        );
      }

      // Update supplier balance
      await this.updateSupplierBalance(returnRequest.supplier, refundAmount, returnRequest.originalOrder);

    } catch (error) {
      console.error('Error processing purchase return refund:', error);
      throw error;
    }
  }

  /**
   * Create double-entry accounting (PostgreSQL) for returns.
   * Replaces the old single-entry createAccountingEntry - call once per pair.
   */
  async createDoubleEntry(entry1Data, entry2Data) {
    try {
      const entry1 = {
        accountCode: entry1Data.accountCode,
        debitAmount: entry1Data.debitAmount || 0,
        creditAmount: entry1Data.creditAmount || 0,
        description: entry1Data.description
      };
      const entry2 = {
        accountCode: entry2Data.accountCode,
        debitAmount: entry2Data.debitAmount || 0,
        creditAmount: entry2Data.creditAmount || 0,
        description: entry2Data.description
      };
      const metadata = {
        referenceType: 'return',
        referenceId: entry1Data.returnId || entry2Data.returnId,
        referenceNumber: entry1Data.reference || entry2Data.reference,
        customerId: entry1Data.customerId || entry2Data.customerId,
        supplierId: entry1Data.supplierId || entry2Data.supplierId
      };
      return await AccountingService.createTransaction(entry1, entry2, metadata);
    } catch (error) {
      console.error('Error creating accounting entry:', error);
      throw error;
    }
  }

  // Legacy single-entry: no-op (use createDoubleEntry for PostgreSQL)
  async createAccountingEntry(entryData) {
    console.warn('createAccountingEntry: single-entry not supported; use createDoubleEntry for return accounting');
    return null;
  }

  // Calculate COGS adjustment for sale return
  async calculateCOGSAdjustment(returnRequest, originalSale) {
    let totalCOGS = 0;

    for (const returnItem of returnRequest.items) {
      const originalItem = originalSale.items.find(oi =>
        oi._id.toString() === returnItem.originalOrderItem.toString()
      );

      if (originalItem) {
        const unitCost = originalItem.unitCost || 0;
        totalCOGS += unitCost * returnItem.quantity;
      }
    }

    return totalCOGS;
  }

  // Calculate COGS adjustment for purchase return
  async calculatePurchaseCOGSAdjustment(returnRequest, originalInvoice) {
    let totalCOGS = 0;

    for (const returnItem of returnRequest.items) {
      const originalItem = originalInvoice.items.find(oi =>
        oi._id.toString() === returnItem.originalOrderItem.toString()
      );

      if (originalItem) {
        const unitCost = originalItem.unitCost || 0;
        totalCOGS += unitCost * returnItem.quantity;
      }
    }

    return totalCOGS;
  }

  // Update supplier balance
  async updateSupplierBalance(supplierId, amount, originalInvoiceId) {
    try {
      const SupplierBalanceService = require('../services/supplierBalanceService');
      if (SupplierBalanceService && SupplierBalanceService.recordReturn) {
        await SupplierBalanceService.recordReturn(supplierId, amount, originalInvoiceId);
      } else {
        const supplier = await SupplierRepository.findById(supplierId);
        if (supplier) {
          const currentBalance = Number(supplier.current_balance ?? supplier.currentBalance ?? 0);
          const { query } = require('../config/postgres');
          await query('UPDATE suppliers SET current_balance = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [currentBalance - amount, supplierId]);
        }
      }
    } catch (error) {
      console.error('Error updating supplier balance:', error);
      // Don't throw - accounting entries are more critical
    }
  }

  // Process exchange
  async processExchange(returnRequest) {
    try {
      const customerId = returnRequest.customer_id || (returnRequest.customer && (returnRequest.customer.id || returnRequest.customer._id));
      const exchangeItems = returnRequest.exchangeDetails?.exchangeItems || [];
      const subtotal = exchangeItems.reduce((s, i) => s + (i.quantity || 0) * (i.unitPrice || i.unit_price || 0), 0);
      const exchangeOrder = await SalesRepository.create({
        orderNumber: `EXC-${Date.now()}`,
        customerId,
        saleDate: new Date(),
        items: exchangeItems,
        subtotal,
        total: subtotal,
        status: 'completed',
        paymentStatus: 'completed',
        notes: `Exchange for return ${returnRequest.return_number || returnRequest.returnNumber}`,
        createdBy: returnRequest.created_by || returnRequest.createdBy
      });
      if (returnRequest.exchangeDetails) returnRequest.exchangeDetails.exchangeOrder = exchangeOrder.id || exchangeOrder._id;
      return exchangeOrder;
    } catch (error) {
      console.error('Error processing exchange:', error);
      throw error;
    }
  }

  // Notify customer about return status
  async notifyCustomer(returnRequest, notificationType) {
    try {
      const customerId = returnRequest.customer_id || returnRequest.customer && (returnRequest.customer.id || returnRequest.customer._id) || returnRequest.customer;
      const customer = customerId ? await CustomerRepository.findById(customerId) : null;
      if (!customer) return;

      const returnNumber = returnRequest.return_number || returnRequest.returnNumber;
      const messages = {
        return_requested: `Your return request ${returnNumber} has been submitted and is under review.`,
        return_approved: `Your return request ${returnNumber} has been approved. Please ship items back.`,
        return_rejected: `Your return request ${returnNumber} has been rejected. Contact support for details.`,
        return_completed: `Your return request ${returnNumber} has been completed. Refund processed.`
      };
      const message = messages[notificationType];
      if (message && typeof returnRequest.addCommunication === 'function') {
        await returnRequest.addCommunication('email', message, null, customer.email);
      }
    } catch (error) {
      console.error('Error notifying customer:', error);
    }
  }

  // Get return statistics
  async getReturnStats(period = {}) {
    try {
      const stats = await ReturnRepository.getStats(period);

      // Get additional metrics
      const filter = period.startDate && period.endDate ? {
        returnDate: {
          $gte: period.startDate,
          $lte: period.endDate
        }
      } : {};

      const totalReturns = await ReturnRepository.count(filter);

      const pendingFilter = {
        status: 'pending',
        ...(period.startDate && period.endDate ? {
          returnDate: {
            $gte: period.startDate,
            $lte: period.endDate
          }
        } : {})
      };
      const pendingReturns = await ReturnRepository.count(pendingFilter);

      const averageProcessingTime = await this.calculateAverageProcessingTime(period);

      // Calculate status and type breakdowns
      const statusBreakdown = {};
      const typeBreakdown = {};
      if (stats.byStatus && Array.isArray(stats.byStatus)) {
        stats.byStatus.forEach(status => {
          statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
        });
      }
      if (stats.byType && Array.isArray(stats.byType)) {
        stats.byType.forEach(type => {
          typeBreakdown[type] = (typeBreakdown[type] || 0) + 1;
        });
      }

      return {
        totalReturns,
        pendingReturns,
        totalRefundAmount: stats.totalRefundAmount || 0,
        totalRestockingFee: stats.totalRestockingFee || 0,
        netRefundAmount: stats.netRefundAmount || 0,
        averageRefundAmount: totalReturns > 0 ? (stats.totalRefundAmount || 0) / totalReturns : 0,
        averageProcessingTime,
        returnRate: await this.calculateReturnRate(period),
        statusBreakdown,
        typeBreakdown
      };
    } catch (error) {
      console.error('Error getting return stats:', error);
      throw error;
    }
  }

  // Calculate average processing time (Postgres: use updated_at - return_date for completed returns)
  async calculateAverageProcessingTime(period = {}) {
    const { query } = require('../config/postgres');
    let sql = `SELECT AVG(EXTRACT(EPOCH FROM (updated_at - return_date)) / 86400.0) AS avg_days
      FROM returns WHERE deleted_at IS NULL AND status = 'completed'`;
    const params = [];
    let n = 1;
    if (period.startDate) { sql += ` AND return_date >= $${n++}`; params.push(period.startDate); }
    if (period.endDate) { sql += ` AND return_date <= $${n++}`; params.push(period.endDate); }
    const result = await query(sql, params);
    return parseFloat(result.rows[0]?.avg_days) || 0;
  }

  // Calculate return rate (Postgres)
  async calculateReturnRate(period = {}) {
    const { query } = require('../config/postgres');
    const dateFilter = period.startDate && period.endDate
      ? ` AND sale_date >= $1 AND sale_date <= $2` : '';
    const dateParams = period.startDate && period.endDate ? [period.startDate, period.endDate] : [];
    const salesCount = await query(
      `SELECT COUNT(*) FROM sales WHERE deleted_at IS NULL${dateFilter}`,
      dateParams
    );
    const returnDateFilter = period.startDate && period.endDate
      ? ` AND return_date >= $1 AND return_date <= $2` : '';
    const returnParams = period.startDate && period.endDate ? [period.startDate, period.endDate] : [];
    const returnsCount = await query(
      `SELECT COUNT(*) FROM returns WHERE deleted_at IS NULL AND status NOT IN ('rejected', 'cancelled')${returnDateFilter}`,
      returnParams
    );
    const totalOrders = parseInt(salesCount.rows[0]?.count || 0, 10);
    const totalReturns = parseInt(returnsCount.rows[0]?.count || 0, 10);
    return totalOrders > 0 ? (totalReturns / totalOrders) * 100 : 0;
  }

  // Get return trends (Postgres)
  async getReturnTrends(periods = 12) {
    try {
      const { query } = require('../config/postgres');
      const result = await query(
        `SELECT
          EXTRACT(YEAR FROM return_date)::int AS year,
          EXTRACT(MONTH FROM return_date)::int AS month,
          COUNT(*) AS count,
          COALESCE(SUM(total_amount), 0) AS total_refund_amount,
          COALESCE(AVG(total_amount), 0) AS average_refund_amount
        FROM returns
        WHERE deleted_at IS NULL AND status != 'cancelled'
          AND return_date >= (CURRENT_DATE - ($1::int || ' months')::interval)
        GROUP BY EXTRACT(YEAR FROM return_date), EXTRACT(MONTH FROM return_date)
        ORDER BY year, month`,
        [periods]
      );
      return (result.rows || []).map(row => ({
        period: `${row.year}-${String(row.month).padStart(2, '0')}`,
        totalReturns: parseInt(row.count, 10) || 0,
        totalRefundAmount: parseFloat(row.total_refund_amount) || 0,
        averageRefundAmount: parseFloat(row.average_refund_amount) || 0
      }));
    } catch (error) {
      console.error('Error getting return trends:', error);
      throw error;
    }
  }

  // Get returns with filters and pagination (Postgres)
  async getReturns(queryParams) {
    const page = parseInt(queryParams.page) || 1;
    const limit = parseInt(queryParams.limit) || 10;

    const filter = {};
    if (queryParams.status) filter.status = queryParams.status;
    if (queryParams.returnType) filter.returnType = queryParams.returnType;
    if (queryParams.customer) filter.customerId = queryParams.customer;
    if (queryParams.search) filter.returnNumber = queryParams.search;

    if (queryParams.dateFilter && queryParams.dateFilter.returnDate) {
      const d = queryParams.dateFilter.returnDate;
      if (d.$gte) filter.dateFrom = d.$gte;
      if (d.$lte) filter.dateTo = d.$lte;
    } else if (queryParams.startDate || queryParams.endDate) {
      const { buildDateRangeFilter } = require('../utils/dateFilter');
      const dateFilter = buildDateRangeFilter(queryParams.startDate, queryParams.endDate, 'returnDate');
      if (dateFilter.returnDate) {
        if (dateFilter.returnDate.$gte) filter.dateFrom = dateFilter.returnDate.$gte;
        if (dateFilter.returnDate.$lte) filter.dateTo = dateFilter.returnDate.$lte;
      }
    }

    const result = await ReturnRepository.findWithPagination(filter, {
      page,
      limit,
      sort: 'return_date DESC'
    });

    // Populate originalOrder for all returns (reference_id points to sales/sales_orders/purchase_invoices/purchase_orders)
    const populatedReturns = await Promise.all(result.returns.map(async (returnItem) => {
      const returnObj = returnItem.toObject ? returnItem.toObject() : { ...returnItem };
      let orderId = returnObj.reference_id || returnObj.referenceId;
      if (returnObj.originalOrder) {
        if (typeof returnObj.originalOrder === 'string' || returnObj.originalOrder._id) {
          orderId = returnObj.originalOrder._id || returnObj.originalOrder;
        } else if (returnObj.originalOrder.orderNumber || returnObj.originalOrder.invoiceNumber || returnObj.originalOrder.poNumber) {
          return returnObj;
        } else {
          orderId = returnObj.originalOrder._id || returnObj.originalOrder.id || returnObj.originalOrder.toString();
        }
      }
      
      if (orderId) {
        const isPurchase = returnObj.origin === 'purchase' || returnObj.return_type === 'purchase_return';
        const originalOrder = await this.fetchAndNormalizeOrder(orderId, isPurchase);
        if (originalOrder) {
          returnObj.originalOrder = {
            _id: originalOrder.id,
            id: originalOrder.id,
            orderNumber: originalOrder.orderNumber,
            soNumber: originalOrder.orderNumber,
            createdAt: originalOrder.createdAt,
            orderDate: originalOrder.orderDate,
            invoiceNumber: originalOrder.orderNumber,
            poNumber: originalOrder.orderNumber
          };
        }
      }
      
      return returnObj;
    }));

    return {
      returns: populatedReturns,
      pagination: result.pagination
    };
  }

  // Get single return by ID
  async getReturnById(returnId) {
    const returnRequest = await ReturnRepository.findById(returnId);
    if (!returnRequest) {
      throw new Error('Return request not found');
    }
    return returnRequest;
  }

  // Update return inspection details (persisted to Postgres)
  async updateInspection(returnId, inspectionData, userId) {
    const returnRequest = await ReturnRepository.findById(returnId);
    if (!returnRequest) {
      throw new Error('Return request not found');
    }
    const inspection = {
      inspectedBy: userId,
      inspectionDate: new Date(),
      ...inspectionData
    };
    await ReturnRepository.update(returnId, { inspection, updatedBy: userId });
    const updated = await ReturnRepository.findById(returnId);
    return { ...updated, inspection: inspection };
  }

  // Add note to return (no-op until returns.notes or separate notes table exists)
  async addNote(returnId, note, userId, isInternal = false) {
    const returnRequest = await ReturnRepository.findById(returnId);
    if (!returnRequest) throw new Error('Return request not found');
    return returnRequest;
  }

  // Add communication log to return (no-op until returns comms storage exists)
  async addCommunication(returnId, type, message, userId, recipient) {
    const returnRequest = await ReturnRepository.findById(returnId);
    if (!returnRequest) throw new Error('Return request not found');
    return returnRequest;
  }

  // Cancel return request
  async cancelReturn(returnId, userId) {
    const returnRequest = await ReturnRepository.findById(returnId);
    if (!returnRequest) {
      throw new Error('Return request not found');
    }

    const status = returnRequest.status;
    if (status !== 'pending') {
      throw new Error('Only pending return requests can be cancelled');
    }

    await ReturnRepository.update(returnId, { status: 'cancelled', updatedBy: userId });
    return await ReturnRepository.findById(returnId) || returnRequest;
  }

  // Delete return request
  async deleteReturn(returnId) {
    const returnRequest = await ReturnRepository.findById(returnId);
    if (!returnRequest) {
      throw new Error('Return request not found');
    }

    if (!['pending', 'cancelled'].includes(returnRequest.status)) {
      throw new Error('Only pending or cancelled return requests can be deleted');
    }

    await ReturnRepository.softDelete(returnId);
    return { message: 'Return request deleted successfully' };
  }
}

module.exports = new ReturnManagementService();
