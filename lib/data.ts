export const projects = [
  {
    id: "reserva-del-parque", name: "Reserva del Parque", city: "Bogotá", zone: "Fontibón", price: 186000000, priceLabel: "$186 M", area: "52–68 m²", rooms: "2–3", delivery: "I semestre 2028", compatibility: 94, status: "Disponible", units: 18, image: "/illustrations/project-1.svg",
    features: ["Aplica a subsidio familiar", "Cerca a transporte", "Zonas verdes", "Cuota inicial flexible"],
    reason: "Coincide con tu capacidad estimada, condición de afiliación, subsidio potencial y ubicación preferida.",
  },
  {
    id: "senderos-de-la-sabana", name: "Senderos de la Sabana", city: "Mosquera", zone: "Centro", price: 164000000, priceLabel: "$164 M", area: "48–61 m²", rooms: "2–3", delivery: "II semestre 2027", compatibility: 89, status: "Últimas unidades", units: 7, image: "/illustrations/project-2.svg",
    features: ["VIS", "Cesantías como cuota inicial", "Zona BBQ", "Cicloruta"],
    reason: "Su valor y esquema de separación son compatibles con tus recursos actuales y horizonte de compra.",
  },
  {
    id: "altos-de-la-floresta", name: "Altos de la Floresta", city: "Soacha", zone: "Ciudad Verde", price: 148000000, priceLabel: "$148 M", area: "45–57 m²", rooms: "2", delivery: "Entrega inmediata", compatibility: 83, status: "Disponible", units: 32, image: "/illustrations/project-3.svg",
    features: ["Menor esfuerzo financiero", "Entrega inmediata", "Comercio cercano", "Portería 24/7"],
    reason: "Es una alternativa de menor esfuerzo financiero mientras fortaleces tu cuota inicial.",
  },
];

export const leads = [
  { id: "lead-001", name: "Daniela Rojas", initials: "DR", score: 94, tier: "A", capacity: "$210 M", project: "Reserva del Parque", source: "Meta Ads", date: "21 jul, 10:24", state: "Listo para cierre", priority: "Alta", phone: "+57 301 555 1842", email: "daniela.rojas@email.com", affiliate: "Afiliada", route: "Asesor", subsidy: "Potencial", horizon: "0–3 meses" },
  { id: "lead-002", name: "Miguel Torres", initials: "MT", score: 87, tier: "A", capacity: "$185 M", project: "Senderos de la Sabana", source: "Google Ads", date: "21 jul, 09:48", state: "Cita agendada", priority: "Alta", phone: "+57 315 440 9771", email: "miguel.torres@email.com", affiliate: "Afiliado", route: "Asesor", subsidy: "Potencial", horizon: "3–6 meses" },
  { id: "lead-003", name: "Paula Martínez", initials: "PM", score: 72, tier: "B", capacity: "$158 M", project: "Altos de la Floresta", source: "WhatsApp", date: "20 jul, 18:31", state: "Validación pendiente", priority: "Media", phone: "+57 300 192 7745", email: "paula.m@email.com", affiliate: "Por validar", route: "Validación", subsidy: "Por validar", horizon: "3–6 meses" },
  { id: "lead-004", name: "Jorge Salazar", initials: "JS", score: 64, tier: "C", capacity: "$172 M", project: "Senderos de la Sabana", source: "Sitio orgánico", date: "20 jul, 15:06", state: "Nutrición 90 días", priority: "Media", phone: "+57 312 590 4490", email: "jorge.salazar@email.com", affiliate: "No afiliado", route: "Nutrición", subsidy: "No aplica hoy", horizon: "6–12 meses" },
  { id: "lead-005", name: "Carolina Méndez", initials: "CM", score: 48, tier: "D", capacity: "$135 M", project: "Sin asignar", source: "TikTok Ads", date: "20 jul, 12:17", state: "Plan de preparación", priority: "Baja", phone: "+57 310 554 8201", email: "carolina.m@email.com", affiliate: "Afiliada", route: "Nutrición", subsidy: "Potencial", horizon: "+12 meses" },
  { id: "lead-006", name: "Andrés Rivera", initials: "AR", score: 82, tier: "A", capacity: "$195 M", project: "Reserva del Parque", source: "Referido", date: "19 jul, 17:54", state: "En negociación", priority: "Alta", phone: "+57 311 481 3884", email: "andres.r@email.com", affiliate: "Afiliado", route: "Asesor", subsidy: "Aplicable", horizon: "0–3 meses" },
];

export const campaigns = [
  { name: "Vivienda propia Bogotá", channel: "Meta Ads", spend: "$18,4 M", leads: 486, profiled: 421, qualified: 172, affiliates: 148, nurtured: 194, cpl: "$37.860", cpql: "$106.977", score: 71, conversion: "35,4%", status: "Activa" },
  { name: "Subsidio + vivienda", channel: "Google Ads", spend: "$12,8 M", leads: 294, profiled: 271, qualified: 131, affiliates: 119, nurtured: 102, cpl: "$43.537", cpql: "$97.710", score: 79, conversion: "44,6%", status: "Activa" },
  { name: "Apartamentos Sabana", channel: "Instagram", spend: "$8,2 M", leads: 315, profiled: 268, qualified: 88, affiliates: 70, nurtured: 151, cpl: "$26.032", cpql: "$93.181", score: 64, conversion: "27,9%", status: "En revisión" },
  { name: "Entrega inmediata", channel: "TikTok Ads", spend: "$5,6 M", leads: 271, profiled: 212, qualified: 49, affiliates: 31, nurtured: 143, cpl: "$20.664", cpql: "$114.285", score: 58, conversion: "18,1%", status: "Pausada" },
];
