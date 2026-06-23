export class AuthRequiredError extends Error {
  readonly returnPath: string;

  constructor(returnPath: string) {
    super("Authentication required");
    this.name = "AuthRequiredError";
    this.returnPath = returnPath;
  }
}

export function isAuthRequiredError(error: unknown): error is AuthRequiredError {
  return error instanceof AuthRequiredError;
}

export function assertAccessToken(
  accessToken: string | undefined,
  returnPath: string,
): asserts accessToken is string {
  if (!accessToken) throw new AuthRequiredError(returnPath);
}
