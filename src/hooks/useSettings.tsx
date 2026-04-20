import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export interface AppSettings {
  unitPrice: number;
  oldUnitPrice: number;
  googleSheetUrl: string;
  googleSheetNotEndedUrl: string;
  bannerEnabled: boolean;
  bannerMessage: string;
  facebookPixelId: string;
  facebookPixelIds: string[];
  facebookAccessToken: string;
  tiktokPixelId: string;
  tiktokPixelIds: string[];
  deliveryPrices: Record<string, { stop: number | null; dom: number; note?: string }>;
}

const DEFAULTS: AppSettings = {
  unitPrice: 3200,
  oldUnitPrice: 3900,
  googleSheetUrl: "",
  googleSheetNotEndedUrl: "",
  bannerEnabled: true,
  bannerMessage: "التوصيل متوفر إلى",
  facebookPixelId: "1612297379997971",
  facebookPixelIds: [],
  facebookAccessToken: "",
  tiktokPixelId: "",
  tiktokPixelIds: [],
  deliveryPrices: {},
};

interface SettingsContextValue {
  settings: AppSettings;
  update: (patch: Partial<AppSettings>) => void;
  reset: () => void;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

/** Normalizes server response: coerces optional fields and ensures robust types */
function normalizeSettings(raw: Record<string, unknown>): AppSettings {
  console.log("Normalizing settings from server:", raw.deliveryPrices);
  const serverPrices = Array.isArray(raw.deliveryPrices) ? raw.deliveryPrices : [];
  const pricesMap: AppSettings["deliveryPrices"] = {};
  serverPrices.forEach((p: any) => {
    if (p && p.wilaya) {
      pricesMap[p.wilaya] = {
        stop: p.stop,
        dom: p.dom,
        note: p.note
      };
    }
  });
  console.log("Mapped prices to Record:", pricesMap);

  const norm = {
    ...DEFAULTS,
    ...(raw as Partial<AppSettings>),
    facebookPixelIds: Array.isArray(raw.facebookPixelIds) ? raw.facebookPixelIds as string[] : [],
    tiktokPixelIds: Array.isArray(raw.tiktokPixelIds) ? raw.tiktokPixelIds as string[] : [],
    deliveryPrices: pricesMap,
  };
  if (!norm.facebookPixelId) {
    norm.facebookPixelId = "1612297379997971";
  }
  return norm;
}

export function SettingsProvider({ children }: { children: ReactNode }): React.ReactElement {
  const serverSettings = useQuery(api.settings.getSettings);
  const updateSettingsMutation = useMutation(api.settings.updateSettings);

  const [localOptimistic, setLocalOptimistic] = useState<AppSettings | null>(null);

  useEffect(() => {
    if (serverSettings && !localOptimistic) {
      setLocalOptimistic(normalizeSettings(serverSettings as Record<string, unknown>));
    }
  }, [serverSettings]);

  const update = useCallback((patch: Partial<AppSettings>) => {
    const base = localOptimistic || (serverSettings ? normalizeSettings(serverSettings as Record<string, unknown>) : DEFAULTS);
    const next: AppSettings = { ...base, ...patch };
    
    const safeNum = (v: any, fallback: number) => (typeof v === "number" && isFinite(v)) ? v : fallback;

    // Convert Record from frontend back to Array for Convex
    const deliveryPricesArray: any[] = [];
    Object.entries(next.deliveryPrices || {}).forEach(([w, p]) => {
      if (p && typeof p === "object") {
        deliveryPricesArray.push({
          wilaya: w,
          stop: (p.stop === null || (typeof p.stop === "number" && isFinite(p.stop))) ? p.stop : null,
          dom: safeNum(p.dom, 0),
          note: p.note
        });
      }
    });
    console.log("Sending deliveryPricesArray to server:", deliveryPricesArray);
    const pureSettings: any = {
      unitPrice: safeNum(next.unitPrice, 4900),
      oldUnitPrice: safeNum(next.oldUnitPrice, 3900),
      googleSheetUrl: next.googleSheetUrl || "",
      googleSheetNotEndedUrl: next.googleSheetNotEndedUrl || "",
      bannerEnabled: Boolean(next.bannerEnabled),
      bannerMessage: next.bannerMessage || "",
      facebookPixelId: next.facebookPixelId || "",
      facebookPixelIds: Array.isArray(next.facebookPixelIds) ? next.facebookPixelIds.filter(Boolean) : [],
      facebookAccessToken: next.facebookAccessToken || "",
      tiktokPixelId: next.tiktokPixelId || "",
      tiktokPixelIds: Array.isArray(next.tiktokPixelIds) ? next.tiktokPixelIds.filter(Boolean) : [],
      deliveryPrices: deliveryPricesArray
    };

    setLocalOptimistic(next);
    updateSettingsMutation(pureSettings)
      .catch((err) => {
        console.error("Mutation failed:", err);
        alert("فشل في حفظ الإعدادات: " + err.message);
      });
  }, [localOptimistic, serverSettings, updateSettingsMutation]);

  const reset = useCallback(() => {
    setLocalOptimistic(DEFAULTS);
    updateSettingsMutation({ 
      ...DEFAULTS, 
      deliveryPrices: [] 
    } as any).catch(console.error);
  }, [updateSettingsMutation]);

  const currentSettings: AppSettings = localOptimistic || (serverSettings ? normalizeSettings(serverSettings as Record<string, unknown>) : DEFAULTS);

  return (
    <SettingsContext.Provider value={{ settings: currentSettings, update, reset, isLoading: serverSettings === undefined }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be inside <SettingsProvider>");
  return ctx;
}
