import { useState, useCallback } from "react";

interface UseModalReturn<T = unknown> {
  isOpen: boolean;
  data: T | null;
  open: (modalData?: T) => void;
  close: () => void;
  toggle: () => void;
  setData: (data: T | null) => void;
}

export function useModal<T = unknown>(initialState = false): UseModalReturn<T> {
  const [isOpen, setIsOpen] = useState(initialState);
  const [data, setData] = useState<T | null>(null);

  const open = useCallback((modalData?: T) => {
    setData(modalData ?? null);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    data,
    open,
    close,
    toggle,
    setData,
  };
}

interface ConfirmDialogConfig<T = unknown> {
  title?: string;
  message?: string;
  onConfirm?: (data?: T) => void;
  onCancel?: () => void;
  data?: T;
}

interface UseConfirmDialogReturn<T = unknown> {
  isOpen: boolean;
  title: string;
  message: string;
  data: T | null;
  confirm: (options: ConfirmDialogConfig<T>) => void;
  handleConfirm: () => void;
  handleCancel: () => void;
  close: () => void;
}

export function useConfirmDialog<T = unknown>(): UseConfirmDialogReturn<T> {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ConfirmDialogConfig<T>>({
    title: "Confirm",
    message: "Are you sure?",
    onConfirm: undefined,
    onCancel: undefined,
    data: undefined,
  });

  const confirm = useCallback((options: ConfirmDialogConfig<T>) => {
    setConfig({
      title: options.title || "Confirm",
      message: options.message || "Are you sure?",
      onConfirm: options.onConfirm,
      onCancel: options.onCancel,
      data: options.data,
    });
    setIsOpen(true);
  }, []);

  const handleConfirm = useCallback(() => {
    if (config.onConfirm) {
      config.onConfirm(config.data);
    }
    setIsOpen(false);
  }, [config]);

  const handleCancel = useCallback(() => {
    if (config.onCancel) {
      config.onCancel();
    }
    setIsOpen(false);
  }, [config]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    title: config.title || "Confirm",
    message: config.message || "Are you sure?",
    data: config.data ?? null,
    confirm,
    handleConfirm,
    handleCancel,
    close,
  };
}

export default useModal;
