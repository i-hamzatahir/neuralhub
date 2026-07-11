import type { Role } from "@/generated/prisma/client";

export const ROLE_HIERARCHY: Record<Role, number> = {
  USER: 1,
  AUTHOR: 2,
  EDITOR: 3,
  ADMIN: 4,
};

export type GuestRole = "GUEST";

export type AppRole = Role | GuestRole;

export interface AuthUser {
  id: string;
  email?: string | null;
  name?: string | null;
  username?: string;
  role: Role;
  image?: string | null;
}

export function isGuest(user: AuthUser | null | undefined): user is null | undefined {
  return !user;
}

export function hasMinRole(user: AuthUser | null | undefined, minRole: Role): boolean {
  if (!user) return false;
  return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[minRole];
}

export function canAccessDashboard(user: AuthUser | null | undefined): boolean {
  return hasMinRole(user, "AUTHOR");
}

export function canAccessAdmin(user: AuthUser | null | undefined): boolean {
  return hasMinRole(user, "EDITOR");
}

export function canManageUsers(user: AuthUser | null | undefined): boolean {
  return hasMinRole(user, "ADMIN");
}

export function getRoleLabel(role: AppRole): string {
  if (role === "GUEST") return "Guest";
  const labels: Record<Role, string> = {
    USER: "User",
    AUTHOR: "Author",
    EDITOR: "Editor",
    ADMIN: "Admin",
  };
  return labels[role];
}

export const ROUTE_PERMISSIONS = {
  "/dashboard": "AUTHOR" as Role,
  "/admin": "EDITOR" as Role,
  "/admin/users": "ADMIN" as Role,
  "/admin/settings": "ADMIN" as Role,
  "/admin/security": "ADMIN" as Role,
} as const;

export function getRequiredRole(pathname: string): Role | null {
  if (pathname.startsWith("/admin/users")) return ROUTE_PERMISSIONS["/admin/users"];
  if (pathname.startsWith("/admin/settings")) return ROUTE_PERMISSIONS["/admin/settings"];
  if (pathname.startsWith("/admin/security")) return ROUTE_PERMISSIONS["/admin/security"];
  if (pathname.startsWith("/admin")) return ROUTE_PERMISSIONS["/admin"];
  if (pathname.startsWith("/dashboard")) return ROUTE_PERMISSIONS["/dashboard"];
  return null;
}
