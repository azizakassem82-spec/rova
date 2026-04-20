import { useEffect, useRef } from "react";
import { useSettings } from "@/hooks/useSettings";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
    ttq?: {
      load: (id: string, options?: any) => void;
      page: () => void;
      track: (event: string, data?: Record<string, unknown>) => void;
      methods: string[];
      setAndDefer: (t: any, e: any) => void;
      instance: (t: any) => any;
      _i?: Record<string, any[]>;
      _t?: Record<string, number>;
      _o?: Record<string, any>;
    };
  }
}

/** Meta (Facebook) Pixel Loader */
function loadFbSdk() {
  if (typeof window === "undefined" || window.fbq) return;

  (function (f: any, b: Document, e: string, v: string, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function () {
      // @ts-ignore
      if (n.callMethod) {
        // @ts-ignore
        n.callMethod.apply(n, arguments);
      } else {
        // @ts-ignore
        n.queue.push(arguments);
      }
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    if (s && s.parentNode) {
      s.parentNode.insertBefore(t, s);
    } else {
      b.head.appendChild(t);
    }
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
}

/** TikTok Pixel Loader */
function loadTtSdk() {
  if (typeof window === "undefined" || window.ttq) return;

  (function (w, d, t) {
    // @ts-ignore
    w.TiktokAnalyticsObject = t;
    // @ts-ignore
    var ttq = (w[t] = w[t] || []);
    ttq.methods = [
      "page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie", "holdConsent", "revokeConsent", "grantConsent",
    ];
    ttq.setAndDefer = function (innerT: any, e: any) {
      innerT[e] = function () {
        innerT.push([e].concat(Array.prototype.slice.call(arguments, 0)));
      };
    };
    for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
    ttq.instance = function (innerT: any) {
      // @ts-ignore
      for (var e = ttq._i[innerT] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]);
      return e;
    };
    ttq.load = function (e: any, n: any) {
      var r = "https://analytics.tiktok.com/i18n/pixel/events.js",
        // @ts-ignore
        o = n && n.partner;
      ttq._i = ttq._i || {};
      ttq._i[e] = [];
      ttq._i[e]._u = r;
      ttq._t = ttq._t || {};
      ttq._t[e] = +new Date();
      ttq._o = ttq._o || {};
      ttq._o[e] = n || {};
      // @ts-ignore
      var script = d.createElement("script");
      script.type = "text/javascript";
      script.async = !0;
      script.src = r + "?sdkid=" + e + "&lib=" + t;
      var a = d.getElementsByTagName("script")[0];
      // @ts-ignore
      a.parentNode.insertBefore(script, a);
    };
  })(window, document, "ttq");
}

/** Call from anywhere to fire a Facebook Pixel event on ALL loaded pixels */
export function fbEvent(event: string, data?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", event, data);
  }
}

/** Call from anywhere to fire a TikTok Pixel event */
export function ttEvent(event: string, data?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.ttq) {
    window.ttq.track(event, data);
  }
}

/** Build the deduplicated list of all Facebook pixel IDs */
function getAllFbIds(single: string, arr: string[]): string[] {
  const all = [single, ...arr].map((s) => s.trim()).filter(Boolean);
  return [...new Set(all)];
}

/** Build the deduplicated list of all TikTok pixel IDs */
function getAllTtIds(single: string, arr: string[]): string[] {
  const all = [single, ...arr].map((s) => s.trim()).filter(Boolean);
  return [...new Set(all)];
}

export function PixelManager() {
  const { settings, isLoading } = useSettings();
  const fbIds = getAllFbIds(settings.facebookPixelId, settings.facebookPixelIds || []);
  const ttIds = getAllTtIds(settings.tiktokPixelId, settings.tiktokPixelIds || []);

  const fbIdsKey = fbIds.join(",");
  const ttIdsKey = ttIds.join(",");

  const hasLoadedFb = useRef(false);
  const hasLoadedTt = useRef(false);

  // ---- Facebook Pixels ----
  useEffect(() => {
    if (isLoading || fbIds.length === 0) return;

    loadFbSdk();

    // Re-initialize all pixels and fire PageView
    fbIds.forEach((id) => {
      window.fbq!("init", id);
    });
    window.fbq!("track", "PageView");

    // Add noscript fallback to head if not already present
    fbIds.forEach((id) => {
      const noscriptId = `fb-noscript-${id}`;
      if (!document.getElementById(noscriptId)) {
        const noscript = document.createElement("noscript");
        noscript.id = noscriptId;
        noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1" />`;
        document.head.appendChild(noscript);
      }
    });

    hasLoadedFb.current = true;
  }, [fbIdsKey, isLoading]);

  // ---- TikTok Pixels ----
  useEffect(() => {
    if (isLoading || ttIds.length === 0) return;

    loadTtSdk();

    ttIds.forEach((id) => {
      window.ttq!.load(id);
    });
    window.ttq!.page();

    hasLoadedTt.current = true;
  }, [ttIdsKey, isLoading]);

  return null;
}

