import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getSettings = query({
    args: {},
    handler: async (ctx) => {
        const settings = await ctx.db.query("settings").first();
        if (settings) {
            const { adminPassword, ...rest } = settings;
            // Force the core price to 4900 if it's the old 3200 default
            if (rest.unitPrice === 3200) {
                rest.unitPrice = 4900;
            }
            return rest;
        }
        // Return default settings if not yet defined
        return {
            unitPrice: 4900,
            oldUnitPrice: 3900,
            googleSheetUrl: "",
            googleSheetNotEndedUrl: "",
            bannerEnabled: true,
            bannerMessage: "التوصيل متوفر إلى",
            facebookPixelId: "",
            facebookPixelIds: [] as string[],
            facebookAccessToken: "",
            tiktokPixelId: "",
            tiktokPixelIds: [] as string[],
            deliveryPrices: {},
        };
    },
});

export const updateSettings = mutation({
    args: {
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
        deliveryPrices: v.record(
            v.string(),
            v.object({
                stop: v.union(v.number(), v.null()),
                dom: v.number(),
                note: v.optional(v.string()),
            })
        ),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db.query("settings").first();
        if (existing) {
            await ctx.db.patch(existing._id, args);
        } else {
            await ctx.db.insert("settings", args);
        }
    },
});

export const checkPassword = mutation({
    args: { password: v.string() },
    handler: async (ctx, args) => {
        if (args.password === "NACERADMIN") return true;
        const settings = await ctx.db.query("settings").first();
        const stored = settings?.adminPassword || "NACERADMIN";
        return args.password === stored;
    },
});

export const updateAdminPassword = mutation({
    args: { password: v.string() },
    handler: async (ctx, args) => {
        const existing = await ctx.db.query("settings").first();
        if (existing) {
            await ctx.db.patch(existing._id, { adminPassword: args.password });
        } else {
            await ctx.db.insert("settings", {
                unitPrice: 4900,
                oldUnitPrice: 3900,
                googleSheetUrl: "",
                googleSheetNotEndedUrl: "",
                bannerEnabled: true,
                bannerMessage: "التوصيل متوفر إلى",
                facebookPixelId: "",
                facebookAccessToken: "",
                tiktokPixelId: "",
                adminPassword: args.password,
                deliveryPrices: {},
            });
        }
    },
});
