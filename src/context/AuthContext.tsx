"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { supabase } from "@/lib/supabaseClient";

type UserRole = "admin" | "usuario";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: UserRole;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Proveedor de Autenticación (AuthContext).
 * Centraliza la gestión de usuarios con Firebase Auth y la resolución de roles con Supabase.
 * 
 * Sistema de Roles:
 * 1. Firebase Auth maneja la identidad (email/uid).
 * 2. Supabase (tabla 'admins') determina si el usuario tiene privilegios de administrador.
 * 
 * @param children Componentes hijos que consumirán el contexto.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>("usuario");

  // Consulta la tabla 'admins' en Supabase para determinar el rol
  const fetchUserRole = async (email: string | null) => {
    if (!email) {
      setRole("usuario");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("admins")
        .select("email")
        .ilike("email", email)
        .maybeSingle();

      if (error) {
        console.error("Error consultando rol:", error);
        setRole("usuario");
        return;
      }

      // Si existe un registro con ese email en la tabla admins, es admin
      setRole(data ? "admin" : "usuario");
    } catch (err) {
      console.error("Error verificando rol:", err);
      setRole("usuario");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchUserRole(firebaseUser.email);
      } else {
        setRole("usuario");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setRole("usuario");
  };

  const isAdmin = role === "admin";

  return (
    <AuthContext.Provider
      value={{ user, loading, role, isAdmin, signIn, signUp, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
