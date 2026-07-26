import type { ProfileAnswers, ProfileField } from "../conversation/domain";
import type { ConversationAction, DiscoveryContext } from "./domain";

export type SignalExtraction = {
  profile: ProfileAnswers;
  discovery: DiscoveryContext;
  fields: ProfileField[];
  requestsAdvisor: boolean;
};

export function extractProspectSignals(
  message: string,
  expectedAction: ConversationAction,
): SignalExtraction {
  const text = normalize(message);
  const profile: ProfileAnswers = {};
  const discovery = extractDiscovery(message, text, expectedAction);

  extractExpectedReply(profile, message, text, expectedAction);
  extractAffiliation(profile, text);
  extractConcern(profile, text);
  extractLocation(profile, text);
  extractHorizon(profile, text);
  extractHousehold(profile, text);
  extractIncome(profile, text);
  extractObligations(profile, text);
  extractSavings(profile, text);
  extractGoal(profile, text);
  extractContactDetails(profile, message, text);

  return {
    profile,
    discovery,
    fields: Object.keys(profile) as ProfileField[],
    requestsAdvisor: /(asesor|asesora|que me llamen|llamenme|contactenme|hablar con (alguien|una persona))/i.test(text),
  };
}

function extractDiscovery(
  rawMessage: string,
  text: string,
  expectedAction: ConversationAction,
): DiscoveryContext {
  const message = rawMessage.trim().replace(/\s+/g, " ").slice(0, 600);
  const discovery: DiscoveryContext = {};

  if (expectedAction === "OPEN_DISCOVERY") discovery.housingVision = message;
  if (expectedAction === "DISCOVER_MOTIVATION") discovery.motivation = message;
  if (expectedAction === "DISCOVER_OBSTACLE") discovery.obstacle = message;
  if (expectedAction === "DISCOVER_ADVANCE_NEED") discovery.advanceNeed = message;

  if (/(mi hij[oa]|mis hij[oa]s)/.test(text)) discovery.intendedFor = "Para vivir con sus hijos";
  else if (/(mi familia|nuestra familia)/.test(text)) discovery.intendedFor = "Para vivir con su familia";
  else if (/(mi pareja|mi espos[oa])/.test(text)) discovery.intendedFor = "Para vivir con su pareja";
  else if (/(solo yo|para mi solo|para mi sola)/.test(text)) discovery.intendedFor = "Para vivir de manera independiente";

  if (
    /(pago arriendo|dejar de (arrendar|pagar arriendo)|familia crecio|necesita mas espacio|nacio|independizar|ahora que|cambio de trabajo)/.test(
      text,
    )
  ) {
    discovery.motivation = message;
  }
  if (/(me preocupa|me frena|obstaculo|no tengo ahorro|cuota inicial|muchas deudas)/.test(text)) {
    discovery.obstacle = message;
  }
  if (/(necesito (saber|entender|aclarar)|quiero saber|me ayudaria|para avanzar)/.test(text)) {
    discovery.advanceNeed = message;
  }

  return discovery;
}

function extractAffiliation(profile: ProfileAnswers, text: string): void {
  if (/(no (estoy|soy) afiliad|no afiliad)/.test(text)) profile.affiliation = "NON_AFFILIATE";
  else if (/(si (estoy|soy) afiliad|soy afiliad|estoy afiliad)/.test(text)) profile.affiliation = "AFFILIATE";
  else if (/(no (se|estoy segur).{0,20}afiliad|afiliacion.{0,15}no se)/.test(text)) profile.affiliation = "UNKNOWN";
}

function extractConcern(profile: ProfileAnswers, text: string): void {
  if (/(subsid|beneficio)/.test(text)) profile.mainConcern = "BENEFITS";
  else if (/(cuota inicial|cuota|pagar|alcanza|presupuesto|dinero)/.test(text)) profile.mainConcern = "PAYMENT";
  else if (/(espacio|habitacion|familia|hij[oa]s?)/.test(text)) profile.mainConcern = "SPACE";
  else if (/(ubicacion|zona|cerca|transporte)/.test(text)) profile.mainConcern = "LOCATION";
}

function extractLocation(profile: ProfileAnswers, text: string): void {
  if (/soacha/.test(text)) profile.location = "SOACHA";
  else if (/bogota/.test(text)) profile.location = "BOGOTA";
  else if (/(sabana|chia|cajica|mosquera|funza)/.test(text)) profile.location = "SABANA";
  else if (/(no se.{0,20}(zona|ubicacion)|cualquier zona)/.test(text)) profile.location = "UNSURE";
}

function extractHorizon(profile: ProfileAnswers, text: string): void {
  if (/(proximos? 3 meses|menos de 3 meses|ya|cuanto antes|inmediato)/.test(text)) profile.horizon = "0_3";
  else if (/(3 a 6 meses|3 y 6 meses|entre 3 y 6|seis meses)/.test(text)) profile.horizon = "3_6";
  else if (/(6 a 12 meses|6 y 12 meses|entre 6 y 12|este ano)/.test(text)) profile.horizon = "6_12";
  else if (/(despues de (un|1) ano|mas de (un|1) ano|largo plazo|aun no tengo fecha)/.test(text)) profile.horizon = "12_PLUS";
}

function extractHousehold(profile: ProfileAnswers, text: string): void {
  const people = text.match(/\b([1-4])\s*(personas?|integrantes?)/)?.[1];
  if (people) {
    profile.householdSize = Number(people) >= 4 ? "4_PLUS" : people;
    return;
  }
  if (/(solo yo|viviria solo|vivir sola)/.test(text)) profile.householdSize = "1";
  else if (/(espos[oa].{0,20}(dos|2) hij|dos hij[oa]s)/.test(text)) profile.householdSize = "4_PLUS";
  else if (/(pareja|espos[oa]|mi hij[oa])/.test(text)) profile.householdSize = "2";
  else if (/(familia|hij[oa]s)/.test(text)) profile.householdSize = "3";
}

function extractIncome(profile: ProfileAnswers, text: string): void {
  if (/(mas de|mayor a|superior a|desde)\s+(4|7)\s*(millones?|millon|salarios|smmlv)/.test(text)) profile.incomeRange = "HIGH";
  else if (/((entre\s+)?(2|dos|3|tres)\s*(a|y|-)\s*(4|cuatro|7|siete)\s*(millones?|millon|salarios|smmlv)|entre 2 y 4 salarios|2 a 4 salarios|dos a cuatro salarios)/.test(text)) profile.incomeRange = "MID";
  else if (/((hasta|menos de|menor a|maximo|max)\s+(2|3)\s*(millones?|millon|salarios|smmlv)|hasta 2 salarios|menos de 2 salarios|uno o dos salarios)/.test(text)) profile.incomeRange = "LOW";
  else if (/(prefiero.{0,25}despues|validarlo.{0,25}despues|no se.{0,35}(ingreso|salario|sueldo|rango))/.test(text)) profile.incomeRange = "UNKNOWN";
  else if (
    /(ingres\w*|ganamos|gano|salario|sueldo|recibimos|recibo|recibe|devengamos|devengo|devenga)/.test(
      text,
    )
  ) {
    const value = extractMoneyValues(text)[0] ?? 0;
    if (value) profile.incomeRange = incomeBand(value);
  }
}

function extractExpectedReply(
  profile: ProfileAnswers,
  rawMessage: string,
  text: string,
  expectedAction: ConversationAction,
): void {
  if (expectedAction === "FINANCIAL_CONTEXT") {
    const values = extractMoneyValues(text);
    if (
      !profile.incomeRange &&
      values.length === 1 &&
      !/(deuda|obligacion|cuota|tarjeta|ahorro|ahorrad|cesantia)/.test(text)
    ) {
      profile.incomeRange = incomeBand(values[0]!);
    }
    if (/(bajas?|ninguna|sin deudas?|pocas?)/.test(text)) {
      profile.obligations = "LOW";
    } else if (/(intermedias?|medias?|moderadas?|algunas?)/.test(text)) {
      profile.obligations = "MEDIUM";
    } else if (/(altas?|muchas?|elevadas?)/.test(text)) {
      profile.obligations = "HIGH";
    }
    if (/(ya tengo|tengo una base|list[oa]|cesantias)/.test(text)) {
      profile.savings = "READY";
    } else if (/(estoy ahorrando|parcial|algo|construyendo)/.test(text)) {
      profile.savings = "PARTIAL";
    } else if (/(aun no|todavia no|no tengo|sin ahorro)/.test(text)) {
      profile.savings = "NONE";
    }
  } else if (expectedAction === "obligations") {
    if (/(bajas?|ninguna|sin deudas?|pocas?)/.test(text)) profile.obligations = "LOW";
    else if (/(intermedias?|medias?|moderadas?|algunas?)/.test(text)) profile.obligations = "MEDIUM";
    else if (/(altas?|muchas?|elevadas?)/.test(text)) profile.obligations = "HIGH";
  } else if (expectedAction === "savings") {
    if (/(ya tengo|tengo una base|list[oa]|cesantias)/.test(text)) profile.savings = "READY";
    else if (/(estoy ahorrando|parcial|algo|construyendo)/.test(text)) profile.savings = "PARTIAL";
    else if (/(aun no|todavia no|no tengo|sin ahorro)/.test(text)) profile.savings = "NONE";
  } else if (expectedAction === "homeOwnership") {
    if (/(no tengo|no tenemos|nunca)/.test(text)) profile.homeOwnership = "NO";
    else if (/(si tengo|si tenemos|ya tengo|propietari[oa])/.test(text)) profile.homeOwnership = "YES";
    else if (/(prefiero|despues|no se|no estoy segur)/.test(text)) profile.homeOwnership = "UNKNOWN";
  } else if (expectedAction === "creditStatus") {
    if (/(al dia|sin reportes|buen historial)/.test(text)) profile.creditStatus = "CURRENT";
    else if (/(revisar|revisarlo|reportad|mora|atrasad)/.test(text)) profile.creditStatus = "REQUIRES_REVIEW";
    else if (/(no se|no estoy segur)/.test(text)) profile.creditStatus = "UNKNOWN";
  } else if (expectedAction === "visitIntent") {
    if (/(visita|sala de ventas|conocer el proyecto)/.test(text)) profile.visitIntent = "VISIT";
    else if (/(llamada|llamen|telefono|asesor)/.test(text)) {
      profile.visitIntent = "CALL";
      profile.preferredChannel = "PHONE";
    } else if (/(ver|revisar|comparar).{0,25}proyectos?/.test(text)) profile.visitIntent = "REVIEW_FIRST";
    else if (/(por mi cuenta|sin contacto|no quiero contacto)/.test(text)) profile.visitIntent = "SELF_SERVICE";
  } else if (expectedAction === "contactConsent") {
    if (/(no autorizo|no gracias|prefiero no|sin contacto)/.test(text)) profile.contactConsent = "NO";
    else if (/(si|autorizo|de acuerdo|acepto)/.test(text)) profile.contactConsent = "YES";
  } else if (expectedAction === "fullName") {
    const name = extractFullName(rawMessage);
    if (name) profile.fullName = name;
  } else if (expectedAction === "preferredChannel") {
    const channel = extractPreferredChannel(text);
    if (channel) profile.preferredChannel = channel;
  } else if (expectedAction === "phone") {
    const phone = extractPhone(rawMessage);
    if (phone) profile.phone = phone;
  } else if (expectedAction === "email") {
    const email = extractEmail(rawMessage);
    if (email) profile.email = email;
  } else if (expectedAction === "contactTimePreference") {
    const time = extractContactTime(text);
    if (time) profile.contactTimePreference = time;
  }
}

function extractObligations(profile: ProfileAnswers, text: string): void {
  if (/(no tengo (deudas|obligaciones)|sin (deudas|obligaciones)|menos del 15)/.test(text)) profile.obligations = "LOW";
  else if (/(algunas deudas|entre 15.{0,10}30|deudas moderadas)/.test(text)) profile.obligations = "MEDIUM";
  else if (/(muchas deudas|mas del 30|muy endeudad)/.test(text)) profile.obligations = "HIGH";
  else if (/(no se.{0,35}(deudas|obligaciones)|no tengo claro.{0,35}(deudas|obligaciones))/.test(text)) profile.obligations = "UNKNOWN";
  else if (/(deuda|deudas|creditos|cuotas|obligaciones|tarjetas)/.test(text)) {
    const value = Math.min(...extractMoneyValues(text));
    if (Number.isFinite(value)) {
      profile.obligations =
        value < 1_000_000 ? "LOW" : value < 2_500_000 ? "MEDIUM" : "HIGH";
    }
  }
}

function extractSavings(profile: ProfileAnswers, text: string): void {
  if (/(no tengo (ahorro|cuota inicial)|sin ahorro|me preocupa no tener.{0,20}cuota inicial)/.test(text)) profile.savings = "NONE";
  else if (/(estoy ahorrando|ahorro poco|construyendo.{0,15}ahorro|tengo algo ahorrado)/.test(text)) profile.savings = "PARTIAL";
  else if (/(ya tengo (ahorro|la cuota inicial)|cuento con (ahorro|la cuota inicial)|tengo una base de ahorro)/.test(text)) profile.savings = "READY";
  else if (
    /\b\d+(?:[.,]\d+)?\s*(?:millones?|millon|mil|k)?\s+ahorrad[oa]s?\b/.test(
      text,
    )
  ) profile.savings = "READY";
}

function extractMoneyValues(text: string): number[] {
  return Array.from(
    text.matchAll(/\b(\d+(?:[.,]\d+)?)\s*(millones?|millon|mil|k)?\b/g),
    ([, raw, unit]) => {
      let value = Number(raw.replace(",", "."));
      if (unit?.startsWith("millon")) value *= 1_000_000;
      else if (unit === "mil" || unit === "k") value *= 1_000;
      return value >= 1_000 ? Math.round(value) : 0;
    },
  ).filter((value) => value > 0);
}

function incomeBand(value: number): "LOW" | "MID" | "HIGH" {
  if (value < 3_000_000) return "LOW";
  if (value < 7_000_000) return "MID";
  return "HIGH";
}

function extractGoal(profile: ProfileAnswers, text: string): void {
  if (/(vivir|para mi familia|para mi hij|casa propia|comprar este ano)/.test(text)) profile.dreamGoal = "BUY_THIS_YEAR";
  else if (/(prepararme|mas adelante|a largo plazo)/.test(text)) profile.dreamGoal = "PREPARE";
  else if (/(conocer proyectos|ver opciones|comparar proyectos)/.test(text)) profile.dreamGoal = "FIND_MATCHES";
  else if (/(conocer subsid|revisar subsid|beneficios)/.test(text)) profile.dreamGoal = "BENEFITS";
}

function extractContactDetails(
  profile: ProfileAnswers,
  rawMessage: string,
  text: string,
): void {
  const phone = extractPhone(rawMessage);
  if (phone) profile.phone = phone;
  const email = extractEmail(rawMessage);
  if (email) profile.email = email;
  const channel = extractPreferredChannel(text);
  if (
    channel &&
    /(prefiero|contact|escrib|llam|canal|whatsapp|correo)/.test(text)
  ) {
    profile.preferredChannel = channel;
  }
}

function extractFullName(message: string): string | undefined {
  const candidate = message
    .trim()
    .replace(/^(?:mi nombre es|me llamo|soy)\s+/i, "")
    .replace(/\s+/g, " ")
    .replace(/^[ .,-]+|[ .,-]+$/g, "");
  if (
    candidate.length < 2 ||
    candidate.length > 120 ||
    !/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:[ '\-][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+){0,5}$/.test(candidate)
  ) {
    return undefined;
  }
  return candidate
    .toLocaleLowerCase("es-CO")
    .replace(
      /(^|[ '\-])([a-záéíóúüñ])/g,
      (_match, separator: string, letter: string) =>
        `${separator}${letter.toLocaleUpperCase("es-CO")}`,
    );
}

function extractPhone(message: string): string | undefined {
  const candidate = message.match(
    /(?:\+?57[\s.-]?)?(?:3\d{2})(?:[\s.-]?\d){7}/,
  )?.[0];
  if (!candidate) return undefined;
  let digits = candidate.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("57")) digits = digits.slice(2);
  return digits.length === 10 && digits.startsWith("3") ? digits : undefined;
}

function extractEmail(message: string): string | undefined {
  return message
    .match(/\b[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}\b/i)?.[0]
    ?.toLowerCase();
}

function extractPreferredChannel(
  text: string,
): "WHATSAPP" | "PHONE" | "EMAIL" | undefined {
  if (/(whatsapp|wsp|mensaje)/.test(text)) return "WHATSAPP";
  if (/(llamada|telefono|celular)/.test(text)) return "PHONE";
  if (/(correo|email|e mail)/.test(text)) return "EMAIL";
  return undefined;
}

function extractContactTime(
  text: string,
): "WEEKDAY_MORNING" | "WEEKDAY_AFTERNOON" | "SATURDAY" | "ANY" | undefined {
  if (/(sabado|fin de semana)/.test(text)) return "SATURDAY";
  if (/(tarde|despues del mediodia)/.test(text)) return "WEEKDAY_AFTERNOON";
  if (/(manana|antes del mediodia)/.test(text)) return "WEEKDAY_MORNING";
  if (/(cualquier|cuando puedan|me da igual|indiferente)/.test(text)) return "ANY";
  return undefined;
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[¿?¡!.,;:]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
