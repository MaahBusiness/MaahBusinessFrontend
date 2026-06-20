import { cn } from "@/lib/utils";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

const VIEWPORT_PAD = 8;
const MOBILE_BREAKPOINT = 640;

type PickerDropdownProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
  minWidth?: number;
  maxWidth?: number;
  /** Size panel to trigger width instead of expanding to minWidth. */
  matchTriggerWidth?: boolean;
  /** Center panel horizontally on narrow viewports. */
  mobileCenter?: boolean;
  align?: "start" | "end";
};

export function PickerDropdown({
  open,
  onOpenChange,
  trigger,
  children,
  className,
  minWidth = 360,
  maxWidth,
  matchTriggerWidth = false,
  mobileCenter = false,
  align = "start",
}: PickerDropdownProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: minWidth });

  const updatePosition = () => {
    const el = triggerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const viewportMax = window.innerWidth - VIEWPORT_PAD * 2;
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;

    let width: number;
    if (matchTriggerWidth) {
      width = rect.width;
    } else {
      width = Math.max(rect.width, minWidth);
    }

    if (maxWidth != null) {
      width = Math.min(width, maxWidth);
    }
    width = Math.min(width, viewportMax);

    let left =
      align === "end" ? rect.right - width : rect.left;

    if (mobileCenter && isMobile) {
      left = (window.innerWidth - width) / 2;
    }

    left = Math.max(
      VIEWPORT_PAD,
      Math.min(left, window.innerWidth - width - VIEWPORT_PAD),
    );

    const panelHeight =
      panelRef.current?.getBoundingClientRect().height ?? 320;
    const gap = 6;
    let top = rect.bottom + gap;

    if (top + panelHeight > window.innerHeight - VIEWPORT_PAD) {
      const above = rect.top - panelHeight - gap;
      if (above >= VIEWPORT_PAD) {
        top = above;
      } else {
        top = Math.max(
          VIEWPORT_PAD,
          window.innerHeight - panelHeight - VIEWPORT_PAD,
        );
      }
    }

    setPos({ top, left, width });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();

    const panel = panelRef.current;
    const ro =
      panel &&
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updatePosition)
        : null;
    ro?.observe(panel);

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, minWidth, maxWidth, matchTriggerWidth, align, mobileCenter]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      onOpenChange(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, onOpenChange]);

  return (
    <>
      <div
        ref={triggerRef}
        className={cn("min-w-0 max-w-full", className)}
      >
        {trigger}
      </div>
      {open &&
        createPortal(
          <div
            ref={panelRef}
            role="listbox"
            className="pointer-events-auto fixed z-[200] overflow-x-hidden overflow-y-auto overscroll-contain rounded-md border border-border bg-popover text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95"
            style={{
              top: pos.top,
              left: pos.left,
              width: pos.width,
              maxHeight: `min(420px, calc(100vh - ${VIEWPORT_PAD}px - ${pos.top}px))`,
            }}
          >
            {children}
          </div>,
          document.body,
        )}
    </>
  );
}
