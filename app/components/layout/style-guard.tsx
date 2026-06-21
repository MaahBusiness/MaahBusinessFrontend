import { CSS_RECOVER_KEY } from "@/lib/style-safety";
import { useEffect } from "react";

function tailwindStylesLoaded() {
  const probe = document.createElement("div");
  probe.className = "hidden";
  document.documentElement.appendChild(probe);
  const loaded = getComputedStyle(probe).display === "none";
  probe.remove();
  return loaded;
}

/**
 * Client-side safety net after hydration — catches CSS loss during failed
 * stylesheet requests. Defers the probe and skips auto-reload in dev/HMR.
 */
export function StyleGuard() {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (tailwindStylesLoaded()) {
        sessionStorage.removeItem(CSS_RECOVER_KEY);
        return;
      }

      // HMR can briefly drop Tailwind; never reload the page in development.
      if (import.meta.env.DEV) return;

      const attempts = Number(sessionStorage.getItem(CSS_RECOVER_KEY) ?? "0");
      if (attempts < 2) {
        sessionStorage.setItem(CSS_RECOVER_KEY, String(attempts + 1));
        window.location.reload();
      }
    }, 200);

    return () => window.clearTimeout(timer);
  }, []);

  return null;
}
