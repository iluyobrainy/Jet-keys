import { createHmac, timingSafeEqual } from "crypto"

export const SIMPLE_ADMIN_EMAIL = "admin@com"
export const SIMPLE_ADMIN_PASSWORD = "Admin@123"
export const SIMPLE_ADMIN_COOKIE = "jetandkeys_admin_session"
export const SIMPLE_ADMIN_SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000

const SIMPLE_ADMIN_SECRET =
  process.env.ADMIN_SIMPLE_AUTH_SECRET?.trim() || "jetandkeys-temporary-admin-auth"

type SimpleAdminSessionPayload = {
  email: string
  role: "admin"
  exp: number
}

function normalizeEmail(email: string) {
  return String(email || "").trim().toLowerCase()
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "")
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/")
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4)
  return Buffer.from(padded, "base64").toString("utf8")
}

function signPayload(payload: string) {
  return createHmac("sha256", SIMPLE_ADMIN_SECRET).update(payload).digest("base64url")
}

export function matchesSimpleAdminCredentials(email: string, password: string) {
  return normalizeEmail(email) === SIMPLE_ADMIN_EMAIL && password === SIMPLE_ADMIN_PASSWORD
}

export function createSimpleAdminSessionToken(email: string) {
  const payload: SimpleAdminSessionPayload = {
    email: normalizeEmail(email),
    role: "admin",
    exp: Date.now() + SIMPLE_ADMIN_SESSION_MAX_AGE_MS,
  }

  const encodedPayload = toBase64Url(JSON.stringify(payload))
  const signature = signPayload(encodedPayload)

  return `${encodedPayload}.${signature}`
}

export function verifySimpleAdminSessionToken(token?: string | null) {
  if (!token || !token.includes(".")) {
    return null
  }

  const [encodedPayload, signature] = token.split(".", 2)

  if (!encodedPayload || !signature) {
    return null
  }

  const expectedSignature = signPayload(encodedPayload)
  const providedSignature = Buffer.from(signature)
  const calculatedSignature = Buffer.from(expectedSignature)

  if (
    providedSignature.length !== calculatedSignature.length ||
    !timingSafeEqual(providedSignature, calculatedSignature)
  ) {
    return null
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as SimpleAdminSessionPayload

    if (payload.role !== "admin" || payload.email !== SIMPLE_ADMIN_EMAIL || payload.exp <= Date.now()) {
      return null
    }

    return payload
  } catch (_error) {
    return null
  }
}
