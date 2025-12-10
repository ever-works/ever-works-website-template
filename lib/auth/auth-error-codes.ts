// Auth error codes for specific error handling
// This file is safe to import in both server and client components
export enum AuthErrorCode {
  ACCOUNT_NOT_FOUND = "ACCOUNT_NOT_FOUND",
  INVALID_PASSWORD = "INVALID_PASSWORD",
  PROFILE_NOT_FOUND = "PROFILE_NOT_FOUND",
  GENERIC_ERROR = "GENERIC_ERROR",
  RATE_LIMITED = "RATE_LIMITED",
}
