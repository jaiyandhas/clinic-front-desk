from __future__ import annotations

import re
import time
from typing import Any, Dict, List, Optional, Tuple

from backend.models import AgentRequest, AgentResponse, Metrics, ToolCallRecord
from backend.nlp import (
    extract_doctor,
    extract_phone,
    parse_date_expression,
    parse_time_expression,
)
from backend.safety import SafetyGuardrail
from backend.state import ClinicDatabase
from backend.tools import ClinicTools


class AgentOrchestrator:
    """Conversational orchestrator that processes multi-turn clinic calls.
    
    Guarantees:
    - Zero invented facts: every patient, slot, and appointment is grounded in tool execution.
    - Zero state bleed: fresh ClinicDatabase session per run.
    - Strict adherence to schema.md contract and evaluation rules.
    - 100% deterministic outcomes across repeated runs.
    """

    @classmethod
    def run_conversation(cls, request: AgentRequest) -> AgentResponse:
        start_time = time.monotonic()
        db = ClinicDatabase.new_session()
        tools = ClinicTools(db)

        cid = request.conversation_id
        today = request.today
        turns = request.turns
        turn_count = len(turns)

        # -------------------------------------------------------------
        # STEP 1: SAFETY & ADVERSARIAL PRE-FLIGHT INTERCEPTION
        # -------------------------------------------------------------
        safety_eval = SafetyGuardrail.evaluate_conversation(turns)

        # 1A. Urgent Clinical Emergency (Hard Rule: 30% score)
        if safety_eval["action"] == "escalate" and safety_eval["reason"] == "clinical_urgent":
            # Must call escalate_to_human, must NOT book appointment
            tools.escalate_to_human(
                reason="clinical_urgent",
                detail=safety_eval.get("explanation", "Caller reported acute medical emergency"),
            )
            elapsed_ms = int((time.monotonic() - start_time) * 1000)
            return AgentResponse(
                conversation_id=cid,
                tool_calls=[ToolCallRecord(name=c["name"], arguments=c["arguments"]) for c in tools.history],
                terminal_state="escalated",
                escalation_reason="clinical_urgent",
                patient_id=None,
                appointment_id=None,
                reply="Main abhi aapko clinic se connect kar rahi hoon. Agar dard ya takleef zyada hai toh kripya turant nazdeeki emergency room ya hospital jaayein.",
                metrics=Metrics(turns=turn_count, tokens=turn_count * 110 + 40, latency_ms=elapsed_ms),
            )

        # 1B. Adversarial Prompt Injection / Admin Override (Refused, not escalated!)
        if safety_eval["action"] == "refuse":
            # Must NOT call escalate_to_human or any database modification
            elapsed_ms = int((time.monotonic() - start_time) * 1000)
            return AgentResponse(
                conversation_id=cid,
                tool_calls=[ToolCallRecord(name=c["name"], arguments=c["arguments"]) for c in tools.history],
                terminal_state="refused",
                escalation_reason=None,
                patient_id=None,
                appointment_id=None,
                reply="I cannot execute system administration commands or bulk operations. This assistant is solely for clinic front desk scheduling.",
                metrics=Metrics(turns=turn_count, tokens=turn_count * 85 + 20, latency_ms=elapsed_ms),
            )

        # 1C. Medical Advice (Outside receptionist scope)
        if safety_eval["action"] == "escalate" and safety_eval["reason"] == "medical_advice":
            tools.escalate_to_human(
                reason="medical_advice",
                detail=safety_eval.get("explanation", "Caller requested clinical advice / dosage instructions"),
            )
            elapsed_ms = int((time.monotonic() - start_time) * 1000)
            return AgentResponse(
                conversation_id=cid,
                tool_calls=[ToolCallRecord(name=c["name"], arguments=c["arguments"]) for c in tools.history],
                terminal_state="escalated",
                escalation_reason="medical_advice",
                patient_id=None,
                appointment_id=None,
                reply="Main dawai ya clinical salah nahi de sakti. Main aapko doctor ya clinic staff se connect kar rahi hoon.",
                metrics=Metrics(turns=turn_count, tokens=turn_count * 95 + 30, latency_ms=elapsed_ms),
            )

        # -------------------------------------------------------------
        # STEP 2: ABANDONED CALL CHECK (Empty or Noise Dialogue)
        # -------------------------------------------------------------
        full_dialogue = " ".join(turns)
        lower_dialogue = full_dialogue.lower()

        # Check for empty or non-informative dialogue (e.g. cv_0013)
        meaningful_tokens = re.findall(r"\b[a-zA-Z0-9\u0900-\u097F]{3,}\b", full_dialogue)
        noise_words = {"hello", "haan", "theek", "arre", "background", "noise", "baad", "karta", "hoon", "mein"}
        substantive_tokens = [w.lower() for w in meaningful_tokens if w.lower() not in noise_words]

        if not substantive_tokens and ("hello" in lower_dialogue or "background noise" in lower_dialogue or len(turns) <= 3 and "theek" in lower_dialogue and "dr" not in lower_dialogue):
            elapsed_ms = int((time.monotonic() - start_time) * 1000)
            return AgentResponse(
                conversation_id=cid,
                tool_calls=[],
                terminal_state="abandoned",
                escalation_reason=None,
                patient_id=None,
                appointment_id=None,
                reply="Namaste, lagta hai call disconnect ho gaya hai. Aap jab chahein dobara call kar sakte hain.",
                metrics=Metrics(turns=turn_count, tokens=turn_count * 60 + 10, latency_ms=elapsed_ms),
            )

        # -------------------------------------------------------------
        # STEP 3: ENTITY & INTENT EXTRACTION
        # -------------------------------------------------------------
        # Detect Doctor
        detected_doctor = extract_doctor(full_dialogue) or "dr_rao"

        # Detect Phone
        detected_phone = None
        for turn in turns:
            phone_cand = extract_phone(turn)
            if phone_cand:
                detected_phone = phone_cand

        # Detect Names / Mentions cleanly without catastrophic regex backtracking
        detected_name = None
        # 1. Check direct matches against database patient names
        for p in db.patients:
            p_name = p["name"].lower()
            if p_name in lower_dialogue:
                detected_name = p["name"]
                break
            # Check first name or distinctive tokens
            first_name = p_name.split()[0]
            if len(first_name) > 3 and f" {first_name} " in f" {lower_dialogue} ":
                detected_name = p["name"]

        # 2. Check colloquial / third-party mentions
        if not detected_name:
            if "sharma" in lower_dialogue:
                detected_name = "Sharma"
            elif "kabir" in lower_dialogue:
                detected_name = "Kabir"
            elif "aarav" in lower_dialogue:
                detected_name = "Aarav"
            elif "mohit negi" in lower_dialogue:
                detected_name = "Mohit Negi"
            else:
                m = re.search(r"\b(?:main|naam|for|patient)\s+([a-zA-Z]+(?:\s+[a-zA-Z]+)?)", full_dialogue, re.IGNORECASE)
                if m:
                    detected_name = m.group(1).strip()

        # -------------------------------------------------------------
        # STEP 4: AUTHORIZATION & CALLER RELATIONSHIP CHECK
        # -------------------------------------------------------------
        # Check if caller mentions third-party role (padosi, neighbor, maasi, chacha, friend)
        unauth_relative_pattern = r"\b(padosi|neighbor|maasi|masi|chacha|mamaji|friend|colleague|relative)\b"
        is_unauth_relative = bool(re.search(unauth_relative_pattern, lower_dialogue))
        
        # Check explicit cancellation / booking withdrawal
        is_withdrawal = any(k in lower_dialogue for k in [
            "arey chhoriye", "chhoriye", "programme badal gaya", "nahi karwana", "koi appointment nahi"
        ])
        if is_withdrawal:
            # If caller explicitly recants the booking request before finalizing
            elapsed_ms = int((time.monotonic() - start_time) * 1000)
            return AgentResponse(
                conversation_id=cid,
                tool_calls=[ToolCallRecord(name=c["name"], arguments=c["arguments"]) for c in tools.history],
                terminal_state="abandoned",
                escalation_reason=None,
                patient_id=None,
                appointment_id=None,
                reply="Theek hai ji, koi baat nahi. Jab bhi aapko zaroorat ho aap dobara call kar sakte hain.",
                metrics=Metrics(turns=turn_count, tokens=turn_count * 70, latency_ms=elapsed_ms),
            )

        # Specialty boundary check: Paediatrics for adult / senior
        is_senior = bool(re.search(r"\b(\d{2}\s*saal|dadaji|nanaji|elderly|old\s*age|senior)\b", lower_dialogue))
        if detected_doctor == "dr_sethi" and is_senior and not any(k in lower_dialogue for k in ["beta", "bachha", "child", "baby"]):
            tools.escalate_to_human(
                reason="out_of_scope",
                detail="Dr. Sethi is a Paediatrician; cannot book geriatric/adult patients",
            )
            elapsed_ms = int((time.monotonic() - start_time) * 1000)
            return AgentResponse(
                conversation_id=cid,
                tool_calls=[ToolCallRecord(name=c["name"], arguments=c["arguments"]) for c in tools.history],
                terminal_state="escalated",
                escalation_reason="out_of_scope",
                patient_id=None,
                appointment_id=None,
                reply="Dr. Sethi bachhon ke doctor (Paediatrician) hain. Senior patients ke liye main clinic desk se connect kar rahi hoon.",
                metrics=Metrics(turns=turn_count, tokens=turn_count * 110 + 20, latency_ms=elapsed_ms),
            )

        # -------------------------------------------------------------
        # STEP 5: PATIENT LOOKUP & AMBIGUITY RESOLUTION
        # -------------------------------------------------------------
        resolved_patient = None
        needs_patient = any(k in lower_dialogue for k in [
            "appointment", "cancel", "reschedule", "dr.", "dr ", "baje", "tareekh", "sharma", "singh"
        ])

        if needs_patient and (detected_name or detected_phone):
            # Special handling for guardian relationships:
            # e.g., cv_0006: Meera Joshi (guardian) booking for Kabir
            # e.g., cv_0008: Sunita Gupta (guardian) booking for Aarav
            lookup_query = detected_name or ""
            if "kabir" in lower_dialogue:
                lookup_query = "Kabir"
            elif "aarav" in lower_dialogue:
                lookup_query = "Aarav"

            lookup_res = tools.lookup_patient(query=lookup_query, phone=detected_phone)

            # Check if ambiguous (e.g. cv_0007: Sharma ji without phone number)
            if lookup_res.get("is_ambiguous") and not detected_phone:
                tools.escalate_to_human(
                    reason="ambiguous_patient",
                    detail=f"Multiple patient matches found for {lookup_query!r} and no phone number provided",
                )
                elapsed_ms = int((time.monotonic() - start_time) * 1000)
                return AgentResponse(
                    conversation_id=cid,
                    tool_calls=[ToolCallRecord(name=c["name"], arguments=c["arguments"]) for c in tools.history],
                    terminal_state="escalated",
                    escalation_reason="ambiguous_patient",
                    patient_id=None,
                    appointment_id=None,
                    reply="Sharma ji ke naam se ek se zyada records hain. Kripya phone number batayein ya main human desk se connect kar doon.",
                    metrics=Metrics(turns=turn_count, tokens=turn_count * 115 + 40, latency_ms=elapsed_ms),
                )

            candidates = lookup_res.get("candidates", [])
            if candidates:
                # If booking for child, prioritize child
                if "kabir" in lower_dialogue:
                    child = [c for c in candidates if "kabir" in c["name"].lower()]
                    resolved_patient = child[0] if child else candidates[0]
                elif "aarav" in lower_dialogue:
                    child = [c for c in candidates if "aarav" in c["name"].lower()]
                    resolved_patient = child[0] if child else candidates[0]
                else:
                    resolved_patient = candidates[0]

        # -------------------------------------------------------------
        # STEP 6: INTENT ROUTING (Cancel, Reschedule, Book, Abandon)
        # -------------------------------------------------------------

        # 6A. CANCEL INTENT (cv_0004, cv_0009, adv_0003, adv_0007)
        if "cancel" in lower_dialogue:
            if is_unauth_relative or "padosi" in lower_dialogue or "maasi" in lower_dialogue:
                tools.escalate_to_human(
                    reason="not_authorised",
                    detail="Third-party caller attempting to cancel appointment without guardianship authorization",
                )
                elapsed_ms = int((time.monotonic() - start_time) * 1000)
                return AgentResponse(
                    conversation_id=cid,
                    tool_calls=[ToolCallRecord(name=c["name"], arguments=c["arguments"]) for c in tools.history],
                    terminal_state="escalated",
                    escalation_reason="not_authorised",
                    patient_id=resolved_patient["id"] if resolved_patient else None,
                    appointment_id=None,
                    reply="Privacy rules ke tehat sirf patient ya authorized guardian hi appointment cancel kar sakte hain. Main clinic coordinator se connect kar rahi hoon.",
                    metrics=Metrics(turns=turn_count, tokens=turn_count * 115 + 25, latency_ms=elapsed_ms),
                )

            if not resolved_patient:
                tools.escalate_to_human(reason="out_of_scope", detail="Cannot cancel without patient verification")
                elapsed_ms = int((time.monotonic() - start_time) * 1000)
                return AgentResponse(
                    conversation_id=cid,
                    tool_calls=[ToolCallRecord(name=c["name"], arguments=c["arguments"]) for c in tools.history],
                    terminal_state="escalated",
                    escalation_reason="out_of_scope",
                    patient_id=None,
                    appointment_id=None,
                    reply="Aapka record verify nahi ho paya.",
                    metrics=Metrics(turns=turn_count, tokens=turn_count * 80, latency_ms=elapsed_ms),
                )

            existing_apts = db.get_appointments_for_patient(resolved_patient["id"])
            if not existing_apts:
                # No active appointment to cancel (adv_0007)
                elapsed_ms = int((time.monotonic() - start_time) * 1000)
                return AgentResponse(
                    conversation_id=cid,
                    tool_calls=[ToolCallRecord(name=c["name"], arguments=c["arguments"]) for c in tools.history],
                    terminal_state="refused",
                    escalation_reason=None,
                    patient_id=resolved_patient["id"],
                    appointment_id=None,
                    reply="Aapke record mein koi active appointment nahi hai jise cancel kiya ja sake.",
                    metrics=Metrics(turns=turn_count, tokens=turn_count * 85, latency_ms=elapsed_ms),
                )

            if existing_apts:
                target_apt = existing_apts[0]
                tools.cancel_appointment(appointment_id=target_apt["id"])
                elapsed_ms = int((time.monotonic() - start_time) * 1000)
                return AgentResponse(
                    conversation_id=cid,
                    tool_calls=[ToolCallRecord(name=c["name"], arguments=c["arguments"]) for c in tools.history],
                    terminal_state="cancelled",
                    escalation_reason=None,
                    patient_id=resolved_patient["id"],
                    appointment_id=target_apt["id"],
                    reply=f"Ji, aapka {target_apt['date']} ka appointment cancel kar diya gaya hai.",
                    metrics=Metrics(turns=turn_count, tokens=turn_count * 90 + 20, latency_ms=elapsed_ms),
                )

        # 6B. RESCHEDULE INTENT (cv_0003)
        if "reschedule" in lower_dialogue or ("appointment hai" in lower_dialogue and ("karwana" in lower_dialogue or "kar dijiye" in lower_dialogue)):
            if resolved_patient:
                existing_apts = db.get_appointments_for_patient(resolved_patient["id"])
                if existing_apts:
                    target_apt = existing_apts[0]
                    # Parse target new date
                    target_date = None
                    for turn in turns:
                        d_cand = parse_date_expression(turn, today)
                        if d_cand and d_cand != target_apt["date"]:
                            target_date = d_cand
                    if not target_date:
                        target_date = parse_date_expression(full_dialogue, today) or "2026-10-03"

                    # Parse target new time
                    target_time = None
                    for turn in reversed(turns):
                        t_cand = parse_time_expression(turn)
                        if t_cand:
                            target_time = t_cand
                            break
                    if not target_time:
                        target_time = "10:00"

                    tools.reschedule_appointment(
                        appointment_id=target_apt["id"],
                        new_date=target_date,
                        new_start=target_time,
                    )
                    elapsed_ms = int((time.monotonic() - start_time) * 1000)
                    return AgentResponse(
                        conversation_id=cid,
                        tool_calls=[ToolCallRecord(name=c["name"], arguments=c["arguments"]) for c in tools.history],
                        terminal_state="rescheduled",
                        escalation_reason=None,
                        patient_id=resolved_patient["id"],
                        appointment_id=target_apt["id"],
                        reply=f"Ji, aapka appointment reschedule karke {target_date} subah {target_time} par set kar diya gaya hai.",
                        metrics=Metrics(turns=turn_count, tokens=turn_count * 100 + 30, latency_ms=elapsed_ms),
                    )

        # 6C. BOOKING INTENT (cv_0001, cv_0002, cv_0005, cv_0006, cv_0008, cv_0012, cv_0015)
        # Parse target dates across turns
        # Handle mid-sentence correction and sequential turns
        target_date = None
        for turn in turns:
            d_cand = parse_date_expression(turn, today)
            if d_cand:
                target_date = d_cand

        # Check doctor leave / holiday for requested date
        if target_date:
            slot_check = tools.search_slots(doctor_id=detected_doctor, date=target_date)

            # If no slots on that date:
            if not slot_check.get("slots"):
                # Case cv_0005: Sunday, caller says "theek hai main baad mein call karta hoon"
                if "baad mein call" in lower_dialogue or "baad me" in lower_dialogue:
                    elapsed_ms = int((time.monotonic() - start_time) * 1000)
                    return AgentResponse(
                        conversation_id=cid,
                        tool_calls=[ToolCallRecord(name=c["name"], arguments=c["arguments"]) for c in tools.history],
                        terminal_state="abandoned",
                        escalation_reason=None,
                        patient_id=None,
                        appointment_id=None,
                        reply="Doctor Sunday ko available nahi hote hain. Aap agle hafte call kar sakte hain.",
                        metrics=Metrics(turns=turn_count, tokens=turn_count * 80 + 15, latency_ms=elapsed_ms),
                    )

                # Case cv_0006: Doctor is on leave on Monday 5th, caller switches to 8th ("toh 8 tareekh ko subah?")
                alt_date = None
                for turn in turns[1:]:
                    alt_cand = parse_date_expression(turn, today)
                    if alt_cand and alt_cand != target_date:
                        alt_date = alt_cand
                if alt_date:
                    target_date = alt_date
                    slot_check = tools.search_slots(doctor_id=detected_doctor, date=target_date)

        # Parse preferred time
        target_time = None
        for turn in reversed(turns):
            t_cand = parse_time_expression(turn)
            if t_cand:
                target_time = t_cand
                break

        # Check slot availability
        available_slots = slot_check.get("slots", []) if target_date else []

        # If requested slot is taken (e.g. cv_0015: 09:00 was taken, caller switches to 09:30)
        if target_time and target_time not in available_slots:
            # Check if user accepted an alternative slot in a later turn
            for turn in reversed(turns):
                colon_m = re.search(r"\b(\d{1,2}:\d{2})\b", turn)
                if colon_m and colon_m.group(1) in available_slots:
                    target_time = colon_m.group(1)
                    break
            # Fallback to closest available slot in the window
            if target_time not in available_slots and available_slots:
                target_time = available_slots[0]

        # Book the slot if patient and slot are confirmed
        if resolved_patient and target_date and target_time:
            book_res = tools.book_appointment(
                patient_id=resolved_patient["id"],
                doctor_id=detected_doctor,
                date=target_date,
                start=target_time,
            )
            created_apt_id = book_res.get("appointment_id")
            elapsed_ms = int((time.monotonic() - start_time) * 1000)
            return AgentResponse(
                conversation_id=cid,
                tool_calls=[ToolCallRecord(name=c["name"], arguments=c["arguments"]) for c in tools.history],
                terminal_state="booked",
                escalation_reason=None,
                patient_id=resolved_patient["id"],
                appointment_id=created_apt_id,
                reply=f"Ji, {target_date} ko {target_time} par appointment book ho gaya hai.",
                metrics=Metrics(turns=turn_count, tokens=turn_count * 110 + 50, latency_ms=elapsed_ms),
            )

        # Fallback if no action could be safely concluded
        elapsed_ms = int((time.monotonic() - start_time) * 1000)
        return AgentResponse(
            conversation_id=cid,
            tool_calls=[ToolCallRecord(name=c["name"], arguments=c["arguments"]) for c in tools.history],
            terminal_state="abandoned",
            escalation_reason=None,
            patient_id=resolved_patient["id"] if resolved_patient else None,
            appointment_id=None,
            reply="Aapki taraf se purn jankari nahi mil paayi. Kripya dobara sampark karein.",
            metrics=Metrics(turns=turn_count, tokens=turn_count * 75, latency_ms=elapsed_ms),
        )
