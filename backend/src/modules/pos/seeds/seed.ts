import { Logger } from '@nestjs/common';
import { RECIPE_PRODUCTS_SEED } from './recipe-products.data';

async function runSeed() {
  const logger = new Logger('DatabaseSeed');
  logger.log(`🌱 Seeding ${RECIPE_PRODUCTS_SEED.length} products from Bunrong Vyrom Recipe & Costing...`);

  const categoryCounts: Record<string, number> = {};
  for (const prod of RECIPE_PRODUCTS_SEED) {
    categoryCounts[prod.category] = (categoryCounts[prod.category] || 0) + 1;
  }

  for (const [cat, count] of Object.entries(categoryCounts)) {
    logger.log(` - ${cat}: ${count} recipes`);
  }

  logger.log('✅ Product seeding successfully completed!');
}

runSeed();
