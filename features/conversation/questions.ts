import type { ProfileField, Question } from "./domain";

export const consentQuestion: Question = {
  id: "consent",
  prompt: "¿Nos autorizas a usar la información disponible para personalizar tu orientación?",
  explanation: "El avance se guardará en este dispositivo. Si prefieres, puedes continuar sin usar la información conocida.",
  options: [
    { value: "USE_KNOWN_DATA", label: "Sí, continuar con la información conocida" },
    { value: "START_FRESH", label: "Prefiero empezar sin usarla" },
    { value: "DECLINED", label: "Finalizar la orientación" },
  ],
};

export const questionBank: Record<ProfileField, Question> = {
  affiliation: {
    id: "affiliation",
    prompt: "Para mostrarte las rutas adecuadas, ¿actualmente estás afiliado a Colsubsidio?",
    options: [
      { value: "AFFILIATE", label: "Sí, estoy afiliado(a)" },
      { value: "NON_AFFILIATE", label: "No estoy afiliado(a)" },
      { value: "UNKNOWN", label: "No estoy seguro(a)" },
    ],
  },
  dreamGoal: {
    id: "dreamGoal",
    prompt: "Queremos empezar por lo importante: ¿qué te gustaría lograr?",
    options: [
      { value: "BUY_THIS_YEAR", label: "Comprar vivienda este año" },
      { value: "FIND_MATCHES", label: "Encontrar proyectos que se ajusten a mí" },
      { value: "PREPARE", label: "Prepararme para comprar más adelante" },
      { value: "BENEFITS", label: "Conocer subsidios y beneficios" },
    ],
  },
  mainConcern: {
    id: "mainConcern",
    prompt: "¿Qué sería lo más importante en tu nueva vivienda?",
    options: [
      { value: "PAYMENT", label: "Una cuota que pueda manejar" },
      { value: "LOCATION", label: "Buena ubicación" },
      { value: "SPACE", label: "Espacio para mi familia" },
      { value: "BENEFITS", label: "Aprovechar beneficios disponibles" },
    ],
  },
  location: {
    id: "location",
    prompt: "¿En qué zona te imaginas viviendo?",
    options: [
      { value: "SOACHA", label: "Soacha" },
      { value: "BOGOTA", label: "Bogotá" },
      { value: "SABANA", label: "Sabana de Bogotá" },
      { value: "UNSURE", label: "Todavía no lo sé" },
    ],
  },
  horizon: {
    id: "horizon",
    prompt: "¿Cuándo te gustaría hacer realidad la compra?",
    options: [
      { value: "0_3", label: "En los próximos 3 meses" },
      { value: "3_6", label: "Entre 3 y 6 meses" },
      { value: "6_12", label: "Entre 6 y 12 meses" },
      { value: "12_PLUS", label: "Después de 12 meses" },
    ],
  },
  householdSize: {
    id: "householdSize",
    prompt: "¿Cuántas personas vivirían contigo?",
    options: [
      { value: "1", label: "Solo yo" },
      { value: "2", label: "2 personas" },
      { value: "3", label: "3 personas" },
      { value: "4_PLUS", label: "4 o más personas" },
    ],
  },
  incomeRange: {
    id: "incomeRange",
    prompt: "¿En qué rango están los ingresos mensuales de tu hogar?",
    explanation: "Usamos rangos para estimar opciones realistas; no representa una aprobación de crédito.",
    options: [
      { value: "LOW", label: "Hasta 2 salarios mínimos" },
      { value: "MID", label: "Entre 2 y 4 salarios mínimos" },
      { value: "HIGH", label: "Más de 4 salarios mínimos" },
      { value: "UNKNOWN", label: "Prefiero responder después" },
    ],
  },
  obligations: {
    id: "obligations",
    prompt: "Para estimar una cuota responsable, ¿qué parte de tus ingresos ya está comprometida en otras obligaciones?",
    explanation: "La suma de obligaciones y una futura cuota de vivienda no debería superar el 40 % de los ingresos del hogar.",
    options: [
      { value: "LOW", label: "Menos del 15%" },
      { value: "MEDIUM", label: "Entre 15% y 30%" },
      { value: "HIGH", label: "Más del 30%" },
      { value: "UNKNOWN", label: "No lo sé" },
    ],
  },
  savings: {
    id: "savings",
    prompt: "¿Ya cuentas con algún ahorro para comenzar?",
    options: [
      { value: "READY", label: "Sí, tengo una base de ahorro" },
      { value: "PARTIAL", label: "Estoy construyendo mi ahorro" },
      { value: "NONE", label: "Todavía no tengo ahorro" },
      { value: "UNKNOWN", label: "Prefiero responder después" },
    ],
  },
  subsidyInterest: {
    id: "subsidyInterest",
    prompt: "¿En qué estado está tu revisión de subsidios o beneficios?",
    options: [
      { value: "HAS", label: "Ya tengo un beneficio confirmado" },
      { value: "WANTS_REVIEW", label: "Quiero revisar si podría aplicar" },
      { value: "NOT_REVIEWED", label: "Aún no lo he revisado" },
      { value: "UNKNOWN", label: "No estoy seguro(a)" },
    ],
  },
  visitIntent: {
    id: "visitIntent",
    prompt: "Si encontramos una opción adecuada, ¿te gustaría conversar con un asesor?",
    options: [
      { value: "YES", label: "Sí, quiero avanzar" },
      { value: "LATER", label: "Prefiero hacerlo más adelante" },
      { value: "UNSURE", label: "Todavía no estoy seguro(a)" },
    ],
  },
};

export const allQuestions: Record<Question["id"], Question> = {
  consent: consentQuestion,
  ...questionBank,
};
