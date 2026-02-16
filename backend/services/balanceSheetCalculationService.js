const { query } = require('../config/postgres');
const AccountingService = require('./accountingService');

/**
 * Normalize date to end-of-day (23:59:59.999) so all transactions on that calendar day are included.
 * The ledger filter uses transaction_date <= asOfDate; if asOfDate is midnight, today's entries are excluded.
 */
function endOfDay(d) {
  const date = d instanceof Date ? d : new Date(d);
  const out = new Date(date);
  out.setHours(23, 59, 59, 999);
  return out;
}

/**
 * Balance Sheet Calculation Service - PostgreSQL Implementation
 * Generates Balance Sheet reports from ledger data
 */
class BalanceSheetCalculationService {
  /**
   * Calculate account balance for balance sheet (as of end of statement date)
   */
  async calculateAccountBalance(accountCode, statementDate) {
    const asOf = statementDate ? endOfDay(statementDate) : null;
    return await AccountingService.getAccountBalance(accountCode, asOf);
  }

  /**
   * Sum balances by account type (as of statementDate - uses date-filtered ledger)
   */
  async sumBalancesByAccountType(accountType, statementDate) {
    const codes = await this.getAccountCodesByType(accountType);
    let total = 0;
    for (const code of codes) {
      total += await this.calculateAccountBalance(code, statementDate);
    }
    return total;
  }

  /**
   * Get account codes by type (for balance sheet categories)
   */
  async getAccountCodesByType(accountType) {
    const result = await query(
      `SELECT account_code FROM chart_of_accounts WHERE account_type = $1 AND deleted_at IS NULL AND is_active = TRUE`,
      [accountType]
    );
    return (result.rows || []).map(r => r.account_code);
  }

  /**
   * Calculate current assets (as of statementDate - respects date filter)
   */
  async calculateCurrentAssets(statementDate) {
    const codes = ['1000', '1001', '1100', '1200', '1300']; // Cash, Bank, AR, Inventory, Prepaid
    let total = 0;
    for (const code of codes) {
      total += await this.calculateAccountBalance(code, statementDate);
    }
    return total;
  }

  /**
   * Calculate fixed assets (as of statementDate)
   */
  async calculateFixedAssets(statementDate) {
    const codes = ['1500', '1600'];
    let total = 0;
    for (const code of codes) {
      total += await this.calculateAccountBalance(code, statementDate);
    }
    return total;
  }

  /**
   * Calculate total assets
   */
  async calculateTotalAssets(statementDate) {
    const currentAssets = await this.calculateCurrentAssets(statementDate);
    const fixedAssets = await this.calculateFixedAssets(statementDate);
    return currentAssets + fixedAssets;
  }

  /**
   * Calculate current liabilities (as of statementDate)
   */
  async calculateCurrentLiabilities(statementDate) {
    const codes = ['2000', '2100', '2200', '2300'];
    let total = 0;
    for (const code of codes) {
      total += await this.calculateAccountBalance(code, statementDate);
    }
    return total;
  }

  /**
   * Calculate long-term liabilities (as of statementDate)
   */
  async calculateLongTermLiabilities(statementDate) {
    const codes = ['2500'];
    let total = 0;
    for (const code of codes) {
      total += await this.calculateAccountBalance(code, statementDate);
    }
    return total;
  }

  /**
   * Calculate total liabilities
   */
  async calculateTotalLiabilities(statementDate) {
    const current = await this.calculateCurrentLiabilities(statementDate);
    const longTerm = await this.calculateLongTermLiabilities(statementDate);
    return current + longTerm;
  }

  /**
   * Calculate equity (Owner's Equity 3000 only - Retained Earnings handled separately)
   */
  async calculateEquity(statementDate) {
    return await this.calculateAccountBalance('3000', statementDate);
  }

  /**
   * Calculate retained earnings (from P&L)
   */
  async calculateRetainedEarnings(statementDate, startOfYear) {
    // Get net income from P&L
    const plService = require('./plCalculationService');
    const netIncome = await plService.calculateNetIncome(startOfYear, statementDate);
    
    // Get opening retained earnings
    const openingRE = await this.calculateAccountBalance('3100', startOfYear);
    
    return openingRE + netIncome;
  }

  /**
   * Generate complete balance sheet
   */
  async generateBalanceSheet(statementDate) {
    const date = statementDate || new Date();
    const startOfYear = new Date(date.getFullYear(), 0, 1);

    // Assets
    const currentAssets = await this.calculateCurrentAssets(date);
    const fixedAssets = await this.calculateFixedAssets(date);
    const totalAssets = currentAssets + fixedAssets;

    // Liabilities
    const currentLiabilities = await this.calculateCurrentLiabilities(date);
    const longTermLiabilities = await this.calculateLongTermLiabilities(date);
    const totalLiabilities = currentLiabilities + longTermLiabilities;

    // Equity
    const ownerEquity = await this.calculateAccountBalance('3000', date);
    const retainedEarnings = await this.calculateRetainedEarnings(endOfDay(date), startOfYear);
    const totalEquity = ownerEquity + retainedEarnings;

    // Validation: Assets = Liabilities + Equity
    const difference = Math.abs(totalAssets - (totalLiabilities + totalEquity));
    const isBalanced = difference < 0.01;

    if (!isBalanced && difference > 1.00) {
      console.warn(`Balance Sheet imbalance: ${difference.toFixed(2)}`);
    }

    return {
      statementDate: date,
      assets: {
        currentAssets: {
          cash: await this.calculateAccountBalance('1000', date),
          bank: await this.calculateAccountBalance('1001', date),
          accountsReceivable: await this.calculateAccountBalance('1100', date),
          inventory: await this.calculateAccountBalance('1200', date),
          prepaidExpenses: await this.calculateAccountBalance('1300', date),
          total: currentAssets
        },
        fixedAssets: {
          grossFixedAssets: fixedAssets,
          accumulatedDepreciation: Math.abs(await this.calculateAccountBalance('1600', date)),
          netFixedAssets: fixedAssets - Math.abs(await this.calculateAccountBalance('1600', date)),
          total: fixedAssets
        },
        total: totalAssets
      },
      liabilities: {
        currentLiabilities: {
          accountsPayable: await this.calculateAccountBalance('2000', date),
          accruedExpenses: await this.calculateAccountBalance('2100', date),
          salesTaxPayable: await this.calculateAccountBalance('2200', date),
          shortTermDebt: await this.calculateAccountBalance('2300', date),
          total: currentLiabilities
        },
        longTermLiabilities: {
          longTermDebt: await this.calculateAccountBalance('2500', date),
          total: longTermLiabilities
        },
        total: totalLiabilities
      },
      equity: {
        ownerEquity: ownerEquity,
        retainedEarnings: retainedEarnings,
        total: totalEquity
      },
      validation: {
        isBalanced: isBalanced,
        difference: difference,
        equation: `${totalAssets.toFixed(2)} = ${totalLiabilities.toFixed(2)} + ${totalEquity.toFixed(2)}`
      },
      generatedAt: new Date()
    };
  }
}

module.exports = new BalanceSheetCalculationService();
