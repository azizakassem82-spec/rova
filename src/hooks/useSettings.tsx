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
  facebookPixelId: "",
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

/** Normalizes server response: coerces optional arrays to [] to match AppSettings type */
function normalizeSettings(raw: Record<string, unknown>): AppSettings {
  return {
    ...DEFAULTS,
    ...(raw as Partial<AppSettings>),
    facebookPixelIds: Array.isArray(raw.facebookPixelIds) ? raw.facebookPixelIds as string[] : [],
    tiktokPixelIds: Array.isArray(raw.tiktokPixelIds) ? raw.tiktokPixelIds as string[] : [],
  };
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
    
    // Strip metadata injected by Convex (e.g. _id, _creationTime)
    // so the mutation validation doesn't reject it as "extra fields"
    const {
      unitPrice, oldUnitPrice, googleSheetUrl, googleSheetNotEndedUrl,
      bannerEnabled, bannerMessage, facebookPixelId, facebookPixelIds,
      facebookAccessToken, tiktokPixelId, tiktokPixelIds, deliveryPrices
    } = next;

    const pureSettings = {
      unitPrice, oldUnitPrice, googleSheetUrl, googleSheetNotEndedUrl,
      bannerEnabled, bannerMessage, facebookPixelId, facebookPixelIds,
      facebookAccessToken, tiktokPixelId, tiktokPixelIds, deliveryPrices
    };

    setLocalOptimistic(next);
    updateSettingsMutation(pureSettings).catch(console.error);
  }, [localOptimistic, serverSettings, updateSettingsMutation]);

  const reset = useCallback(() => {
    setLocalOptimistic(DEFAULTS);
    updateSettingsMutation(DEFAULTS).catch(console.error);
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
