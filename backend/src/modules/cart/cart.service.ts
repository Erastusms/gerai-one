import { cartRepository } from "./cart.repository";
import { prisma } from "../../shared/database";
import { NotFoundException, HttpException, ValidationException } from "../../shared/exceptions";
import { AddToCartInput } from "./cart.schema";

export class CartService {
  async addToCart(userId: string, input: AddToCartInput) {
    // 1. Find product variant
    const variant = await prisma.productVariant.findUnique({
      where: { id: input.productVariantId },
      include: {
        product: true,
        inventory: true,
      },
    });

    if (!variant) {
      throw new NotFoundException("Product variant not found");
    }

    if (!variant.isActive) {
      throw new ValidationException([
        { field: "productVariantId", message: "This product variant is no longer available" },
      ]);
    }

    if (!variant.product.isActive) {
      throw new ValidationException([
        { field: "productVariantId", message: "This product is no longer available" },
      ]);
    }

    // 2. Find or create cart
    const cart = await cartRepository.findOrCreateCart(userId);

    // 3. Check if variant already exists in cart
    const existing = await cartRepository.findCartItemByVariant(cart.id, variant.id);

    const newQuantity = existing ? existing.quantity + input.quantity : input.quantity;

    // Check stock limit based on inventory
    const availableStock = variant.inventory?.availableStock || 0;
    if (availableStock <= 0) {
      throw new HttpException(400, "This product variant is out of stock");
    }

    if (newQuantity > availableStock) {
      throw new HttpException(
        400,
        `Cannot add ${input.quantity} more. Only ${availableStock} items available in stock.`
      );
    }

    if (existing) {
      // Update quantity
      await cartRepository.updateCartItemQuantity(existing.id, newQuantity);
    } else {
      // 4. Validate cart limit (max 20 active variants)
      const activeCount = await cartRepository.countActiveCartItems(cart.id);
      if (activeCount >= 20) {
        throw new HttpException(
          400,
          "Your cart has reached the maximum limit of 20 different products."
        );
      }

      // Create new cart item
      await cartRepository.createCartItem(cart.id, variant.id, input.quantity);
    }

    return this.getCart(userId);
  }

  async getCart(userId: string) {
    const cart = await cartRepository.findCartWithItems(userId);
    if (!cart) {
      await cartRepository.findOrCreateCart(userId);
      return {
        items: [],
        summary: {
          selectedItemCount: 0,
          selectedQuantity: 0,
          subtotal: 0,
          discount: 0,
          grandTotal: 0,
        },
      };
    }

    const items = cart.items || [];

    // Calculate totals
    let selectedItemCount = 0;
    let selectedQuantity = 0;
    let subtotal = 0;
    let grandTotal = 0;

    const mappedItems = items.map((item: any) => {
      const variant = item.productVariant;
      const product = variant.product;

      const originalPrice = Number(variant.price);
      const discountPrice = product.discountPrice ? Number(product.discountPrice) : null;
      const effectivePrice = discountPrice !== null ? discountPrice : originalPrice;

      const availableStock = variant.inventory?.availableStock || 0;
      const isOutOfStock = availableStock <= 0;

      // Force selection state to false if out of stock
      const finalIsSelected = isOutOfStock ? false : item.isSelected;

      if (finalIsSelected) {
        selectedItemCount += 1;
        selectedQuantity += item.quantity;
        subtotal += originalPrice * item.quantity;
        grandTotal += effectivePrice * item.quantity;
      }

      return {
        ...item,
        isSelected: finalIsSelected,
        quantity: Number(item.quantity),
        productVariant: {
          ...variant,
          price: originalPrice,
          product: {
            ...product,
            price: Number(product.price),
            discountPrice: discountPrice,
          },
          availableStock,
          isOutOfStock,
        },
      };
    });

    const discount = subtotal - grandTotal;

    return {
      items: mappedItems,
      summary: {
        selectedItemCount,
        selectedQuantity,
        subtotal,
        discount,
        grandTotal,
      },
    };
  }

  async updateQuantity(userId: string, itemId: string, quantity: number) {
    const item = await cartRepository.findCartItemById(itemId);
    if (!item || item.cart.userId !== userId) {
      throw new NotFoundException("Cart item not found");
    }

    // Validate variant stock
    const variant = await prisma.productVariant.findUnique({
      where: { id: item.productVariantId },
      include: { inventory: true },
    });

    if (!variant) {
      throw new NotFoundException("Product variant not found");
    }

    const availableStock = variant.inventory?.availableStock || 0;
    if (quantity > availableStock) {
      throw new HttpException(
        400,
        `Cannot update quantity to ${quantity}. Only ${availableStock} items available in stock.`
      );
    }

    await cartRepository.updateCartItemQuantity(itemId, quantity);
    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const item = await cartRepository.findCartItemById(itemId);
    if (!item || item.cart.userId !== userId) {
      throw new NotFoundException("Cart item not found");
    }

    await cartRepository.deleteCartItem(itemId);
    return this.getCart(userId);
  }

  async removeAllItems(userId: string) {
    const cart = await cartRepository.findOrCreateCart(userId);
    await cartRepository.deleteAllCartItems(cart.id);
    return this.getCart(userId);
  }

  async removeSelectedItems(userId: string) {
    const cart = await cartRepository.findOrCreateCart(userId);
    await cartRepository.deleteSelectedCartItems(cart.id);
    return this.getCart(userId);
  }

  async selectItem(userId: string, itemId: string, isSelected: boolean) {
    const item = await cartRepository.findCartItemById(itemId);
    if (!item || item.cart.userId !== userId) {
      throw new NotFoundException("Cart item not found");
    }

    // Check stock limit based on inventory
    const variant = await prisma.productVariant.findUnique({
      where: { id: item.productVariantId },
      include: { inventory: true },
    });

    if (variant && (variant.inventory?.availableStock || 0) <= 0 && isSelected) {
      throw new HttpException(400, "Cannot select an out of stock product");
    }

    await cartRepository.updateCartItemSelection(itemId, isSelected);
    return this.getCart(userId);
  }

  async selectAll(userId: string, isSelected: boolean) {
    const cart = await cartRepository.findOrCreateCart(userId);
    await cartRepository.updateAllItemsSelection(cart.id, isSelected);
    return this.getCart(userId);
  }
}

export const cartService = new CartService();
