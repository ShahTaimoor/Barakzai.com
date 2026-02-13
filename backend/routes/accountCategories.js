const express = require('express');
const router = express.Router();
const { auth, requirePermission } = require('../middleware/auth');
const { validateAccountCategory } = require('../middleware/validation');
const accountCategoryRepository = require('../repositories/AccountCategoryRepository');
const chartOfAccountsRepository = require('../repositories/ChartOfAccountsRepository');

// Get all account categories
router.get('/', auth, async (req, res) => {
  try {
    const { accountType, grouped } = req.query;
    
    let categories;
    if (grouped === 'true') {
      categories = await accountCategoryRepository.getAllCategoriesGrouped();
    } else if (accountType) {
      categories = await accountCategoryRepository.getCategoriesByType(accountType);
    } else {
      categories = await accountCategoryRepository.findActive();
    }
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching account categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch account categories',
      error: error.message
    });
  }
});

// Get grouped account categories (specific route before /:id to avoid route conflict)
router.get('/grouped', auth, async (req, res) => {
  try {
    const categories = await accountCategoryRepository.getAllCategoriesGrouped();
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching grouped account categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch grouped account categories',
      error: error.message
    });
  }
});

// Get single account category
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate that id is a valid UUID format
    // Handle special keywords that might be mistaken for IDs
    if (id === 'grouped' || id === 'all' || id === 'active') {
      return res.status(400).json({
        success: false,
        message: `Invalid category ID. Use query parameters instead. For example: /api/account-categories?grouped=true`
      });
    }
    
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID format'
      });
    }
    
    const category = await accountCategoryRepository.findById(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Account category not found'
      });
    }
    
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error fetching account category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch account category',
      error: error.message
    });
  }
});

// Create new account category
router.post('/', auth, validateAccountCategory, async (req, res) => {
  try {
    const categoryData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    let category;
    try {
      category = await accountCategoryRepository.create(categoryData);
    } catch (err) {
      if (err.code === 11000) {
        const duplicateField = Object.keys(err.keyPattern || {})[0];
        return res.status(400).json({
          success: false,
          message: `${duplicateField} already exists`
        });
      }
      throw err;
    }
    
    res.status(201).json({
      success: true,
      message: 'Account category created successfully',
      data: category
    });
  } catch (error) {
    console.error('Error creating account category:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category name or code already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create account category',
      error: error.message
    });
  }
});

// Update account category
router.put('/:id', auth, validateAccountCategory, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID format'
      });
    }
    
    const category = await accountCategoryRepository.findById(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Account category not found'
      });
    }
    
    if (category.is_system_category ?? category.isSystemCategory) {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify system categories'
      });
    }
    
    const updateData = {
      ...req.body,
      updatedBy: req.user.id
    };
    
    const updatedCategory = await accountCategoryRepository.updateById(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'Account category updated successfully',
      data: updatedCategory
    });
  } catch (error) {
    console.error('Error updating account category:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category name or code already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update account category',
      error: error.message
    });
  }
});

// Delete account category
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate that id is a valid UUID format
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    const category = await accountCategoryRepository.findById(id);
    const categoryData = category && (typeof category.toObject === 'function' ? category.toObject() : category);

    if (!categoryData) {
      return res.status(404).json({
        success: false,
        message: 'Account category not found'
      });
    }

    const isSystemCategory = categoryData.is_system_category ?? categoryData.isSystemCategory;
    if (isSystemCategory) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete system categories'
      });
    }

    const categoryIdForCount = categoryData.id ?? categoryData._id;
    const accountsUsingCategory = await chartOfAccountsRepository.count({
      accountCategory: categoryIdForCount
    });

    if (accountsUsingCategory > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. ${accountsUsingCategory} account(s) are using this category.`
      });
    }

    await accountCategoryRepository.hardDelete(id);
    
    res.json({
      success: true,
      message: 'Account category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting account category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account category',
      error: error.message
    });
  }
});

module.exports = router;
