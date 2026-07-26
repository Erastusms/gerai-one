import { FastifyInstance } from "fastify"
import { MarketingController } from "./marketing.controller"
import { adminAuthMiddleware } from "../../shared/middlewares/admin-auth.middleware"
import { requireRoles } from "../../shared/middlewares/role.middleware"
import {
  getAdminBannersSwagger,
  createBannerSwagger,
  updateBannerSwagger,
  getCustomerBannersSwagger,
  getAdminVouchersSwagger,
  createVoucherSwagger,
  updateVoucherSwagger,
  getCustomerVouchersSwagger,
  getMarketingConfigSwagger,
  updateMarketingConfigSwagger,
} from "./marketing.swagger"

export async function marketingRoutes(fastify: FastifyInstance) {
  const controller = new MarketingController()

  // ── CUSTOMER PUBLIC ROUTES ──
  fastify.get("/banners", getCustomerBannersSwagger, controller.getCustomerBanners)
  fastify.get("/vouchers", getCustomerVouchersSwagger, controller.getCustomerVouchers)
  fastify.get("/marketing-config", getMarketingConfigSwagger, controller.getMarketingConfig)

  // ── ADMIN PROTECTED ROUTES ──
  fastify.register(async (adminGroup) => {
    adminGroup.addHook("onRequest", adminAuthMiddleware)
    adminGroup.addHook("onRequest", requireRoles("ADMIN", "SUPER_ADMIN"))

    // Banner CRUD
    adminGroup.get("/admin/banners", getAdminBannersSwagger, controller.getAdminBanners)
    adminGroup.get("/admin/banners/:id", controller.getBannerById)
    adminGroup.post("/admin/banners", createBannerSwagger, controller.createBanner)
    adminGroup.patch("/admin/banners/:id", updateBannerSwagger, controller.updateBanner)
    adminGroup.delete("/admin/banners/:id", controller.deleteBanner)

    // Voucher CRUD
    adminGroup.get("/admin/vouchers", getAdminVouchersSwagger, controller.getAdminVouchers)
    adminGroup.get("/admin/vouchers/:id", controller.getVoucherById)
    adminGroup.post("/admin/vouchers", createVoucherSwagger, controller.createVoucher)
    adminGroup.patch("/admin/vouchers/:id", updateVoucherSwagger, controller.updateVoucher)
    adminGroup.delete("/admin/vouchers/:id", controller.deleteVoucher)

    // Marketing Config
    adminGroup.get("/admin/marketing-config", getMarketingConfigSwagger, controller.getMarketingConfig)
    adminGroup.patch("/admin/marketing-config", updateMarketingConfigSwagger, controller.updateMarketingConfig)
  })
}
