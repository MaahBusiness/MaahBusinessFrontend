import type { OTPSessionData, SignUpActionType } from "types";

/**Generic error message */
export function genericErrorState() {
  return {
    success: false,
    message: "Oops! Something went wrong. Please try again later.",
  };
}

/**Generic network error message */
export function genericNetworkError(message: string) {
  if (message === "fetch failed")
    return {
      success: false,
      message: "Please check your network and try again.",
    };
}
// handy functions to display timer countdown on otp screen
export function minutesToSeconds(minutes: number) {
  return Math.max(0, Math.floor(minutes * 60));
}

export function microsecondsToSeconds(microseconds: number) {
  return Math.max(0, Math.floor(microseconds / 1_000_000));
}

export function formatSeconds(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function expiryFromNowSeconds(seconds: number) {
  return Date.now() + seconds * 1000;
}

// -------------------------------------
// Helper: Format Rate Limit Message
// -------------------------------------
export function getRateLimitMessage(retryAfterSeconds?: number): string {
  if (!retryAfterSeconds) {
    return "Too many requests. Please try again later.";
  }

  const retryTime = new Date(Date.now() + retryAfterSeconds * 1000);
  const timeString = retryTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const minutes = Math.ceil(retryAfterSeconds / 60);

  if (minutes < 60) {
    return `Too many requests. Please try again after ${timeString} (in ${minutes} minute${minutes !== 1 ? "s" : ""}).`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  const timeDesc =
    remainingMins > 0
      ? `${hours} hour${hours !== 1 ? "s" : ""} and ${remainingMins} minute${remainingMins !== 1 ? "s" : ""}`
      : `${hours} hour${hours !== 1 ? "s" : ""}`;

  return `Too many requests. Please try again after ${timeString} (in ${timeDesc}).`;
}

// -------------------------------------
// Helper: Handle Rate Limit Error
// -------------------------------------
export function handleRateLimitError(
  step?: "EMAIL" | "OTP",
  retryAfterSeconds?: number,
  otpSession?: OTPSessionData,
): SignUpActionType {
  if (retryAfterSeconds) {
    console.log(retryAfterSeconds);
    console.log(microsecondsToSeconds(retryAfterSeconds));
    console.log(expiryFromNowSeconds(microsecondsToSeconds(retryAfterSeconds)));
    console.log(expiryFromNowSeconds(60));
  }
  // const resendAvailableAt = retryAfterSeconds
  //   ? expiryFromNowSeconds(microsecondsToSeconds(retryAfterSeconds))
  //   : undefined;
  const resendAvailableAt = retryAfterSeconds;

  return {
    success: false,
    message: getRateLimitMessage(retryAfterSeconds),
    step,
    otpSession: otpSession ? { ...otpSession, resendAvailableAt } : undefined,
  };
}

// For opening the user's inbox directly
export const getInboxUrl = (email: string) => {
  const domain = email.split("@")[1].toLowerCase();

  if (domain.includes("gmail"))
    return "https://mail.google.com/mail/u/0/#inbox";
  if (domain.includes("outlook") || domain.includes("hotmail")) {
    return "https://outlook.live.com/mail/0/inbox";
  }
  if (domain.includes("yahoo")) return "https://mail.yahoo.com";

  return "mailto:"; // fallback to default client
};

/**Image URL validation helper */
export function verifyImageUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve(url);
    img.onerror = () =>
      reject(new Error("The provided link does not point to a valid image."));

    img.src = url;
  });
}

/**
 * This is a simple function to capitalize the first character of a string:
 *
 * `str.charAt(0).toUpperCase()`: Takes the first character of the string and converts it to uppercase.\
 * `str.slice(1)`: Extracts the rest of the string starting from the second character\
 * Concatenate the two parts to form the capitalized string.
 */
export function capitalizeFirstChar(str: string): string {
  if (!str) return ""; // Handle empty strings or undefined input
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const passwordRules = [
  {
    test: (p: string) => p.length >= 8,
    message: "Your password needs to be at least 8 characters long.",
  },
  {
    test: (p: string) => /[a-z]/.test(p),
    message: "Your password should include at least one lowercase letter.",
  },
  {
    test: (p: string) => /[A-Z]/.test(p),
    message: "Your password should include at least one uppercase letter.",
  },
  {
    test: (p: string) => /[0-9]/.test(p),
    message: "Your password should include at least one number.",
  },
  {
    test: (p: string) => /[^A-Za-z0-9]/.test(p),
    message:
      "Your password should include at least one special character (e.g. !@#$%).",
  },
];

/**
 * Removes undefined properties and empty File objects from an object\
 * Useful before JSON.stringify or sending data to API
 */
export function cleanPayload<T extends Record<string, any>>(
  obj: T,
): Partial<T> {
  return Object.fromEntries<any>(
    Object.entries(obj).filter(([, value]) => {
      if (value === undefined) return false;
      if (value === "") return false;
      if (value instanceof File && !value.name && !value.size) return false;
      if (typeof value === "object" && Object.keys(value).length === 0)
        return false;
      return true;
    }),
  ) as any;
}

/**
 * Removes undefined properties and empty File objects from an object\
 * Useful before JSON.stringify or sending data to API
 */
export function removeUndefined<T extends Record<string, any>>(
  obj: T,
): Partial<T> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    // Skip undefined values
    if (value === undefined) {
      return acc;
    }

    // Skip empty File objects (File with no name/size)
    if (value instanceof File && !value.name && !value.size) {
      return acc;
    }

    // Skip objects that stringify to empty {}
    if (value && typeof value === "object" && Object.keys(value).length === 0) {
      return acc;
    }

    // acc[key] = value;
    return acc;
  }, {} as Partial<T>);
}
