"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isRegister) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center space-y-2 pb-2">
          <div className="mx-auto w-24 h-24 mb-4 flex items-center justify-center">
            <img src="/logo.png" alt="Mesa de Ayuda TI Uniajc Logo" className="w-full h-full object-contain drop-shadow-lg" />
          </div>
          <CardTitle className="text-2xl font-bold text-navy-900">
            Mesa de Ayuda TI

          </CardTitle>
          <CardDescription>
            {isRegister ? "Crear una cuenta nueva" : "Inicia sesión para continuar"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-navy-800">
                Correo electrónico
              </label>
              <Input
                id="email"
                type="email"
                placeholder="hola@ejemplo.com…"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-navy-800">
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres…"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-navy-800 hover:bg-navy-700 text-white transition-[background-color]"
              disabled={loading}
            >
              {loading ? "Cargando…" : isRegister ? "Registrarse" : "Iniciar sesión"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">o continuar con</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogle}
            disabled={loading}
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {isRegister ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}{" "}
            <button
              type="button"
              onClick={() => { setIsRegister(!isRegister); setError(""); }}
              className="text-navy-600 hover:text-navy-800 font-medium underline-offset-4 hover:underline"
            >
              {isRegister ? "Iniciar sesión" : "Registrarse"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
