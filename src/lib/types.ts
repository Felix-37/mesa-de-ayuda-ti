export interface Ticket {
  id: string;
  subject: string;
  description: string;
  category: "Software" | "Hardware" | "Redes" | "Accesos";
  priority: "Baja" | "Media" | "Alta" | "Crítica";
  status: "Nuevo" | "En Progreso" | "Resuelto";
  created_at: string;
  user_id: string;
  user_email?: string;
  attachment_url: string | null;
}

export interface Comment {
  id: string;
  ticket_id: string;
  content: string;
  created_at: string;
  user_id: string;
}

export interface TicketHistory {
  id: string;
  ticket_id: string;
  field_changed: string;
  old_value: string | null;
  new_value: string | null;
  changed_at: string;
}

export type TicketStatus = Ticket["status"];
export type TicketPriority = Ticket["priority"];
export type TicketCategory = Ticket["category"];

export const STATUSES: TicketStatus[] = ["Nuevo", "En Progreso", "Resuelto"];
export const PRIORITIES: TicketPriority[] = ["Baja", "Media", "Alta", "Crítica"];
export const CATEGORIES: TicketCategory[] = ["Software", "Hardware", "Redes", "Accesos"];
