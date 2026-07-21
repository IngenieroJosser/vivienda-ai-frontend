"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PublicFlowShell } from "@/components/public-flow-shell";
import { Icon } from "@/components/icon";

const days = [
  { day: "22", week: "Mié" },
  { day: "23", week: "Jue" },
  { day: "24", week: "Vie" },
  { day: "25", week: "Sáb" },
  { day: "27", week: "Lun" },
];
const times = ["8:30 a. m.", "10:00 a. m.", "11:30 a. m.", "2:00 p. m.", "3:30 p. m.", "5:00 p. m."];
const channels = [
  { id: "video", label: "Videollamada", detail: "Google Meet", icon: "camera" as const },
  { id: "call", label: "Llamada", detail: "Al número registrado", icon: "phone" as const },
  { id: "office", label: "Punto físico", detail: "Sede seleccionada", icon: "location" as const },
];

export default function AgendarPage() {
  const router = useRouter();
  const [day, setDay] = useState(days[1].day);
  const [time, setTime] = useState(times[2]);
  const [channel, setChannel] = useState("video");
  const selectedDay = days.find((item) => item.day === day);
  const selectedChannel = channels.find((item) => item.id === channel);

  return (
    <PublicFlowShell step={5} eyebrow="Asesoría personalizada" title="Agenda el siguiente paso." description="Tu asesor recibirá el perfil, proyecto de interés y validaciones pendientes antes de la conversación.">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="flow-panel p-6 sm:p-8 lg:p-9">
          <div className="flex items-start justify-between gap-4"><div><h2 className="text-2xl font-bold tracking-[-.04em]">Elige la fecha de tu asesoría</h2><p className="mt-2 text-xs leading-5 text-black/45">Duración estimada: 30 minutos.</p></div><span className="hidden rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700 sm:inline-flex">Disponibilidad en tiempo real</span></div>

          <div className="mt-7 rounded-[20px] border border-black/[.065] bg-[#f8f9f9] p-5">
            <div className="flex items-center justify-between"><button className="grid h-8 w-8 place-items-center rounded-full bg-white shadow-sm"><Icon name="chevron" className="h-3.5 w-3.5 rotate-180" /></button><div className="text-sm font-bold">Julio 2026</div><button className="grid h-8 w-8 place-items-center rounded-full bg-white shadow-sm"><Icon name="chevron" className="h-3.5 w-3.5" /></button></div>
            <div className="mt-5 grid grid-cols-5 gap-2">{days.map((item) => <button key={item.day} onClick={() => setDay(item.day)} className={`rounded-[16px] border px-2 py-3 text-center transition ${day === item.day ? "border-[#0067b1] bg-[#0067b1] text-white shadow-[0_10px_24px_rgba(0,103,177,.16)]" : "border-black/[.07] bg-white hover:border-[#0067b1]/22"}`}><div className={`text-[9px] font-semibold ${day === item.day ? "text-white/65" : "text-black/38"}`}>{item.week}</div><div className="mt-1 text-lg font-extrabold">{item.day}</div></button>)}</div>
          </div>

          <div className="mt-7"><div className="flex items-center justify-between"><h3 className="text-sm font-bold">Horarios disponibles</h3><span className="text-[9px] text-black/38">Hora Colombia</span></div><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{times.map((item) => <button key={item} onClick={() => setTime(item)} className={`rounded-[14px] border px-3 py-3 text-xs font-bold transition ${time === item ? "border-[#ffd000] bg-[#ffd000] text-[#111820] shadow-[0_8px_20px_rgba(255,208,0,.18)]" : "border-black/[.075] bg-white text-black/55 hover:border-[#0067b1]/22 hover:text-[#0067b1]"}`}>{item}</button>)}</div></div>

          <div className="mt-7"><h3 className="text-sm font-bold">Canal de atención</h3><div className="mt-4 grid gap-3 sm:grid-cols-3">{channels.map((item) => <button key={item.id} onClick={() => setChannel(item.id)} className={`flex items-center gap-3 rounded-[16px] border p-4 text-left transition ${channel === item.id ? "border-[#0067b1] bg-[#f3f9fd] text-[#0067b1]" : "border-black/[.075] bg-white hover:border-[#0067b1]/22"}`}><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-[12px] ${channel === item.id ? "bg-[#0067b1] text-white" : "bg-[#ffd000]/20 text-[#0067b1]"}`}><Icon name={item.icon} className="h-4 w-4" /></span><span><span className="block text-xs font-bold">{item.label}</span><span className="mt-0.5 block text-[9px] text-black/38">{item.detail}</span></span></button>)}</div></div>
        </section>

        <aside className="space-y-4">
          <section className="surface-card p-5"><div className="text-[9px] font-bold uppercase tracking-[.13em] text-[#0067b1]">Asesora disponible</div><div className="mt-5 flex items-center gap-3"><span className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[#0067b1] to-[#004f8c] text-sm font-extrabold text-white">LG</span><div><div className="text-sm font-bold">Laura Gómez</div><div className="mt-0.5 text-[10px] text-black/40">Asesora comercial senior</div><div className="mt-2 flex items-center gap-1 text-[9px] font-bold text-[#7a6100]"><span className="text-[#ffd000]">★</span>4,9 · 128 asesorías</div></div></div><div className="mt-5 space-y-2.5">{["Especialista en vivienda e inversión", "Más de 6 años de experiencia", "Atención personalizada"].map((item) => <div key={item} className="flex gap-2 text-[10px] text-black/48"><Icon name="check" className="h-3.5 w-3.5 text-emerald-700" />{item}</div>)}</div></section>

          <section className="rounded-[24px] bg-[#111820] p-6 text-white shadow-[0_18px_48px_rgba(17,24,32,.16)]"><div className="flex items-center justify-between"><div className="text-[9px] font-bold uppercase tracking-[.14em] text-[#ffd000]">Resumen de la cita</div><Icon name="calendar" className="h-5 w-5 text-[#ffd000]" /></div><div className="mt-6 space-y-4">{[["building", "Proyecto", "Reserva del Parque"], ["calendar", "Fecha", `${selectedDay?.week} ${day} de julio`], ["clock", "Hora", time], [selectedChannel?.icon ?? "camera", "Modalidad", selectedChannel?.label ?? "Videollamada"]].map(([icon, label, value]) => <div key={label} className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-white/[.07]"><Icon name={icon as Parameters<typeof Icon>[0]["name"]} className="h-4 w-4 text-white/72" /></span><div><div className="text-[8px] uppercase tracking-[.1em] text-white/32">{label}</div><div className="mt-1 text-xs font-bold">{value}</div></div></div>)}</div><div className="mt-6 rounded-[15px] bg-white/[.055] p-4"><div className="flex gap-2.5"><Icon name="info" className="h-4 w-4 shrink-0 text-[#ffd000]" /><p className="text-[9px] leading-4 text-white/45">La confirmación y el enlace de acceso llegarán por correo y WhatsApp.</p></div></div><button onClick={() => router.push("/vivienda/confirmacion")} className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#ffd000] text-sm font-extrabold text-[#111820] transition hover:-translate-y-0.5">Confirmar cita <Icon name="arrow" className="h-4 w-4" /></button></section>
        </aside>
      </div>
    </PublicFlowShell>
  );
}
