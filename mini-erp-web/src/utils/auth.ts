export const ROLES = {
  ADMIN: "ADMIN",
  WAREHOUSE_MANAGER: "WAREHOUSE_MANAGER",
  SALES_STAFF: "SALES_STAFF",
  BRANCH_MANAGER: "BRANCH_MANAGER",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

type JwtPayload = {
  exp?: number;
  role?: string | string[];
  roles?: string | string[];
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?:
    | string
    | string[];
};

export function getToken(): string | null {
  return sessionStorage.getItem("accessToken");
}

export function getJwtPayload(): JwtPayload | null {
  const token = getToken();
  if (!token) return null;

  try {
    const encoded = token.split(".")[1];
    if (!encoded) return null;

    const base64 = encoded
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const json = atob(
      base64.padEnd(
        Math.ceil(base64.length / 4) * 4,
        "="
      )
    );

    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  const payload = getJwtPayload();

  return Boolean(
    payload &&
      typeof payload.exp === "number" &&
      payload.exp * 1000 > Date.now()
  );
}

export function getRoles(): string[] {
  const payload = getJwtPayload();
  if (!payload) return [];

  const claim =
    payload.role ??
    payload.roles ??
    payload[
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
    ];

  if (!claim) return [];

  return Array.isArray(claim) ? claim : [claim];
}

export function hasRole(allowedRoles: readonly string[]): boolean {
  return getRoles().some((role) => allowedRoles.includes(role));
}

export function logout(): void {
  sessionStorage.removeItem("accessToken");
}
