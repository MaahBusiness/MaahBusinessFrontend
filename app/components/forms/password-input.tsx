import * as React from "react";
import { Check, Eye, EyeOff, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FieldError } from "@/components/ui/field";

type PasswordInputProps = {
  error?: string;
  required?: boolean;
  onValidityChange?: (valid: boolean) => void;
};

export function PasswordInput({
  error,
  required = true,
  onValidityChange,
}: PasswordInputProps) {
  const [password, setPassword] = React.useState("");
  const [focused, setFocused] = React.useState(false);
  const [show, setShow] = React.useState(false);

  const rules = {
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    length: password.length >= 8,
  };

  const isValid = Object.values(rules).every(Boolean);

  React.useEffect(() => {
    onValidityChange?.(isValid);
  }, [isValid, onValidityChange]);

  const showRequirements = focused || password.length > 0;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          value={password}
          id="password"
          name="password"
          aria-invalid={password.length > 0 && !isValid}
          onChange={(e) => setPassword(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Create a strong password"
          autoComplete="new-password"
          className="auth-input !px-4 pr-11"
          required={required}
        />

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setShow((v) => !v)}
          className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground"
          tabIndex={-1}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </Button>
      </div>

      {error && <FieldError errors={[{ message: error }]} />}

      {showRequirements && (
        <div className="rounded-xl border border-violet-200/60 bg-gradient-to-r from-violet-50/80 to-blue-50/60 px-4 py-3.5 dark:border-violet-500/20 dark:from-violet-950/40 dark:to-blue-950/30">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Password must include:
          </p>
          <ul className="grid gap-1.5 sm:grid-cols-2">
            <Rule ok={rules.uppercase}>Uppercase letter</Rule>
            <Rule ok={rules.lowercase}>Lowercase letter</Rule>
            <Rule ok={rules.number}>Number</Rule>
            <Rule ok={rules.special}>Special character</Rule>
            <Rule ok={rules.length} className="sm:col-span-2">
              At least 8 characters
            </Rule>
          </ul>
        </div>
      )}
    </div>
  );
}

function Rule({
  ok,
  children,
  className,
}: {
  ok: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <li
      className={cn(
        "flex items-center gap-2 text-xs",
        ok ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground",
        className,
      )}
    >
      {ok ? (
        <Check className="size-3.5 shrink-0" strokeWidth={2.5} />
      ) : (
        <X className="size-3.5 shrink-0 opacity-50" strokeWidth={2.5} />
      )}
      {children}
    </li>
  );
}
