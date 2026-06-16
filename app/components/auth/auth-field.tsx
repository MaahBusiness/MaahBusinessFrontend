import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { FieldError, FieldLabel } from "@/components/ui/field";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface AuthFieldProps {
  id: string;
  name: string;
  label: string;
  type?: string;
  placeholder: string;
  autoComplete?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export function AuthField({
  id,
  name,
  label,
  type = "text",
  placeholder,
  autoComplete,
  error,
  required,
  className,
}: AuthFieldProps) {
  return (
    <div className={cn("auth-field-stack", className)}>
      <FieldLabel htmlFor={id} className="sr-only">
        {label}
      </FieldLabel>
      <Input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="auth-input"
        required={required}
        aria-invalid={!!error}
      />
      {error && <FieldError errors={[{ message: error }]} />}
    </div>
  );
}

interface AuthPasswordFieldProps {
  id?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export function AuthPasswordField({
  id = "password",
  name = "password",
  label = "Password",
  placeholder = "Password",
  autoComplete = "current-password",
  error,
  required = true,
  className,
}: AuthPasswordFieldProps) {
  const [show, setShow] = useState(false);

  return (
    <div className={cn("auth-field-stack", className)}>
      <FieldLabel htmlFor={id} className="sr-only">
        {label}
      </FieldLabel>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="auth-input pr-11"
          required={required}
          aria-invalid={!!error}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="auth-input-toggle"
          tabIndex={-1}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? (
            <EyeOff className="size-4" />
          ) : (
            <Eye className="size-4" />
          )}
        </button>
      </div>
      {error && <FieldError errors={[{ message: error }]} />}
    </div>
  );
}
