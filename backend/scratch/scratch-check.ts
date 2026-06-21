import { prisma } from "./shared/database";

async function main() {
  console.log("=== CATEGORIES IN DB ===");
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    }
  });
  for (const cat of categories) {
    console.log(`Category: "${cat.name}" | Slug: "${cat.slug}" | ProductCount: ${cat._count.products}`);
  }

  console.log("\n=== BRANDS IN DB ===");
  // Let's get unique brands and count of products for each
  const brands = await prisma.product.groupBy({
    by: ["brand"],
    where: { deletedAt: null },
    _count: {
      id: true
    }
  });
  for (const b of brands) {
    console.log(`Brand: "${b.brand}" | ProductCount: ${b._count.id}`);
  }

  console.log("\n=== SAMSUNG PRODUCTS ===");
  const samsungProds = await prisma.product.findMany({
    where: {
      OR: [
        { brand: { equals: "Samsung", mode: "insensitive" } },
        { name: { contains: "Samsung", mode: "insensitive" } }
      ]
    },
    select: {
      id: true,
      name: true,
      brand: true,
      isActive: true,
      deletedAt: true,
      categories: {
        select: {
          category: {
            select: {
              name: true
            }
          }
        }
      }
    }
  });
  for (const p of samsungProds) {
    console.log(`Product: "${p.name}" | Brand: "${p.brand}" | Active: ${p.isActive} | Deleted: ${p.deletedAt} | Categories: ${p.categories.map(c => c.category.name).join(", ")}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
