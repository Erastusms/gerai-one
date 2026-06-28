import { FastifyRequest, FastifyReply } from "fastify";
import { cartService } from "./cart.service";
import { AddToCartInput, UpdateQuantityInput, SelectItemInput, SelectAllInput } from "./cart.schema";
import { createSuccessResponse } from "../../shared/responses";

export class CartController {
  async handleAddToCart(
    request: FastifyRequest<{ Body: AddToCartInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user!.id;
    const result = await cartService.addToCart(userId, request.body);
    return reply.status(201).send(
      createSuccessResponse("Item added to cart successfully", result)
    );
  }

  async handleGetCart(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const userId = request.user!.id;
    const result = await cartService.getCart(userId);
    return reply.status(200).send(
      createSuccessResponse("Cart retrieved successfully", result)
    );
  }

  async handleUpdateQuantity(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateQuantityInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user!.id;
    const { id } = request.params;
    const result = await cartService.updateQuantity(userId, id, request.body.quantity);
    return reply.status(200).send(
      createSuccessResponse("Cart item quantity updated successfully", result)
    );
  }

  async handleRemoveItem(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const userId = request.user!.id;
    const { id } = request.params;
    const result = await cartService.removeItem(userId, id);
    return reply.status(200).send(
      createSuccessResponse("Item removed from cart successfully", result)
    );
  }

  async handleRemoveAllItems(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const userId = request.user!.id;
    const result = await cartService.removeAllItems(userId);
    return reply.status(200).send(
      createSuccessResponse("All items removed from cart successfully", result)
    );
  }

  async handleSelectItem(
    request: FastifyRequest<{ Params: { id: string }; Body: SelectItemInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user!.id;
    const { id } = request.params;
    const result = await cartService.selectItem(userId, id, request.body.isSelected);
    return reply.status(200).send(
      createSuccessResponse("Cart item selection updated successfully", result)
    );
  }

  async handleSelectAll(
    request: FastifyRequest<{ Body: SelectAllInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user!.id;
    const result = await cartService.selectAll(userId, request.body.isSelected);
    return reply.status(200).send(
      createSuccessResponse("All cart items selection updated successfully", result)
    );
  }

  async handleRemoveSelected(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const userId = request.user!.id;
    const result = await cartService.removeSelectedItems(userId);
    return reply.status(200).send(
      createSuccessResponse("Selected items removed from cart successfully", result)
    );
  }
}

export const cartController = new CartController();
