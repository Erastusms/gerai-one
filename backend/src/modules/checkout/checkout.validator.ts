import { prisma } from "../../shared/database";
import { CreateCheckoutInput, BlockingValidationErrorItem, CheckoutWarning } from "./checkout.schema";

export interface ValidationResult {
  isValid: boolean;
  blockingErrors: BlockingValidationErrorItem[];
  warnings: CheckoutWarning[];
  itemsToSnapshot: Array<{
    productVariantId: string;
    productName: string;
    sku: string;
    price: number;
    discountPrice: number | null;
    quantity: number;
    thumbnailUrl: string | null;
  }>;
}

export class CheckoutValidator {
  async validate(userId: string, input?: CreateCheckoutInput): Promise<ValidationResult> {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          where: { isSelected: true },
          include: {
            productVariant: {
              include: {
                product: true,
                inventory: true,
              },
            },
          },
        },
      },
    });

    const items = cart?.items || [];
    const blockingErrors: BlockingValidationErrorItem[] = [];
    const warnings: CheckoutWarning[] = [];
    const itemsToSnapshot: ValidationResult["itemsToSnapshot"] = [];

    // If no items are selected, we treat it as a blocking error (cannot checkout empty selection)
    if (items.length === 0) {
      return {
        isValid: false,
        blockingErrors: [
          {
            productVariantId: "00000000-0000-0000-0000-000000000000",
            name: "Empty Selection",
            sku: "N/A",
            quantity: 0,
            availableStock: 0,
            reason: "INSUFFICIENT_STOCK",
          },
        ],
        warnings: [],
        itemsToSnapshot: [],
      };
    }

    for (const item of items) {
      const variant = item.productVariant;
      const product = variant?.product;
      const inventory = variant?.inventory;

      const productName = product?.name || "Unknown Product";
      const sku = variant?.sku || "Unknown SKU";
      const availableStock = inventory?.availableStock || 0;

      // 1. Check if product exists and is active
      if (!product || !product.isActive) {
        blockingErrors.push({
          productVariantId: item.productVariantId,
          name: productName,
          sku,
          quantity: item.quantity,
          availableStock,
          reason: "PRODUCT_INACTIVE",
        });
        continue;
      }

      // 2. Check if variant exists and is active
      if (!variant || !variant.isActive) {
        blockingErrors.push({
          productVariantId: item.productVariantId,
          name: productName,
          sku,
          quantity: item.quantity,
          availableStock,
          reason: "VARIANT_INACTIVE",
        });
        continue;
      }

      // 3. Check requested quantity exceeds available stock
      if (item.quantity > availableStock) {
        blockingErrors.push({
          productVariantId: item.productVariantId,
          name: productName,
          sku,
          quantity: item.quantity,
          availableStock,
          reason: "INSUFFICIENT_STOCK",
        });
        continue;
      }

      // If no blocking errors for this item, calculate warnings (if input is provided)
      const inputItem = input?.items?.find((i) => i.productVariantId === item.productVariantId);
      
      const dbPrice = Number(variant.price);
      const dbDiscountPrice = product.discountPrice ? Number(product.discountPrice) : null;

      if (inputItem) {
        // Compare price
        const inputPrice = Number(inputItem.price);
        if (inputPrice !== dbPrice) {
          const alreadyHasPriceWarning = warnings.some(w => w.type === "PRICE_CHANGED");
          if (!alreadyHasPriceWarning) {
            warnings.push({
              type: "PRICE_CHANGED",
              message: "The price of one or more products has changed.",
            });
          }
        }

        // Compare discount
        const inputDiscount = inputItem.discountPrice !== undefined && inputItem.discountPrice !== null 
          ? Number(inputItem.discountPrice) 
          : null;
        if (inputDiscount !== dbDiscountPrice) {
          const alreadyHasDiscountWarning = warnings.some(w => w.type === "DISCOUNT_CHANGED");
          if (!alreadyHasDiscountWarning) {
            warnings.push({
              type: "DISCOUNT_CHANGED",
              message: "The discount of one or more products has changed.",
            });
          }
        }
      }

      // Add to snapshot list
      itemsToSnapshot.push({
        productVariantId: item.productVariantId,
        productName,
        sku,
        price: dbPrice,
        discountPrice: dbDiscountPrice,
        quantity: item.quantity,
        thumbnailUrl: product.thumbnailUrl,
      });
    }

    return {
      isValid: blockingErrors.length === 0,
      blockingErrors,
      warnings,
      itemsToSnapshot,
    };
  }
}

export const checkoutValidator = new CheckoutValidator();
