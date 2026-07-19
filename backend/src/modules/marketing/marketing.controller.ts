import { FastifyRequest, FastifyReply } from "fastify"
import { MarketingService } from "./marketing.service"
import {
  createBannerSchema,
  updateBannerSchema,
  bannerQuerySchema,
  createVoucherSchema,
  updateVoucherSchema,
  voucherQuerySchema,
  updateMarketingConfigSchema,
} from "./marketing.schema"

export class MarketingController {
  constructor(private marketingService: MarketingService = new MarketingService()) {}

  // ── ADMIN BANNERS ──
  getAdminBanners = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = bannerQuerySchema.parse(req.query)
    const result = await this.marketingService.getAdminBanners(query)
    return reply.status(200).send({
      success: true,
      message: "Admin banners fetched successfully",
      data: result,
    })
  }

  getBannerById = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const banner = await this.marketingService.getBannerById(req.params.id)
    return reply.status(200).send({
      success: true,
      message: "Banner fetched successfully",
      data: banner,
    })
  }

  createBanner = async (req: FastifyRequest, reply: FastifyReply) => {
    const body = createBannerSchema.parse(req.body)
    const userId = req.user?.id
    const banner = await this.marketingService.createBanner(body, userId)
    return reply.status(201).send({
      success: true,
      message: "Banner created successfully",
      data: banner,
    })
  }

  updateBanner = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const body = updateBannerSchema.parse(req.body)
    const userId = req.user?.id
    const banner = await this.marketingService.updateBanner(req.params.id, body, userId)
    return reply.status(200).send({
      success: true,
      message: "Banner updated successfully",
      data: banner,
    })
  }

  deleteBanner = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const banner = await this.marketingService.softDeleteBanner(req.params.id)
    return reply.status(200).send({
      success: true,
      message: "Banner soft deleted successfully",
      data: banner,
    })
  }

  // ── CUSTOMER BANNERS ──
  getCustomerBanners = async (_req: FastifyRequest, reply: FastifyReply) => {
    const banners = await this.marketingService.getCustomerBanners()
    return reply.status(200).send({
      success: true,
      message: "Customer banners fetched successfully",
      data: banners,
    })
  }

  // ── ADMIN VOUCHERS ──
  getAdminVouchers = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = voucherQuerySchema.parse(req.query)
    const result = await this.marketingService.getAdminVouchers(query)
    return reply.status(200).send({
      success: true,
      message: "Admin vouchers fetched successfully",
      data: result,
    })
  }

  getVoucherById = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const voucher = await this.marketingService.getVoucherById(req.params.id)
    return reply.status(200).send({
      success: true,
      message: "Voucher fetched successfully",
      data: voucher,
    })
  }

  createVoucher = async (req: FastifyRequest, reply: FastifyReply) => {
    const body = createVoucherSchema.parse(req.body)
    const userId = req.user?.id
    const voucher = await this.marketingService.createVoucher(body, userId)
    return reply.status(201).send({
      success: true,
      message: "Voucher created successfully",
      data: voucher,
    })
  }

  updateVoucher = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const body = updateVoucherSchema.parse(req.body)
    const userId = req.user?.id
    const voucher = await this.marketingService.updateVoucher(req.params.id, body, userId)
    return reply.status(200).send({
      success: true,
      message: "Voucher updated successfully",
      data: voucher,
    })
  }

  deleteVoucher = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const voucher = await this.marketingService.softDeleteVoucher(req.params.id)
    return reply.status(200).send({
      success: true,
      message: "Voucher soft deleted successfully",
      data: voucher,
    })
  }

  // ── CUSTOMER VOUCHERS ──
  getCustomerVouchers = async (_req: FastifyRequest, reply: FastifyReply) => {
    const vouchers = await this.marketingService.getCustomerVouchers()
    return reply.status(200).send({
      success: true,
      message: "Customer vouchers fetched successfully",
      data: vouchers,
    })
  }

  // ── MARKETING CONFIG ──
  getMarketingConfig = async (_req: FastifyRequest, reply: FastifyReply) => {
    const config = await this.marketingService.getMarketingConfig()
    return reply.status(200).send({
      success: true,
      message: "Marketing configuration fetched successfully",
      data: config,
    })
  }

  updateMarketingConfig = async (req: FastifyRequest, reply: FastifyReply) => {
    const body = updateMarketingConfigSchema.parse(req.body)
    const config = await this.marketingService.updateMarketingConfig(body)
    return reply.status(200).send({
      success: true,
      message: "Marketing configuration updated successfully",
      data: config,
    })
  }
}
