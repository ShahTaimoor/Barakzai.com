const { query } = require('../config/postgres');
const AccountingService = require('./accountingService');

/**
 * Balance Sheet Calculation Service - PostgreSQL Implementation
 * Generates Balance Sheet reports from ledger data
 */
class BalanceSheetCalculationService {
  /**
   * Calculate account balance for balance sheet
   */
  async calculateAccountBalance(accountCode, statementDate) {
    return await AccountingService.getAccountBalance(accountCode, statementDate);
  }

  /**
   * Sum balances by account type
   */
  async sumBalancesByAccountType(accountType, statementDate) {
    const result = await query(
      `SELECT COALESCE(SUM(current_balance), 0) AS total
       FROM account_balances
       WHERE account_type = $1
         AND current_balance != 0`,
      [accountType]
    );
    return parseFloat(result.rows[0]?.total || 0);
  }

  /**
   * Calculate current assets (by account_code; view may not have account_category)
   */
  async calculateCurrentAssets(statementDate) {
    const result = await query(
      `SELECT COALESCE(SUM(current_balance), 0) AS total
       FROM account_balances
       WHERE account_type = 'asset'
         AND account_code IN ('1000', '1100', '1200', '1300')
         AND current_balance != 0`,
      []
    );
    return parseFloat(result.rows[0]?.total || 0);
  }

  /**
   * Calculate fixed assets (by account_code)
   */
  async calculateFixedAssets(statementDate) {
    const result = await query(
      `SELECT COALESCE(SUM(current_balance), 0) AS total
       FROM account_balances
       WHERE account_type = 'asset'
         AND account_code IN ('1500', '1600')
         AND current_balance != 0`,
      []
    );
    return parseFloat(result.rows[0]?.total || 0);
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
   * Calculate current liabilities (by account_code)
   */
  async calculateCurrentLiabilities(statementDate) {
    const result = await query(
      `SELECT COALESCE(SUM(current_balance), 0) AS total
       FROM account_balances
       WHERE account_type = 'liability'
         AND account_code IN ('2000', '2100', '2200', '2300')
         AND current_balance != 0`,
      []
    );
    return parseFloat(result.rows[0]?.total || 0);
  }

  /**
   * Calculate long-term liabilities (by account_code)
   */
  async calculateLongTermLiabilities(statementDate) {
    const result = await query(
      `SELECT COALESCE(SUM(current_balance), 0) AS total
       FROM account_balances
       WHERE account_type = 'liability'
         AND account_code IN ('2500')
         AND current_balance != 0`,
      []
    );
    return parseFloat(result.rows[0]?.total || 0);
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
   * Calculate equity
   */
  async calculateEquity(statementDate) {
    const result = await query(
      `SELECT COALESCE(SUM(current_balance), 0) AS total
       FROM account_balances
       WHERE account_type = 'equity'
         AND current_balance != 0`,
      []
    );
    return parseFloat(result.rows[0]?.total || 0);
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
    const retainedEarnings = await this.calculateRetainedEarnings(date, startOfYear);
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
