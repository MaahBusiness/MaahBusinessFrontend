import { GoogleLogo } from "@/components/auth/google-logo";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useNavigation, useSubmit } from "react-router";

type OTPSessionData = {
  email: string;
  otpExpiresAt: number;
  resendAvailableAt?: number;
  resendCount: number;
};

interface GoogleAuthButtonProps {
  otpSession?: OTPSessionData;
  className?: string;
}

export default function GoogleAuthButton({
  otpSession,
  className,
}: GoogleAuthButtonProps) {
  const navigation = useNavigation();
  const submit = useSubmit();

  const isSubmitting = navigation.state === "submitting";
  const intent = navigation.formData?.get("intent");
  const isGoogleAuthSubmitting = isSubmitting && intent === "google-auth";

  const handleGoogleAuth = () => {
    const formData: Record<string, string> = {
      intent: "google-auth",
    };

    if (otpSession) {
      formData.otpSession = JSON.stringify(otpSession);
    }

    submit(formData, { method: "POST" });
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      onClick={handleGoogleAuth}
      disabled={isGoogleAuthSubmitting}
      className={cn(
        "auth-google-btn group h-12 w-full gap-3 border-border/80 bg-white text-[15px] font-medium text-foreground",
        "shadow-sm transition-all duration-300",
        "hover:border-blue-200 hover:bg-white hover:shadow-md hover:shadow-blue-500/10",
        "dark:border-white/15 dark:bg-white/5 dark:hover:border-white/25 dark:hover:bg-white/10",
        className,
      )}
    >
      {isGoogleAuthSubmitting ? (
        <Spinner />
      ) : (
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform duration-300 group-hover:scale-110">
          <GoogleLogo className="size-4" />
        </span>
      )}
      <span>Continue with Google</span>
    </Button>
  );
}
