import { FastifyInstance } from 'fastify';
import { cartController } from './cart.controller';
import {
  addToCartSwagger,
  getCartSwagger,
  updateQuantitySwagger,
  removeItemSwagger,
  removeAllItemsSwagger,
  selectItemSwagger,
  selectAllSwagger,
  removeSelectedSwagger,
} from './cart.swagger';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';

export async function cartRoutes(fastify: FastifyInstance) {
  // Add item to cart
  fastify.post(
    '/api/v1/cart/items',
    {
      schema: addToCartSwagger.schema,
      preHandler: [authMiddleware],
    },
    cartController.handleAddToCart as any,
  );

  // Get user's cart
  fastify.get(
    '/api/v1/cart',
    {
      schema: getCartSwagger.schema,
      preHandler: [authMiddleware],
    },
    cartController.handleGetCart as any,
  );

  // Update item quantity
  fastify.patch(
    '/api/v1/cart/items/:id',
    {
      schema: updateQuantitySwagger.schema,
      preHandler: [authMiddleware],
    },
    cartController.handleUpdateQuantity as any,
  );

  // Remove single item
  fastify.delete(
    '/api/v1/cart/items/:id',
    {
      schema: removeItemSwagger.schema,
      preHandler: [authMiddleware],
    },
    cartController.handleRemoveItem as any,
  );

  // Remove all items
  fastify.delete(
    '/api/v1/cart/items',
    {
      schema: removeAllItemsSwagger.schema,
      preHandler: [authMiddleware],
    },
    cartController.handleRemoveAllItems as any,
  );

  // Select/Deselect single item
  fastify.patch(
    '/api/v1/cart/items/:id/select',
    {
      schema: selectItemSwagger.schema,
      preHandler: [authMiddleware],
    },
    cartController.handleSelectItem as any,
  );

  // Select/Deselect all items
  fastify.patch(
    '/api/v1/cart/select-all',
    {
      schema: selectAllSwagger.schema,
      preHandler: [authMiddleware],
    },
    cartController.handleSelectAll as any,
  );

  // Delete selected items
  fastify.delete(
    '/api/v1/cart/selected',
    {
      schema: removeSelectedSwagger.schema,
      preHandler: [authMiddleware],
    },
    cartController.handleRemoveSelected as any,
  );
}
