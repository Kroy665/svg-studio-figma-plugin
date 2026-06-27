const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const logger = require('../utils/logger');

/**
 * GET /api/categories
 * Get all categories with shape counts
 */
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { shapes: true }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });

    const transformed = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      display_name: cat.displayName,
      description: cat.description,
      sort_order: cat.sortOrder,
      shape_count: cat._count.shapes,
      created_at: cat.createdAt,
      updated_at: cat.updatedAt
    }));

    logger.info(`Retrieved ${transformed.length} categories`);

    res.json({
      success: true,
      count: transformed.length,
      data: transformed
    });
  } catch (error) {
    logger.error('Error fetching categories', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
});

/**
 * GET /api/categories/:id
 * Get a single category by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { shapes: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: {
        ...category,
        shape_count: category._count.shapes
      }
    });
  } catch (error) {
    logger.error('Error fetching category', { id: req.params.id, error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch category'
    });
  }
});

module.exports = router;
