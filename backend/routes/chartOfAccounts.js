const express = require('express');
const router = express.Router();
const { auth, requirePermission, requireAnyPermission } = require('../middleware/auth');
const chartOfAccountsRepository = require('../repositories/ChartOfAccountsRepository');
const accountCategoryRepository = require('../repositories/AccountCategoryRepository');

const chartView = requireAnyPermission(['view_chart_of_accounts', 'view_reports']);
const chartManage = requireAnyPermission(['manage_chart_of_accounts', 'view_reports']);

// GET /api/chart-of-accounts - list accounts (query: accountType, accountCategory, isActive, includeBalances)
router.get('/', auth, chartView, async (req, res) => {
  try {
    const { accountType, accountCategory, includePartyAccounts, isActive, includeBalances } = req.query;
    const filters = {};
    if (accountType) filters.accountType = accountType;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (accountCategory) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(accountCategory)) {
        const cat = await accountCategoryRepository.findById(accountCategory);
        filters.accountCategory = cat ? (cat.name || cat.account_name) : accountCategory;
      } else {
        filters.accountCategory = accountCategory;
      }
    }
    const accounts = await chartOfAccountsRepository.findAll(filters, { limit: 5000 });
    const data = (includeBalances === 'true' || includeBalances === true) ? accounts : accounts.map(a => ({ ...a, currentBalance: undefined, openingBalance: undefined }));
    res.json(Array.isArray(data) ? data : { success: true, data: data || accounts });
  } catch (error) {
    console.error('Chart of accounts list error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch chart of accounts', error: error.message });
  }
});

// GET /api/chart-of-accounts/hierarchy
router.get('/hierarchy', auth, chartView, async (req, res) => {
  try {
    const accounts = await chartOfAccountsRepository.findAll({ isActive: true }, { limit: 5000 });
    const byId = new Map(accounts.map(a => [a.id, { ...a, children: [] }]));
    const roots = [];
    for (const a of byId.values()) {
      if (a.parentAccountId && byId.has(a.parentAccountId)) {
        byId.get(a.parentAccountId).children.push(a);
      } else {
        roots.push(a);
      }
    }
    roots.sort((a, b) => (a.accountCode || '').localeCompare(b.accountCode || ''));
    res.json(roots);
  } catch (error) {
    console.error('Chart of accounts hierarchy error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch hierarchy', error: error.message });
  }
});

// GET /api/chart-of-accounts/stats/summary
router.get('/stats/summary', auth, chartView, async (req, res) => {
  try {
    const accounts = await chartOfAccountsRepository.findAll({ isActive: true }, { limit: 5000 });
    const total = accounts.length;
    const withBalance = accounts.filter(a => (a.currentBalance || 0) !== 0).length;
    res.json({ success: true, data: { totalAccounts: total, accountsWithBalance: withBalance } });
  } catch (error) {
    console.error('Chart of accounts stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats', error: error.message });
  }
});

// GET /api/chart-of-accounts/:id
router.get('/:id', auth, chartView, async (req, res) => {
  try {
    const account = await chartOfAccountsRepository.findById(req.params.id);
    if (!account) return res.status(404).json({ success: false, message: 'Account not found' });
    res.json(account);
  } catch (error) {
    console.error('Chart of accounts get error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch account', error: error.message });
  }
});

// POST /api/chart-of-accounts
router.post('/', auth, chartManage, async (req, res) => {
  try {
    const data = { ...req.body, createdBy: req.user?.id || req.user?._id };
    const account = await chartOfAccountsRepository.create(data);
    res.status(201).json(account);
  } catch (error) {
    console.error('Chart of accounts create error:', error);
    res.status(500).json({ success: false, message: 'Failed to create account', error: error.message });
  }
});

// PUT /api/chart-of-accounts/:id
router.put('/:id', auth, chartManage, async (req, res) => {
  try {
    const data = { ...req.body, updatedBy: req.user?.id || req.user?._id };
    const account = await chartOfAccountsRepository.updateById(req.params.id, data);
    if (!account) return res.status(404).json({ success: false, message: 'Account not found' });
    res.json(account);
  } catch (error) {
    console.error('Chart of accounts update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update account', error: error.message });
  }
});

// DELETE /api/chart-of-accounts/:id (soft delete if supported, else 501)
router.delete('/:id', auth, chartManage, async (req, res) => {
  try {
    const account = await chartOfAccountsRepository.findById(req.params.id);
    if (!account) return res.status(404).json({ success: false, message: 'Account not found' });
    if (account.isSystemAccount) return res.status(403).json({ success: false, message: 'Cannot delete system account' });
    if (chartOfAccountsRepository.softDelete) {
      await chartOfAccountsRepository.softDelete(req.params.id);
    } else {
      return res.status(501).json({ success: false, message: 'Delete not implemented' });
    }
    res.json({ success: true, message: 'Account deleted' });
  } catch (error) {
    console.error('Chart of accounts delete error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete account', error: error.message });
  }
});

module.exports = router;
