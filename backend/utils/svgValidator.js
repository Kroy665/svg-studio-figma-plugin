const config = require('../config');

/**
 * Validate SVG content
 */
function validateSVG(svgContent) {
  const errors = [];

  // Check if content exists
  if (!svgContent || typeof svgContent !== 'string') {
    errors.push('SVG content is required and must be a string');
    return { valid: false, errors };
  }

  // Trim whitespace
  svgContent = svgContent.trim();

  // Check size
  const byteSize = Buffer.byteLength(svgContent, 'utf8');
  if (byteSize > config.storage.maxSvgSize) {
    errors.push(`SVG size (${byteSize} bytes) exceeds maximum allowed size (${config.storage.maxSvgSize} bytes)`);
  }

  // Check if it's valid XML/SVG
  if (!svgContent.startsWith('<svg') && !svgContent.startsWith('<?xml')) {
    errors.push('Content must be valid SVG (should start with <svg or <?xml)');
  }

  if (!svgContent.includes('</svg>')) {
    errors.push('SVG must have closing </svg> tag');
  }

  // Check for potentially dangerous content
  const dangerousPatterns = [
    /<script[\s>]/i,
    /on\w+\s*=/i, // onclick, onload, etc.
    /javascript:/i,
    /<iframe[\s>]/i,
    /<embed[\s>]/i,
    /<object[\s>]/i,
    /xlink:href\s*=\s*["']?javascript:/i
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(svgContent)) {
      errors.push(`SVG contains potentially dangerous content: ${pattern.source}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    size: byteSize
  };
}

/**
 * Sanitize SVG content
 */
function sanitizeSVG(svgContent) {
  if (!svgContent || typeof svgContent !== 'string') {
    return '';
  }

  let sanitized = svgContent.trim();

  // Remove script tags
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers
  sanitized = sanitized.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '');

  // Remove javascript: protocols
  sanitized = sanitized.replace(/javascript:/gi, '');

  // Remove dangerous tags
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  sanitized = sanitized.replace(/<embed\b[^>]*>/gi, '');
  sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');

  return sanitized;
}

/**
 * Extract SVG dimensions
 */
function extractDimensions(svgContent) {
  const widthMatch = svgContent.match(/width\s*=\s*["']?(\d+)["']?/i);
  const heightMatch = svgContent.match(/height\s*=\s*["']?(\d+)["']?/i);

  let width = widthMatch ? parseInt(widthMatch[1]) : null;
  let height = heightMatch ? parseInt(heightMatch[1]) : null;

  // Try to extract from viewBox if width/height not found
  if (!width || !height) {
    const viewBoxMatch = svgContent.match(/viewBox\s*=\s*["']?[\d.]+\s+[\d.]+\s+([\d.]+)\s+([\d.]+)["']?/i);
    if (viewBoxMatch) {
      width = width || parseInt(viewBoxMatch[1]);
      height = height || parseInt(viewBoxMatch[2]);
    }
  }

  return { width, height };
}

/**
 * Validate shape name
 */
function validateShapeName(name) {
  const errors = [];

  if (!name || typeof name !== 'string') {
    errors.push('Shape name is required');
    return { valid: false, errors };
  }

  name = name.trim();

  if (name.length < 1) {
    errors.push('Shape name cannot be empty');
  }

  if (name.length > 100) {
    errors.push('Shape name cannot exceed 100 characters');
  }

  // Check for invalid characters
  const invalidChars = /[<>:"\/\\|?*\x00-\x1F]/;
  if (invalidChars.test(name)) {
    errors.push('Shape name contains invalid characters');
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized: name.trim()
  };
}

/**
 * Validate tags
 */
function validateTags(tags) {
  if (!tags) {
    return { valid: true, sanitized: [] };
  }

  const errors = [];
  let sanitized = [];

  if (typeof tags === 'string') {
    try {
      sanitized = JSON.parse(tags);
    } catch (e) {
      // Try comma-separated
      sanitized = tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
    }
  } else if (Array.isArray(tags)) {
    sanitized = tags;
  } else {
    errors.push('Tags must be a string or array');
    return { valid: false, errors };
  }

  // Validate each tag
  sanitized = sanitized
    .filter(tag => typeof tag === 'string')
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag.length > 0 && tag.length <= 50)
    .slice(0, 20); // Max 20 tags

  return {
    valid: true,
    sanitized: JSON.stringify(sanitized)
  };
}

module.exports = {
  validateSVG,
  sanitizeSVG,
  extractDimensions,
  validateShapeName,
  validateTags
};
