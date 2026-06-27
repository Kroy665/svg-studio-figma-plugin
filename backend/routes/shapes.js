const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const { validateSVG, sanitizeSVG, extractDimensions, validateShapeName, validateTags } = require('../utils/svgValidator');
const logger = require('../utils/logger');

/**
 * GET /api/shapes
 * Get all shapes or filter by category/search
 */
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;

    let where = {};

    if (search) {
      // SQLite doesn't support mode: 'insensitive', so use COLLATE NOCASE or convert to lowercase
      where.OR = [
        { name: { contains: search } },
        { tags: { contains: search } }
      ];
    }

    if (category && category !== 'all') {
      where.category = { name: category };
    }

    const shapes = await prisma.shape.findMany({
      where,
      include: {
        category: {
          select: {
            name: true,
            displayName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Parse tags and transform response
    const transformedShapes = shapes.map(shape => ({
      id: shape.id,
      name: shape.name,
      cat: shape.category.name,
      category_name: shape.category.name,
      category_display_name: shape.category.displayName,
      svg: shape.svgContent,
      svg_content: shape.svgContent,
      width: shape.width,
      height: shape.height,
      tags: shape.tags ? JSON.parse(shape.tags) : [],
      is_custom: shape.isCustom,
      created_at: shape.createdAt,
      updated_at: shape.updatedAt
    }));

    logger.info(`Retrieved ${transformedShapes.length} shapes`, { category, search });

    res.json({
      success: true,
      count: transformedShapes.length,
      data: transformedShapes
    });
  } catch (error) {
    logger.error('Error fetching shapes', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch shapes'
    });
  }
});

/**
 * GET /api/shapes/:id
 * Get a single shape by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const shape = await prisma.shape.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: {
          select: {
            name: true,
            displayName: true
          }
        }
      }
    });

    if (!shape) {
      return res.status(404).json({
        success: false,
        error: 'Shape not found'
      });
    }

    res.json({
      success: true,
      data: {
        ...shape,
        tags: shape.tags ? JSON.parse(shape.tags) : []
      }
    });
  } catch (error) {
    logger.error('Error fetching shape', { id: req.params.id, error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch shape'
    });
  }
});

/**
 * POST /api/shapes
 * Create a new shape
 */
router.post('/', async (req, res) => {
  try {
    const { name, category, svg_content, tags, is_custom } = req.body;

    // Validate name
    const nameValidation = validateShapeName(name);
    if (!nameValidation.valid) {
      return res.status(400).json({
        success: false,
        errors: nameValidation.errors
      });
    }

    // Validate SVG
    const svgValidation = validateSVG(svg_content);
    if (!svgValidation.valid) {
      return res.status(400).json({
        success: false,
        errors: svgValidation.errors
      });
    }

    // Sanitize SVG
    const sanitized = sanitizeSVG(svg_content);

    // Extract dimensions
    const { width, height } = extractDimensions(sanitized);

    // Validate tags
    const tagsValidation = validateTags(tags);

    // Get category
    const categoryName = category || 'custom';
    const categoryRecord = await prisma.category.findUnique({
      where: { name: categoryName }
    });

    if (!categoryRecord) {
      return res.status(400).json({
        success: false,
        error: `Category '${categoryName}' not found`
      });
    }

    // Create shape with history
    const newShape = await prisma.shape.create({
      data: {
        name: nameValidation.sanitized,
        categoryId: categoryRecord.id,
        svgContent: sanitized,
        width,
        height,
        tags: tagsValidation.sanitized,
        isCustom: is_custom || false,
        history: {
          create: {
            action: 'created',
            userNote: 'Shape created via API'
          }
        }
      },
      include: {
        category: {
          select: {
            name: true,
            displayName: true
          }
        }
      }
    });

    logger.info('Shape created', { id: newShape.id, name: newShape.name });

    res.status(201).json({
      success: true,
      data: {
        ...newShape,
        tags: newShape.tags ? JSON.parse(newShape.tags) : []
      }
    });
  } catch (error) {
    logger.error('Error creating shape', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to create shape'
    });
  }
});

/**
 * PUT /api/shapes/:id
 * Update a shape
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, svg_content, tags } = req.body;

    // Check if shape exists
    const existingShape = await prisma.shape.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingShape) {
      return res.status(404).json({
        success: false,
        error: 'Shape not found'
      });
    }

    // Build update data
    const updateData = {};

    if (name) {
      const nameValidation = validateShapeName(name);
      if (!nameValidation.valid) {
        return res.status(400).json({
          success: false,
          errors: nameValidation.errors
        });
      }
      updateData.name = nameValidation.sanitized;
    }

    if (svg_content) {
      const svgValidation = validateSVG(svg_content);
      if (!svgValidation.valid) {
        return res.status(400).json({
          success: false,
          errors: svgValidation.errors
        });
      }

      const sanitized = sanitizeSVG(svg_content);
      const { width, height } = extractDimensions(sanitized);

      updateData.svgContent = sanitized;
      updateData.width = width;
      updateData.height = height;
    }

    if (tags !== undefined) {
      const tagsValidation = validateTags(tags);
      updateData.tags = tagsValidation.sanitized;
    }

    if (category) {
      const categoryRecord = await prisma.category.findUnique({
        where: { name: category }
      });

      if (!categoryRecord) {
        return res.status(400).json({
          success: false,
          error: `Category '${category}' not found`
        });
      }
      updateData.categoryId = categoryRecord.id;
    }

    // Update shape with history
    const updatedShape = await prisma.shape.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData,
        history: {
          create: {
            action: 'updated',
            userNote: 'Shape updated via API'
          }
        }
      },
      include: {
        category: {
          select: {
            name: true,
            displayName: true
          }
        }
      }
    });

    logger.info('Shape updated', { id, name: updatedShape.name });

    res.json({
      success: true,
      data: {
        ...updatedShape,
        tags: updatedShape.tags ? JSON.parse(updatedShape.tags) : []
      }
    });
  } catch (error) {
    logger.error('Error updating shape', { id: req.params.id, error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to update shape'
    });
  }
});

/**
 * DELETE /api/shapes/:id
 * Delete a shape
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existingShape = await prisma.shape.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingShape) {
      return res.status(404).json({
        success: false,
        error: 'Shape not found'
      });
    }

    // Create history before deleting (history will be cascade deleted)
    await prisma.shapeHistory.create({
      data: {
        shapeId: parseInt(id),
        action: 'deleted',
        userNote: 'Shape deleted via API'
      }
    });

    // Delete shape
    await prisma.shape.delete({
      where: { id: parseInt(id) }
    });

    logger.info('Shape deleted', { id, name: existingShape.name });

    res.json({
      success: true,
      message: 'Shape deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting shape', { id: req.params.id, error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to delete shape'
    });
  }
});

module.exports = router;
