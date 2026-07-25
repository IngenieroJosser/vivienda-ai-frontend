#!/usr/bin/env python3
"""
Seed 4 prospectos canónicos para el demo del domingo 26/07/2026.

Workaround: inserta directo en la BD SQLite porque el endpoint POST
/api/v1/leads/sync tiene un bug (`SESSION_VERSION_IN_PROGRESS`) que
bloquea toda creación de leads nuevos vía API. Josser debe arreglarlo.

Crea:
  1. Jonathan — afiliado, ingresos altos, ahorro listo    → READY_TO_CLOSE
  2. Camila  — afiliada, ingresos bajos, sin ahorro       → NURTURE
  3. Laura   — NO afiliada, ingresos medios               → NON_AFFILIATE_REVIEW
  4. Andres  — comprador previo, ahorro listo             → READY_TO_CLOSE

Uso:
  cd vivienda-ai-frontend
  python3 scripts/seed-demo-leads.py
"""
from __future__ import annotations

import json
import sqlite3
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

DB_PATH = Path(__file__).resolve().parents[2] / "vivienda-ai-backend" / "vivienda_match.db"
NOW = datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def make_lead(
    first_name: str,
    profile: dict,
    discovery: dict,
    route: str,
    recommendations: list[dict],
    handoff: dict | None,
    priority: str = "MEDIUM",
    readiness_level: str = "INITIAL",
    workflow_state: str | None = None,
) -> str:
    """Inserta un lead + journey + workflow + handoff. Devuelve lead_id."""
    lead_id = str(uuid.uuid4())
    session_id = f"demo-{first_name.lower()}-{uuid.uuid4().hex[:8]}"

    journey = {
        "lead_id": lead_id,
        "session_id": session_id,
        "session_version": 1,
        "persisted": True,
        "readiness": {
            "level": readiness_level,
            "factors": ["Perfil sintético de demo"],
            "blockers": [],
            "missing_fields": [],
        },
        "route": route,
        "capacity": {
            "estimated_amount": None,
            "estimated_monthly_payment": None,
            "disclaimer": "Estimación orientativa; no constituye aprobación crediticia.",
        },
        "nurture_plan": (
            {
                "primary_gap": "Ahorro inicial",
                "target_amount": None,
                "review_date": "2026-12-31",
                "status": "ACTIVE",
                "intervention_required": False,
                "milestones": [
                    {"id": "m1", "label": "Definir fecha objetivo", "completed": False, "completed_at": None},
                    {"id": "m2", "label": "Apertura de cuenta de ahorro", "completed": False, "completed_at": None},
                ],
            }
            if route == "NURTURE"
            else None
        ),
        "recommendations": recommendations,
        "handoff": handoff or {
            "requested": False,
            "status": "NOT_REQUESTED",
            "channel": None,
            "time_preference": None,
            "requested_at": None,
            "project_ids": [],
            "next_action": "Esperar solicitud de contacto del prospecto.",
        },
        "evaluated_at": NOW,
    }

    cur = DB_PATH.parent.glob("**/vivienda_match.db")
    db_files = list(cur)
    if not db_files:
        print(f"❌ No encuentro la BD en {DB_PATH}")
        sys.exit(1)
    conn = sqlite3.connect(str(db_files[0]))
    try:
        # 1. leads
        conn.execute(
            """INSERT INTO leads
            (id, session_id, first_name, source, campaign, content, is_paid,
             status, customer_relationship, consent_accepted_at,
             profile_json, discovery_json, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                lead_id, session_id, first_name, "meta", "demo", "home", 1,
                "IN_PROGRESS", "NEW", NOW,
                json.dumps(profile), json.dumps(discovery), NOW, NOW,
            ),
        )

        # 2. journey state
        conn.execute(
            """INSERT INTO lead_journey_states
            (lead_id, session_version, response_json, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)""",
            (lead_id, 1, json.dumps(journey), NOW, NOW),
        )

        # 3. workflow si hay handoff solicitado
        if handoff and handoff.get("status") == "REQUESTED":
            sla_due = NOW.replace("Z", "+00:00")  # placeholder
            # Calcular SLA en 4 horas para el demo
            sla_due_dt = datetime.now(timezone.utc)
            sla_due_dt = sla_due_dt.replace(microsecond=0)
            conn.execute(
                """INSERT INTO lead_commercial_workflows
                (lead_id, state, workflow_version, assigned_advisor_id,
                 contact_requested_at, sla_due_at, next_action, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    lead_id, workflow_state or "PENDING", 1, None,
                    NOW, NOW, "Tomar la oportunidad.", NOW, NOW,
                ),
            )

        conn.commit()
        return lead_id
    finally:
        conn.close()


def make_recommendations(route: str, name: str) -> list[dict]:
    """Genera 2-3 recomendaciones plausibles según la ruta."""
    if route == "READY_TO_CLOSE":
        return [
            {
                "project_id": "araucaria",
                "project_name": "Araucaria",
                "rank": 1,
                "reasons": [
                    f"Compatible con perfil de {name}",
                    "Tiene proyectos vigentes en la zona de interés",
                ],
                "brochure_url": "https://heyzine.com/flip-book/26d2b013cf.html",
                "tour_urls": ["https://shape.com.co/360/COLSUBSIDIO-AMARILO_ARAUCARIA/"],
                "purpose": "MATCH",
            },
            {
                "project_id": "inari",
                "project_name": "Inari",
                "rank": 2,
                "reasons": [f"Apto para {name}"],
                "brochure_url": None,
                "tour_urls": [],
                "purpose": "MATCH",
            },
        ]
    if route == "NURTURE":
        return []  # Nurture no muestra proyectos incompatibles
    if route == "NON_AFFILIATE_REVIEW":
        return [
            {
                "project_id": "los-nogales",
                "project_name": "Los Nogales",
                "rank": 1,
                "reasons": ["Proyecto abierto sin afiliación"],
                "brochure_url": None,
                "tour_urls": [],
                "purpose": "REFERENCE",
            }
        ]
    return []


def main():
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("Insertando 4 prospectos directamente en la BD")
    print("(workaround para el bug SESSION_VERSION_IN_PROGRESS del backend)")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

    # 1. Jonathan — afiliado, listo
    jonathan = make_lead(
        first_name="Jonathan",
        profile={
            "affiliation": "AFFILIATE",
            "location": "Bogotá",
            "income_range": "SMLV_8_10",
            "obligations": "low",
            "savings": "ready",
            "horizon": "0_3",
            "household_size": "3",
            "subsidy_interest": "yes",
        },
        discovery={
            "housing_vision": "PRIMARY",
            "intended_for": "FAMILY",
            "motivation": "Mejor ubicación",
            "obstacle": "",
            "advance_need": "",
        },
        route="READY_TO_CLOSE",
        priority="HIGH",
        readiness_level="HIGH",
        recommendations=make_recommendations("READY_TO_CLOSE", "Jonathan"),
        handoff={
            "requested": True,
            "status": "REQUESTED",
            "channel": "WHATSAPP",
            "time_preference": "Mañana 9-12",
            "requested_at": NOW,
            "project_ids": [],
            "next_action": "Registrar el primer intento de contacto.",
        },
    )
    print(f"  ✓ Jonathan (READY_TO_CLOSE) → {jonathan}")

    # 2. Camila — afiliada, sin ahorro
    camila = make_lead(
        first_name="Camila",
        profile={
            "affiliation": "AFFILIATE",
            "location": "Soacha",
            "income_range": "SMLV_1_2",
            "obligations": "medium",
            "savings": "none",
            "horizon": "6_12",
            "household_size": "2",
            "subsidy_interest": "yes",
        },
        discovery={
            "housing_vision": "PRIMARY",
            "intended_for": "COUPLE",
            "motivation": "Primer hogar",
            "obstacle": "Sin ahorro inicial",
            "advance_need": "Ahorro programado",
        },
        route="NURTURE",
        priority="LOW",
        readiness_level="INITIAL",
        recommendations=make_recommendations("NURTURE", "Camila"),
        handoff=None,  # Nurture: no handoff, no workflow
    )
    print(f"  ✓ Camila (NURTURE) → {camila}")

    # 3. Laura — no afiliada
    laura = make_lead(
        first_name="Laura",
        profile={
            "affiliation": "NON_AFFILIATE",
            "location": "Bogotá",
            "income_range": "SMLV_4_6",
            "obligations": "low",
            "savings": "partial",
            "horizon": "3_6",
            "household_size": "1",
            "subsidy_interest": "no",
        },
        discovery={
            "housing_vision": "INVESTMENT",
            "intended_for": "SINGLE",
            "motivation": "Inversión",
            "obstacle": "",
            "advance_need": "Validar capacidad sin afiliación",
        },
        route="NON_AFFILIATE_REVIEW",
        priority="MEDIUM",
        readiness_level="DEVELOPING",
        recommendations=make_recommendations("NON_AFFILIATE_REVIEW", "Laura"),
        handoff={
            "requested": True,
            "status": "REQUESTED",
            "channel": "PHONE",
            "time_preference": "Tarde 14-17",
            "requested_at": NOW,
            "project_ids": [],
            "next_action": "Validar capacidad crediticia sin afiliación.",
        },
    )
    print(f"  ✓ Laura (NON_AFFILIATE_REVIEW) → {laura}")

    # 4. Andrés — comprador previo
    andres = make_lead(
        first_name="Andres",
        profile={
            "affiliation": "AFFILIATE",
            "location": "Bogotá",
            "income_range": "SMLV_6_8",
            "obligations": "low",
            "savings": "ready",
            "horizon": "0_3",
            "household_size": "4",
            "subsidy_interest": "yes",
            "previous_buyer": "true",
            "previous_project": "Ciudadela Maiporé",
            "previous_purchase_year": "2021",
        },
        discovery={
            "housing_vision": "UPGRADE",
            "intended_for": "FAMILY",
            "motivation": "Mejoramiento",
            "obstacle": "",
            "advance_need": "Hablar con asesor de upgrade",
        },
        route="READY_TO_CLOSE",
        priority="HIGH",
        readiness_level="HIGH",
        recommendations=make_recommendations("READY_TO_CLOSE", "Andres"),
        handoff={
            "requested": True,
            "status": "REQUESTED",
            "channel": "EMAIL",
            "time_preference": "Cualquier horario",
            "requested_at": NOW,
            "project_ids": [],
            "next_action": "Cliente previo — priorizar atención.",
        },
    )
    print(f"  ✓ Andres (READY_TO_CLOSE) → {andres}")

    print("")
    print("Resumen: 4 prospectos insertados.")
    print("  - Jonathan → listo para asesor (READYA_TO_CLOSE, handoff REQUESTED)")
    print("  - Camila  → en plan de nutrición (NURTURE, sin handoff)")
    print("  - Laura   → revisión sin afiliación (NON_AFFILIATE_REVIEW)")
    print("  - Andres  → comprador previo, listo (READY_TO_CLOSE)")
    print("")
    print("⚠ Workaround: el endpoint POST /leads/sync tiene un bug")
    print("  que Josser debe arreglar. Por eso este script va directo a la BD.")


if __name__ == "__main__":
    main()
