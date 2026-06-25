import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

function ensureGtag(id) {
  return new Promise((resolve) => {
    if (typeof window.gtag === "function") {
      resolve();
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", id, { send_page_view: false });

    const existing = document.querySelector(`script[data-ga-id="${id}"]`);
    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
      } else {
        existing.addEventListener("load", () => resolve(), { once: true });
      }
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.dataset.gaId = id;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    document.head.appendChild(script);
  });
}

export default function GoogleAnalytics() {
  const { pathname, search } = useLocation();
  const ready = useRef(false);

  useEffect(() => {
    if (!MEASUREMENT_ID || import.meta.env.DEV) return;

    ensureGtag(MEASUREMENT_ID).then(() => {
      ready.current = true;
      window.gtag("config", MEASUREMENT_ID, { page_path: pathname + search });
    });
  }, []);

  useEffect(() => {
    if (!MEASUREMENT_ID || import.meta.env.DEV || !ready.current) return;
    window.gtag("config", MEASUREMENT_ID, { page_path: pathname + search });
  }, [pathname, search]);

  return null;
}
