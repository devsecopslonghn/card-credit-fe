import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { parseAuthSessionResponse } from "@/lib/api/authSessionCore.mjs";
import type { AuthSessionDto } from "@card-credit/contracts";

type AuthState = { status: "loading" | "authenticated" | "unauthenticated"; user: AuthSessionDto | null };
const AuthContext = createContext<AuthState>({ status: "loading", user: null });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading", user: null });
  useEffect(() => { let active = true; fetch("/api/auth/me", { credentials: "include" }).then(async (r) => { if (!r.ok) throw new Error("unauthenticated"); return parseAuthSessionResponse(await r.json()); }).then((body) => active && setState({ status: "authenticated", user: body.user })).catch(() => active && setState({ status: "unauthenticated", user: null })); return () => { active = false; }; }, []);
  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
export function ProtectedRoute({ children }: { children: ReactNode }) { const auth = useAuth(); const location = useLocation(); if (auth.status === "loading") return <main className="cc-page min-h-screen p-8">Đang kiểm tra phiên đăng nhập...</main>; return auth.status === "authenticated" ? children : <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />; }
