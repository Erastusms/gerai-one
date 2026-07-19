import { prisma } from '../../shared/database';
import { Cart, CartItem } from '@prisma/client';

export class CartRepository {
  async findOrCreateCart(userId: string): Promise<Cart> {
    return prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }

  async findCartWithItems(userId: string) {
    return prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          where: {
            productVariant: {
              isActive: true,
              product: {
                isActive: true,
              },
            },
          },
          include: {
            productVariant: {
              include: {
                attributeValues: {
                  include: {
                    attributeValue: {
                      include: {
                        attribute: true,
                      },
                    },
                  },
                },
                product: {
                  include: {
                    brand: true,
                  },
                },
                inventory: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }

  async findCartItemById(itemId: string) {
    return prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
      },
    });
  }

  async findCartItemByVariant(cartId: string, productVariantId: string) {
    return prisma.cartItem.findUnique({
      where: {
        cartId_productVariantId: {
          cartId,
          productVariantId,
        },
      },
    });
  }

  async countActiveCartItems(cartId: string): Promise<number> {
    return prisma.cartItem.count({
      where: {
        cartId,
        productVariant: {
          isActive: true,
          product: {
            isActive: true,
          },
        },
      },
    });
  }

  async createCartItem(
    cartId: string,
    productVariantId: string,
    quantity: number,
  ): Promise<CartItem> {
    return prisma.cartItem.create({
      data: {
        cartId,
        productVariantId,
        quantity,
        isSelected: true,
      },
    });
  }

  async updateCartItemQuantity(
    itemId: string,
    quantity: number,
  ): Promise<CartItem> {
    return prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  async updateCartItemSelection(
    itemId: string,
    isSelected: boolean,
  ): Promise<CartItem> {
    return prisma.cartItem.update({
      where: { id: itemId },
      data: { isSelected },
    });
  }

  async updateAllItemsSelection(
    cartId: string,
    isSelected: boolean,
  ): Promise<any> {
    // We only update selection for active cart items
    const activeItems = await prisma.cartItem.findMany({
      where: {
        cartId,
        productVariant: {
          isActive: true,
          product: {
            isActive: true,
          },
          ...(isSelected
            ? {
                inventory: {
                  availableStock: {
                    gt: 0,
                  },
                },
              }
            : {}),
        },
      },
      select: { id: true },
    });

    const activeItemIds = activeItems.map((item) => item.id);

    return prisma.cartItem.updateMany({
      where: {
        id: { in: activeItemIds },
      },
      data: { isSelected },
    });
  }

  async deleteCartItem(itemId: string): Promise<CartItem> {
    return prisma.cartItem.delete({
      where: { id: itemId },
    });
  }

  async deleteAllCartItems(cartId: string): Promise<any> {
    return prisma.cartItem.deleteMany({
      where: { cartId },
    });
  }

  async deleteSelectedCartItems(cartId: string): Promise<any> {
    return prisma.cartItem.deleteMany({
      where: {
        cartId,
        isSelected: true,
      },
    });
  }
}

export const cartRepository = new CartRepository();
