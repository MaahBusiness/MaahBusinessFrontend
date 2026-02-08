import type { Locale } from "date-fns";
import type {
  ClientFilters,
  InvoiceFilters,
  OTPSessionData,
  Product,
  ProductFilters,
  SignUpActionType,
} from "types";

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
      if ([undefined, null, ""].includes(value)) return false;
      if (typeof value === "string" && value.trim() === "") return false;
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
 * @deprecated
 */
export function removeUndefined<T extends Record<string, any>>(
  obj: T,
): Partial<T> {
  return Object.entries(obj).reduce((acc, [, value]) => {
    // Skip undefined values
    if ([undefined, null, ""].includes(value)) {
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

type QueryValue = string | number | boolean | undefined;
/**
 * A clean query builder for filters.
 * * only defined filters
 * * booleans preserved (false must not be dropped)
 * * numbers preserved
 * * keys mapped cleanly to query params
 * @param params filter options. e,g
 * ```js
 * buildQueryParams({
 *  business_id: "abc",
 *  low_stock_only: false,
 *  search: "milk",
 *  page: 2,
 * });
 * ```
 * @returns the built query e.g `?business_id=abc&low_stock_only=false&search=milk&page=2`
 */
export function buildQueryParams<T extends Record<string, QueryValue>>(
  params?: T,
) {
  if (
    !params ||
    (typeof params === "object" && Object.keys(params).length === 0)
  )
    return "";

  return (
    "?" +
    new URLSearchParams(
      Object.entries(cleanPayload(params)).map(([k, v]) => [k, String(v)]),
    ).toString()
  );
}

const genericFiltersParsers = {
  search: (v: string | null) => v || undefined,
  order_by: (v: string | null) => v as keyof Product | undefined,
  page: (v: string | null) => (v ? Number(v) : undefined),
  page_size: (v: string | null) => (v ? Number(v) : undefined),
};

/**For parsing search params back into a usable object */
export const productFilterParsers = {
  category_id: (v: string | null) => v || undefined,
  subcategory_id: (v: string | null) => v || undefined,
  name: (v: string | null) => v as keyof Product | undefined,
  expired_only: (v: string | null) =>
    v === "true" ? true : v === "false" ? false : undefined,
  low_stock_only: (v: string | null) =>
    v === "true" ? true : v === "false" ? false : undefined,
  ...genericFiltersParsers,
} satisfies Record<keyof ProductFilters, (v: string | null) => any>;

export const invoiceFilterParsers = {
  status: (v: string | null) => v || undefined,
  start_date: (v: string | null) => v || undefined,
  end_date: (v: string | null) => v || undefined,
  ...genericFiltersParsers,
} satisfies Record<keyof InvoiceFilters, (v: string | null) => any>;

export const clientFilterParsers = {
  name: (v: string | null) => v || undefined,
  customer_type: (v: string | null) => v || undefined,
  ...genericFiltersParsers,
} satisfies Record<keyof ClientFilters, (v: string | null) => any>;

/**Parses only defined search params. Much like `cleanPayload` */
export function parseSearchParams<T>(
  searchParams: URLSearchParams,
  parsers: Record<keyof T, (value: string | null) => any>,
): Partial<T> {
  const result: Partial<T> = {};

  for (const key in parsers) {
    const parsed = parsers[key](searchParams.get(key));
    if (![undefined, null, ""].includes(parsed)) {
      result[key] = parsed;
    }
  }

  return result;
}

/**Formats amount into readable format, thousand with separators */
export const formatAmount = (input: string): string => {
  const numericinput = input.replace(/\D/g, ""); // Strip non-numeric characters
  const amount = parseFloat(numericinput || "0");
  return new Intl.NumberFormat("en-CM", {
    style: "currency",
    currency: "XAF",
    minimumFractionDigits: 0,
  }).format(amount);
  // return numericinput.replace(/\B(?=(\d{3})+(?!\d))/g, ","); // Thousand separators
};
export const formatDisplayAmount = (input: string | number): string => {
  const numericinput =
    `${input}`.trim() ?? "0".split(".")[0].replace(/\D/g, ""); // Strip non-numeric characters
  const amount = parseFloat(numericinput);
  return new Intl.NumberFormat("en-CM", {
    style: "currency",
    currency: "XAF",
    minimumFractionDigits: 0,
  }).format(amount);
  // return formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ","); // Thousand separators
};

export const percent = (value: number, total: number, decimals: number = 0) => {
  if (total === 0) return 0;

  const factor = 10 ** decimals;
  return Math.round((value / total) * 100 * factor) / factor;
};

type FormatStyle = boolean | "verbose" | "date";

interface FormatDateOptions {
  extended?: FormatStyle;
  minimal?: boolean;
  locale?: Locale;
}

/**
 * Returns a human-readable duration string for how much time is left until a date,
 * or how much time has passed since.
 *
 * Examples:
 *  - "2 days left"
 *  - "Expired 5 hours ago"
 *
 * @param targetDate - A future or past date (iSO string or timestamp)
 * @returns A formatted string representing the time difference
 */
export function getTimeUntilOrSince(
  targetDate: string | number,
  options: FormatDateOptions = {},
): string {
  const { minimal } = options;

  const now = new Date();
  const date = new Date(targetDate);
  const diffinMs = date.getTime() - now.getTime();

  const isFuture = diffinMs > 0;
  const absDiff = Math.abs(diffinMs);
  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (minimal) {
    if (seconds < 60) return isFuture ? "a few secs" : "Just now";
    if (minutes < 60) return isFuture ? `${minutes}m left` : `${minutes}m ago`;
    if (hours < 24) return isFuture ? `${hours}h left` : `${hours}h ago`;

    if (days < 30) return isFuture ? `${days}d left` : `${days}d ago`;
    return isFuture ? `${months}m left` : `${months}m ago`;
  }

  if (seconds < 60) return isFuture ? "in a few seconds" : "Just now";
  if (minutes < 60)
    return isFuture
      ? `${minutes} min${minutes !== 1 ? "s" : ""} left`
      : `${minutes} min${minutes !== 1 ? "s" : ""} ago`;
  if (hours < 24)
    return isFuture
      ? `${hours} hour${hours !== 1 ? "s" : ""} left`
      : `${hours} hour${hours !== 1 ? "s" : ""} ago`;

  if (days < 7)
    return isFuture
      ? `${days} day${days !== 1 ? "s" : ""} left`
      : `${days} day${days !== 1 ? "s" : ""} ago`;

  if (weeks < 4)
    return isFuture
      ? `${weeks} week${weeks !== 1 ? "s" : ""} left`
      : `${weeks} week${weeks !== 1 ? "s" : ""} ago`;

  return isFuture
    ? `${months} month${months !== 1 ? "s" : ""} left`
    : `${months} month${months !== 1 ? "s" : ""} ago`;
}

/**Quick safe parser for possibly undefined json */
export const safeParseJSON = <T>(value?: string): T | undefined => {
  if (!value) return undefined;

  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
};

/** Simple check if date is earlier than another*/
export const isEarlier = (a?: string, b?: string) => {
  if (!a || !b) return;
  return new Date(a).getTime() < new Date(b).getTime();
};
/**Simple check if date is later than another*/
export const isLater = (a?: string, b?: string) => {
  if (!a || !b) return;
  return new Date(a).getTime() > new Date(b).getTime();
};

/**Handy function to extract actual image URLs since from what the API returns, the actual image URL is URL-encoded inside the S3 object key. 
 * | Case                           | Object key                         | Result                  |
| ------------------------------ | ---------------------------------- | ----------------------- |
| External image attached by URL | `https%3A//i.pinimg.com/...jpg`    | ✅ decoded to public URL |
| Uploaded image                 | `barcodes/product-barcode-....png` | ✅ original S3 URL       |
| Generated image                | `products/generated-....png`       | ✅ original S3 URL       |
| Non-S3 URL                     | `https://example.com/img.png`      | ✅ returned as-is        |

*/

export const extractImageUrl = (url?: string) => {
  if (!url) return undefined;

  // Not an S3 URL → return as-is
  if (!url.includes(".amazonaws.com/")) {
    return url;
  }

  const objectKey = url.split(".amazonaws.com/")[1]?.split("?")[0];
  if (!objectKey) return url;

  // If the object key itself is an encoded URL, decode it
  if (objectKey.startsWith("https%3A") || objectKey.startsWith("http%3A")) {
    return decodeURIComponent(objectKey);
  }

  // Otherwise it's a normal uploaded/generated S3 object
  return url;
};
