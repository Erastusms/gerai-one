import { FastifyRequest, FastifyReply } from "fastify";
import { brandService } from "./brand.service";
import { CreateBrandInput, UpdateBrandInput, BrandSearchQuery } from "./brand.schema";
import { createSuccessResponse } from "../../shared/responses";
import { mapProductResponse } from "../product/product.controller";

export class BrandController {
  async handleCreateBrand(
    request: FastifyRequest<{ Body: CreateBrandInput }>,
    reply: FastifyReply
  ) {
    const brand = await brandService.createBrand(request.body);
    return reply.status(201).send(
      createSuccessResponse("Brand created successfully", brand)
    );
  }

  async handleUpdateBrand(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateBrandInput }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const brand = await brandService.updateBrand(id, request.body);
    return reply.status(200).send(
      createSuccessResponse("Brand updated successfully", brand)
    );
  }

  async handleDeleteBrand(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const brand = await brandService.softDeleteBrand(id);
    return reply.status(200).send(
      createSuccessResponse("Brand deleted successfully", brand)
    );
  }

  async handleGetBrands(
    request: FastifyRequest<{ Querystring: BrandSearchQuery }>,
    reply: FastifyReply
  ) {
    const { brands, meta } = await brandService.getBrandList(request.query);
    return reply.status(200).send(
      createSuccessResponse("Brands retrieved successfully", brands, meta)
    );
  }

  async handleGetBrandDetail(
    request: FastifyRequest<{ Params: { slug: string }; Querystring: BrandSearchQuery }>,
    reply: FastifyReply
  ) {
    const { slug } = request.params;
    const { page, limit } = request.query;

    const { brand, products, meta } = await brandService.getBrandBySlug(slug, {
      page,
      limit,
    });

    const mappedProducts = products.map(mapProductResponse);

    return reply.status(200).send(
      createSuccessResponse(
        "Brand details with products retrieved successfully",
        {
          brand,
          products: mappedProducts,
        },
        meta
      )
    );
  }
}

export const brandController = new BrandController();
