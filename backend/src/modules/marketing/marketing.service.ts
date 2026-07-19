import { prisma } from "../../shared/database"
import { NotFoundException, ConflictException } from "../../shared/exceptions"
import {
  CreateBannerInput,
  UpdateBannerInput,
  BannerQueryInput,
  CreateVoucherInput,
  UpdateVoucherInput,
  VoucherQueryInput,
  UpdateMarketingConfigInput,
} from "./marketing.schema"

export class MarketingService {
  // ── ADMIN BANNERS ──
  async getAdminBanners(query: BannerQueryInput) {
    const { page, limit, search, status, isEnabled } = query
    const skip = (page - 1) * limit

    const where: any = { deletedAt: null }
    if (search) {
      where.title = { contains: search, mode: "insensitive" }
    }
    if (status === "ACTIVE") where.isActive = true
    if (status === "INACTIVE") where.isActive = false
    if (typeof isEnabled === "boolean") where.isEnabled = isEnabled

    const [banners, totalItems] = await Promise.all([
      prisma.banner.findMany({
        where,
        skip,
        take: limit,
        orderBy: { displayOrder: "asc" },
      }),
      prisma.banner.count({ where }),
    ])

    return {
      banners,
      meta: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit) || 1,
      },
    }
  }

  async getBannerById(id: string) {
    const banner = await prisma.banner.findFirst({
      where: { id, deletedAt: null },
    })
    if (!banner) throw new NotFoundException("Banner record not found")
    return banner
  }

  async createBanner(data: CreateBannerInput, userId?: string) {
    return prisma.banner.create({
      data: {
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        desktopImageUrl: data.desktopImageUrl,
        mobileImageUrl: data.mobileImageUrl,
        redirectUrl: data.redirectUrl,
        displayOrder: data.displayOrder,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isActive: data.isActive,
        isEnabled: data.isEnabled,
        createdById: userId,
      },
    })
  }

  async updateBanner(id: string, data: UpdateBannerInput, userId?: string) {
    await this.getBannerById(id)

    const updateData: any = { ...data, updatedById: userId }
    if (data.startDate) updateData.startDate = new Date(data.startDate)
    if (data.endDate) updateData.endDate = new Date(data.endDate)

    return prisma.banner.update({
      where: { id },
      data: updateData,
    })
  }

  async softDeleteBanner(id: string) {
    await this.getBannerById(id)
    return prisma.banner.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    })
  }

  // ── CUSTOMER BANNERS ──
  async getCustomerBanners() {
    const now = new Date()
    return prisma.banner.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        isEnabled: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { displayOrder: "asc" },
    })
  }

  // ── ADMIN VOUCHERS ──
  async getAdminVouchers(query: VoucherQueryInput) {
    const { page, limit, search, status } = query
    const skip = (page - 1) * limit

    const where: any = { deletedAt: null }
    if (search) {
      where.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ]
    }
    if (status === "ACTIVE") where.isActive = true
    if (status === "INACTIVE") where.isActive = false

    const [vouchers, totalItems] = await Promise.all([
      prisma.voucher.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.voucher.count({ where }),
    ])

    return {
      vouchers,
      meta: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit) || 1,
      },
    }
  }

  async getVoucherById(id: string) {
    const voucher = await prisma.voucher.findFirst({
      where: { id, deletedAt: null },
    })
    if (!voucher) throw new NotFoundException("Voucher record not found")
    return voucher
  }

  async createVoucher(data: CreateVoucherInput, userId?: string) {
    const existing = await prisma.voucher.findFirst({
      where: { code: data.code, deletedAt: null },
    })
    if (existing) throw new ConflictException(`Voucher code '${data.code}' already exists`)

    return prisma.voucher.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        maxDiscountAmount: data.maxDiscountAmount,
        minPurchaseAmount: data.minPurchaseAmount,
        usageLimit: data.usageLimit,
        usagePerUser: data.usagePerUser,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isActive: data.isActive,
        isEnabled: data.isEnabled,
        createdById: userId,
      },
    })
  }

  async updateVoucher(id: string, data: UpdateVoucherInput, userId?: string) {
    await this.getVoucherById(id)

    if (data.code) {
      const existing = await prisma.voucher.findFirst({
        where: { code: data.code, id: { not: id }, deletedAt: null },
      })
      if (existing) throw new ConflictException(`Voucher code '${data.code}' already exists`)
    }

    const updateData: any = { ...data, updatedById: userId }
    if (data.startDate) updateData.startDate = new Date(data.startDate)
    if (data.endDate) updateData.endDate = new Date(data.endDate)

    return prisma.voucher.update({
      where: { id },
      data: updateData,
    })
  }

  async softDeleteVoucher(id: string) {
    await this.getVoucherById(id)
    return prisma.voucher.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    })
  }

  // ── CUSTOMER VOUCHERS ──
  async getCustomerVouchers() {
    const now = new Date()
    return prisma.voucher.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        isEnabled: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { createdAt: "desc" },
    })
  }

  // ── MARKETING CONFIG ──
  async getMarketingConfig() {
    let config = await prisma.marketingConfig.findFirst()
    if (!config) {
      config = await prisma.marketingConfig.create({
        data: { allowMultipleVouchers: false },
      })
    }
    return config
  }

  async updateMarketingConfig(data: UpdateMarketingConfigInput) {
    const existing = await this.getMarketingConfig()
    return prisma.marketingConfig.update({
      where: { id: existing.id },
      data: { allowMultipleVouchers: data.allowMultipleVouchers },
    })
  }
}
