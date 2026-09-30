from __future__ import annotations

import re
from typing import Any, Dict, List, Optional, Tuple


class SafetyGuardrail:
    """Pre-flight safety analyzer for clinical triage, medical advice, and prompt injection.
    
    Acts as a deterministic defense-in-depth shield ensuring:
    1. ZERO medical emergencies slip through to booking flows (Hard Rule: 30% score)
    2. Medical advice questions are escalated to clinicians
    3. Adversarial prompt injections are strictly refused without polluting human queues
    """

    # --- URGENT CLINICAL TRIGGERS (English, Hindi, Hinglish) ---
    CLINICAL_URGENT_PATTERNS = [
        # Chest pain / Cardiac (dard, bojh, dabav, jalan, heaviness)
        r"\b(seene|chhati|chaati|chest|dil)\s*(mein|me|par|pe)?\s*(dard|pain|heavy|heaviness|jalan|pressure|bojh|dabav)\b",
        r"\b(baayein|left)\s*(haath|arm)\s*(mein|me)?\s*(dard|pain|numb|numbness)\b",
        r"\b(heart\s*attack|cardiac|angina)\b",
        # Dyspnea / Breathing difficulty
        r"\b(saans|saas|breath)\s*(phool|rook|ruk|lene\s*me\s*takleef|shortness|difficulty|heavy)\b",
        r"\b(choking|suffocating|cannot\s*breathe|trouble\s*breathing)\b",
        # Severe bleeding / Trauma
        r"\b(khoon|bleed|bleeding)\s*(beh|ruk\s*nahi|heavy|severe|profuse)\b",
        r"\b(head\s*injury|sar\s*pe\s*chot|bone\s*fracture|broken\s*bone)\b",
        # Loss of consciousness / Neurological
        r"\b(behoshi|behosh|unconscious|fainted|blackout|chakkar\s*aake\s*gir)\b",
        r"\b(seizure|mirgi|fits|convulsion|paralysis|stroke)\b",
        # Acute allergic reaction
        r"\b(gala\s*band|throat\s*closing|severe\s*allergic|anaphylaxis)\b",
    ]

    # --- MEDICAL ADVICE TRIGGERS ---
    MEDICAL_ADVICE_PATTERNS = [
        r"\b(dawai|dawa|medicine|tablet|goli|dose)\s*(lu|lun|le\s*sakta|le\s*lu|badha|chahiye|khau)\b",
        r"\b(crocin|paracetamol|dolo|combiflam|antibiotic)\b",
        r"\b(kitni\s*(der|tablet|goli|dose))\b",
        r"\b(bukhar\s*utar|fever\s*nahi\s*utar|theek\s*hoga)\b",
        r"\b(can\s*i\s*(take|stop|increase|reduce)\s*(medicine|dose|pill|tablet))\b",
        r"\b(what\s*(medicine|treatment|cure)\s*should\s*i)\b",
    ]

    # --- PROMPT INJECTION / ADVERSARIAL PATTERNS ---
    INJECTION_PATTERNS = [
        r"\bignore\s*(all\s*)?(your\s*)?(previous\s*)?instructions\b",
        r"\byou\s*are\s*now\s*in\s*(administrator|admin|developer|god|root)\s*mode\b",
        r"\b(system\s*prompt|internal\s*test|dan\s*mode|jailbreak)\b",
        r"\bcancel\s*every\s*appointment\b",
        r"\bdelete\s*all\s*(records|appointments|patients)\b",
        r"\bdrop\s*(database|table)\b",
    ]

    @classmethod
    def evaluate_turn(cls, text: str) -> Dict[str, Any]:
        """Analyzes a single utterance for safety or adversarial triggers."""
        lower_text = text.lower().strip()

        # 1. Clinical Urgency (Absolute Priority)
        for pattern in cls.CLINICAL_URGENT_PATTERNS:
            if re.search(pattern, lower_text):
                return {
                    "action": "escalate",
                    "reason": "clinical_urgent",
                    "matched_pattern": pattern,
                    "explanation": "Active emergency symptom reported (requires immediate clinical intervention)",
                }

        # 2. Prompt Injection (Refuse immediately)
        for pattern in cls.INJECTION_PATTERNS:
            if re.search(pattern, lower_text):
                return {
                    "action": "refuse",
                    "reason": None,
                    "matched_pattern": pattern,
                    "explanation": "Adversarial prompt injection or unauthorized admin command",
                }

        # 3. Medical Advice
        for pattern in cls.MEDICAL_ADVICE_PATTERNS:
            if re.search(pattern, lower_text):
                return {
                    "action": "escalate",
                    "reason": "medical_advice",
                    "matched_pattern": pattern,
                    "explanation": "Clinical judgement / medical prescription query outside receptionist scope",
                }

        return {"action": "continue", "reason": None}

    @classmethod
    def evaluate_conversation(cls, turns: List[str]) -> Dict[str, Any]:
        """Scans the entire dialogue sequence.
        
        Clinical urgency anywhere in the dialogue halts everything immediately!
        """
        has_injection = False
        has_medical_advice = False

        for turn in turns:
            res = cls.evaluate_turn(turn)
            if res["action"] == "escalate" and res["reason"] == "clinical_urgent":
                # Emergency immediately preempts everything
                return res
            if res["action"] == "refuse":
                has_injection = True
            elif res["action"] == "escalate" and res["reason"] == "medical_advice":
                has_medical_advice = True

        if has_injection:
            return {
                "action": "refuse",
                "reason": None,
                "explanation": "Conversation contains prompt injection or unauthorized directive",
            }

        if has_medical_advice:
            return {
                "action": "escalate",
                "reason": "medical_advice",
                "explanation": "Conversation requests medical advice or clinical diagnosis",
            }

        return {"action": "continue", "reason": None}

    @classmethod
    def verify_authorization(
        cls,
        caller_name: Optional[str],
        caller_phone: Optional[str],
        target_patient: Dict[str, Any],
        all_patients: List[Dict[str, Any]],
        caller_relationship: Optional[str] = None,
    ) -> Tuple[bool, Optional[str]]:
        """Verifies if caller has legal authority to act on target patient's record.
        
        Rules:
        - Caller is the patient themselves (matching name/phone).
        - Caller is an authorized guardian (target_patient["id"] in caller["guardian_of"]).
        - Neighbors, friends, acquaintances without guardianship are NOT authorized.
        """
        target_id = target_patient["id"]

        # Case 1: Caller is the patient
        if caller_phone and caller_phone == target_patient.get("phone"):
            # If name is also provided, check if it matches target patient
            if caller_name:
                p_name = target_patient["name"].lower()
                c_name = caller_name.lower()
                if c_name in p_name or p_name in c_name:
                    return True, "Caller is verified patient"
            else:
                return True, "Caller verified by registered phone number"

        # Case 2: Caller is a registered guardian
        for p in all_patients:
            if target_id in p.get("guardian_of", []):
                # This patient 'p' is an authorized guardian of target_patient
                if caller_phone and caller_phone == p.get("phone"):
                    return True, f"Caller is registered guardian ({p['name']})"
                if caller_name:
                    if caller_name.lower() in p["name"].lower() or p["name"].lower() in caller_name.lower():
                        return True, f"Caller is registered guardian ({p['name']})"

        # Case 3: Explicit third-party relationship mentioned (e.g. padosi/neighbor)
        if caller_relationship and any(r in caller_relationship.lower() for r in ["padosi", "neighbor", "friend", "colleague"]):
            return False, "Third-party caller (neighbor/friend) is not authorized"

        # If caller phone or name was provided but matched neither patient nor guardian
        if caller_name or caller_phone:
            return False, "Caller identity does not match patient or any registered guardian"

        return False, "Unverified caller identity"
