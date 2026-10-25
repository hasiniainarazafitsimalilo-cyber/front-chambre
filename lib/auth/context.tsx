"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getCurrentUser, loginUser, logoutUser, refreshToken } from "@/lib/api/auth";
import type { LoginPayload, TokenResponse, UserProfile } from "@/types/auth";

/* ─── Types ─── */
interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => string | null;
}

/* ─── Context ─── */
const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "hotelia_tokens";

function readTokens(): TokenResponse | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TokenResponse) : null;
  } catch {
    return null;
  }
}

function writeTokens(tokens: TokenResponse) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  // Store the access token in the cookie so middleware can decode the role (base64 payload).
  // The cookie is used only for routing decisions; real JWT validation stays on the backend.
  document.cookie = `hotelia_session=${tokens.access_token}; path=/; max-age=604800; SameSite=Lax`;
}

function clearTokens() {
  localStorage.removeItem(STORAGE_KEY);
  document.cookie = "hotelia_session=; path=/; max-age=0; SameSite=Lax";
}

/* ─── Provider ─── */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isLoading: true,
    isAuthenticated: false,
  });

  /* Bootstrap — restore session from localStorage */
  useEffect(() => {
    const restore = async () => {
      const stored = readTokens();
      if (!stored) {
        setState((s) => ({ ...s, isLoading: false }));
        return;
      }
      try {
        // Try current access token
        const user = await getCurrentUser(stored.access_token);
        setState({
          user,
          accessToken: stored.access_token,
          isLoading: false,
          isAuthenticated: true,
        });
      } catch {
        // Access token expired — try refresh
        try {
          const fresh = await refreshToken(stored.refresh_token);
          writeTokens(fresh);
          const user = await getCurrentUser(fresh.access_token);
          setState({
            user,
            accessToken: fresh.access_token,
            isLoading: false,
            isAuthenticated: true,
          });
        } catch {
          clearTokens();
          setState({ user: null, accessToken: null, isLoading: false, isAuthenticated: false });
        }
      }
    };
    restore();
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const tokens = await loginUser(payload);
    writeTokens(tokens);
    const user = await getCurrentUser(tokens.access_token);
    setState({
      user,
      accessToken: tokens.access_token,
      isLoading: false,
      isAuthenticated: true,
    });
  }, []);

  const logout = useCallback(async () => {
    const stored = readTokens();
    if (stored) {
      try {
        await logoutUser(stored.access_token);
      } catch {
        // Ignore logout API errors — clear local anyway
      }
    }
    clearTokens();
    setState({ user: null, accessToken: null, isLoading: false, isAuthenticated: false });
  }, []);

  const getToken = useCallback((): string | null => {
    return state.accessToken ?? readTokens()?.access_token ?? null;
  }, [state.accessToken]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ─── Hook ─── */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
