import type {
  EvidenceSource,
  FactValidity,
  HousingProject,
  VirtualTour,
} from "./types";

const VERIFIED_AT = "2026-07-23";
const MULTIPROJECT_URL = "https://heyzine.com/flip-book/1de36642fc.html";

type ProjectSeed = {
  id: string;
  name: string;
  city: string;
  department?: string;
  development: string;
  housingType: HousingProject["housingType"];
  image?: string;
  brochureUrl?: string;
  summary: string;
  totalUnits?: number;
  towers?: number;
  floors?: string;
  elevator?: boolean;
  areas: readonly number[];
  bedrooms?: string;
  finish?: string;
  certification?: string;
  features: readonly string[];
  tourUrls?: readonly string[];
  unavailableTourUrl?: string;
  officialPage?: string;
  priceFromCop?: number;
};

const seeds: readonly ProjectSeed[] = [
  {
    id: "abeto",
    name: "Abeto",
    city: "Bogotá",
    development: "Ciudadela Colsubsidio Calle 80",
    housingType: "NO_VIS",
    image: "/images/projects/abeto.webp",
    summary: "Una torre residencial cerca de parques y de Unicentro de Occidente, donde naturaleza y ciudad conviven.",
    totalUnits: 144,
    towers: 1,
    floors: "7",
    areas: [37, 47],
    bedrooms: "1",
    features: ["Coworking y lavandería", "Terraza comunal", "Zona fitness", "Salón de juegos"],
    tourUrls: ["https://umbra3d.studio/masterplans/ojo-de-pez/abeto/"],
  },
  {
    id: "araucaria",
    name: "Araucaria",
    city: "Bogotá",
    development: "Ciudadela Colsubsidio Calle 80",
    housingType: "NO_VIS",
    image: "/images/projects/araucaria.webp",
    brochureUrl: "https://heyzine.com/flip-book/26d2b013cf.html",
    summary: "Apartamentos con acabados, parqueadero privado y depósito dentro de la Ciudadela Calle 80.",
    totalUnits: 252,
    towers: 4,
    floors: "7",
    elevator: true,
    areas: [74.36, 86.93, 105.4],
    bedrooms: "3",
    finish: "Con acabados",
    features: ["Parqueadero privado y depósito", "Coworking", "Gimnasio", "Terraza con BBQ"],
    tourUrls: ["https://shape.com.co/360/COLSUBSIDIO-AMARILO_ARAUCARIA/"],
  },
  {
    id: "los-nogales",
    name: "Los Nogales",
    city: "Bogotá",
    development: "Ciudadela Colsubsidio Calle 80",
    housingType: "NO_VIS",
    image: "/images/projects/los-nogales.webp",
    brochureUrl: "https://heyzine.com/flip-book/9dd9bf814e.html",
    summary: "Proyecto arquitectónico en la Ciudadela Calle 80 con apartamentos de tres habitaciones y acabados.",
    totalUnits: 168,
    towers: 3,
    floors: "7",
    elevator: true,
    areas: [74, 91],
    bedrooms: "3",
    finish: "Con acabados",
    features: ["Parqueadero privado y depósito", "Coworking", "Gimnasio", "Parque infantil"],
    tourUrls: ["https://shape.com.co/360/COLSUBSIDIO-AMARILO_LOSNOGALES/"],
  },
  {
    id: "pamplona",
    name: "Pamplona",
    city: "Soacha",
    development: "Ciudadela Colsubsidio Maiporé",
    housingType: "VIS",
    image: "/images/projects/pamplona.webp",
    brochureUrl: "https://heyzine.com/flip-book/c159d5d733.html",
    summary: "Proyecto sostenible en Maiporé con cuatro tipologías, zonas verdes y espacios para la comunidad.",
    totalUnits: 488,
    towers: 12,
    floors: "6, 8 y 13",
    areas: [50.25, 58.47, 59.05, 63.49],
    bedrooms: "2 + espacio flexible",
    finish: "Obra gris",
    certification: "EDGE",
    features: ["Cuatro tipologías", "Cancha múltiple", "Zona para mascotas", "Teatrino al aire libre"],
    tourUrls: ["https://storage.net-fs.com/hosting/7532170/18/"],
  },
  {
    id: "la-macarena",
    name: "La Macarena",
    city: "Soacha",
    development: "Ciudadela Colsubsidio Maiporé",
    housingType: "VIS",
    image: "/images/projects/la-macarena.webp",
    brochureUrl: "https://heyzine.com/flip-book/b168b2f5ba.html",
    summary: "Propuesta coliving con espacios para convivencia, bienestar y crecimiento personal.",
    totalUnits: 702,
    floors: "Hasta 10",
    elevator: true,
    areas: [34.94],
    bedrooms: "1 + espacio flexible",
    features: ["Social living y coworking", "Lavandería comunal", "Cancha múltiple", "Parque para mascotas"],
  },
  {
    id: "mongui",
    name: "Monguí",
    city: "Soacha",
    development: "Ciudadela Colsubsidio Maiporé",
    housingType: "VIS",
    image: "/images/projects/mongui.webp",
    brochureUrl: "https://heyzine.com/flip-book/866af8f6a6.html",
    summary: "Proyecto rodeado de naturaleza y cercano al futuro portal de TransMilenio.",
    totalUnits: 860,
    floors: "Hasta 10",
    elevator: true,
    areas: [45.76],
    bedrooms: "2",
    features: ["Salón social con terraza", "Ecogym y yoga", "Senderos peatonales", "Zona de mascotas"],
    tourUrls: ["https://storage.net-fs.com/hosting/7532170/19/"],
  },
  {
    id: "versalles",
    name: "Versalles",
    city: "Soacha",
    development: "Ciudadela Colsubsidio Maiporé",
    housingType: "VIS",
    image: "/images/versalles-porteria-hero.webp",
    brochureUrl: "https://heyzine.com/flip-book/be784b0d5c.html",
    summary: "Proyecto VIS con tres tipologías, amplias zonas recreativas y certificación de construcción sostenible.",
    totalUnits: 560,
    towers: 4,
    floors: "10",
    elevator: true,
    areas: [45.05, 51.41, 56.29],
    bedrooms: "Hasta 3",
    finish: "Obra gris",
    certification: "EDGE",
    priceFromCop: 214_300_000,
    officialPage: "https://www.colsubsidio.com/vivienda/proyectos/soacha/versalles",
    features: ["Tres tipologías", "Cancha múltiple", "Terraza BBQ", "Zona de mascotas"],
    tourUrls: [
      "https://shape.com.co/360/COLSUBSIDIO-Versalles_APTOA",
      "https://shape.com.co/360/COLSUBSIDIO-Versalles_APTOB",
      "https://shape.com.co/360/COLSUBSIDIO-Versalles_APTOC",
      "https://shape.com.co/360/COLSUBSIDIO-Versalles_AMENIDADES",
    ],
  },
  {
    id: "zarzal",
    name: "Zarzal",
    city: "Soacha",
    development: "Ciudadela Colsubsidio Maiporé",
    housingType: "VIS",
    image: "/images/projects/zarzal.webp",
    brochureUrl: "https://heyzine.com/flip-book/56764c1e33.html",
    summary: "Vivienda de interés social en Maiporé con apartamentos funcionales y espacios al aire libre.",
    totalUnits: 504,
    towers: 21,
    floors: "6",
    areas: [39.06, 43.3],
    bedrooms: "2",
    finish: "Obra gris",
    features: ["Parques biosaludables", "Bicicleteros", "Senderos peatonales", "Terraza BBQ"],
    tourUrls: ["https://zarzal.shape.com.co/"],
  },
  {
    id: "bosque-de-arrayan",
    name: "Bosque de Arrayán",
    city: "Tocancipá",
    development: "Sabana Norte",
    housingType: "VIS",
    image: "/images/projects/bosque-arrayan.webp",
    brochureUrl: "https://heyzine.com/flip-book/7f3c85cf46.html",
    summary: "Proyecto sostenible creado en armonía con el entorno verde de la Sabana.",
    totalUnits: 528,
    towers: 11,
    floors: "6",
    elevator: true,
    areas: [48.05],
    bedrooms: "3",
    certification: "EDGE",
    features: ["242 parqueaderos", "Social living y coworking", "Cancha múltiple", "Zona BBQ"],
    tourUrls: ["https://storage.net-fs.com/hosting/8270899/1/"],
  },
  {
    id: "bosque-de-turpial",
    name: "Bosque de Turpial",
    city: "Tocancipá",
    development: "Sabana Norte",
    housingType: "VIS",
    image: "/images/projects/bosque-turpial.webp",
    brochureUrl: "https://heyzine.com/flip-book/5eec0a2afc.html",
    summary: "Vivienda sostenible en Tocancipá con varias tipologías y completas zonas sociales.",
    totalUnits: 432,
    towers: 9,
    floors: "6",
    elevator: true,
    areas: [47, 52.33, 57.52],
    bedrooms: "2 y 3",
    finish: "Obra gris",
    certification: "EDGE",
    features: ["Social living y coworking", "Cancha múltiple", "Gimnasio", "Zona de mascotas"],
    tourUrls: ["https://salasdeventas.com/Turpial_Apto_B/"],
  },
  {
    id: "inari",
    name: "Inari",
    city: "Chía",
    development: "Centro de Chía",
    housingType: "VIS",
    image: "/images/projects/inari.webp",
    brochureUrl: "https://heyzine.com/flip-book/8b6615372f.html",
    summary: "Proyecto urbano a pocas cuadras del parque principal de Chía, universidades y servicios.",
    totalUnits: 594,
    towers: 6,
    floors: "11",
    areas: [35.79],
    bedrooms: "1 o 2",
    features: ["Coworking", "Gimnasio", "Zona pet", "Sala de TV"],
    tourUrls: ["https://umbra3d.studio/recorridos/colsubsidio/inari/41.60mt/"],
  },
  {
    id: "reserva-de-guayacan",
    name: "Reserva de Guayacán",
    city: "Girardot",
    development: "Girardot",
    housingType: "VIS",
    image: "/images/projects/reserva-aguayacan.webp",
    brochureUrl: "https://heyzine.com/flip-book/aa430852c2.html",
    summary: "Proyecto de clima cálido con ubicación estratégica y diferentes opciones de apartamento.",
    totalUnits: 436,
    towers: 4,
    elevator: true,
    areas: [43.53, 52.98, 53.41],
    bedrooms: "2 + espacio flexible",
    finish: "Obra gris",
    features: ["Piscinas para adultos y niños", "Salón social", "Zona BBQ", "Parque infantil"],
    tourUrls: ["https://storage.net-fs.com/hosting/8270899/0/"],
  },
  {
    id: "saman",
    name: "Samán",
    city: "Ricaurte",
    development: "Ricaurte",
    housingType: "VIS",
    image: "/images/projects/saman.webp",
    brochureUrl: "https://heyzine.com/flip-book/1daa8c80c5.html",
    summary: "Entorno cálido con senderos ecológicos, cuerpo de agua y parqueadero comunal 1:1.",
    totalUnits: 280,
    towers: 2,
    floors: "10",
    elevator: true,
    areas: [52.53],
    bedrooms: "2 + espacio flexible",
    features: ["Piscinas para adultos y niños", "Senderos peatonales", "Gimnasio", "Zona BBQ"],
    tourUrls: ["https://storage.net-fs.com/hosting/8321237/0/"],
  },
  {
    id: "payande",
    name: "Payandé",
    city: "Ricaurte",
    development: "Ricaurte",
    housingType: null,
    image: "/images/projects/payande.webp",
    brochureUrl: "https://heyzine.com/flip-book/34ac4d8a9e.html",
    summary: "Proyecto de clima cálido para vivienda, descanso o inversión cerca de Bogotá.",
    totalUnits: 320,
    towers: 6,
    floors: "10",
    elevator: true,
    areas: [44, 56.86],
    bedrooms: "2 o 3",
    finish: "Obra gris",
    features: ["Parqueadero comunal 1:1", "Piscinas para adultos y niños", "Salón social", "Senderos peatonales"],
    unavailableTourUrl: "https://storage.net-fs.com/hosting/6021405/17/",
  },
  {
    id: "vibo-once",
    name: "Vibo Once",
    city: "Bogotá",
    development: "Centro de Bogotá",
    housingType: "VIS",
    image: "/images/projects/vibo-once.webp",
    brochureUrl: "https://heyzine.com/flip-book/d3d1f61d6b.html",
    summary: "Proyecto frente a la futura estación Once del Metro, conectado con la transformación del centro.",
    totalUnits: 310,
    towers: 2,
    floors: "20",
    areas: [42.03, 50.44],
    bedrooms: "2",
    finish: "Obra gris",
    features: ["Coworking", "Lavandería comunal", "Terraza con BBQ", "Parque infantil"],
    tourUrls: ["https://umbra3d.studio/recorridos/colsubsidio/vibo/tipo-a/"],
  },
  {
    id: "karakali",
    name: "Karakalí",
    city: "Bogotá",
    development: "Chapinero",
    housingType: "VIS",
    image: "/images/projects/karakali.webp",
    brochureUrl: "https://heyzine.com/flip-book/5083a3d46c.html",
    summary: "Proyecto coliving cerca del corazón de Bogotá con apartaestudios y amplias zonas sociales.",
    totalUnits: 127,
    towers: 1,
    floors: "16",
    areas: [28.97],
    bedrooms: "1",
    features: ["Coworking", "Lavandería comunal", "Terraza con BBQ", "Sala de juntas"],
    tourUrls: ["https://umbra3d.studio/masterplans/colsubsidio/karakali/"],
  },
  {
    id: "la-arboleda",
    name: "La Arboleda",
    city: "Bogotá",
    development: "San Cristóbal Sur",
    housingType: "VIS",
    image: "/images/projects/la-arboleda.webp",
    summary: "Proyecto en una zona de alta valorización de San Cristóbal Sur, con proyección de nuevas conexiones viales.",
    totalUnits: 1502,
    towers: 14,
    floors: "Hasta 21",
    elevator: true,
    areas: [39.96],
    bedrooms: "2",
    features: ["Salón social", "Terraza BBQ", "Gimnasio", "Salón infantil y juvenil"],
    tourUrls: ["https://umbra3d.studio/recorridos/promotora-convivienda/la-arboleda-apto-tipo-a/"],
  },
  {
    id: "verde-esperanza",
    name: "Verde Esperanza",
    city: "Ubaté",
    development: "Villa de San Diego",
    housingType: "VIS",
    image: "/images/projects/verde-esperanza.webp",
    brochureUrl: "https://heyzine.com/flip-book/ea1997d7ae.html",
    summary: "Proyecto rodeado de entorno natural en Ubaté, con amplios espacios verdes.",
    totalUnits: 440,
    towers: 22,
    floors: "5",
    areas: [49.53],
    bedrooms: "2 + espacio flexible",
    finish: "Obra gris",
    features: ["Zonas verdes", "Salón social", "Zona infantil", "Espacios para la familia"],
  },
];

export const housingProjects = seeds.map(buildProject) satisfies readonly HousingProject[];

function buildProject(seed: ProjectSeed): HousingProject {
  const brochureId = `${seed.id}-approved-brochure`;
  const officialPageId = `${seed.id}-official-page`;
  const baseSourceIds = [brochureId];
  const evidence: EvidenceSource[] = [
    {
      id: brochureId,
      kind: "APPROVED_BROCHURE",
      title: seed.brochureUrl
        ? `Brochure individual de ${seed.name}`
        : `Brochure multiproyecto con ficha de ${seed.name}`,
      url: seed.brochureUrl ?? MULTIPROJECT_URL,
      verifiedAt: VERIFIED_AT,
      materialStatus: "APPROVED",
    },
  ];

  if (seed.officialPage) {
    evidence.push({
      id: officialPageId,
      kind: "OFFICIAL_PROJECT_PAGE",
      title: `Ficha vigente de ${seed.name}`,
      url: seed.officialPage,
      verifiedAt: VERIFIED_AT,
      materialStatus: "LIVE",
    });
  }

  const tours: VirtualTour[] = [];
  seed.tourUrls?.forEach((url, index) => {
    const sourceId = `${seed.id}-tour-${index + 1}`;
    evidence.push({
      id: sourceId,
      kind: "VIRTUAL_TOUR",
      title: `Recorrido virtual de ${seed.name}${seed.tourUrls!.length > 1 ? ` ${index + 1}` : ""}`,
      url,
      verifiedAt: VERIFIED_AT,
      materialStatus: "LIVE",
    });
    tours.push({
      id: sourceId,
      label: seed.tourUrls!.length > 1 ? `Recorrido ${index + 1}` : "Recorrido virtual",
      url,
      availability: "AVAILABLE",
      sourceId,
      verifiedAt: VERIFIED_AT,
    });
  });

  if (seed.unavailableTourUrl) {
    const sourceId = `${seed.id}-tour-unavailable`;
    evidence.push({
      id: sourceId,
      kind: "VIRTUAL_TOUR",
      title: `Recorrido virtual de ${seed.name} no disponible`,
      url: seed.unavailableTourUrl,
      verifiedAt: VERIFIED_AT,
      materialStatus: "LIVE",
    });
    tours.push({
      id: sourceId,
      label: "Recorrido no disponible",
      url: seed.unavailableTourUrl,
      availability: "UNAVAILABLE",
      sourceId,
      verifiedAt: VERIFIED_AT,
    });
  }

  const priceSources = seed.officialPage
    ? [officialPageId]
    : baseSourceIds;

  return {
    id: seed.id,
    name: seed.name,
    location: {
      city: seed.city,
      department: seed.department ?? (seed.city === "Bogotá" ? "Bogotá D.C." : "Cundinamarca"),
      development: seed.development,
    },
    catalogStatus: "COMMERCIAL_MATERIAL_APPROVED",
    housingType: seed.housingType,
    image: seed.image ?? `/images/projects/${seed.id}.webp`,
    brochureUrl: seed.brochureUrl ?? MULTIPROJECT_URL,
    summary: seed.summary,
    totalUnits: fact(seed.totalUnits ?? null, baseSourceIds),
    towers: fact(seed.towers ?? null, baseSourceIds),
    floorsPerTower: fact(seed.floors ?? null, baseSourceIds),
    hasElevator: fact(seed.elevator ?? null, baseSourceIds),
    typologies: seed.areas.map((builtAreaM2, index) => ({
      id: `${seed.id}-tipo-${index + 1}`,
      label: seed.areas.length > 1 ? `Tipología ${index + 1}` : "Tipología disponible",
      builtAreaM2,
      sourceIds: baseSourceIds,
    })),
    bedrooms: fact(seed.bedrooms ?? null, baseSourceIds),
    finish: fact(seed.finish ?? null, baseSourceIds),
    certification: fact(seed.certification ?? null, baseSourceIds),
    priceFromCop: fact(
      seed.priceFromCop ?? null,
      priceSources,
      seed.priceFromCop ? "CURRENT" : "REQUIRES_CONFIRMATION",
    ),
    inventory: fact(null, baseSourceIds, "REQUIRES_CONFIRMATION"),
    deliveryDate: fact(null, baseSourceIds, "REQUIRES_CONFIRMATION"),
    features: seed.features,
    tours,
    evidence,
  };
}

function fact<T>(
  value: T,
  sourceIds: readonly string[],
  validity: FactValidity = "COMMERCIAL_REFERENCE",
) {
  return {
    value,
    sourceIds,
    verifiedAt: VERIFIED_AT,
    validity,
  };
}
