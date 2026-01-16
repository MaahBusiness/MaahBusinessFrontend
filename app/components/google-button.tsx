// google-button.tsx
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useNavigation, useSubmit } from "react-router";

type OTPSessionData = {
  email: string;
  otpExpiresAt: number;
  resendAvailableAt?: number;
  resendCount: number;
};

interface GoogleAuthButtonProps {
  otpSession?: OTPSessionData;
}

export default function GoogleAuthButton({
  otpSession,
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

    // Pass OTP session if present (for preserving state)
    if (otpSession) {
      formData.otpSession = JSON.stringify(otpSession);
    }

    submit(formData, { method: "POST" });
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogleAuth}
      disabled={isGoogleAuthSubmitting}
    >
      {isGoogleAuthSubmitting ? (
        <Spinner />
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="size-4"
        >
          <path
            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
            fill="currentColor"
          />
        </svg>
      )}
      Continue with Google
    </Button>
  );
}
