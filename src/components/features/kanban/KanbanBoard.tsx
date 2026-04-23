"use client";

import { useState, useEffect, useCallback, memo, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";
import type { Ticket, TicketStatus, TicketPriority } from "@/lib/types";
import { STATUSES, PRIORITIES, CATEGORIES } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

const priorityColors: Record<TicketPriority, string> = {
  Baja: "bg-slate-100 text-slate-700 border-slate-200",
  Media: "bg-blue-100 text-blue-700 border-blue-200",
  Alta: "bg-accent-yellow-100 text-navy-900 border-accent-yellow-300 font-bold",
  Crítica: "bg-red-100 text-red-700 border-red-200 font-bold",
};

const statusColors: Record<TicketStatus, string> = {
  Nuevo: "border-l-orange-500",
  "En Progreso": "border-l-sky-400",
  Resuelto: "border-l-green-500",
};

const statusHeaderColors: Record<TicketStatus, string> = {
  Nuevo: "text-orange-600 bg-orange-50/50",
  "En Progreso": "text-sky-600 bg-sky-50/50",
  Resuelto: "text-green-600 bg-green-50/50",
};

const priorityWeight: Record<TicketPriority, number> = {
  "Crítica": 4,
  Alta: 3,
  Media: 2,
  Baja: 1,
};

const TicketCard = memo(function TicketCard({
  ticket,
  onMove,
  isAdmin,
}: {
  ticket: Ticket;
  onMove: (ticketId: string, newStatus: TicketStatus) => void;
  isAdmin: boolean;
}) {
  const availableStatuses = STATUSES.filter((s) => s !== ticket.status);
  const ticketIdDisplay = ticket.id.substring(0, 5).toUpperCase();

  return (
    <Card
      draggable={isAdmin}
      onDragStart={(e) => {
        if (!isAdmin) return;
        e.dataTransfer.setData("ticketId", ticket.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      className={cn(
        "border-l-4 bg-white shadow-sm hover:shadow-md transition-[box-shadow,border-color,background-color] duration-200 border-y-0 border-r-0",
        isAdmin ? "cursor-grab active:cursor-grabbing" : "cursor-default",
        statusColors[ticket.status]
      )}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Badge className="bg-navy-700 text-white hover:bg-navy-600 font-medium text-[10px] px-2 py-0">
            {ticket.category.toUpperCase()}
          </Badge>
          <span className="text-[10px] font-bold text-slate-400">
            #TK-{ticketIdDisplay}
          </span>
        </div>
        
        <Link href={`/dashboard/ticket/${ticket.id}`} className="block">
          <h4 className="font-bold text-navy-950 text-sm leading-snug hover:text-navy-600 transition-colors">
            {ticket.subject}
          </h4>
        </Link>
        
        <div className="flex flex-wrap gap-1.5 items-center justify-between">
          <Badge variant="outline" className={`text-[10px] py-0 px-2 uppercase tracking-wider ${priorityColors[ticket.priority]}`}>
            {ticket.priority}
          </Badge>
          
          {/* Autor del ticket */}
          <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold truncate max-w-[120px]" title={ticket.user_email}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-2.5 h-2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            {ticket.user_email?.split('@')[0] || "Usuario"}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
          <div className="flex items-center gap-1.5 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span className="text-[10px] font-medium">
              {new Date(ticket.created_at).toLocaleDateString("es-CO", {
                day: "2-digit",
                month: "short",
              })}
            </span>
          </div>

          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={`Mover ticket ${ticket.subject} a otro estado`}
                className="inline-flex items-center justify-center rounded-lg text-[10px] font-bold ring-offset-background transition-[color,background-color,border-color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-navy-100 bg-white h-7 px-3 text-navy-700 hover:bg-navy-50 hover:border-navy-200"
              >
                Mover a…
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {availableStatuses.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => onMove(ticket.id, status)}
                    className="text-xs font-medium cursor-pointer"
                  >
                    {status}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

const KanbanColumn = memo(function KanbanColumn({
  status,
  tickets,
  onMove,
  onDrop,
  isAdmin,
}: {
  status: TicketStatus;
  tickets: Ticket[];
  onMove: (ticketId: string, newStatus: TicketStatus) => void;
  onDrop: (ticketId: string, newStatus: TicketStatus) => void;
  isAdmin: boolean;
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div
      className={cn(
        "flex-1 min-w-[280px] max-w-md rounded-xl border transition-colors",
        isDragOver && isAdmin ? "border-accent-yellow-400 bg-accent-yellow-50/50" : "border-gray-200 bg-gray-50/50"
      )}
      onDragOver={(e) => {
        if (!isAdmin) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        if (!isAdmin) return;
        e.preventDefault();
        setIsDragOver(false);
        const ticketId = e.dataTransfer.getData("ticketId");
        if (ticketId) onDrop(ticketId, status);
      }}
    >
      <div className={`flex items-center justify-between px-5 py-4 border-b border-white/20 ${statusHeaderColors[status]}`}>
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", status.includes("Progreso") ? "bg-sky-500" : status === "Nuevo" ? "bg-orange-500" : "bg-green-500")} />
          <h3 className="font-black text-xs uppercase tracking-widest">{status}</h3>
        </div>
        <Badge variant="secondary" className="bg-white/50 text-navy-900 border-none font-bold text-[10px]">
          {tickets.length}
        </Badge>
      </div>
      <div className="p-3 space-y-3 min-h-[200px]">
        {tickets.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            No hay tickets
          </p>
        )}
        {tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} onMove={onMove} isAdmin={isAdmin} />
        ))}
      </div>
    </div>
  );
});

/**
 * Componente principal del Tablero Kanban.
 * Gestiona la visualización, filtrado, búsqueda y movimiento de tickets.
 * 
 * Lógica de Visibilidad:
 * - Admin: Ve todos los tickets del sistema.
 * - Usuario: Solo ve los tickets donde user_id coincide con su UID de Firebase.
 * 
 * Reglas de Ordenamiento (processedTickets):
 * 1. Prioridad: Crítica > Alta > Media > Baja.
 * 2. Antigüedad: FIFO (First In, First Out), los más antiguos primero en caso de empate de prioridad.
 */
export default function KanbanBoard() {
  const { user, isAdmin } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const fetchTickets = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    let query = supabase
      .from("tickets")
      .select("*");

    if (!isAdmin) {
      query = query.eq("user_id", user.uid);
    }

    const { data, error } = await query;

    if (!error && data) {
      setTickets(data as Ticket[]);
    }
    setLoading(false);
  }, [user, isAdmin]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const moveTicket = useCallback(async (ticketId: string, newStatus: TicketStatus) => {
    if (!isAdmin) return;

    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket || ticket.status === newStatus) return;

    const oldStatus = ticket.status;

    // Optimistic update
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
    );

    const { error } = await supabase
      .from("tickets")
      .update({ status: newStatus })
      .eq("id", ticketId);

    if (error) {
      // Revert on error
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: oldStatus } : t))
      );
      return;
    }

    // Log history
    await supabase.from("ticket_history").insert({
      ticket_id: ticketId,
      field_changed: "status",
      old_value: oldStatus,
      new_value: newStatus,
    });
  }, [isAdmin, tickets]);

  const processedTickets = useMemo(() => {
    return [...tickets]
      .filter((ticket) => {
        const matchSearch =
          search === "" ||
          ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
          ticket.description.toLowerCase().includes(search.toLowerCase()) ||
          ticket.user_email?.toLowerCase().includes(search.toLowerCase());
        const matchPriority =
          filterPriority === "all" || ticket.priority === filterPriority;
        const matchCategory =
          filterCategory === "all" || ticket.category === filterCategory;
        return matchSearch && matchPriority && matchCategory;
      })
      .sort((a, b) => {
        // 1. Prioridad (Descendente)
        const pDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
        if (pDiff !== 0) return pDiff;
        
        // 2. Fecha de creación (Ascendente - FIFO)
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
  }, [tickets, search, filterPriority, filterCategory]);

  // Export CSV
  const exportCSV = () => {
    const headers = ["ID", "Asunto", "Descripción", "Categoría", "Prioridad", "Estado", "Creado Por", "Fecha"];
    const rows = processedTickets.map((t) => [
      t.id,
      t.subject,
      t.description.replace(/,/g, ";"),
      t.category,
      t.priority,
      t.status,
      t.user_email || t.user_id,
      new Date(t.created_at).toLocaleString("es-CO"),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tickets_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-navy-200 border-t-navy-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Tablero Kanban</h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin 
              ? "Gestiona y organiza todos los tickets de la institución" 
              : "Sigue el estado de tus solicitudes de soporte"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/crear">
            <Button className="bg-navy-800 hover:bg-navy-700 text-white transition-[background-color]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Nuevo ticket
            </Button>
          </Link>
          <Button variant="outline" onClick={exportCSV} aria-label="Exportar tickets a CSV" className="border-navy-200 text-navy-700 transition-[background-color,border-color,color]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            name="search-kanban"
            placeholder="Buscar tickets…"
            autoComplete="off"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm transition-[border-color,box-shadow]"
          />
        </div>
        <Select value={filterPriority} onValueChange={(val) => val && setFilterPriority(val)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Prioridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={(val) => val && setFilterCategory(val)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Kanban Columns */}
      <div className="flex flex-col lg:flex-row gap-4 overflow-x-auto pb-4">
        {STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tickets={processedTickets.filter((t) => t.status === status)}
            onMove={moveTicket}
            onDrop={moveTicket}
            isAdmin={isAdmin}
          />
        ))}
      </div>
    </div>
  );
}
