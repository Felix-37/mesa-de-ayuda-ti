"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { CATEGORIES, PRIORITIES } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CrearTicketPage() {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError("");
    setLoading(true);

    try {
      let attachmentUrl: string | null = null;

      // Upload file if exists
      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `tickets/${user.uid}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("ticket-attachments")
          .upload(filePath, file);

        if (uploadError) {
          throw new Error("Error al subir el archivo: " + uploadError.message);
        }

        const { data: urlData } = supabase.storage
          .from("ticket-attachments")
          .getPublicUrl(filePath);

        attachmentUrl = urlData.publicUrl;
      }

      // Insert ticket
      const { data: ticket, error: insertError } = await supabase.from("tickets").insert({
        subject,
        description,
        category,
        priority,
        status: "Nuevo",
        user_id: user.uid,
        user_email: user.email,
        attachment_url: attachmentUrl,
      }).select().single();

      if (insertError) {
        throw new Error("Error al crear ticket: " + insertError.message);
      }

      // Log history
      await supabase.from("ticket_history").insert({
        ticket_id: ticket.id,
        field_changed: "creación",
        new_value: "Ticket creado",
      });

      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-10">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header Estilo Stitch */}
        <div className="bg-navy-900 px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Crear nuevo ticket</h1>
            <p className="text-navy-300 text-xs mt-1">Completa los detalles de tu requerimiento técnico</p>
          </div>
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="text-navy-300 hover:text-white hover:bg-navy-800 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </Button>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">Asunto del Problema</label>
              <Input
                placeholder="Ej: No funciona la impresora del segundo piso…"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="h-12 border-slate-200 focus:border-navy-500 bg-slate-50/50 transition-[border-color]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">Categoría</label>
              <Select value={category} onValueChange={(val) => val && setCategory(val)} required>
                <SelectTrigger className="h-12 border-slate-200 bg-slate-50/50">
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">Prioridad</label>
              <Select value={priority} onValueChange={(val) => val && setPriority(val)} required>
                <SelectTrigger className="h-12 border-slate-200 bg-slate-50/50">
                  <SelectValue placeholder="Seleccionar prioridad" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">Descripción Detallada</label>
              <Textarea
                placeholder="Describe el problema detalladamente para una mejor resolución…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="min-h-[150px] border-slate-200 focus:border-navy-500 bg-slate-50/50 resize-none font-medium transition-[border-color]"
              />
            </div>

            {/* Adjuntos Estilo Stitch */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">Evidencias o Archivos (Opcional)</label>
              <div 
                className={cn(
                  "relative group flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-2xl cursor-pointer transition-[background-color,border-color,transform] duration-300",
                  file 
                    ? "border-green-400 bg-green-50/50" 
                    : "border-slate-300 bg-sky-50/30 group-hover:bg-sky-50/60 group-hover:border-navy-300"
                )}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const droppedFile = e.dataTransfer.files[0];
                  if (droppedFile) setFile(droppedFile);
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {file ? (
                    <>
                      <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-3 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      </div>
                      <p className="text-sm font-bold text-navy-950">{file.name}</p>
                      <p className="text-[10px] text-green-600 font-bold uppercase mt-2 tracking-widest">Archivo seleccionado</p>
                    </>
                  ) : (
                    <>
                      <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-sky-500 mb-3 shadow-md border border-sky-100 group-hover:scale-110 transition-transform duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                        </svg>
                      </div>
                      <p className="mb-1 text-sm text-navy-950 font-bold">
                        Arrastra archivos aquí o haz clic
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Imágenes o Documentos (Máx. 5MB)</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold animate-shake">
              {error}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Link href="/dashboard" className="flex-1">
              <Button type="button" variant="outline" className="w-full h-12 border-navy-200 text-navy-700 font-bold hover:bg-navy-50">
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={loading || !category || !priority}
              className="flex-1 h-12 bg-navy-900 hover:bg-navy-800 text-white font-bold shadow-lg shadow-navy-900/20 transition-[background-color,transform,box-shadow]"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                  Creando…
                </>
              ) : (
                "Crear ticket"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
