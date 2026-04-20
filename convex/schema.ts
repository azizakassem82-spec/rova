import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  orders: defineTable({
    name: v.string(),
    phone: v.string(),
    wilaya: v.string(),
    address: v.optional(v.string()),
    qty: v.number(),
    total: v.number(),
    status: v.string(),         // "new" | "confirmed" | "shipped" | "delivered" | "cancelled"
    isNotEnded: v.boolean(),    // true = lead who didn't finish; false = completed order
    isSuspect: v.boolean(),     // flagged by anti-bot logic
    createdAt: v.number(),      // Date.now()
  })
    .index("by_phone", ["phone"])
    .index("by_status", ["status"])
    .index("by_not_ended", ["isNotEnded"])
    .index("by_created", ["createdAt"]),
  settings: defineTable({
    unitPrice: v.number(),
    oldUnitPrice: v.number(),
    googleSheetUrl: v.string(),
    googleSheetNotEndedUrl: v.string(),
    bannerEnabled: v.boolean(),
    bannerMessage: v.string(),
    facebookPixelId: v.string(),
    facebookPixelIds: v.optional(v.array(v.string())),
    facebookAccessToken: v.string(),
    tiktokPixelId: v.string(),
    tiktokPixelIds: v.optional(v.array(v.string())),
    adminPassword: v.optional(v.string()),
    deliveryPrices: v.record(
      v.string(),
      v.object({
        stop: v.union(v.number(), v.null()),
        dom: v.number(),
        note: v.optional(v.string()),
      })
    ),
  }),
});
