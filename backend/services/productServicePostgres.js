const productRepository = require('../repositories/postgres/ProductRepository');
const categoryRepository = require('../repositories/postgres/CategoryRepository');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function resolveCategoryId(categoryOrName) {
  if (categoryOrName == null || categoryOrName === '') return null;
  const s = String(categoryOrName).trim();
  if (UUID_REGEX.test(s)) return s;
  const cat = await categoryRepository.findByName(s);
  return cat ? cat.id : null;
}

function toApiProduct(row, categoryMap = null) {
  if (!row) return null;
  const id = row.id;
  const categoryId = row.category_id;
  const cat = categoryMap && categoryId ? categoryMap.get(categoryId) : null;
  return {
    _id: id,
    id,
    name: row.name,
    sku: row.sku,
    barcode: row.barcode,
    description: row.description,
    category: cat ? { _id: categoryId, id: categoryId, name: cat.name } : (categoryId ? { _id: categoryId, id: categoryId, name: null } : null),
    pricing: {
      cost: parseFloat(row.cost_price) || 0,
      wholesale: parseFloat(row.selling_price) || 0,
      retail: parseFloat(row.selling_price) || 0
    },
    inventory: {
      currentStock: parseFloat(row.stock_quantity) || 0,
      reorderPoint: parseFloat(row.min_stock_level) || 0,
      minStock: parseFloat(row.min_stock_level) || 0
    },
    status: row.is_active ? 'active' : 'inactive',
    isActive: row.is_active,
    unit: row.unit,
    created_at: row.created_at,
    updated_at: row.updated_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function getCategoryMap(categoryIds) {
  const uniq = [...new Set(categoryIds.filter(Boolean))];
  const map = new Map();
  for (const id of uniq) {
    const cat = await categoryRepository.findById(id);
    if (cat) map.set(id, cat);
  }
  return map;
}

class ProductServicePostgres {
  buildFilter(queryParams) {
    const filters = {};
    if (queryParams.search) filters.search = queryParams.search;
    if (queryParams.category) filters.categoryId = queryParams.category;
    else if (queryParams.categories) {
      try {
        const arr = JSON.parse(queryParams.categories);
        if (Array.isArray(arr) && arr.length > 0) filters.categoryId = arr[0];
      } catch (_) {}
    }
    if (queryParams.status === 'active') filters.isActive = true;
    else if (queryParams.status === 'inactive') filters.isActive = false;
    if (queryParams.lowStock === 'true' || queryParams.lowStock === true) filters.lowStock = true;
    if (queryParams.stockStatus) filters.stockStatus = queryParams.stockStatus;
    return filters;
  }

  async getProducts(queryParams) {
    const getAll = queryParams.all === 'true' || queryParams.all === true ||
      (queryParams.limit && parseInt(queryParams.limit) >= 999999);
    const page = getAll ? 1 : (parseInt(queryParams.page) || 1);
    const limit = getAll ? 999999 : (parseInt(queryParams.limit) || 20);

    const filters = this.buildFilter(queryParams);
    const result = await productRepository.findWithPagination(filters, { page, limit });

    const categoryIds = [...new Set(result.products.map(p => p.category_id).filter(Boolean))];
    const categoryMap = await getCategoryMap(categoryIds);

    const products = result.products.map(p => toApiProduct(p, categoryMap));
    return {
      products,
      pagination: result.pagination
    };
  }

  async getProductById(id) {
    const row = await productRepository.findById(id);
    if (!row) throw new Error('Product not found');
    const categoryMap = row.category_id ? await getCategoryMap([row.category_id]) : null;
    return toApiProduct(row, categoryMap);
  }

  async createProduct(productData, userId, req = null) {
    const pricing = productData.pricing || {};
    const cost = pricing.cost !== undefined && pricing.cost !== null ? Number(pricing.cost) : 0;
    const retail = pricing.retail !== undefined && pricing.retail !== null ? Number(pricing.retail) : 0;
    const wholesale = pricing.wholesale !== undefined && pricing.wholesale !== null ? Number(pricing.wholesale) : retail;

    if (cost < 0) throw new Error('Cost price is required and must be non-negative');
    if (retail < 0) throw new Error('Retail price is required and must be non-negative');
    if (wholesale < 0) throw new Error('Wholesale price must be non-negative');
    if (cost > wholesale) throw new Error('Cost price cannot be greater than wholesale price');
    if (wholesale > retail) throw new Error('Wholesale price cannot be greater than retail price');

    if (productData.name) {
      const nameExists = await productRepository.nameExists(productData.name);
      if (nameExists) throw new Error('A product with this name already exists. Please choose a different name.');
    }
    if (productData.sku) {
      const skuExists = await productRepository.skuExists(productData.sku);
      if (skuExists) throw new Error('A product with this SKU already exists.');
    }
    if (productData.barcode) {
      const barcodeExists = await productRepository.barcodeExists(productData.barcode);
      if (barcodeExists) throw new Error('A product with this barcode already exists.');
    }

    const inv = productData.inventory || {};
    const categoryId = await resolveCategoryId(productData.category || productData.categoryId);

    const product = await productRepository.create({
      name: productData.name,
      sku: productData.sku,
      barcode: productData.barcode,
      description: productData.description,
      categoryId,
      costPrice: cost,
      sellingPrice: retail,
      stockQuantity: inv.currentStock ?? inv.stockQuantity ?? 0,
      minStockLevel: inv.reorderPoint ?? inv.minStock ?? inv.minStockLevel ?? 0,
      unit: productData.unit,
      isActive: productData.status !== 'inactive' && productData.isActive !== false,
      createdBy: userId
    });

    const categoryMap = product.category_id ? await getCategoryMap([product.category_id]) : null;
    return {
      product: toApiProduct(product, categoryMap),
      message: 'Product created successfully'
    };
  }

  async updateProduct(id, updateData, userId, req = null) {
    const current = await productRepository.findById(id);
    if (!current) throw new Error('Product not found');

    if (updateData.name) {
      const nameExists = await productRepository.nameExists(updateData.name, id);
      if (nameExists) throw new Error('A product with this name already exists. Please choose a different name.');
    }
    if (updateData.sku) {
      const skuExists = await productRepository.skuExists(updateData.sku, id);
      if (skuExists) throw new Error('A product with this SKU already exists.');
    }
    if (updateData.barcode) {
      const barcodeExists = await productRepository.barcodeExists(updateData.barcode, id);
      if (barcodeExists) throw new Error('A product with this barcode already exists.');
    }

    const data = {};
    if (updateData.name !== undefined) data.name = updateData.name;
    if (updateData.sku !== undefined) data.sku = updateData.sku;
    if (updateData.barcode !== undefined) data.barcode = updateData.barcode;
    if (updateData.description !== undefined) data.description = updateData.description;
    if (updateData.category !== undefined || updateData.categoryId !== undefined) {
      data.categoryId = updateData.category ?? updateData.categoryId;
    }
    if (updateData.unit !== undefined) data.unit = updateData.unit;
    if (updateData.status !== undefined) data.isActive = updateData.status !== 'inactive';
    if (updateData.isActive !== undefined) data.isActive = updateData.isActive;

    const pricing = updateData.pricing;
    if (pricing) {
      const cost = pricing.cost !== undefined && pricing.cost !== null ? Number(pricing.cost) : current.cost_price;
      const retail = pricing.retail !== undefined && pricing.retail !== null ? Number(pricing.retail) : current.selling_price;
      const wholesale = pricing.wholesale !== undefined && pricing.wholesale !== null ? Number(pricing.wholesale) : retail;
      if (cost > wholesale) throw new Error('Cost price cannot be greater than wholesale price');
      if (wholesale > retail) throw new Error('Wholesale price cannot be greater than retail price');
      data.costPrice = cost;
      data.sellingPrice = retail;
    }

    const inv = updateData.inventory;
    if (inv) {
      if (inv.currentStock !== undefined) data.stockQuantity = inv.currentStock;
      if (inv.reorderPoint !== undefined) data.minStockLevel = inv.reorderPoint;
      if (inv.minStock !== undefined) data.minStockLevel = inv.minStock;
    }

    data.updatedBy = userId;

    const product = await productRepository.update(id, data);
    if (!product) throw new Error('Product not found');
    const categoryMap = product.category_id ? await getCategoryMap([product.category_id]) : null;
    return {
      product: toApiProduct(product, categoryMap),
      message: 'Product updated successfully'
    };
  }

  async deleteProduct(id, req = null) {
    const product = await productRepository.findById(id);
    if (!product) throw new Error('Product not found');
    await productRepository.delete(id);
    return { message: 'Product deleted successfully' };
  }

  async searchProducts(query, limit = 10) {
    const rows = await productRepository.search(query, { limit });
    const categoryIds = [...new Set(rows.map(p => p.category_id).filter(Boolean))];
    const categoryMap = await getCategoryMap(categoryIds);
    return rows.map(p => toApiProduct(p, categoryMap));
  }

  async productExistsByName(name) {
    return productRepository.nameExists(name);
  }

  async getLowStockProducts() {
    const rows = await productRepository.findAll({ lowStock: true, isActive: true }, { limit: 500 });
    const categoryIds = [...new Set(rows.map(p => p.category_id).filter(Boolean))];
    const categoryMap = await getCategoryMap(categoryIds);
    return rows.map(p => toApiProduct(p, categoryMap));
  }

  async getProductsForExport(filters = {}) {
    const f = this.buildFilter(filters);
    const rows = await productRepository.findAll(f, { limit: 999999 });
    const categoryIds = [...new Set(rows.map(p => p.category_id).filter(Boolean))];
    const categoryMap = await getCategoryMap(categoryIds);
    return rows.map(p => toApiProduct(p, categoryMap));
  }

  async getLastPurchasePrice(productId) {
    return null;
  }

  async getLastPurchasePrices(productIds) {
    return (productIds || []).map(() => null);
  }

  async getPriceForCustomerType(productId, customerType, quantity) {
    const product = await productRepository.findById(productId);
    if (!product) return null;
    return {
      price: parseFloat(product.selling_price) || 0,
      customerType,
      quantity: quantity || 1
    };
  }

  async bulkUpdateProductsAdvanced(productIds, updates) {
    const results = { updated: 0, failed: 0 };
    for (const id of productIds) {
      try {
        await this.updateProduct(id, updates, null);
        results.updated++;
      } catch (_) {
        results.failed++;
      }
    }
    return results;
  }

  async bulkDeleteProducts(productIds) {
    const results = { deleted: 0, failed: 0 };
    for (const id of productIds) {
      try {
        await this.deleteProduct(id);
        results.deleted++;
      } catch (_) {
        results.failed++;
      }
    }
    return results;
  }

  async updateProductInvestors(id, investors) {
    const product = await this.getProductById(id);
    return product;
  }

  async removeProductInvestor(id, investorId) {
    const product = await this.getProductById(id);
    return product;
  }

  async restoreProduct(id) {
    const product = await productRepository.findDeletedById(id);
    if (!product) throw new Error('Deleted product not found');
    await productRepository.restore(id);
    return { message: 'Product restored successfully' };
  }

  async getDeletedProducts() {
    const rows = await productRepository.findDeleted({}, { limit: 500 });
    const categoryIds = [...new Set(rows.map(p => p.category_id).filter(Boolean))];
    const categoryMap = await getCategoryMap(categoryIds);
    return rows.map(p => toApiProduct(p, categoryMap));
  }
}

module.exports = new ProductServicePostgres();
