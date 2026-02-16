const salesRepository = require('../repositories/SalesRepository');
const productRepository = require('../repositories/ProductRepository');
const ReturnRepository = require('../repositories/postgres/ReturnRepository');

class ReportsService {
  /**
   * Format date based on grouping type
   * @param {Date} date - Date to format
   * @param {string} groupBy - Grouping type (day, week, month, year)
   * @returns {string} - Formatted date string
   */
  formatDate(date, groupBy) {
    switch (groupBy) {
      case 'day':
        return date.toISOString().split('T')[0];
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        return weekStart.toISOString().split('T')[0];
      case 'month':
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      case 'year':
        return date.getFullYear().toString();
      default:
        return date.toISOString().split('T')[0];
    }
  }

  /**
   * Get comprehensive sales report with various grouping options
   * @param {object} filters - Query filters (dateFrom, dateTo, city, groupBy)
   * @returns {Promise<object>}
   */
  async getSalesReport(filters) {
    const { query } = require('../config/postgres');
    const { getStartOfDayPakistan, getEndOfDayPakistan } = require('../utils/dateFilter');

    const dateFrom = filters.dateFrom ? getStartOfDayPakistan(filters.dateFrom) : getStartOfDayPakistan(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const dateTo = filters.dateTo ? getEndOfDayPakistan(filters.dateTo) : getEndOfDayPakistan(new Date().toISOString().split('T')[0]);
    const city = filters.city && filters.city !== 'all' ? filters.city : null;
    const groupBy = filters.groupBy || 'daily'; // daily, monthly, product, category, city, invoice

    let sql = '';
    let params = [dateFrom, dateTo];
    let paramIdx = 3;

    const cityFilter = city ? `AND (
      (jsonb_typeof(c.address) = 'array' AND EXISTS (SELECT 1 FROM jsonb_array_elements(c.address) addr WHERE addr->>'city' = $${paramIdx}))
      OR (jsonb_typeof(c.address) = 'object' AND c.address->>'city' = $${paramIdx})
    )` : '';
    if (city) params.push(city);

    switch (groupBy) {
      case 'daily':
        sql = `
          SELECT 
            DATE(s.sale_date) as date,
            COUNT(s.id) as "totalOrders",
            SUM(s.subtotal) as subtotal,
            SUM(s.discount) as discount,
            SUM(s.total) as total,
            SUM(s.tax) as tax
          FROM sales s
          LEFT JOIN customers c ON s.customer_id = c.id
          WHERE s.sale_date BETWEEN $1 AND $2 AND s.status != 'cancelled'
          ${cityFilter}
          GROUP BY DATE(s.sale_date)
          ORDER BY date DESC
        `;
        break;

      case 'monthly':
        sql = `
          SELECT 
            TO_CHAR(s.sale_date, 'YYYY-MM') as month,
            COUNT(s.id) as "totalOrders",
            SUM(s.subtotal) as subtotal,
            SUM(s.discount) as discount,
            SUM(s.total) as total
          FROM sales s
          LEFT JOIN customers c ON s.customer_id = c.id
          WHERE s.sale_date BETWEEN $1 AND $2 AND s.status != 'cancelled'
          ${cityFilter}
          GROUP BY TO_CHAR(s.sale_date, 'YYYY-MM')
          ORDER BY month DESC
        `;
        break;

      case 'product':
        sql = `
          WITH sale_items AS (
            SELECT 
              COALESCE(elem->>'product', elem->>'product_id')::uuid as product_id,
              (elem->>'quantity')::numeric as quantity,
              (elem->>'total')::numeric as line_total,
              s.customer_id,
              s.status
            FROM sales s,
            jsonb_array_elements(CASE WHEN jsonb_typeof(COALESCE(s.items, '[]')::jsonb) = 'array' THEN s.items::jsonb ELSE '[]'::jsonb END) AS elem
            WHERE s.sale_date BETWEEN $1 AND $2 AND s.status != 'cancelled'
          )
          SELECT 
            p.name as "productName",
            p.sku,
            COALESCE(SUM(si.quantity), 0) as "totalQuantity",
            COALESCE(SUM(si.line_total), 0) as "totalRevenue",
            COUNT(*) as "saleCount"
          FROM sale_items si
          JOIN products p ON si.product_id = p.id
          LEFT JOIN customers c ON si.customer_id = c.id
          WHERE 1=1 ${cityFilter}
          GROUP BY p.id, p.name, p.sku
          ORDER BY "totalRevenue" DESC
        `;
        break;

      case 'category':
        sql = `
          WITH sale_items AS (
            SELECT 
              COALESCE(elem->>'product', elem->>'product_id')::uuid as product_id,
              (elem->>'total')::numeric as line_total,
              s.customer_id
            FROM sales s,
            jsonb_array_elements(CASE WHEN jsonb_typeof(COALESCE(s.items, '[]')::jsonb) = 'array' THEN s.items::jsonb ELSE '[]'::jsonb END) AS elem
            WHERE s.sale_date BETWEEN $1 AND $2 AND s.status != 'cancelled'
          )
          SELECT 
            cat.name as "categoryName",
            COALESCE(SUM(si.line_total), 0) as "totalRevenue",
            COUNT(*) as "itemCount"
          FROM sale_items si
          JOIN products p ON si.product_id = p.id
          JOIN categories cat ON p.category_id = cat.id
          LEFT JOIN customers c ON si.customer_id = c.id
          WHERE 1=1 ${cityFilter}
          GROUP BY cat.id, cat.name
          ORDER BY "totalRevenue" DESC
        `;
        break;

      case 'city':
        sql = `
          SELECT 
            COALESCE(
              CASE 
                WHEN jsonb_typeof(c.address) = 'array' THEN (SELECT addr->>'city' FROM jsonb_array_elements(c.address) addr WHERE addr->>'city' IS NOT NULL LIMIT 1)
                ELSE c.address->>'city'
              END,
              'Unassigned'
            ) as city,
            COUNT(s.id) as "totalOrders",
            COALESCE(SUM(s.total), 0) as "totalRevenue"
          FROM sales s
          JOIN customers c ON s.customer_id = c.id
          WHERE s.sale_date BETWEEN $1 AND $2 AND s.status != 'cancelled'
          GROUP BY city
          ORDER BY "totalRevenue" DESC
        `;
        break;

      case 'invoice':
        sql = `
          SELECT 
            s.order_number as "invoiceNo",
            s.sale_date as date,
            COALESCE(c.business_name, c.name) as "customerName",
            s.total,
            s.payment_status as status,
            s.payment_method as method
          FROM sales s
          LEFT JOIN customers c ON s.customer_id = c.id
          WHERE s.sale_date BETWEEN $1 AND $2 AND s.status != 'cancelled'
          ${cityFilter}
          ORDER BY s.sale_date DESC
        `;
        break;
    }

    const result = await query(sql, params);
    
    // Calculate summary for the period
    const summarySql = `
      SELECT 
        COUNT(s.id) as "totalOrders",
        SUM(s.total) as "totalRevenue",
        AVG(s.total) as "averageOrderValue"
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE s.sale_date BETWEEN $1 AND $2 AND s.status != 'cancelled'
      ${cityFilter}
    `;
    const summaryResult = await query(summarySql, params);
    const summary = summaryResult.rows[0];

    return {
      data: result.rows.map(row => {
        const newRow = { ...row };
        // Convert numeric strings to numbers
        ['total', 'subtotal', 'discount', 'tax', 'totalRevenue', 'totalQuantity', 'averageOrderValue'].forEach(key => {
          if (newRow[key] !== undefined) newRow[key] = parseFloat(newRow[key] || 0);
        });
        return newRow;
      }),
      summary: {
        totalOrders: parseInt(summary.totalOrders || 0),
        totalRevenue: parseFloat(summary.totalRevenue || 0),
        averageOrderValue: parseFloat(summary.averageOrderValue || 0)
      },
      groupBy,
      dateRange: { from: dateFrom, to: dateTo }
    };
  }

  /**
   * Get product performance report
   * @param {object} queryParams - Query parameters
   * @returns {Promise<object>}
   */
  async getProductReport(queryParams) {
    const { getStartOfDayPakistan, getEndOfDayPakistan } = require('../utils/dateFilter');
    
    // Use Pakistan timezone for date filtering
    let dateFrom, dateTo;
    if (queryParams.dateFrom) {
      dateFrom = getStartOfDayPakistan(queryParams.dateFrom);
    } else {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dateFrom = getStartOfDayPakistan(thirtyDaysAgo.toISOString().split('T')[0]);
    }
    
    if (queryParams.dateTo) {
      dateTo = getEndOfDayPakistan(queryParams.dateTo);
    } else {
      dateTo = getEndOfDayPakistan(new Date().toISOString().split('T')[0]);
    }
    
    const limit = parseInt(queryParams.limit) || 20;

    const orders = await salesRepository.findAll({
      createdAt: { $gte: dateFrom, $lte: dateTo },
      status: { $nin: ['cancelled'] }
    }, {
      populate: [{ path: 'items.product', select: 'name description pricing' }],
      sort: { createdAt: 1 }
    });

    // Aggregate product sales
    const productSales = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        if (!item.product) return;
        const productId = item.product._id.toString();
        if (!productSales[productId]) {
          productSales[productId] = {
            product: item.product,
            totalQuantity: 0,
            totalRevenue: 0,
            totalOrders: 0,
            averagePrice: 0
          };
        }

        productSales[productId].totalQuantity += item.quantity;
        productSales[productId].totalRevenue += item.total;
        productSales[productId].totalOrders += 1;
      });
    });

    // Calculate averages and sort
    const productReport = Object.values(productSales)
      .map(item => ({
        ...item,
        averagePrice: item.totalQuantity > 0 ? item.totalRevenue / item.totalQuantity : 0
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);

    return {
      products: productReport,
      dateRange: {
        from: dateFrom,
        to: dateTo
      },
      total: Object.keys(productSales).length
    };
  }

  /**
   * Get customer performance report
   * @param {object} queryParams - Query parameters
   * @returns {Promise<object>}
   */
  async getCustomerReport(queryParams) {
    const { getStartOfDayPakistan, getEndOfDayPakistan } = require('../utils/dateFilter');
    
    // Use Pakistan timezone for date filtering
    let dateFrom, dateTo;
    if (queryParams.dateFrom) {
      dateFrom = getStartOfDayPakistan(queryParams.dateFrom);
    } else {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dateFrom = getStartOfDayPakistan(thirtyDaysAgo.toISOString().split('T')[0]);
    }
    
    if (queryParams.dateTo) {
      dateTo = getEndOfDayPakistan(queryParams.dateTo);
    } else {
      dateTo = getEndOfDayPakistan(new Date().toISOString().split('T')[0]);
    }
    
    const limit = parseInt(queryParams.limit) || 20;
    const businessType = queryParams.businessType;

    const filter = {
      createdAt: { $gte: dateFrom, $lte: dateTo },
      status: { $nin: ['cancelled'] },
      customer: { $exists: true, $ne: null }
    };

    const orders = await salesRepository.findAll(filter, {
      populate: [{ path: 'customer', select: 'firstName lastName businessName businessType customerTier' }],
      sort: { createdAt: 1 }
    });

    // Aggregate customer sales
    const customerSales = {};

    orders.forEach(order => {
      if (!order.customer) return;

      const customerId = order.customer._id.toString();
      if (!customerSales[customerId]) {
        customerSales[customerId] = {
          customer: order.customer,
          totalOrders: 0,
          totalRevenue: 0,
          totalItems: 0,
          averageOrderValue: 0,
          lastOrderDate: null
        };
      }

      customerSales[customerId].totalOrders += 1;
      customerSales[customerId].totalRevenue += order.pricing.total;
      customerSales[customerId].totalItems += order.items.reduce((sum, item) => sum + item.quantity, 0);

      if (!customerSales[customerId].lastOrderDate || order.createdAt > customerSales[customerId].lastOrderDate) {
        customerSales[customerId].lastOrderDate = order.createdAt;
      }
    });

    // Filter by business type if specified
    let filteredCustomers = Object.values(customerSales);
    if (businessType) {
      filteredCustomers = filteredCustomers.filter(item =>
        item.customer.businessType === businessType
      );
    }

    // Calculate averages and sort
    const customerReport = filteredCustomers
      .map(item => ({
        ...item,
        averageOrderValue: item.totalOrders > 0 ? item.totalRevenue / item.totalOrders : 0
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);

    return {
      customers: customerReport,
      dateRange: {
        from: dateFrom,
        to: dateTo
      },
      total: filteredCustomers.length,
      filters: {
        businessType
      }
    };
  }

  /**
   * Get stock summary report (Opening Balance, Purchase, Sale, Returns, Damage, Closing Balance, For Zakat)
   * @param {object} filters - Query filters (category, dateFrom, dateTo)
   * @returns {Promise<object>}
   */
  async getStockSummaryReport(filters) {
    const { query } = require('../config/postgres');
    const { getStartOfDayPakistan, getEndOfDayPakistan } = require('../utils/dateFilter');

    const categoryId = filters.category && filters.category !== 'all' ? filters.category : null;
    const dateFrom = filters.dateFrom ? getStartOfDayPakistan(filters.dateFrom) : getStartOfDayPakistan(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const dateTo = filters.dateTo ? getEndOfDayPakistan(filters.dateTo) : getEndOfDayPakistan(new Date().toISOString().split('T')[0]);

    const params = [dateFrom, dateTo];
    let paramIdx = 3;
    const prodFilter = categoryId ? ` AND p.category_id = $${paramIdx++}` : '';
    if (categoryId) params.push(categoryId);

    const stockInTypes = "'purchase','return_in','adjustment_in','transfer_in','production','initial_stock'";
    const stockOutTypes = "'sale','return_out','adjustment_out','transfer_out','damage','expiry','theft','consumption'";

    const sql = `
      WITH products_base AS (
        SELECT p.id, p.name, p.sku, p.unit, cat.name as "categoryName",
               COALESCE(p.cost_price, 0) as cost_price,
               COALESCE(p.selling_price, 0) as selling_price,
               COALESCE(p.wholesale_price, p.selling_price, 0) as wholesale_price,
               COALESCE(p.min_stock_level, 0) as min_stock_level,
               COALESCE(ib.quantity, i.current_stock, p.stock_quantity, 0)::decimal as "currentStock"
        FROM products p
        LEFT JOIN categories cat ON p.category_id = cat.id
        LEFT JOIN inventory_balance ib ON ib.product_id = p.id
        LEFT JOIN inventory i ON i.product_id = p.id AND i.deleted_at IS NULL
        WHERE p.is_deleted = FALSE AND p.is_active = TRUE ${prodFilter}
      ),
      opening AS (
        SELECT product_id, product_name, product_sku,
          SUM(CASE WHEN movement_type IN (${stockInTypes}) THEN quantity ELSE -quantity END) as qty,
          SUM(CASE WHEN movement_type IN (${stockInTypes}) THEN total_value ELSE -total_value END) as amount
        FROM stock_movements
        WHERE created_at < $1 AND status = 'completed'
        GROUP BY product_id, product_name, product_sku
      ),
      period_act AS (
        SELECT product_id,
          SUM(CASE WHEN movement_type = 'purchase' THEN quantity ELSE 0 END) as purchase_qty,
          SUM(CASE WHEN movement_type = 'purchase' THEN total_value ELSE 0 END) as purchase_amt,
          SUM(CASE WHEN movement_type = 'return_out' THEN quantity ELSE 0 END) as purchase_return_qty,
          SUM(CASE WHEN movement_type = 'return_out' THEN total_value ELSE 0 END) as purchase_return_amt,
          SUM(CASE WHEN movement_type = 'sale' THEN quantity ELSE 0 END) as sale_qty,
          SUM(CASE WHEN movement_type = 'sale' THEN total_value ELSE 0 END) as sale_amt,
          SUM(CASE WHEN movement_type = 'return_in' THEN quantity ELSE 0 END) as sale_return_qty,
          SUM(CASE WHEN movement_type = 'return_in' THEN total_value ELSE 0 END) as sale_return_amt,
          SUM(CASE WHEN movement_type = 'damage' THEN quantity ELSE 0 END) as damage_qty,
          SUM(CASE WHEN movement_type = 'damage' THEN total_value ELSE 0 END) as damage_amt
        FROM stock_movements
        WHERE created_at >= $1 AND created_at <= $2 AND status = 'completed'
        GROUP BY product_id
      ),
      last_pur AS (
        SELECT DISTINCT ON (product_id) product_id, unit_cost as last_purchase_price
        FROM stock_movements
        WHERE movement_type = 'purchase' AND status = 'completed'
        ORDER BY product_id, created_at DESC
      ),
      avg_cost AS (
        SELECT product_id,
          CASE WHEN SUM(quantity) > 0 THEN SUM(total_value) / SUM(quantity) ELSE 0 END as avg_purchase_price
        FROM stock_movements
        WHERE movement_type = 'purchase' AND status = 'completed'
        GROUP BY product_id
      )
      SELECT
        pb.id, pb.name, pb.sku, pb.unit, pb."categoryName", pb.cost_price, pb.selling_price, pb.wholesale_price,
        pb."currentStock",
        pb.min_stock_level,
        CASE WHEN o.qty IS NOT NULL THEN COALESCE(o.qty, 0) ELSE pb."currentStock" END::decimal as "openingQty",
        CASE WHEN o.amount IS NOT NULL THEN COALESCE(o.amount, 0) ELSE (pb."currentStock" * pb.cost_price) END::decimal as "openingAmount",
        COALESCE(pa.purchase_qty, 0)::decimal as "purchaseQty",
        COALESCE(pa.purchase_amt, 0)::decimal as "purchaseAmount",
        COALESCE(pa.purchase_return_qty, 0)::decimal as "purchaseReturnQty",
        COALESCE(pa.purchase_return_amt, 0)::decimal as "purchaseReturnAmount",
        COALESCE(pa.sale_qty, 0)::decimal as "saleQty",
        COALESCE(pa.sale_amt, 0)::decimal as "saleAmount",
        COALESCE(pa.sale_return_qty, 0)::decimal as "saleReturnQty",
        COALESCE(pa.sale_return_amt, 0)::decimal as "saleReturnAmount",
        COALESCE(pa.damage_qty, 0)::decimal as "damageQty",
        COALESCE(pa.damage_amt, 0)::decimal as "damageAmount",
        COALESCE(lp.last_purchase_price, pb.cost_price, 0)::decimal as "lastPurchasePrice",
        COALESCE(ac.avg_purchase_price, pb.cost_price, 0)::decimal as "avgPurchasePrice"
      FROM products_base pb
      LEFT JOIN opening o ON o.product_id = pb.id
      LEFT JOIN period_act pa ON pa.product_id = pb.id
      LEFT JOIN last_pur lp ON lp.product_id = pb.id
      LEFT JOIN avg_cost ac ON ac.product_id = pb.id
      ORDER BY pb.name ASC
    `;

    const result = await query(sql, params);
    const rows = result.rows.map(r => {
      const openingQty = parseFloat(r.openingQty || 0);
      const openingAmount = parseFloat(r.openingAmount || 0);
      const purchaseQty = parseFloat(r.purchaseQty || 0);
      const purchaseAmount = parseFloat(r.purchaseAmount || 0);
      const purchaseReturnQty = parseFloat(r.purchaseReturnQty || 0);
      const purchaseReturnAmount = parseFloat(r.purchaseReturnAmount || 0);
      const saleQty = parseFloat(r.saleQty || 0);
      const saleAmount = parseFloat(r.saleAmount || 0);
      const saleReturnQty = parseFloat(r.saleReturnQty || 0);
      const saleReturnAmount = parseFloat(r.saleReturnAmount || 0);
      const damageQty = parseFloat(r.damageQty || 0);
      const damageAmount = parseFloat(r.damageAmount || 0);
      const closingQty = openingQty + purchaseQty - purchaseReturnQty - saleQty + saleReturnQty - damageQty;
      const lastPurchasePrice = parseFloat(r.lastPurchasePrice || 0);
      const avgPurchasePrice = parseFloat(r.avgPurchasePrice || 0);
      const costPrice = avgPurchasePrice || lastPurchasePrice || parseFloat(r.cost_price || 0);
      const sellingPriceRaw = parseFloat(r.sellingPrice || r.selling_price || 0);
      const wholesalePriceRaw = parseFloat(r.wholesalePrice || r.wholesale_price || 0);
      const sellingPrice = sellingPriceRaw || costPrice;
      const wholesalePrice = wholesalePriceRaw || sellingPriceRaw || costPrice;
      const closingAmount = closingQty * costPrice;
      const wholesaleValuation = closingQty * wholesalePrice;
      const zakatSaleAmount = closingQty * sellingPrice;
      const zakatAvgAmount = closingQty * avgPurchasePrice;
      const minStockLevel = parseFloat(r.min_stock_level || 0);
      return {
        id: r.id,
        name: r.name,
        sku: r.sku,
        unit: r.unit,
        categoryName: r.categoryName,
        minStockLevel,
        lastPurchasePrice,
        openingQty,
        openingAmount,
        purchaseQty,
        purchaseAmount,
        purchaseReturnQty,
        purchaseReturnAmount,
        saleQty,
        saleAmount,
        saleReturnQty,
        saleReturnAmount,
        damageQty,
        damageAmount,
        closingQty,
        closingAmount,
        salePrice1: sellingPriceRaw,
        wholesaleValuation,
        zakatAmount: zakatSaleAmount,
        avgPurchasePrice,
        zakatAvgAmount
      };
    });

    const totals = rows.reduce((acc, r) => ({
      openingQty: acc.openingQty + r.openingQty,
      openingAmount: acc.openingAmount + r.openingAmount,
      purchaseQty: acc.purchaseQty + r.purchaseQty,
      purchaseAmount: acc.purchaseAmount + r.purchaseAmount,
      purchaseReturnQty: acc.purchaseReturnQty + r.purchaseReturnQty,
      purchaseReturnAmount: acc.purchaseReturnAmount + r.purchaseReturnAmount,
      saleQty: acc.saleQty + r.saleQty,
      saleAmount: acc.saleAmount + r.saleAmount,
      saleReturnQty: acc.saleReturnQty + r.saleReturnQty,
      saleReturnAmount: acc.saleReturnAmount + r.saleReturnAmount,
      damageQty: acc.damageQty + r.damageQty,
      damageAmount: acc.damageAmount + r.damageAmount,
      closingQty: acc.closingQty + r.closingQty,
      closingAmount: acc.closingAmount + r.closingAmount,
      wholesaleValuation: acc.wholesaleValuation + (r.wholesaleValuation || 0),
      zakatAmount: acc.zakatAmount + r.zakatAmount,
      zakatAvgAmount: acc.zakatAvgAmount + r.zakatAvgAmount
    }), { openingQty: 0, openingAmount: 0, purchaseQty: 0, purchaseAmount: 0, purchaseReturnQty: 0, purchaseReturnAmount: 0, saleQty: 0, saleAmount: 0, saleReturnQty: 0, saleReturnAmount: 0, damageQty: 0, damageAmount: 0, closingQty: 0, closingAmount: 0, wholesaleValuation: 0, zakatAmount: 0, zakatAvgAmount: 0 });

    const lowStockCount = rows.filter(r => (r.closingQty ?? 0) <= (r.minStockLevel ?? 0)).length;
    const outOfStockCount = rows.filter(r => (r.closingQty || 0) === 0).length;

    return {
      data: rows,
      summary: {
        ...totals,
        totalItems: rows.length,
        totalValuation: totals.closingAmount,
        totalWholesaleValuation: totals.wholesaleValuation,
        totalRetailValuation: totals.zakatAmount,
        totalStock: totals.closingQty,
        lowStockCount,
        outOfStockCount
      },
      reportType: 'stock-summary',
      filters: { categoryId, dateFrom: filters.dateFrom, dateTo: filters.dateTo }
    };
  }

  /**
   * Get comprehensive inventory report
   * @param {object} filters - Query filters (category, lowStock, type)
   * @returns {Promise<object>}
   */
  async getInventoryReport(filters) {
    const reportType = filters.type || 'summary';
    if (reportType === 'stock-summary') {
      return this.getStockSummaryReport(filters);
    }

    const { query } = require('../config/postgres');
    const categoryId = filters.category && filters.category !== 'all' ? filters.category : null;

    let sql = '';
    let params = [];
    let paramIdx = 1;

    let whereClause = "WHERE p.is_deleted = FALSE AND p.is_active = TRUE";
    if (categoryId) {
      whereClause += ` AND p.category_id = $${paramIdx++}`;
      params.push(categoryId);
    }

    if (reportType === 'low-stock') {
      whereClause += " AND p.stock_quantity <= p.min_stock_level";
    }

    sql = `
      SELECT 
        p.id,
        p.name,
        p.sku,
        p.barcode,
        cat.name as "categoryName",
        p.stock_quantity as "stockQuantity",
        p.min_stock_level as "minStockLevel",
        p.cost_price as "costPrice",
        p.selling_price as "sellingPrice",
        (p.stock_quantity * p.cost_price) as "valuation",
        p.unit
      FROM products p
      LEFT JOIN categories cat ON p.category_id = cat.id
      ${whereClause}
      ORDER BY p.name ASC
    `;

    const result = await query(sql, params);

    // Calculate summary
    const summarySql = `
      SELECT 
        COUNT(*) as "totalItems",
        SUM(stock_quantity * cost_price) as "totalValuation",
        COUNT(*) FILTER (WHERE stock_quantity <= min_stock_level) as "lowStockCount",
        COUNT(*) FILTER (WHERE stock_quantity = 0) as "outOfStockCount"
      FROM products
      WHERE is_deleted = FALSE AND is_active = TRUE
      ${categoryId ? ` AND category_id = $1` : ''}
    `;
    const summaryResult = await query(summarySql, categoryId ? [categoryId] : []);
    const summary = summaryResult.rows[0];

    return {
      data: result.rows.map(row => ({
        ...row,
        stockQuantity: parseFloat(row.stockQuantity || 0),
        minStockLevel: parseFloat(row.minStockLevel || 0),
        costPrice: parseFloat(row.costPrice || 0),
        sellingPrice: parseFloat(row.sellingPrice || 0),
        valuation: parseFloat(row.valuation || 0)
      })),
      summary: {
        totalItems: parseInt(summary.totalItems || 0),
        totalValuation: parseFloat(summary.totalValuation || 0),
        lowStockCount: parseInt(summary.lowStockCount || 0),
        outOfStockCount: parseInt(summary.outOfStockCount || 0)
      },
      reportType,
      filters: { categoryId }
    };
  }

  /**
   * Get comprehensive financial reports
   * @param {object} filters - Query filters (dateFrom, dateTo, type)
   * @returns {Promise<object>}
   */
  async getFinancialReport(filters) {
    const { query } = require('../config/postgres');
    const { getStartOfDayPakistan, getEndOfDayPakistan } = require('../utils/dateFilter');

    const dateFrom = filters.dateFrom ? getStartOfDayPakistan(filters.dateFrom) : null;
    const dateTo = filters.dateTo ? getEndOfDayPakistan(filters.dateTo) : getEndOfDayPakistan(new Date().toISOString().split('T')[0]);
    const reportType = filters.type || 'trial-balance'; // trial-balance, pl-statement, balance-sheet

    let sql = '';
    let params = [];
    if (dateFrom && dateTo) params = [dateFrom, dateTo];
    else if (dateTo) params = [dateTo];

    switch (reportType) {
      case 'trial-balance':
        sql = `
          SELECT 
            coa.account_code as "accountCode",
            coa.account_name as "accountName",
            coa.account_type as "accountType",
            COALESCE(SUM(l.debit_amount), 0) as "totalDebit",
            COALESCE(SUM(l.credit_amount), 0) as "totalCredit",
            CASE 
              WHEN coa.normal_balance = 'debit' THEN (coa.opening_balance + COALESCE(SUM(l.debit_amount - l.credit_amount), 0))
              ELSE 0
            END as "debitBalance",
            CASE 
              WHEN coa.normal_balance = 'credit' THEN (coa.opening_balance + COALESCE(SUM(l.credit_amount - l.debit_amount), 0))
              ELSE 0
            END as "creditBalance"
          FROM chart_of_accounts coa
          LEFT JOIN account_ledger l ON coa.account_code = l.account_code 
            AND l.status = 'completed' 
            ${dateFrom && dateTo ? 'AND l.transaction_date BETWEEN $1 AND $2' : dateTo ? 'AND l.transaction_date <= $1' : ''}
          WHERE coa.deleted_at IS NULL
          GROUP BY coa.id, coa.account_code, coa.account_name, coa.account_type, coa.normal_balance, coa.opening_balance
          HAVING (coa.opening_balance != 0 OR SUM(l.debit_amount) != 0 OR SUM(l.credit_amount) != 0)
          ORDER BY coa.account_code ASC
        `;
        break;

      case 'pl-statement':
        sql = `
          SELECT 
            coa.account_category as category,
            coa.account_name as "accountName",
            coa.account_type as "accountType",
            CASE 
              WHEN coa.account_type = 'revenue' THEN COALESCE(SUM(l.credit_amount - l.debit_amount), 0)
              ELSE COALESCE(SUM(l.debit_amount - l.credit_amount), 0)
            END as amount
          FROM chart_of_accounts coa
          JOIN account_ledger l ON coa.account_code = l.account_code
          WHERE coa.account_type IN ('revenue', 'expense')
            AND l.status = 'completed'
            ${dateFrom && dateTo ? 'AND l.transaction_date BETWEEN $1 AND $2' : dateTo ? 'AND l.transaction_date <= $1' : ''}
          GROUP BY coa.account_category, coa.account_name, coa.account_type
          ORDER BY coa.account_type DESC, coa.account_category ASC
        `;
        break;

      case 'balance-sheet':
        sql = `
          SELECT 
            coa.account_type as "accountType",
            coa.account_category as category,
            coa.account_name as "accountName",
            (coa.opening_balance + COALESCE(SUM(
              CASE 
                WHEN coa.normal_balance = 'debit' THEN (l.debit_amount - l.credit_amount)
                ELSE (l.credit_amount - l.debit_amount)
              END
            ), 0)) as balance
          FROM chart_of_accounts coa
          LEFT JOIN account_ledger l ON coa.account_code = l.account_code 
            AND l.status = 'completed'
            ${dateTo ? 'AND l.transaction_date <= $1' : ''}
          WHERE coa.account_type IN ('asset', 'liability', 'equity')
            AND coa.deleted_at IS NULL
          GROUP BY coa.account_type, coa.account_category, coa.account_name, coa.normal_balance, coa.opening_balance
          ORDER BY coa.account_type ASC, coa.account_category ASC
        `;
        break;
    }

    const result = await query(sql, params);
    const data = result.rows.map(row => {
      const newRow = { ...row };
      ['totalDebit', 'totalCredit', 'debitBalance', 'creditBalance', 'amount', 'balance'].forEach(key => {
        if (newRow[key] !== undefined) newRow[key] = parseFloat(newRow[key] || 0);
      });
      return newRow;
    });

    // Calculate Summary
    let summary = {};
    if (reportType === 'trial-balance') {
      summary = {
        totalDebit: data.reduce((sum, r) => sum + r.debitBalance, 0),
        totalCredit: data.reduce((sum, r) => sum + r.creditBalance, 0)
      };
    } else if (reportType === 'pl-statement') {
      const revenue = data.filter(r => r.accountType === 'revenue').reduce((sum, r) => sum + r.amount, 0);
      const expenses = data.filter(r => r.accountType === 'expense').reduce((sum, r) => sum + r.amount, 0);
      summary = {
        totalRevenue: revenue,
        totalExpenses: expenses,
        netProfit: revenue - expenses
      };
    } else if (reportType === 'balance-sheet') {
      summary = {
        totalAssets: data.filter(r => r.accountType === 'asset').reduce((sum, r) => sum + r.balance, 0),
        totalLiabilities: data.filter(r => r.accountType === 'liability').reduce((sum, r) => sum + r.balance, 0),
        totalEquity: data.filter(r => r.accountType === 'equity').reduce((sum, r) => sum + r.balance, 0)
      };
    }

    return {
      data,
      summary,
      reportType,
      dateRange: { from: dateFrom, to: dateTo }
    };
  }

  /**
   * Get summary cards for reporting dashboard
   * @param {object} filters - Query filters (dateFrom, dateTo, city)
   * @returns {Promise<object>}
   */
  async getSummaryCards(filters) {
    const { query } = require('../config/postgres');
    const { getStartOfDayPakistan, getEndOfDayPakistan } = require('../utils/dateFilter');

    const dateFrom = filters.dateFrom ? getStartOfDayPakistan(filters.dateFrom) : null;
    const dateTo = filters.dateTo ? getEndOfDayPakistan(filters.dateTo) : null;
    const city = filters.city && filters.city !== 'all' ? filters.city : null;

    // Base filters for city if provided
    let cityJoin = '';
    let cityWhere = '';
    if (city) {
      cityJoin = `
        LEFT JOIN customers c ON l.customer_id = c.id
        LEFT JOIN suppliers s ON l.supplier_id = s.id
      `;
      cityWhere = `AND (
        (jsonb_typeof(c.address) = 'array' AND EXISTS (SELECT 1 FROM jsonb_array_elements(c.address) addr WHERE addr->>'city' = $${filters.dateFrom && filters.dateTo ? 3 : 1}))
        OR (jsonb_typeof(c.address) = 'object' AND c.address->>'city' = $${filters.dateFrom && filters.dateTo ? 3 : 1})
        OR (jsonb_typeof(s.address) = 'array' AND EXISTS (SELECT 1 FROM jsonb_array_elements(s.address) addr WHERE addr->>'city' = $${filters.dateFrom && filters.dateTo ? 3 : 1}))
        OR (jsonb_typeof(s.address) = 'object' AND s.address->>'city' = $${filters.dateFrom && filters.dateTo ? 3 : 1})
      )`;
    }

    // 1. Total Customer Balance (Current)
    const customerBalanceQuery = `
      SELECT SUM(balance) as total FROM (
        SELECT c.opening_balance + COALESCE(SUM(l.debit_amount - l.credit_amount), 0) as balance
        FROM customers c
        LEFT JOIN account_ledger l ON c.id = l.customer_id AND l.status = 'completed' AND l.account_code = '1100'
        WHERE c.deleted_at IS NULL
        ${city ? `AND (
          (jsonb_typeof(c.address) = 'array' AND EXISTS (SELECT 1 FROM jsonb_array_elements(c.address) addr WHERE addr->>'city' = $1))
          OR (jsonb_typeof(c.address) = 'object' AND c.address->>'city' = $1)
        )` : ''}
        GROUP BY c.id, c.opening_balance
      ) as sub
    `;
    const customerBalance = await query(customerBalanceQuery, city ? [city] : []);

    // 2. Total Supplier Balance (Current)
    const supplierBalanceQuery = `
      SELECT SUM(balance) as total FROM (
        SELECT s.opening_balance + COALESCE(SUM(l.credit_amount - l.debit_amount), 0) as balance
        FROM suppliers s
        LEFT JOIN account_ledger l ON s.id = l.supplier_id AND l.status = 'completed' AND l.account_code = '2000'
        WHERE s.deleted_at IS NULL
        ${city ? `AND (
          (jsonb_typeof(s.address) = 'array' AND EXISTS (SELECT 1 FROM jsonb_array_elements(s.address) addr WHERE addr->>'city' = $1))
          OR (jsonb_typeof(s.address) = 'object' AND s.address->>'city' = $1)
        )` : ''}
        GROUP BY s.id, s.opening_balance
      ) as sub
    `;
    const supplierBalance = await query(supplierBalanceQuery, city ? [city] : []);

    // 3. Period-specific metrics (Sales, Payments)
    let dateFilter = '';
    let params = [];
    if (dateFrom && dateTo) {
      dateFilter = 'AND l.transaction_date BETWEEN $1 AND $2';
      params = [dateFrom, dateTo];
      if (city) params.push(city);
    } else if (city) {
      params = [city];
    }

    // Total Customer Payments in period
    const customerPaymentsQuery = `
      SELECT SUM(l.credit_amount) as total
      FROM account_ledger l
      ${city ? cityJoin : ''}
      WHERE l.customer_id IS NOT NULL 
      AND l.account_code = '1100'
      AND l.status = 'completed'
      ${dateFilter}
      ${city ? cityWhere : ''}
    `;
    const customerPayments = await query(customerPaymentsQuery, params);

    // Total Supplier Payments in period
    const supplierPaymentsQuery = `
      SELECT SUM(l.debit_amount) as total
      FROM account_ledger l
      ${city ? cityJoin : ''}
      WHERE l.supplier_id IS NOT NULL
      AND l.account_code = '2000'
      AND l.status = 'completed'
      ${dateFilter}
      ${city ? cityWhere : ''}
    `;
    const supplierPayments = await query(supplierPaymentsQuery, params);

    return {
      totalCustomerBalance: parseFloat(customerBalance.rows[0].total || 0),
      totalSupplierBalance: parseFloat(supplierBalance.rows[0].total || 0),
      totalCustomerPayments: parseFloat(customerPayments.rows[0].total || 0),
      totalSupplierPayments: parseFloat(supplierPayments.rows[0].total || 0),
    };
  }

  /**
   * Get party balance report (Customer/Supplier)
   * @param {object} filters - Query filters (partyType, city, dateFrom, dateTo)
   * @returns {Promise<object>}
   */
  async getPartyBalanceReport(filters) {
    const { query } = require('../config/postgres');
    const partyType = filters.partyType || 'customer';
    const city = filters.city && filters.city !== 'all' ? filters.city : null;
    
    let sql = '';
    let params = [];
    
    if (partyType === 'customer') {
      sql = `
        SELECT 
          c.id,
          COALESCE(c.business_name, c.name) as "businessName",
          c.name as "contactPerson",
          COALESCE(
            CASE 
              WHEN jsonb_typeof(c.address) = 'array' THEN (SELECT addr->>'city' FROM jsonb_array_elements(c.address) addr WHERE addr->>'city' IS NOT NULL LIMIT 1)
              ELSE c.address->>'city'
            END,
            'N/A'
          ) as city,
          (c.opening_balance + COALESCE(SUM(l.debit_amount - l.credit_amount), 0)) as balance,
          COALESCE(SUM(l.debit_amount), 0) as "totalDebit",
          COALESCE(SUM(l.credit_amount), 0) as "totalCredit"
        FROM customers c
        LEFT JOIN account_ledger l ON c.id = l.customer_id AND l.status = 'completed' AND l.account_code = '1100'
        WHERE c.deleted_at IS NULL
      `;
      if (city) {
        sql += ` AND (
          (jsonb_typeof(c.address) = 'array' AND EXISTS (SELECT 1 FROM jsonb_array_elements(c.address) addr WHERE addr->>'city' = $1))
          OR (jsonb_typeof(c.address) = 'object' AND c.address->>'city' = $1)
        )`;
        params.push(city);
      }
      sql += ` GROUP BY c.id, c.business_name, c.name, c.address, c.opening_balance ORDER BY balance DESC`;
    } else {
      sql = `
        SELECT 
          s.id,
          COALESCE(s.business_name, s.name) as "businessName",
          s.name as "contactPerson",
          COALESCE(
            CASE 
              WHEN jsonb_typeof(s.address) = 'array' THEN (SELECT addr->>'city' FROM jsonb_array_elements(s.address) addr WHERE addr->>'city' IS NOT NULL LIMIT 1)
              ELSE s.address->>'city'
            END,
            'N/A'
          ) as city,
          (s.opening_balance + COALESCE(SUM(l.credit_amount - l.debit_amount), 0)) as balance,
          COALESCE(SUM(l.debit_amount), 0) as "totalDebit",
          COALESCE(SUM(l.credit_amount), 0) as "totalCredit"
        FROM suppliers s
        LEFT JOIN account_ledger l ON s.id = l.supplier_id AND l.status = 'completed' AND l.account_code = '2000'
        WHERE s.deleted_at IS NULL
      `;
      if (city) {
        sql += ` AND (
          (jsonb_typeof(s.address) = 'array' AND EXISTS (SELECT 1 FROM jsonb_array_elements(s.address) addr WHERE addr->>'city' = $1))
          OR (jsonb_typeof(s.address) = 'object' AND s.address->>'city' = $1)
        )`;
        params.push(city);
      }
      sql += ` GROUP BY s.id, s.business_name, s.name, s.address, s.opening_balance ORDER BY balance DESC`;
    }

    const result = await query(sql, params);
    return {
      data: result.rows.map(row => ({
        ...row,
        balance: parseFloat(row.balance),
        totalDebit: parseFloat(row.totalDebit),
        totalCredit: parseFloat(row.totalCredit)
      })),
      partyType,
      city: city || 'All Cities'
    };
  }
}

module.exports = new ReportsService();

