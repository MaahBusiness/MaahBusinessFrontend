import { useState, useEffect } from "react";

type CopyState = "idle" | "copying" | "copied" | "error";

interface UseClipboardOptions {
  /** How many milliseconds to show the "copied" state */
  resetDelay?: number;
  /** Optional callback when copy succeeds */
  onCopy?: () => void;
  /** Optional callback when copy fails */
  onError?: (error: unknown) => void;
}

/**
 * Custom hook for handling clipboard operations
 */
export function useClipboard(options: UseClipboardOptions = {}) {
  const { resetDelay = 5000, onCopy, onError } = options;
  const [state, setState] = useState<CopyState>("idle");
  const [value, setValue] = useState<string | null>(null);

  // Reset to idle state after specified delay
  useEffect(() => {
    if (state === "copied") {
      const timer = setTimeout(() => {
        setState("idle");
      }, resetDelay);

      return () => clearTimeout(timer);
    }
  }, [state, resetDelay]);

  const copy = async (text: string) => {
    if (state === "copying") return;

    setState("copying");
    setValue(text);

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.top = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();

        const success = document.execCommand("copy");
        document.body.removeChild(textarea);

        if (!success) throw new Error("Fallback copy failed");
      }

      setState("copied");
      onCopy?.();
    } catch (error) {
      setState("error");
      onError?.(error);
      console.error("Failed to copy text to clipboard", error);
    }
  };

  return {
    copy,
    state,
    value,
    isIdle: state === "idle",
    isCopying: state === "copying",
    isCopied: state === "copied",
    isError: state === "error",
  };
}
