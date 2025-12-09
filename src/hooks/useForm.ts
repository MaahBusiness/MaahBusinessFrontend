import { useState, useCallback, ChangeEvent } from "react";
import type { FormErrors } from "../types";

interface UseFormOptions<T> {
  initialValues: T;
  onSubmit: (values: T) => Promise<void>;
  validate?: (values: T) => FormErrors;
}

interface UseFormReturn<T> {
  values: T;
  errors: FormErrors;
  isSubmitting: boolean;
  submitError: string;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  setValue: <K extends keyof T>(name: K, value: T[K]) => void;
  setValues: (newValues: Partial<T>) => void;
  setErrors: (errors: FormErrors) => void;
  setSubmitError: (error: string) => void;
  reset: () => void;
  resetTo: (newValues: T) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
}

export function useForm<T extends Record<string, unknown>>({
  initialValues,
  onSubmit,
  validate,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;
      const checked = (e.target as HTMLInputElement).checked;

      setValuesState((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));

      // Clear field error when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
      // Clear submit error
      if (submitError) {
        setSubmitError("");
      }
    },
    [errors, submitError]
  );

  const setValue = useCallback(<K extends keyof T>(name: K, value: T[K]) => {
    setValuesState((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...newValues }));
  }, []);

  const reset = useCallback(() => {
    setValuesState(initialValues);
    setErrors({});
    setSubmitError("");
  }, [initialValues]);

  const resetTo = useCallback((newValues: T) => {
    setValuesState(newValues);
    setErrors({});
    setSubmitError("");
  }, []);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();

      // Run validation if provided
      if (validate) {
        const validationErrors = validate(values);
        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          return;
        }
      }

      setIsSubmitting(true);
      setSubmitError("");

      try {
        await onSubmit(values);
      } catch (error: unknown) {
        const axiosError = error as { response?: { data?: Record<string, unknown> }; message?: string };
        const errorMessage =
          (axiosError.response?.data?.detail as string) ||
          (axiosError.response?.data?.message as string) ||
          (axiosError.response?.data?.error as string) ||
          axiosError.message ||
          "An error occurred";
        setSubmitError(errorMessage);

        // Handle field-specific errors from API
        if (axiosError.response?.data && typeof axiosError.response.data === "object") {
          const fieldErrors: FormErrors = {};
          Object.entries(axiosError.response.data).forEach(([key, value]) => {
            if (key !== "detail" && key !== "message" && key !== "error") {
              fieldErrors[key] = Array.isArray(value) ? value[0] : String(value);
            }
          });
          if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
          }
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, onSubmit, validate]
  );

  return {
    values,
    errors,
    isSubmitting,
    submitError,
    handleChange,
    setValue,
    setValues,
    setErrors,
    setSubmitError,
    reset,
    resetTo,
    handleSubmit,
  };
}

export default useForm;
