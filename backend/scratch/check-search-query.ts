import { productRepository } from "../src/modules/product/product.repository";

async function main() {
  console.log("--- Querying smartphones + samsung ---");
  const products = await productRepository.findMany({
    categorySlug: "smartphones",
    search: "samsung",
    skip: 0,
    limit: 12,
    onlyActive: true
  });

  console.log(`Found: ${products.length} products`);
  for (const p of products) {
    console.log(`- ${p.name} (SKU: ${p.sku})`);
  }
}

main();
