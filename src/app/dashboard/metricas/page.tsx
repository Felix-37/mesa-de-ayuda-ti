"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import type { Ticket } from "@/lib/types";
import { CATEGORIES, PRIORITIES } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function MetricasPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // Guard RBAC: redirigir si no es administrador
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/dashboard");
    }
  }, [authLoading, isAdmin, router]);

  const fetchTickets = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    let query = supabase
      .from("tickets")
      .select("*")
      .order("created_at", { ascending: false });

    if (!isAdmin) {
      query = query.eq("user_id", user.uid);
    }

    const { data, error } = await query;
    if (!error && data) setTickets(data as Ticket[]);
    setLoading(false);
  }, [user, isAdmin]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-navy-200 border-t-navy-800 rounded-full animate-spin" />
      </div>
    );
  }

  const totalTickets = tickets.length;
  const resueltosCount = tickets.filter((t) => t.status === "Resuelto").length;
  const pendientesCount = tickets.filter((t) => t.status !== "Resuelto").length;
  const criticosCount = tickets.filter((t) => t.priority === "Crítica" && t.status !== "Resuelto").length;

  const summaryCards = [
    {
      title: "Total Tickets",
      value: totalTickets,
      detail: "Solicitudes históricas",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
        </svg>
      ),
      color: "bg-navy-50 text-navy-700",
      accent: "bg-navy-600"
    },
    {
      title: "Pendientes",
      value: pendientesCount,
      detail: "En cola de atención",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
      color: "bg-sky-50 text-sky-700",
      accent: "bg-sky-500"
    },
    {
      title: "Resueltos",
      value: resueltosCount,
      detail: "Casos cerrados",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
      color: "bg-green-50 text-green-700",
      accent: "bg-green-600"
    },
    {
      title: "Casos Críticos",
      value: criticosCount,
      detail: "Atención inmediata",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
        </svg>
      ),
      color: "bg-red-50 text-red-700",
      accent: "bg-red-600"
    }
  ];

  const byCategory = CATEGORIES.map((c) => ({
    label: c,
    count: tickets.filter((t) => t.category === c).length,
  }));

  const byPriority = PRIORITIES.map((p) => ({
    label: p,
    count: tickets.filter((t) => t.priority === p).length,
  }));

  const maxCatCount = Math.max(...byCategory.map((c) => c.count), 1);
  const maxPriCount = Math.max(...byPriority.map((p) => p.count), 1);

  const priorityBarColors: Record<string, string> = {
    Baja: "bg-slate-300",
    Media: "bg-sky-400",
    Alta: "bg-accent-yellow-500",
    Crítica: "bg-red-500",
  };

  const recentTickets = tickets.slice(0, 6);

  return (
    <div className="p-4 lg:p-10 space-y-10 bg-slate-50/30 min-h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-950 tracking-tight">Panel de Métricas TI</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Monitoreo de rendimiento y estado del servicio</p>
        </div>
        <Badge className="bg-accent-yellow-500 text-navy-950 font-bold hover:bg-accent-yellow-400 border-none px-4 py-1.5 rounded-full shadow-sm">
          Actualizado hace un momento
        </Badge>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card) => (
          <Card key={card.title} className="group relative overflow-hidden border-none shadow-sm hover:shadow-xl transition-[box-shadow,transform] duration-300 hover:-translate-y-1">
            <div className={`absolute top-0 left-0 w-1 h-full ${card.accent}`} />
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{card.title}</p>
                  <p className="text-3xl font-black text-navy-950">{card.value}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">{card.detail}</p>
                </div>
                <div className={`p-3 rounded-2xl ${card.color} transition-colors duration-300 group-hover:scale-110 shadow-sm`}>
                  {card.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Statistics Columns */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-50 py-5 px-8">
              <CardTitle className="text-sm font-black text-navy-950 uppercase tracking-widest">Tickets por Categoría</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {byCategory.map((c) => (
                  <div key={c.label} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-bold text-navy-900">{c.label}</span>
                      <span className="text-lg font-black text-navy-900 leading-none">{c.count}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-navy-600 rounded-full transition-[width] duration-700 ease-out"
                        style={{ width: `${(c.count / maxCatCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-50 py-5 px-8">
              <CardTitle className="text-sm font-black text-navy-950 uppercase tracking-widest">Distribución de Prioridad</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {byPriority.map((p) => (
                  <div key={p.label} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-bold text-navy-900">{p.label}</span>
                      <span className="text-lg font-black text-navy-900 leading-none">{p.count}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${priorityBarColors[p.label]} rounded-full transition-[width] duration-700 ease-out`}
                        style={{ width: `${(p.count / maxPriCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent activity side list */}
        <Card className="border-none shadow-sm h-fit">
          <CardHeader className="bg-white border-b border-slate-50 py-5 px-8">
            <CardTitle className="text-sm font-black text-navy-950 uppercase tracking-widest">Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentTickets.length === 0 ? (
              <div className="p-10 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Sin actividad reciente</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {recentTickets.map((t) => (
                  <div key={t.id} className="p-6 hover:bg-slate-50 transition-colors group">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="text-xs font-bold text-navy-950 line-clamp-2 leading-tight group-hover:text-navy-700 transition-colors">
                        {t.subject}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          t.status === "Resuelto" ? "bg-green-500" : t.status === "En Progreso" ? "bg-sky-500" : "bg-orange-500"
                        )} />
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">
                          {t.category}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">
                        {new Date(t.created_at).toLocaleDateString("es-CO", { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="p-6 bg-slate-50/50 border-t border-slate-100">
              <Link href="/dashboard">
                <Button className="w-full bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs rounded-xl h-10 shadow-sm border-none transition-[background-color]">
                  Ver tablero completo
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
