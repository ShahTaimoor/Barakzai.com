const purchaseInvoiceRepository = require('../repositories/PurchaseInvoiceRepository');
const supplierRepository = require('../repositories/SupplierRepository');

class PurchaseInvoiceService {
  /**
   * Transform supplier names to uppercase
   * @param {object} supplier - Supplier to transform
   * @returns {object} - Transformed supplier
   */
  transformSupplierToUppercase(supplier) {
    if (!supplier) return supplier;
    if (supplier.toObject) supplier = supplier.toObject();
    if (supplier.companyName) supplier.companyName = supplier.companyName.toUpperCase();
    if (supplier.name) supplier.name = supplier.name.toUpperCase();
    if (supplier.contactPerson && supplier.contactPerson.name) {
      supplier.contactPerson.name = supplier.contactPerson.name.toUpperCase();
    }
    return supplier;
  }

  /**
   * Transform product names to uppercase
   * @param {object} product - Product to transform
   * @returns {object} - Transformed product
   */
  transformProductToUppercase(product) {
    if (!product) return product;
    if (product.toObject) product = product.toObject();
    // Handle both products and variants
    if (product.displayName) {
      product.displayName = product.displayName.toUpperCase();
    }
    if (product.variantName) {
      product.variantName = product.variantName.toUpperCase();
    }
    if (product.name) product.name = product.name.toUpperCase();
    if (product.description) product.description = product.description.toUpperCase();
    return product;
  }

  /**
   * Build filter query from request parameters
   * @param {object} queryParams - Request query parameters
   * @returns {Promise<object>} - MongoDB filter object
   */
  async buildFilter(queryParams) {
    const filter = {};
    if (queryParams.search && queryParams.search.trim()) filter.search = queryParams.search.trim();
    if (queryParams.status) filter.status = queryParams.status;
    if (queryParams.paymentStatus) filter.paymentStatus = queryParams.paymentStatus;
    if (queryParams.invoiceType) filter.invoiceType = queryParams.invoiceType;
    if (queryParams.supplier) filter.supplierId = queryParams.supplier;

    if (queryParams.dateFilter && Object.keys(queryParams.dateFilter).length > 0) {
      const df = queryParams.dateFilter;
      if (df.invoiceDate) {
        if (df.invoiceDate.$gte) filter.dateFrom = df.invoiceDate.$gte;
        if (df.invoiceDate.$lte) filter.dateTo = df.invoiceDate.$lte;
      }
      if (df.createdAt) {
        if (df.createdAt.$gte && !filter.dateFrom) filter.dateFrom = df.createdAt.$gte;
        if (df.createdAt.$lte && !filter.dateTo) filter.dateTo = df.createdAt.$lte;
      }
      if (df.$or && Array.isArray(df.$or)) {
        for (const cond of df.$or) {
          const key = cond.invoiceDate ? 'invoiceDate' : cond.createdAt ? 'createdAt' : null;
          if (key && cond[key]) {
            if (cond[key].$gte && !filter.dateFrom) filter.dateFrom = cond[key].$gte;
            if (cond[key].$lte && !filter.dateTo) filter.dateTo = cond[key].$lte;
          }
        }
      }
    }
    if (queryParams.dateFrom && !filter.dateFrom) filter.dateFrom = queryParams.dateFrom;
    if (queryParams.dateTo && !filter.dateTo) filter.dateTo = queryParams.dateTo;
    return filter;
  }

  /**
   * Get purchase invoices with filtering and pagination
   * @param {object} queryParams - Query parameters
   * @returns {Promise<object>}
   */
  async getPurchaseInvoices(queryParams) {
    const page = parseInt(queryParams.page) || 1;
    const limit = parseInt(queryParams.limit) || 20;
    const filter = await this.buildFilter(queryParams);
    const result = await purchaseInvoiceRepository.findWithPagination(filter, { page, limit });

    // Repository now handles invoiceNumber mapping and supplierInfo transformation
    // Just ensure items are parsed if needed (should already be done by repository)
    for (const invoice of result.invoices) {
      if (invoice.items && typeof invoice.items === 'string') {
        try {
          invoice.items = JSON.parse(invoice.items);
        } catch (e) {
          invoice.items = [];
        }
      }
      // supplierInfo is now populated by repository JOIN, but keep supplier for backward compatibility
      if (invoice.supplierInfo && !invoice.supplier) {
        invoice.supplier = this.transformSupplierToUppercase(invoice.supplierInfo);
      }
    }
    return result;
  }

  /**
   * Get single purchase invoice by ID
   * @param {string} id - Invoice ID
   * @returns {Promise<object>}
   */
  async getPurchaseInvoiceById(id) {
    const invoice = await purchaseInvoiceRepository.findById(id);
    if (!invoice) throw new Error('Purchase invoice not found');

    // Repository now handles invoiceNumber mapping and supplierInfo transformation
    // Just ensure items are parsed if needed (should already be done by repository)
    if (invoice.items && typeof invoice.items === 'string') {
      try {
        invoice.items = JSON.parse(invoice.items);
      } catch (e) {
        invoice.items = [];
      }
    }
    // supplierInfo is now populated by repository JOIN, but keep supplier for backward compatibility
    if (invoice.supplierInfo && !invoice.supplier) {
      invoice.supplier = this.transformSupplierToUppercase(invoice.supplierInfo);
    }
    return invoice;
  }
}

module.exports = new PurchaseInvoiceService();

