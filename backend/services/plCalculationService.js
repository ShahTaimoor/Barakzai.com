const { query } = require('../config/postgres');
const AccountingService = require('./accountingService');

/**
 * Profit & Loss Calculation Service - PostgreSQL Implementation
 * Generates P&L statements from ledger data, with fallback to sales table when ledger is empty
 */
class PLCalculationService {
  /**
   * Get revenue and COGS from sales table for period (fallback when ledger has no data)
   */
  async getRevenueAndCOGSFromSales(startDate, endDate) {
    const revenueResult = await query(
      `SELECT COALESCE(SUM(total), 0) AS revenue
       FROM sales
       WHERE deleted_at IS NULL AND sale_date >= $1 AND sale_date <= $2`,
      [startDate, endDate]
    );
    const revenue = parseFloat(revenueResult.rows[0]?.revenue || 0);
    const salesRows = await query(
      `SELECT items FROM sales WHERE deleted_at IS NULL AND sale_date >= $1 AND sale_date <= $2`,
      [startDate, endDate]
    );
    let cogs = 0;
    for (const r of salesRows.rows || []) {
      const items = typeof r.items === 'string' ? JSON.parse(r.items || '[]') : (r.items || []);
      for (const it of items) {
        const qty = Number(it.quantity) || 0;
        const cost = Number(it.cost_price ?? it.costPrice ?? 0);
        cogs += qty * cost;
      }
    }
    return { revenue, cogs };
  }

  /**
   * Calculate revenue for a period
   */
  async calculateRevenue(startDate, endDate) {
    const result = await query(
      `SELECT COALESCE(SUM(credit_amount - debit_amount), 0) AS revenue
       FROM account_ledger
       WHERE account_code IN ('4000', '4200')
         AND transaction_date >= $1
         AND transaction_date <= $2
         AND status = 'completed'
         AND reversed_at IS NULL`,
      [startDate, endDate]
    );
    return parseFloat(result.rows[0]?.revenue || 0);
  }

  /**
   * Calculate cost of goods sold for a period
   */
  async calculateCOGS(startDate, endDate) {
    const result = await query(
      `SELECT COALESCE(SUM(debit_amount - credit_amount), 0) AS cogs
       FROM account_ledger
       WHERE account_code = '5000'
         AND transaction_date >= $1
         AND transaction_date <= $2
         AND status = 'completed'
         AND reversed_at IS NULL`,
      [startDate, endDate]
    );
    return parseFloat(result.rows[0]?.cogs || 0);
  }

  /**
   * Calculate gross profit
   */
  async calculateGrossProfit(startDate, endDate) {
    const revenue = await this.calculateRevenue(startDate, endDate);
    const cogs = await this.calculateCOGS(startDate, endDate);
    return revenue - cogs;
  }

  /**
   * Calculate operating expenses for a period
   */
  async calculateOperatingExpenses(startDate, endDate) {
    const result = await query(
      `SELECT COALESCE(SUM(debit_amount - credit_amount), 0) AS expenses
       FROM account_ledger
       WHERE account_code IN ('5100', '5200', '5300', '5400', '5500')
         AND transaction_date >= $1
         AND transaction_date <= $2
         AND status = 'completed'
         AND reversed_at IS NULL`,
      [startDate, endDate]
    );
    return parseFloat(result.rows[0]?.expenses || 0);
  }

  /**
   * Calculate other expenses (account 5600 only)
   */
  async calculateOtherExpenses(startDate, endDate) {
    const result = await query(
      `SELECT COALESCE(SUM(debit_amount - credit_amount), 0) AS expenses
       FROM account_ledger
       WHERE account_code = '5600'
         AND transaction_date >= $1
         AND transaction_date <= $2
         AND status = 'completed'
         AND reversed_at IS NULL`,
      [startDate, endDate]
    );
    return parseFloat(result.rows[0]?.expenses || 0);
  }

  /**
   * Get all expense account codes from chart of accounts (excluding COGS 5000).
   * Used so Record Expense and any expense account impact P&L.
   */
  async getExpenseAccountCodes() {
    const result = await query(
      `SELECT account_code FROM chart_of_accounts
       WHERE account_type = 'expense' AND account_code != '5000'
         AND deleted_at IS NULL AND is_active = TRUE`,
      []
    );
    return (result.rows || []).map((r) => r.account_code);
  }

  /**
   * Calculate total expenses from ledger for ALL expense-type accounts in period.
   * Ensures Record Expense (and any expense account) impacts P&L.
   */
  async calculateTotalExpensesFromLedger(startDate, endDate) {
    const codes = await this.getExpenseAccountCodes();
    if (codes.length === 0) return 0;
    const result = await query(
      `SELECT COALESCE(SUM(debit_amount - credit_amount), 0) AS total
       FROM account_ledger
       WHERE account_code = ANY($1)
         AND transaction_date >= $2
         AND transaction_date <= $3
         AND status = 'completed'
         AND reversed_at IS NULL`,
      [codes, startDate, endDate]
    );
    return parseFloat(result.rows[0]?.total || 0);
  }

  /**
   * Calculate net income (includes all expense accounts so Record Expense impacts P&L)
   */
  async calculateNetIncome(startDate, endDate) {
    const revenue = await this.calculateRevenue(startDate, endDate);
    const cogs = await this.calculateCOGS(startDate, endDate);
    const totalExpenses = await this.calculateTotalExpensesFromLedger(startDate, endDate);
    return revenue - cogs - totalExpenses;
  }

  /**
   * Generate complete P&L statement
   * Uses account_ledger when populated; falls back to sales table for revenue/COGS when ledger is empty
   */
  async generatePLStatement(startDate, endDate) {
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // Revenue from ledger
    let salesRevenue = await this.calculateAccountRevenue('4000', start, end);
    const salesReturns = await this.calculateAccountRevenue('4100', start, end);
    const otherIncome = await this.calculateAccountRevenue('4200', start, end);

    // COGS from ledger
    let cogs = await this.calculateCOGS(start, end);

    // Fallback: when ledger has no revenue/COGS, use sales table so P&L shows real data
    if (salesRevenue === 0 && cogs === 0) {
      const fromSales = await this.getRevenueAndCOGSFromSales(start, end);
      if (fromSales.revenue > 0 || fromSales.cogs > 0) {
        salesRevenue = fromSales.revenue;
        cogs = fromSales.cogs;
      }
    }
    // When ledger has revenue but no COGS posted, still get COGS from sales items (cost) so P&L shows expense
    if (cogs === 0) {
      const fromSales = await this.getRevenueAndCOGSFromSales(start, end);
      if (fromSales.cogs > 0) cogs = fromSales.cogs;
    }

    const totalRevenue = salesRevenue - salesReturns + otherIncome;
    const grossProfit = totalRevenue - cogs;

    // Operating Expenses (breakdown by standard accounts)
    const salaries = await this.calculateAccountExpense('5200', start, end);
    const rent = await this.calculateAccountExpense('5300', start, end);
    const utilities = await this.calculateAccountExpense('5400', start, end);
    const depreciation = await this.calculateAccountExpense('5500', start, end);
    const otherOperating = await this.calculateAccountExpense('5100', start, end);
    const standardOperatingTotal = salaries + rent + utilities + depreciation + otherOperating;

    // Other Expenses (5600)
    const otherExpenses = await this.calculateOtherExpenses(start, end);

    // Total expenses from ALL expense accounts in ledger (so Record Expense impacts P&L)
    const totalExpensesFromLedger = await this.calculateTotalExpensesFromLedger(start, end);
    const otherExpenseAccounts = Math.max(0, totalExpensesFromLedger - standardOperatingTotal - otherExpenses);
    const totalOperatingExpenses = standardOperatingTotal + otherExpenseAccounts;

    // Net Income (uses full expense total so every recorded expense is included)
    const totalExpensesForNet = totalOperatingExpenses + otherExpenses;
    const netIncome = grossProfit - totalExpensesForNet;

    return {
      period: {
        startDate: start,
        endDate: end
      },
      revenue: {
        salesRevenue: salesRevenue,
        salesReturns: salesReturns,
        netSales: salesRevenue - salesReturns,
        otherIncome: otherIncome,
        total: totalRevenue
      },
      costOfGoodsSold: {
        total: cogs
      },
      grossProfit: grossProfit,
      operatingExpenses: {
        salaries: salaries,
        rent: rent,
        utilities: utilities,
        depreciation: depreciation,
        otherOperating: otherOperating,
        otherExpenseAccounts: otherExpenseAccounts,
        total: totalOperatingExpenses
      },
      otherExpenses: {
        total: otherExpenses
      },
      totalExpenses: totalExpensesForNet,
      netIncome: netIncome,
      generatedAt: new Date()
    };
  }

  /**
   * Calculate revenue for a specific account
   */
  async calculateAccountRevenue(accountCode, startDate, endDate) {
    const result = await query(
      `SELECT COALESCE(SUM(credit_amount - debit_amount), 0) AS revenue
       FROM account_ledger
       WHERE account_code = $1
         AND transaction_date >= $2
         AND transaction_date <= $3
         AND status = 'completed'
         AND reversed_at IS NULL`,
      [accountCode, startDate, endDate]
    );
    return parseFloat(result.rows[0]?.revenue || 0);
  }

  /**
   * Calculate expense for a specific account
   */
  async calculateAccountExpense(accountCode, startDate, endDate) {
    const result = await query(
      `SELECT COALESCE(SUM(debit_amount - credit_amount), 0) AS expense
       FROM account_ledger
       WHERE account_code = $1
         AND transaction_date >= $2
         AND transaction_date <= $3
         AND status = 'completed'
         AND reversed_at IS NULL`,
      [accountCode, startDate, endDate]
    );
    return parseFloat(result.rows[0]?.expense || 0);
  }
}

module.exports = new PLCalculationService();
