const { PrismaClient } = require('../generated/prisma');
const SHAPES_DATA = require('./shapes-data');

const prisma = new PrismaClient();

// Helper to extract dimensions
function extractDimensions(svg) {
  const widthMatch = svg.match(/width\s*=\s*["']?(\d+)["']?/i);
  const heightMatch = svg.match(/height\s*=\s*["']?(\d+)["']?/i);

  let width = widthMatch ? parseInt(widthMatch[1]) : null;
  let height = heightMatch ? parseInt(heightMatch[1]) : null;

  if (!width || !height) {
    const viewBoxMatch = svg.match(/viewBox\s*=\s*["']?[\d.]+\s+[\d.]+\s+([\d.]+)\s+([\d.]+)["']?/i);
    if (viewBoxMatch) {
      width = width || parseInt(viewBoxMatch[1]);
      height = height || parseInt(viewBoxMatch[2]);
    }
  }

  return { width, height };
}

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Create categories
  console.log('Creating categories...');
  const categories = [
    { name: 'all', displayName: 'All', description: 'All available shapes', sortOrder: 0 },
    { name: 'waves', displayName: 'Waves', description: 'Wave patterns and backgrounds', sortOrder: 1 },
    { name: 'blobs', displayName: 'Blobs', description: 'Organic blob shapes', sortOrder: 2 },
    { name: 'shapes', displayName: 'Shapes', description: 'Geometric and UI shapes', sortOrder: 3 },
    { name: 'dividers', displayName: 'Dividers', description: 'Line dividers and separators', sortOrder: 4 },
    { name: 'frames', displayName: 'Frames', description: 'Border frames', sortOrder: 5 },
    { name: 'borders', displayName: 'Borders', description: 'Border styles', sortOrder: 6 },
    { name: 'custom', displayName: 'Custom', description: 'User uploaded shapes', sortOrder: 7 }
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat
    });
  }
  console.log(`✓ Created ${categories.length} categories\n`);

  // Create settings
  console.log('Creating settings...');
  const settings = [
    { key: 'version', value: '1.0.0', description: 'Database schema version' },
    { key: 'max_svg_size', value: '524288', description: 'Maximum SVG file size in bytes (512KB)' },
    { key: 'backup_enabled', value: 'true', description: 'Enable automatic backups' },
    { key: 'last_backup', value: '', description: 'Timestamp of last backup' }
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting
    });
  }
  console.log(`✓ Created ${settings.length} settings\n`);

  // Create shapes from data file
  console.log('Creating shapes...');
  const ASSETS = SHAPES_DATA;

  let successCount = 0;
  let errorCount = 0;

  for (const asset of ASSETS) {
    try {
      const category = await prisma.category.findUnique({
        where: { name: asset.cat }
      });

      if (!category) {
        console.warn(`⚠️  Skipping ${asset.name}: category '${asset.cat}' not found`);
        errorCount++;
        continue;
      }

      const { width, height } = extractDimensions(asset.svg);
      const tags = JSON.stringify([asset.cat, asset.id.charAt(0)]);

      const shape = await prisma.shape.create({
        data: {
          name: asset.name,
          categoryId: category.id,
          svgContent: asset.svg,
          width,
          height,
          tags,
          isCustom: false,
          history: {
            create: {
              action: 'created',
              userNote: 'Seeded from ui.html'
            }
          }
        }
      });

      successCount++;
      console.log(`✓ ${asset.name} (${asset.cat}) [${width}x${height}]`);
    } catch (error) {
      errorCount++;
      console.error(`✗ Failed: ${asset.name} -`, error.message);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('Seed Summary');
  console.log('='.repeat(60));
  console.log(`✅ Successfully seeded: ${successCount} shapes`);
  if (errorCount > 0) {
    console.log(`❌ Failed: ${errorCount} shapes`);
  }

  // Show statistics
  const stats = await prisma.category.findMany({
    include: {
      _count: {
        select: { shapes: true }
      }
    },
    orderBy: { sortOrder: 'asc' }
  });

  console.log('\nDatabase Statistics:');
  console.log('-'.repeat(60));
  for (const cat of stats) {
    if (cat._count.shapes > 0) {
      console.log(`  ${cat.displayName.padEnd(20)} ${cat._count.shapes} shapes`);
    }
  }

  const totalShapes = await prisma.shape.count();
  console.log('-'.repeat(60));
  console.log(`  ${'Total'.padEnd(20)} ${totalShapes} shapes`);
  console.log('');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('✅ Seed completed successfully!\n');
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
