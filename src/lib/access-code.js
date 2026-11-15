// Test access code required at sign-in until real seat codes are issued.
export const ACCESS_CODE = "ACCESS TEST CODE";

export function isValidAccessCode(value) {
  return String(value || "").trim().toUpperCase() === ACCESS_CODE;
}