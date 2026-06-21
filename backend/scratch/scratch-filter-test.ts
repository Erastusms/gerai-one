import { productService } from "./modules/product/product.service";

async function runTest() {
  console.log("--- 1. Querying with empty query ---");
  const res1 = await productService.getProductList({});
  console.log(`Total: ${res1.meta.totalItems}, Returned: ${res1.products.length}`);

  console.log("\n--- 2. Querying with brand=Samsung ---");
  const res2 = await productService.getProductList({ brand: "Samsung" });
  console.log(`Total: ${res2.meta.totalItems}, Returned: ${res2.products.length}`);
  res2.products.forEach(p => console.log(`- ${p.name} (Brand: ${p.brand})`));

  console.log("\n--- 3. Querying with categorySlug=smartphones ---");
  const res3 = await productService.getProductList({ categorySlug: "smartphones" });
  console.log(`Total: ${res3.meta.totalItems}, Returned: ${res3.products.length}`);
  res3.products.forEach(p => console.log(`- ${p.name} (Brand: ${p.brand})`));

  console.log("\n--- 4. Querying with categorySlug=smartphones and brand=Samsung ---");
  const res4 = await productService.getProductList({ categorySlug: "smartphones", brand: "Samsung" });
  console.log(`Total: ${res4.meta.totalItems}, Returned: ${res4.products.length}`);
  res4.products.forEach(p => console.log(`- ${p.name} (Brand: ${p.brand})`));
}

runTest().catch(console.error);
