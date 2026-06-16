import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface AuthSubmitButtonProps
  extends React.ComponentProps<typeof Button> {
  loading?: boolean;
  children: React.ReactNode;
}

export function AuthSubmitButton({
  loading,
  children,
  className,
  disabled,
  ...props
}: AuthSubmitButtonProps) {
  return (
    <Button
      type="submit"
      size="lg"
      disabled={disabled || loading}
      className={cn(
        "auth-submit-btn h-12 w-full text-base font-semibold shadow-lg transition-all duration-300",
        "hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]",
        className,
      )}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </Button>
  );
}
