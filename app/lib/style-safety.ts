export const CRITICAL_APP_CSS = `
  html {
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
  }
  html.dark {
    color-scheme: dark;
    background-color: rgb(23 23 23);
    color: rgb(250 250 250);
  }
  html:not(.dark) {
    color-scheme: light;
    background-color: rgb(250 250 250);
    color: rgb(23 23 23);
  }
  body {
    margin: 0;
    min-height: 100vh;
    font-family: "Geist-Variable", ui-sans-serif, system-ui, sans-serif;
    line-height: 1.5;
    background-color: inherit;
    color: inherit;
  }
  a {
    color: inherit;
    text-decoration: none;
  }
  button {
    font: inherit;
  }
`;

/** Runs before paint — applies saved theme class on <html>. */
export const THEME_INIT_SCRIPT = `(function(){try{var k="vite-ui-theme";var t=localStorage.getItem(k)||"dark";if(t==="system"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.classList.remove("light","dark");document.documentElement.classList.add(t);}catch(e){document.documentElement.classList.add("dark");}})();`;

const CSS_RECOVER_KEY = "retailpulse-css-recover";

/** Detects missing Tailwind and auto-recovers once before showing a banner. */
export const CSS_RECOVERY_SCRIPT = `(function(){var KEY="${CSS_RECOVER_KEY}";var DEV=/^(localhost|127\\.0\\.0\\.1)$/.test(location.hostname);function stylesLoaded(){var p=document.createElement("div");p.className="hidden";p.style.cssText="position:absolute;pointer-events:none;opacity:0;";document.documentElement.appendChild(p);var ok=getComputedStyle(p).display==="none";p.remove();return ok;}function recover(){if(stylesLoaded()){sessionStorage.removeItem(KEY);return;}if(DEV)return;var n=Number(sessionStorage.getItem(KEY)||"0");if(n<2){sessionStorage.setItem(KEY,String(n+1));location.reload();return;}var b=document.createElement("div");b.setAttribute("role","alert");b.style.cssText="position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:24px;background:rgb(23 23 23);color:rgb(250 250 250);font-family:system-ui,sans-serif;text-align:center;";b.innerHTML='<div><p style="font-size:1.125rem;font-weight:600;margin:0 0 8px">Styles failed to load</p><p style="opacity:.85;margin:0 0 16px;max-width:22rem">Hard refresh the page (Ctrl+Shift+R). If this keeps happening, restart the dev server.</p><button type="button" style="padding:8px 16px;border-radius:8px;border:0;background:rgb(124 58 237);color:white;cursor:pointer">Reload</button></div>';b.querySelector("button").addEventListener("click",function(){location.reload();});document.body.prepend(b);}function scheduleRecover(){setTimeout(recover,120);}if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",scheduleRecover);}else{scheduleRecover();}})();`;

export { CSS_RECOVER_KEY };
