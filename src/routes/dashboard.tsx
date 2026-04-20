import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Search,
  Filter,
  Package,
  Phone,
  MapPin,
  Calendar,
  RefreshCw,
  BarChart2,
  Users,
  DollarSign,
  LogOut,
  Settings,
  Save,
  ExternalLink,
  RotateCcw,
  Megaphone,
  Tag,
  Sheet,
  Info,
  Zap,
} from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { WILAYAS } from "@/components/landing/wilayas";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

const STATUS_LABELS: Record<string, string> = {
  new: "جديد",
  confirmed: "مؤكد",
  shipped: "قيد التوصيل",
  delivered: "تم التسليم",
  cancelled: "ملغى",
};
const STATUS_STYLES: Record<string, string> = {
  new: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};
const STATUS_ICONS: Record<string, React.ReactNode> = {
  new: <Clock className="h-3.5 w-3.5" />,
  confirmed: <CheckCircle2 className="h-3.5 w-3.5" />,
  shipped: <Truck className="h-3.5 w-3.5" />,
  delivered: <Package className="h-3.5 w-3.5" />,
  cancelled: <XCircle className="h-3.5 w-3.5" />,
};

const APPS_SCRIPT_CODE = `// ====================================================
// SCRIPT 1 — الطلبات المكتملة (Main Orders)
// ====================================================

function setupHeaders() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  sheet.getRange("A1:H1").setValues([["التاريخ", "الاسم واللقب", "رقم الهاتف", "الولاية", "البلدية / العنوان", "الكمية", "السعر الإجمالي", "الحالة"]]);
  sheet.getRange("A1:H1").setFontWeight("bold").setBackground("#d9ead3").setFontSize(12);
  sheet.setFrozenRows(1);
}

function doGet(e) {
  if (!e || !e.parameter || !e.parameter.phone) {
    return ContentService.createTextOutput("ok");
  }

  var phone = (e.parameter.phone || "").trim();

  // Server-side validation: Algerian mobile only (05/06/07 + 8 digits)
  if (!/^(05|06|07)\\d{8}$/.test(phone)) {
    return ContentService.createTextOutput("invalid");
  }

  // Block obviously fake numbers (all same digit)
  if (/^(\\d)\\1{9}$/.test(phone)) {
    return ContentService.createTextOutput("fake");
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  sheet.appendRow([
    new Date().toLocaleString("fr-DZ"),
    e.parameter.name    || "",
    phone,
    e.parameter.wilaya  || "",
    e.parameter.address || "",
    e.parameter.qty     || "",
    e.parameter.total   || "",
    "جديد"
  ]);
  return ContentService.createTextOutput("ok");
}`;

const APPS_SCRIPT_LEADS = `// ====================================================
// SCRIPT 2 — الطلبات غير المكتملة (Not-Ended Leads)
// ====================================================

function setupHeaders() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  sheet.getRange("A1:D1").setValues([["التاريخ", "الاسم", "رقم الهاتف", "الحالة"]]);
  sheet.getRange("A1:D1").setFontWeight("bold").setBackground("#fce5cd").setFontSize(12);
  sheet.setFrozenRows(1);
}

function doGet(e) {
  if (!e || !e.parameter || !e.parameter.phone) {
    return ContentService.createTextOutput("ok");
  }

  var phone = (e.parameter.phone || "").trim();
  if (!/^(05|06|07)\d{8}$/.test(phone)) {
    return ContentService.createTextOutput("invalid");
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  // Avoid duplicate leads for the same phone
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][2] === phone) return ContentService.createTextOutput("dup");
  }

  sheet.appendRow([
    new Date().toLocaleString("fr-DZ"),
    e.parameter.name || "",
    phone,
    "لم يُكمل الطلب"
  ]);
  return ContentService.createTextOutput("ok");
}`;

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const checkPassword = useMutation(api.settings.checkPassword);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const ok = await checkPassword({ password });
      if (ok) {
        onLogin();
      } else {
        setError("كلمة المرور غير صحيحة");
      }
    } catch (err) {
      setError("حدث خطأ ما، يرجى المحاولة لاحقاً");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--gradient-hero)" }}>
      <div className="w-full max-w-sm mx-4">
        <div className="rounded-3xl border bg-card p-8 shadow-2xl" style={{ boxShadow: "var(--shadow-elegant)" }}>
          <div className="mb-6 flex flex-col items-center gap-3">
            <div className="h-14 w-14 overflow-hidden rounded-2xl bg-white shadow-md">
              <img src="/LOGO .webp" alt="Rova" className="h-full w-full object-cover" />
            </div>
            <h1 className="text-2xl font-extrabold">لوحة تحكم Rova</h1>
            <p className="text-sm text-muted-foreground">ادخل كلمة المرور للوصول</p>
          </div>
          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-2 text-center text-sm text-destructive font-medium">
              {error}
            </div>
          )}
          <div className="space-y-3">
            <input
              type="password"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full rounded-xl border bg-background px-4 py-3 text-right text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full rounded-xl py-3 text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "var(--gradient-cta)" }}
            >
              {loading ? "جاري التحقق..." : "تسجيل الدخول"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Settings Tab ----------
function SettingsTab() {
  const { settings, update, reset, isLoading } = useSettings();
  const updateAdminPassword = useMutation(api.settings.updateAdminPassword);
  const [saved, setSaved] = useState(false);
  // ✅ FIX: initialize draft as null; sync from server when Convex loads
  const [draft, setDraft] = useState<typeof settings | null>(null);
  const [showScript, setShowScript] = useState(false);
  const [showLeadsScript, setShowLeadsScript] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  // Sync draft from server settings once Convex data arrives (first load only)
  useEffect(() => {
    if (!isLoading && draft === null) {
      setDraft({ ...settings });
    }
  }, [isLoading, settings]);

  const handleSave = () => {
    if (!draft) return;
    update(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    setPasswordUpdating(true);
    try {
      await updateAdminPassword({ password: newPassword });
      setNewPassword("");
      alert("تم تحديث كلمة المرور بنجاح");
    } catch (err) {
      alert("حدث خطأ أثناء تحديث كلمة المرور");
      console.error(err);
    } finally {
      setPasswordUpdating(false);
    }
  };

  const handleReset = () => {
    const defaults: import("@/hooks/useSettings").AppSettings = { unitPrice: 4900, oldUnitPrice: 3900, googleSheetUrl: "", googleSheetNotEndedUrl: "", bannerEnabled: true, bannerMessage: "التوصيل متوفر إلى", facebookPixelId: "", facebookPixelIds: [], facebookAccessToken: "", tiktokPixelId: "", tiktokPixelIds: [], deliveryPrices: {} };
    reset();
    setDraft(defaults);
  };

  // Show loading spinner until Convex settings arrive
  if (isLoading || draft === null) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span className="text-sm font-semibold">جاري تحميل الإعدادات...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Price Settings */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <h3 className="font-extrabold text-base mb-4 flex items-center gap-2">
          <Tag className="h-5 w-5 text-primary" />
          إعدادات السعر
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">السعر الحالي (دج)</label>
            <input
              type="number"
              value={draft.unitPrice}
              onChange={(e) => setDraft({ ...draft, unitPrice: Number(e.target.value) })}
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-right text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">السعر القديم / المشطوب (دج)</label>
            <input
              type="number"
              value={draft.oldUnitPrice}
              onChange={(e) => setDraft({ ...draft, oldUnitPrice: Number(e.target.value) })}
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-right text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        <div className="mt-3 rounded-lg bg-primary/5 px-4 py-2 text-sm text-muted-foreground">
          التخفيض المحتسب: <strong className="text-primary">{Math.round((1 - draft.unitPrice / draft.oldUnitPrice) * 100)}%</strong>
        </div>
      </div>

      {/* Banner Settings */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <h3 className="font-extrabold text-base mb-4 flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" />
          إعدادات البانر المتحرك
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold">تفعيل البانر</label>
            <button
              onClick={() => setDraft({ ...draft, bannerEnabled: !draft.bannerEnabled })}
              className={`relative h-6 w-11 rounded-full transition-colors ${draft.bannerEnabled ? "bg-primary" : "bg-muted"}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${draft.bannerEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">نص البانر (يظهر قبل اسم الولاية)</label>
            <input
              type="text"
              value={draft.bannerMessage}
              onChange={(e) => setDraft({ ...draft, bannerMessage: e.target.value })}
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-right text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="التوصيل متوفر إلى"
            />
          </div>
          <div className="rounded-lg border bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
            معاينة: <span className="font-bold text-primary">🚚 {draft.bannerMessage} 16 - الجزائر</span>
          </div>
        </div>
      </div>

      {/* Google Sheets */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <h3 className="font-extrabold text-base mb-4 flex items-center gap-2">
          <Sheet className="h-5 w-5 text-primary" />
          ربط Google Sheets
        </h3>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">رابط Google Apps Script (Webhook)</label>
            <input
              type="url"
              value={draft.googleSheetUrl}
              onChange={(e) => setDraft({ ...draft, googleSheetUrl: e.target.value })}
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-left text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://script.google.com/macros/s/..."
              dir="ltr"
            />
          </div>
          {draft.googleSheetUrl && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700 font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              الطلبات ستُرسل تلقائياً عند كل طلب جديد
            </div>
          )}

          {/* Setup Guide */}
          <button
            onClick={() => setShowScript(!showScript)}
            className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <Info className="h-4 w-4" />
            {showScript ? "إخفاء" : "عرض"} كود الإعداد (Apps Script)
          </button>

          {showScript && (
            <div className="space-y-3 rounded-xl border bg-muted/30 p-4 text-sm">
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>افتح <a href="https://sheets.google.com" target="_blank" rel="noopener" className="text-primary underline inline-flex items-center gap-0.5">Google Sheets <ExternalLink className="h-3 w-3" /></a> وأنشئ ملفاً جديداً</li>
                <li>اذهب إلى <strong>Extensions → Apps Script</strong></li>
                <li>امسح الكود القديم والصق الكود التالي:</li>
              </ol>
              <pre className="overflow-x-auto rounded-lg bg-background border p-4 text-xs font-mono text-left" dir="ltr">
                {APPS_SCRIPT_CODE}
              </pre>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground" start={4}>
                <li>اضغط <strong>Deploy → New Deployment → Web App</strong></li>
                <li>اختر <strong>Who has access: Anyone</strong></li>
                <li>انسخ رابط الـ Deployment والصقه في الحقل أعلاه</li>
              </ol>
            </div>
          )}
        </div>
      </div>

      {/* Not-Ended Orders Sheet */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm border-orange-200">
        <h3 className="font-extrabold text-base mb-1 flex items-center gap-2">
          <Sheet className="h-5 w-5 text-orange-500" />
          ربط Google Sheets — الطلبات غير المكتملة
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          يُرسَل تلقائياً عندما يكتب الزبون رقم هاتفه دون إتمام الطلب. مفيد لاسترجاع العملاء المحتملين.
        </p>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold">رابط Apps Script — ورقة الطلبات غير المكتملة</label>
          <input
            type="url"
            value={draft.googleSheetNotEndedUrl}
            onChange={(e) => setDraft({ ...draft, googleSheetNotEndedUrl: e.target.value })}
            className="w-full rounded-xl border bg-background px-4 py-2.5 text-left text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="https://script.google.com/macros/s/..."
            dir="ltr"
          />
        </div>
        {draft.googleSheetNotEndedUrl && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2 text-xs text-orange-700 font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            الطلبات غير المكتملة ستُرسَل عند كتابة رقم الهاتف فقط
          </div>
        )}

        {/* Leads Script Guide */}
        <button
          onClick={() => setShowLeadsScript(!showLeadsScript)}
          className="mt-2 flex items-center gap-2 text-sm font-semibold text-orange-600 hover:underline"
        >
          <Info className="h-4 w-4" />
          {showLeadsScript ? "إخفاء" : "عرض"} كود الإعداد (Script 2 — الطلبات غير المكتملة)
        </button>
        {showLeadsScript && (
          <div className="space-y-3 rounded-xl border border-orange-200 bg-orange-50/40 p-4 text-sm">
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>أنشئ <strong>ملف Google Sheets جديد ومنفصل</strong> للطلبات غير المكتملة</li>
              <li>اذهب إلى <strong>Extensions → Apps Script</strong></li>
              <li>امسح الكود القديم والصق الكود التالي:</li>
            </ol>
            <pre className="overflow-x-auto rounded-lg bg-background border p-4 text-xs font-mono text-left" dir="ltr">
              {APPS_SCRIPT_LEADS}
            </pre>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground" start={4}>
              <li>اضغط <strong>Deploy → New Deployment → Web App</strong></li>
              <li>اختر <strong>Who has access: Anyone</strong></li>
              <li>انسخ رابط الـ Deployment والصقه في الحقل أعلاه</li>
            </ol>
          </div>
        )}
      </div>

      {/* Pixels */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <h3 className="font-extrabold text-base mb-1 flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          ربط البيكسلات (Pixels)
        </h3>
        <p className="text-xs text-muted-foreground mb-4">أضف معرّفات البيكسل — يمكنك إضافة عدة بيكسلات في نفس الوقت. جميعها تُحقن تلقائياً وتُطلق نفس الأحداث.</p>

        {/* ─── Facebook ─── */}
        <div className="space-y-3">
          <p className="text-sm font-bold flex items-center gap-1.5">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-blue-600 text-white text-[10px] font-bold">f</span>
            Facebook Pixel IDs
          </p>

          {/* Primary pixel */}
          <div className="flex gap-2 items-center">
            <span className="text-xs text-muted-foreground w-14 text-center shrink-0">رئيسي</span>
            <input
              type="text"
              value={draft.facebookPixelId}
              onChange={(e) => setDraft({ ...draft, facebookPixelId: e.target.value })}
              className="flex-1 rounded-xl border bg-background px-4 py-2.5 text-left text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1234567890"
              dir="ltr"
            />
          </div>

          {/* Extra pixels */}
          {(draft.facebookPixelIds || []).map((pid, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <span className="text-xs text-muted-foreground w-14 text-center shrink-0">#{idx + 2}</span>
              <input
                type="text"
                value={pid}
                onChange={(e) => {
                  const updated = [...(draft.facebookPixelIds || [])];
                  updated[idx] = e.target.value;
                  setDraft({ ...draft, facebookPixelIds: updated });
                }}
                className="flex-1 rounded-xl border bg-background px-4 py-2.5 text-left text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Facebook Pixel ID ${idx + 2}`}
                dir="ltr"
              />
              <button
                onClick={() => {
                  const updated = (draft.facebookPixelIds || []).filter((_, i) => i !== idx);
                  setDraft({ ...draft, facebookPixelIds: updated });
                }}
                className="rounded-xl border px-3 py-2.5 text-red-500 hover:bg-red-50 transition-colors"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          ))}

          <button
            onClick={() => setDraft({ ...draft, facebookPixelIds: [...(draft.facebookPixelIds || []), ""] })}
            className="flex items-center gap-1.5 rounded-xl border border-dashed border-blue-400 px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors w-full justify-center"
          >
            <span className="text-base leading-none">+</span> إضافة Facebook Pixel آخر
          </button>

          {/* Active count */}
          {([draft.facebookPixelId, ...(draft.facebookPixelIds || [])].filter(Boolean).length > 0) && (
            <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {[draft.facebookPixelId, ...(draft.facebookPixelIds || [])].filter(Boolean).length} Facebook Pixel(s) نشطة
            </p>
          )}
        </div>

        {/* Facebook CAPI Token */}
        <div className="mt-4 space-y-1.5">
          <label className="text-sm font-semibold flex items-center gap-1.5">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-blue-600 text-white text-[10px] font-bold">f</span>
            Facebook CAPI Access Token (اختياري)
          </label>
          <textarea
            value={draft.facebookAccessToken}
            onChange={(e) => setDraft({ ...draft, facebookAccessToken: e.target.value })}
            className="w-full rounded-xl border bg-background px-4 py-2.5 text-left text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
            placeholder="EAA..."
            dir="ltr"
          />
          <p className="text-[10px] text-muted-foreground">مطلوب لتحسين دقة البيانات عبر Conversion API</p>
        </div>

        {/* ─── TikTok ─── */}
        <div className="mt-6 space-y-3">
          <p className="text-sm font-bold flex items-center gap-1.5">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-black text-white text-[10px] font-bold">T</span>
            TikTok Pixel IDs
          </p>
          {/* Primary */}
          <div className="flex gap-2 items-center">
            <span className="text-xs text-muted-foreground w-14 text-center shrink-0">رئيسي</span>
            <input
              type="text"
              value={draft.tiktokPixelId}
              onChange={(e) => setDraft({ ...draft, tiktokPixelId: e.target.value })}
              className="flex-1 rounded-xl border bg-background px-4 py-2.5 text-left text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
              placeholder="ABCDEFGHIJK"
              dir="ltr"
            />
          </div>
          {/* Extra TikTok pixels */}
          {(draft.tiktokPixelIds || []).map((tid, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <span className="text-xs text-muted-foreground w-14 text-center shrink-0">#{idx + 2}</span>
              <input
                type="text"
                value={tid}
                onChange={(e) => {
                  const updated = [...(draft.tiktokPixelIds || [])];
                  updated[idx] = e.target.value;
                  setDraft({ ...draft, tiktokPixelIds: updated });
                }}
                className="flex-1 rounded-xl border bg-background px-4 py-2.5 text-left text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                placeholder={`TikTok Pixel ID ${idx + 2}`}
                dir="ltr"
              />
              <button
                onClick={() => {
                  const updated = (draft.tiktokPixelIds || []).filter((_, i) => i !== idx);
                  setDraft({ ...draft, tiktokPixelIds: updated });
                }}
                className="rounded-xl border px-3 py-2.5 text-red-500 hover:bg-red-50 transition-colors"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            onClick={() => setDraft({ ...draft, tiktokPixelIds: [...(draft.tiktokPixelIds || []), ""] })}
            className="flex items-center gap-1.5 rounded-xl border border-dashed border-gray-400 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors w-full justify-center"
          >
            <span className="text-base leading-none">+</span> إضافة TikTok Pixel آخر
          </button>
          {([draft.tiktokPixelId, ...(draft.tiktokPixelIds || [])].filter(Boolean).length > 0) && (
            <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {[draft.tiktokPixelId, ...(draft.tiktokPixelIds || [])].filter(Boolean).length} TikTok Pixel(s) نشطة
            </p>
          )}
        </div>

        <div className="mt-5 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground">الأحداث التي تُطلق تلقائياً على كل البيكسلات:</p>
          <p>• <strong>PageView</strong> — عند تحميل الصفحة</p>
          <p>• <strong>InitiateCheckout</strong> — عند البدء بملء نموذج الطلب</p>
          <p>• <strong>Purchase</strong> — عند إتمام الطلب بنجاح</p>
        </div>
      </div>

      {/* Delivery Prices Editor */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <h3 className="font-extrabold text-base mb-1 flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary" />
          أسعار التوصيل المخصصة
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          قم بتحديد أسعار التوصيل لكل ولاية. إذا حقل السعر فارغ، سيتم استخدام السعر الافتراضي المبرمج سابقا.
        </p>
        <div className="max-h-96 overflow-y-auto rounded-xl border bg-background/50 divide-y">
          <div className="grid grid-cols-12 gap-2 p-3 text-xs font-bold text-muted-foreground bg-muted/30 top-0 sticky z-10 backdrop-blur">
            <div className="col-span-4">الولاية</div>
            <div className="col-span-4 text-center">المكتب (Stopdesk)</div>
            <div className="col-span-4 text-center">المنزل (Domicile)</div>
          </div>
          {WILAYAS.map((w) => {
            const val = draft.deliveryPrices?.[w] || { stop: null, dom: null };
            return (
              <div key={w} className="grid grid-cols-12 gap-3 p-3 items-center hover:bg-muted/10 transition-colors">
                <div className="col-span-4 text-xs font-semibold">{w}</div>
                <div className="col-span-4">
                  <input
                    type="number"
                    value={val.stop === null ? "" : val.stop}
                    onChange={(e) => {
                      const num = e.target.value ? Number(e.target.value) : null;
                      setDraft({
                        ...draft,
                        deliveryPrices: {
                          ...draft.deliveryPrices,
                          [w]: { ...val, stop: num, dom: val.dom || 0 }
                        }
                      });
                    }}
                    placeholder="افتراضي"
                    className="w-full rounded-lg border bg-background px-3 py-1.5 text-center text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div className="col-span-4">
                  <input
                    type="number"
                    value={val.dom === null ? "" : val.dom}
                    onChange={(e) => {
                      const num = e.target.value ? Number(e.target.value) : null;
                      setDraft({
                        ...draft,
                        deliveryPrices: {
                          ...draft.deliveryPrices,
                          [w]: { ...val, stop: val.stop, dom: num || 0 }
                        }
                      });
                    }}
                    placeholder="افتراضي"
                    className="w-full rounded-lg border bg-background px-3 py-1.5 text-center text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700 font-semibold">
          <Info className="h-4 w-4" />
          تلميح: اترك خانة المكتب فارغة تماماً إذا كان التوصيل للمنزل فقط (لا يوجد stopdesk).
        </div>
      </div>

      {/* Admin Password */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm border-red-100">
        <h3 className="font-extrabold text-base mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5 text-red-500" />
          تغيير كلمة مرور المدير
        </h3>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">كلمة المرور الجديدة</label>
            <div className="flex gap-2">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="أدخل كلمة المرور الجديدة"
                className="flex-1 rounded-xl border bg-background px-4 py-2.5 text-right text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              <button
                onClick={handleUpdatePassword}
                disabled={passwordUpdating}
                className="rounded-xl px-4 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {passwordUpdating ? "جاري التحديث..." : "تحديث"}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground">كلمة المرور الافتراضية هي: NACERADMIN</p>
          </div>
        </div>
      </div>

      {/* Save / Reset */}
      <div className="flex gap-3 justify-end">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          إعادة تعيين
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all hover:scale-[1.02]"
          style={{ background: "var(--gradient-cta)" }}
        >
          {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? "تم الحفظ!" : "حفظ الإعدادات"}
        </button>
      </div>
    </div>
  );
}

// ---------- Orders Tab ----------
function OrdersTab() {
  const { settings } = useSettings();
  const convexOrders = useQuery(api.orders.listOrders);
  const updateStatusMutation = useMutation(api.orders.updateStatus);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const orders = convexOrders || [];

  const total = orders.length;
  const totalRevenue = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);
  const pending = orders.filter((o) => o.status === "new").length;
  const delivered = orders.filter((o) => o.status === "delivered").length;

  const filtered = orders.filter((o) => {
    const matchSearch = o.name.includes(search) || o.phone.includes(search) || o.wilaya.includes(search) || o._id.includes(search);
    const matchStatus = filterStatus === "all" || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const updateStatus = (id: string, status: string) => {
    updateStatusMutation({ id: id as any, status }).catch(console.error);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "إجمالي الطلبات", value: total, icon: <ShoppingBag />, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "الإيرادات (دج)", value: totalRevenue.toLocaleString(), icon: <DollarSign />, color: "text-green-600", bg: "bg-green-50" },
          { label: "في الانتظار", value: pending, icon: <Clock />, color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "تم التسليم", value: delivered, icon: <CheckCircle2 />, color: "text-primary", bg: "bg-primary/10" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border bg-card p-5 shadow-sm flex items-center gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-extrabold">{stat.value}</p>
              <p className="text-xs text-muted-foreground leading-tight">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Google Sheets status */}
      {!settings.googleSheetUrl && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 flex items-center gap-2">
          <Info className="h-4 w-4 shrink-0" />
          Google Sheets غير مربوط. اذهب إلى <strong>الإعدادات</strong> لربطه وحفظ الطلبات تلقائياً.
        </div>
      )}

      {/* Orders Table */}
      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-extrabold text-lg flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-primary" />
            إدارة الطلبات
          </h2>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث بالاسم، الهاتف..."
                className="rounded-xl border bg-background px-4 py-2 pr-9 text-sm text-right w-full sm:w-52 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="relative">
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-xl border bg-background px-4 py-2 pr-9 text-sm text-right w-full focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
              >
                <option value="all">كل الطلبات</option>
                {Object.entries(STATUS_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-right text-xs font-bold text-muted-foreground">
                <th className="px-5 py-3">رقم الطلب</th>
                <th className="px-5 py-3">العميل</th>
                <th className="px-5 py-3">الهاتف</th>
                <th className="px-5 py-3">الولاية</th>
                <th className="px-5 py-3">الكمية</th>
                <th className="px-5 py-3">المبلغ</th>
                <th className="px-5 py-3">التاريخ</th>
                <th className="px-5 py-3">الحالة</th>
                <th className="px-5 py-3">تحديث</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="py-12 text-center text-muted-foreground">لا توجد طلبات تطابق البحث</td></tr>
              )}
              {filtered.map((order, idx) => (
                <tr key={order._id} className={`border-b transition-colors hover:bg-muted/20 ${idx % 2 === 0 ? "" : "bg-muted/10"}`}>
                  <td className="px-5 py-3.5 font-mono text-xs font-semibold text-primary">{order._id.slice(-6).toUpperCase()}</td>
                  <td className="px-5 py-3.5 font-semibold">{order.name}</td>
                  <td className="px-5 py-3.5">
                    <a href={`tel:${order.phone}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                      <Phone className="h-3.5 w-3.5 shrink-0" />{order.phone}
                    </a>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />{order.wilaya}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center font-bold">{order.qty}</td>
                  <td className="px-5 py-3.5 font-bold text-primary">{order.total.toLocaleString()} دج</td>
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />{new Date(order.createdAt).toLocaleDateString("en-GB")}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLES[order.status]}`}>
                      {STATUS_ICONS[order.status] || <Clock className="h-3.5 w-3.5" />}{STATUS_LABELS[order.status] || order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                      className="rounded-lg border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                    >
                      {Object.entries(STATUS_LABELS).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t text-xs text-muted-foreground">
          <span>{filtered.length} طلب معروض</span>
        </div>
      </div>

      {/* Orders by Wilaya */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <h2 className="font-extrabold text-lg mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          الطلبات حسب الولاية
        </h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(
            orders.reduce<Record<string, number>>((acc, o) => {
              acc[o.wilaya] = (acc[o.wilaya] || 0) + 1;
              return acc;
            }, {})
          ).map(([wilaya, count]) => (
            <span key={wilaya} className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <TrendingUp className="h-3 w-3" />{wilaya} — {count}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- Main Dashboard ----------
function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<"orders" | "settings">("orders");

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-muted/30" dir="rtl">
      {/* Top Nav */}
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 overflow-hidden rounded-xl bg-white shadow">
                <img src="/LOGO .webp" alt="Rova" className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="text-sm font-extrabold leading-tight">Rova</p>
                <p className="text-[10px] text-muted-foreground">لوحة التحكم</p>
              </div>
            </div>
            {/* Tabs */}
            <div className="hidden sm:flex items-center gap-1 rounded-xl border bg-muted/50 p-1">
              <button
                onClick={() => setActiveTab("orders")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${activeTab === "orders" ? "bg-background shadow text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <ShoppingBag className="h-3.5 w-3.5" />الطلبات
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${activeTab === "settings" ? "bg-background shadow text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Settings className="h-3.5 w-3.5" />الإعدادات
              </button>
            </div>
          </div>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />خروج
          </button>
        </div>
        {/* Mobile Tabs */}
        <div className="flex sm:hidden border-t">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition-colors ${activeTab === "orders" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
          >
            <ShoppingBag className="h-4 w-4" />الطلبات
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition-colors ${activeTab === "settings" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
          >
            <Settings className="h-4 w-4" />الإعدادات
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {activeTab === "orders" ? <OrdersTab /> : <SettingsTab />}
      </main>
    </div>
  );
}
