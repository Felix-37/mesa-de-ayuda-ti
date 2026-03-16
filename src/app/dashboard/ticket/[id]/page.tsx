"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import type { Ticket, Comment, TicketHistory, TicketStatus } from "@/lib/types";
import { STATUSES } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const priorityColors: Record<string, string> = {
  Baja: "bg-slate-100 text-slate-700 border-slate-200",
  Media: "bg-sky-100 text-sky-700 border-sky-200",
  Alta: "bg-accent-yellow-100 text-navy-900 border-accent-yellow-200",
  Crítica: "bg-red-100 text-red-700 border-red-200",
};

const statusColors: Record<string, string> = {
  Nuevo: "bg-orange-100 text-orange-700 border-orange-200",
  "En Progreso": "bg-sky-100 text-sky-700 border-sky-200",
  Resuelto: "bg-green-100 text-green-700 border-green-200",
};

/**
 * Vista de Detalle del Ticket.
 * Muestra la información completa de un ticket, incluyendo descripción, adjuntos y comentarios.
 * 
 * Lógica de Seguridad (RLS Front-end):
 * - Los administradores pueden visualizar cualquier ticket.
 * - Los usuarios regulares son redireccionados al dashboard si intentan acceder a un ticket que no les pertenece.
 * 
 * Funcionalidades:
 * - Cambio de estado de ticket (solo admin).
 * - Sistema de comentarios internos.
 * - Visualización de historial de transiciones de estado.
 */
export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [history, setHistory] = useState<TicketHistory[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!ticketId || !user) return;
    setLoading(true);

    const [ticketRes, commentsRes, historyRes] = await Promise.all([
      supabase.from("tickets").select("*").eq("id", ticketId).single(),
      supabase.from("comments").select("*").eq("ticket_id", ticketId).order("created_at", { ascending: true }),
      supabase.from("ticket_history").select("*").eq("ticket_id", ticketId).order("changed_at", { ascending: false }),
    ]);

    if (ticketRes.data) {
      const ticketData = ticketRes.data as Ticket;
      if (!isAdmin && ticketData.user_id !== user.uid) {
        router.push("/dashboard");
        return;
      }
      setTicket(ticketData);
    }
    if (commentsRes.data) setComments(commentsRes.data as Comment[]);
    if (historyRes.data) setHistory(historyRes.data as TicketHistory[]);
    setLoading(false);
  }, [ticketId, user, router, isAdmin]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addComment = async () => {
    if (!newComment.trim() || !user) return;
    setCommentLoading(true);

    const { error } = await supabase.from("comments").insert({
      ticket_id: ticketId,
      content: newComment.trim(),
      user_id: user.uid,
    });

    if (!error) {
      setNewComment("");
      fetchData();
    }
    setCommentLoading(false);
  };

  const changeStatus = async (newStatus: TicketStatus) => {
    if (!ticket || ticket.status === newStatus) return;
    const oldStatus = ticket.status;

    const { error } = await supabase
      .from("tickets")
      .update({ status: newStatus })
      .eq("id", ticketId);

    if (!error) {
      await supabase.from("ticket_history").insert({
        ticket_id: ticketId,
        field_changed: "status",
        old_value: oldStatus,
        new_value: newStatus,
      });
      fetchData();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-navy-200 border-t-navy-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Ticket no encontrado</p>
        <Button variant="link" onClick={() => router.push("/dashboard")}>
          Volver al tablero
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50/30 min-h-screen">
      {/* Premium Header */}
      <div className="bg-navy-950 text-white p-6 lg:px-10 shadow-lg">
        <div className="max-w-5xl mx-auto space-y-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="text-slate-300 hover:text-white hover:bg-white/10 -ml-2 h-8 text-xs font-bold uppercase tracking-widest"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Volver al Tablero
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black bg-accent-yellow-500 text-navy-950 px-2 py-0.5 rounded uppercase tracking-tighter">
                  #TK-{ticket.id.toString().slice(-5).toUpperCase()}
                </span>
                <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                  {ticket.category}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">{ticket.subject}</h1>
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge variant="outline" className={cn("font-bold border-none", statusColors[ticket.status])}>
                  {ticket.status}
                </Badge>
                <Badge variant="outline" className={cn("font-bold border-none", priorityColors[ticket.priority])}>
                  Prioridad {ticket.priority}
                </Badge>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger className="bg-accent-yellow-500 text-navy-950 font-black hover:bg-accent-yellow-400 border-none px-6 rounded-xl shadow-lg h-12 flex items-center gap-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-accent-yellow-400">
                GESTIONAR ESTADO
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl border-none shadow-2xl">
                {STATUSES.filter((s) => s !== ticket.status).map((status) => (
                  <DropdownMenuItem 
                    key={status} 
                    onClick={() => changeStatus(status)}
                    className="rounded-lg font-bold text-navy-900 focus:bg-slate-100 transition-colors py-2.5 cursor-pointer"
                  >
                    Marcar como &quot;{status}&quot;
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-10 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details + Comments */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-sm overflow-hidden bg-white">
            <CardHeader className="border-b border-slate-50 px-8 py-5">
              <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest">Descripción del Incidente</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-navy-900 leading-relaxed font-medium whitespace-pre-wrap">{ticket.description}</p>
              
              {ticket.attachment_url && (
                <div className="mt-8 pt-8 border-t border-slate-50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Evidencia Adjunta</p>
                  <a
                    href={ticket.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 p-4 rounded-2xl bg-sky-50 text-sky-700 hover:bg-sky-100 transition-all border border-sky-100 group"
                  >
                    <div className="p-2 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-sm font-black">Visualizar adjunto</span>
                      <span className="block text-[10px] font-bold opacity-70 uppercase">Formato de archivo externo</span>
                    </div>
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interaction Zone */}
          <div className="space-y-6">
            <h2 className="text-sm font-black text-navy-950 uppercase tracking-widest px-2">Discusión y Notas</h2>
            
            <Card className="border-none shadow-sm overflow-hidden bg-white">
              <CardContent className="p-0">
                <div className="p-6 bg-slate-50/50 border-b border-slate-100">
                  <Textarea
                    placeholder="Escribe una actualización o comentario interno..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    className="bg-white border-slate-200 rounded-xl focus:ring-navy-600 focus:border-navy-600 transition-all text-sm font-medium resize-none shadow-inner"
                  />
                  <div className="flex justify-end mt-4">
                    <Button
                      onClick={addComment}
                      disabled={!newComment.trim() || commentLoading}
                      className="bg-navy-900 hover:bg-navy-800 text-white font-black text-xs px-8 h-10 rounded-xl shadow-lg transition-all"
                    >
                      {commentLoading ? "ENVIANDO..." : "PUBLICAR COMENTARIO"}
                    </Button>
                  </div>
                </div>

                <div className="divide-y divide-slate-50">
                  {comments.length === 0 ? (
                    <div className="p-12 text-center">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Sin comentarios registrados</p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="p-8 hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-navy-100 text-navy-800 flex items-center justify-center font-black text-sm shadow-sm">
                            {comment.user_id.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-navy-950/40 uppercase tracking-widest">
                                {new Date(comment.created_at).toLocaleDateString("es-CO", { 
                                  day: '2-digit', 
                                  month: 'long', 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                            <p className="text-sm text-navy-900 font-medium leading-relaxed">{comment.content}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: History + Sidebar Info */}
        <div className="space-y-8">
          <Card className="border-none shadow-sm overflow-hidden bg-white">
            <CardHeader className="border-b border-slate-50 px-6 py-4">
              <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Historial de Cambios</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {history.length === 0 ? (
                <p className="text-[10px] font-bold text-slate-400 uppercase text-center py-4">Sin cambios registrados</p>
              ) : (
                <div className="space-y-6 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                  {history.map((entry) => (
                    <div key={entry.id} className="relative pl-8">
                      <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-white border-2 border-navy-300 z-10" />
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          {new Date(entry.changed_at).toLocaleTimeString("es-CO", { hour: '2-digit', minute: '2-digit' })} • {new Date(entry.changed_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs font-bold text-navy-950">
                          Cambio en <span className="text-navy-600">{entry.field_changed}</span>
                        </p>
                        <div className="flex items-center flex-wrap gap-1 mt-1 font-black text-[9px] uppercase">
                          <span className="text-slate-400 line-through decoration-slate-300">
                            {entry.old_value || "—"}
                          </span>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-2.5 h-2.5 text-navy-300">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                          </svg>
                          <span className="text-navy-700 bg-navy-50 px-1.5 py-0.5 rounded">
                            {entry.new_value}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-navy-900 overflow-hidden text-white relative">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-accent-yellow-500/10 rounded-full blur-3xl" />
            <CardContent className="p-8 space-y-6 relative z-10">
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Información de Soporte</p>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Solicitante</p>
                  <p className="text-xs font-black bg-white/5 p-3 rounded-xl border border-white/10 break-all">
                    {ticket.user_email || ticket.user_id}
                  </p>
                </div>
              </div>
              
              <div className="pt-6 border-t border-white/10 space-y-4">
                <div className="flex items-center gap-3 text-accent-yellow-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008h-.008v-.008Z" />
                  </svg>
                  <span className="text-[10px] font-black uppercase tracking-widest">SLA de Respuesta</span>
                </div>
                <p className="text-xs text-slate-300 font-medium">Este ticket está siendo procesado bajo los lineamientos institucionales de prioridad {ticket.priority}.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
