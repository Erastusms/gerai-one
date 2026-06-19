import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    }
  });

  console.log("--- Categories ---");
  for (const c of categories) {
    console.log(`Category: ${c.name} (slug: ${c.slug}), productCount: ${c._count.products}, isActive: ${c.isActive}`);
  }

  const products = await prisma.product.findMany({
    include: {
      categories: {
        include: { category: true }
      }
    }
  });

  console.log("\n--- Products ---");
  console.log(`Total Products: ${products.length}`);
  const inactive = products.filter(p => !p.isActive);
  console.log(`Inactive Products: ${inactive.length}`);
  
  const samsungProducts = products.filter(p => p.brand?.toLowerCase() === "samsung");
  console.log(`Samsung Products count in DB: ${samsungProducts.length}`);
  for (const p of samsungProducts) {
    console.log(`- Product: ${p.name}, Brand: ${p.brand}, isActive: ${p.isActive}, deletedAt: ${p.deletedAt}`);
    console.log(`  Categories: ${p.categories.map(pc => pc.category.name).join(", ")}`);
  }
}

main().finally(() => prisma.$disconnect());
