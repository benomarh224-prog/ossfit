type LoginUser = { id?: string; role?: string } | null | undefined;

export function loginPortalAllowsRole(role: string, portal: unknown): boolean {
  if (portal === "admin") return role === "COACH";
  if (portal !== undefined && portal !== "") return false;
  return role === "COACH" || role === "CLIENT";
}

export function signedInDestination(user: LoginUser): "/admin" | "/" | null {
  if (!user?.id) return null;
  if (user.role === "COACH") return "/admin";
  if (user.role === "CLIENT") return "/";
  return null;
}
