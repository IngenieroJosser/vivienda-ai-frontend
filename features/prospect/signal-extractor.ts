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

  extractAffiliation(profile, text);
  extractConcern(profile, text);
  extractLocation(profile, text);
  extractHorizon(profile, text);
  extractHousehold(profile, text);
  extractIncome(profile, text);
  extractObligations(profile, text);
  extractSavings(profile, text);
  extractGoal(profile, text);

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
  else if (/(3 a 6 meses|entre 3 y 6|seis meses)/.test(text)) profile.horizon = "3_6";
  else if (/(6 a 12 meses|entre 6 y 12|este ano)/.test(text)) profile.horizon = "6_12";
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
  if (/(mas de 4 salarios|superior a 4 salarios)/.test(text)) profile.incomeRange = "HIGH";
  else if (/(entre 2 y 4 salarios|2 a 4 salarios|dos a cuatro salarios)/.test(text)) profile.incomeRange = "MID";
  else if (/(hasta 2 salarios|menos de 2 salarios|uno o dos salarios)/.test(text)) profile.incomeRange = "LOW";
  else if (/(prefiero.{0,15}despues|no se.{0,15}ingreso)/.test(text)) profile.incomeRange = "UNKNOWN";
}

function extractObligations(profile: ProfileAnswers, text: string): void {
  if (/(no tengo (deudas|obligaciones)|sin (deudas|obligaciones)|menos del 15)/.test(text)) profile.obligations = "LOW";
  else if (/(algunas deudas|entre 15.{0,10}30|deudas moderadas)/.test(text)) profile.obligations = "MEDIUM";
  else if (/(muchas deudas|mas del 30|muy endeudad)/.test(text)) profile.obligations = "HIGH";
  else if (/(no se.{0,15}(deudas|obligaciones)|no tengo claro.{0,15}(deudas|obligaciones))/.test(text)) profile.obligations = "UNKNOWN";
}

function extractSavings(profile: ProfileAnswers, text: string): void {
  if (/(no tengo (ahorro|cuota inicial)|sin ahorro|me preocupa no tener.{0,20}cuota inicial)/.test(text)) profile.savings = "NONE";
  else if (/(estoy ahorrando|ahorro poco|construyendo.{0,15}ahorro|tengo algo ahorrado)/.test(text)) profile.savings = "PARTIAL";
  else if (/(ya tengo (ahorro|la cuota inicial)|cuento con (ahorro|la cuota inicial)|tengo una base de ahorro)/.test(text)) profile.savings = "READY";
}

function extractGoal(profile: ProfileAnswers, text: string): void {
  if (/(vivir|para mi familia|para mi hij|casa propia|comprar este ano)/.test(text)) profile.dreamGoal = "BUY_THIS_YEAR";
  else if (/(prepararme|mas adelante|a largo plazo)/.test(text)) profile.dreamGoal = "PREPARE";
  else if (/(conocer proyectos|ver opciones|comparar proyectos)/.test(text)) profile.dreamGoal = "FIND_MATCHES";
  else if (/(conocer subsid|revisar subsid|beneficios)/.test(text)) profile.dreamGoal = "BENEFITS";
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
