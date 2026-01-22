import * as React from "react";
import { Eye, EyeOff, Check, Circle, CircleIcon } from "lucide-react";

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
  //   const [_error, setError] = React.useState(error);

  const rules = {
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    length: password.length >= 8,
  };

  //   React.useEffect(() => {
  //     console.log(_error);
  //     setError(undefined);
  //     setError(_error);
  //   }, [_error]);

  const isValid = Object.values(rules).every(Boolean);

  React.useEffect(() => {
    onValidityChange?.(isValid);
  }, [isValid, onValidityChange]);

  const showError: boolean = password.length > 0 && !isValid;

  return (
    <div className="space-y-2">
      {/* Input */}
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          value={password}
          id="password"
          name="password"
          aria-invalid={showError}
          onChange={(e) => {
            setPassword(e.target.value);
            // setError(undefined);
          }}
          onFocus={() => setFocused(true)}
          //   onBlur={() => setFocused(false)}
          placeholder="Enter your password"
          className="pr-10"
          required={required}
        />

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setShow((v) => !v)}
          className="absolute right-0 top-1/2 -translate-y-1/2"
          tabIndex={-1}
        >
          {show ? <EyeOff size={3} /> : <Eye size={3} />}
        </Button>
      </div>

      {error && <FieldError errors={[{ message: error }]} />}
      {/* Inline error */}
      {/* {showError && (
        <FieldError
          errors={[
            {
              message:
                "Please make sure your password meets all the requirements below.",
            },
          ]}
        />
      )} */}

      {/* Requirements */}
      {focused && (
        <ul className="py-1 text-sm">
          <Rule ok={rules.uppercase}>Uppercase letter</Rule>
          <Rule ok={rules.lowercase}>Lowercase letter</Rule>
          <Rule ok={rules.number}>Number</Rule>
          <Rule ok={rules.special}>Special character (e.g. !?&@$%)</Rule>
          <Rule ok={rules.length}>8 characters or more</Rule>
        </ul>
      )}
    </div>
  );
}

function Rule({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li
      className={cn(
        "flex items-center gap-2 text-muted-foreground",
        ok && "text-foreground",
      )}
    >
      {ok ? (
        <CircleIcon className="size-3 fill-current shrink-0" />
      ) : (
        <CircleIcon className="size-3 text-muted-foreground shrink-0" />
      )}
      {children}
    </li>
  );
}
