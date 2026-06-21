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
 * Client-side safety net after hydration — catches CSS loss during dev HMR
 * or failed stylesheet requests that inline recovery missed.
 */
export function StyleGuard() {
  useEffect(() => {
    if (tailwindStylesLoaded()) {
      sessionStorage.removeItem(CSS_RECOVER_KEY);
      return;
    }

    const attempts = Number(sessionStorage.getItem(CSS_RECOVER_KEY) ?? "0");
    if (attempts < 2) {
      sessionStorage.setItem(CSS_RECOVER_KEY, String(attempts + 1));
      window.location.reload();
    }
  }, []);

  return null;
}
