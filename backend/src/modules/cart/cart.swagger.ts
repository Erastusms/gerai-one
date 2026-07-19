import {
  addToCartSchema,
  updateQuantitySchema,
  selectItemSchema,
  selectAllSchema,
  cartItemParamsSchema,
  cartResponseSchema,
} from './cart.schema';
import {
  apiSuccessResponseSchema,
  apiErrorResponseSchema,
} from '../auth/auth.schema';

export const addToCartSwagger = {
  schema: {
    description:
      "Add a product variant to the user's cart (Authenticated users only)",
    tags: ['Cart'],
    summary: 'Add item to cart',
    security: [{ BearerAuth: [] }],
    body: addToCartSchema,
    response: {
      201: apiSuccessResponseSchema(cartResponseSchema).describe(
        'Item added to cart successfully',
      ),
      400: apiErrorResponseSchema.describe(
        'Validation errors / Out of stock / Cart limit reached',
      ),
      401: apiErrorResponseSchema.describe('Unauthorized'),
      404: apiErrorResponseSchema.describe('Product variant not found'),
    },
  },
};

export const getCartSwagger = {
  schema: {
    description:
      'Retrieve active cart items and calculations for the current user (Authenticated users only)',
    tags: ['Cart'],
    summary: 'Get user cart',
    security: [{ BearerAuth: [] }],
    response: {
      200: apiSuccessResponseSchema(cartResponseSchema).describe(
        'Cart retrieved successfully',
      ),
      401: apiErrorResponseSchema.describe('Unauthorized'),
    },
  },
};

export const updateQuantitySwagger = {
  schema: {
    description:
      'Update the quantity of a cart item (Authenticated users only)',
    tags: ['Cart'],
    summary: 'Update item quantity',
    security: [{ BearerAuth: [] }],
    params: cartItemParamsSchema,
    body: updateQuantitySchema,
    response: {
      200: apiSuccessResponseSchema(cartResponseSchema).describe(
        'Cart item quantity updated successfully',
      ),
      400: apiErrorResponseSchema.describe('Validation errors / Out of stock'),
      401: apiErrorResponseSchema.describe('Unauthorized'),
      404: apiErrorResponseSchema.describe('Cart item not found'),
    },
  },
};

export const removeItemSwagger = {
  schema: {
    description:
      'Remove a single item from the cart (Authenticated users only)',
    tags: ['Cart'],
    summary: 'Remove cart item',
    security: [{ BearerAuth: [] }],
    params: cartItemParamsSchema,
    response: {
      200: apiSuccessResponseSchema(cartResponseSchema).describe(
        'Item removed from cart successfully',
      ),
      401: apiErrorResponseSchema.describe('Unauthorized'),
      404: apiErrorResponseSchema.describe('Cart item not found'),
    },
  },
};

export const removeAllItemsSwagger = {
  schema: {
    description:
      "Remove all items from the user's cart (Authenticated users only)",
    tags: ['Cart'],
    summary: 'Clear cart',
    security: [{ BearerAuth: [] }],
    response: {
      200: apiSuccessResponseSchema(cartResponseSchema).describe(
        'All items removed from cart successfully',
      ),
      401: apiErrorResponseSchema.describe('Unauthorized'),
    },
  },
};

export const selectItemSwagger = {
  schema: {
    description:
      'Update the selected status of a cart item (Authenticated users only)',
    tags: ['Cart'],
    summary: 'Select/Deselect item',
    security: [{ BearerAuth: [] }],
    params: cartItemParamsSchema,
    body: selectItemSchema,
    response: {
      200: apiSuccessResponseSchema(cartResponseSchema).describe(
        'Cart item selection updated successfully',
      ),
      401: apiErrorResponseSchema.describe('Unauthorized'),
      404: apiErrorResponseSchema.describe('Cart item not found'),
    },
  },
};

export const selectAllSwagger = {
  schema: {
    description:
      "Select or deselect all items in the user's cart (Authenticated users only)",
    tags: ['Cart'],
    summary: 'Select/Deselect all items',
    security: [{ BearerAuth: [] }],
    body: selectAllSchema,
    response: {
      200: apiSuccessResponseSchema(cartResponseSchema).describe(
        'All cart items selection updated successfully',
      ),
      401: apiErrorResponseSchema.describe('Unauthorized'),
    },
  },
};

export const removeSelectedSwagger = {
  schema: {
    description:
      "Remove all selected items from the user's cart (Authenticated users only)",
    tags: ['Cart'],
    summary: 'Remove selected items',
    security: [{ BearerAuth: [] }],
    response: {
      200: apiSuccessResponseSchema(cartResponseSchema).describe(
        'Selected items removed from cart successfully',
      ),
      401: apiErrorResponseSchema.describe('Unauthorized'),
    },
  },
};
