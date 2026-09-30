from __future__ import annotations

import copy
import datetime
import json
import os
import pathlib
import threading
from typing import Any, Dict, List, Optional, Tuple

CLINIC_JSON_PATH = pathlib.Path(__file__).resolve().parent.parent / "swasthiq-front-desk-agent-starter-pack" / "clinic.json"
if not CLINIC_JSON_PATH.exists():
    # Alternative path if in parent or same dir
    alt = pathlib.Path(__file__).resolve().parent / "clinic.json"
    if alt.exists():
        CLINIC_JSON_PATH = alt


class ClinicDatabase:
    """In-memory clinic database with transactional isolation and concurrency locking.
    
    Guarantees:
    - Zero state bleed between conversations (reloaded or snapshotted per run)
    - Concurrency lock protecting slot reservations from double-booking race conditions
    - Full grounding: the tool layer is the only source of truth
    """
    _global_lock = threading.RLock()
    _base_data: Optional[Dict[str, Any]] = None

    def __init__(self, data: Optional[Dict[str, Any]] = None):
        if data is not None:
            self._data = copy.deepcopy(data)
        else:
            self._data = copy.deepcopy(self.get_base_data())
        self._lock = threading.RLock()

    @classmethod
    def get_base_data(cls) -> Dict[str, Any]:
        with cls._global_lock:
            if cls._base_data is None:
                if not CLINIC_JSON_PATH.exists():
                    raise FileNotFoundError(f"clinic.json not found at {CLINIC_JSON_PATH}")
                with open(CLINIC_JSON_PATH, "r", encoding="utf-8") as f:
                    cls._base_data = json.load(f)
            return cls._base_data

    @classmethod
    def reload_base(cls) -> None:
        with cls._global_lock:
            with open(CLINIC_JSON_PATH, "r", encoding="utf-8") as f:
                cls._base_data = json.load(f)

    @classmethod
    def new_session(cls) -> "ClinicDatabase":
        """Spawns an isolated session starting from clinic.json exactly as shipped."""
        return cls(cls.get_base_data())

    # --- Properties ---
    @property
    def clinic(self) -> Dict[str, Any]:
        return self._data["clinic"]

    @property
    def doctors(self) -> List[Dict[str, Any]]:
        return self._data["doctors"]

    @property
    def patients(self) -> List[Dict[str, Any]]:
        return self._data["patients"]

    @property
    def appointments(self) -> List[Dict[str, Any]]:
        return self._data["appointments"]

    @property
    def holidays(self) -> List[str]:
        return self._data.get("holidays", [])

    # --- Helper methods ---
    def get_doctor(self, doctor_id_or_name: str) -> Optional[Dict[str, Any]]:
        query = doctor_id_or_name.lower().strip()
        for doc in self.doctors:
            if doc["id"].lower() == query:
                return doc
            if query in doc["name"].lower() or doc["name"].lower() in query:
                return doc
            # Handle "dr rao", "dr. rao", "rao", "sethi"
            clean_name = doc["name"].lower().replace(".", "").replace("dr ", "")
            clean_query = query.replace(".", "").replace("dr ", "")
            if clean_query in clean_name or clean_name in clean_query:
                return doc
        return None

    def get_patient_by_id(self, patient_id: str) -> Optional[Dict[str, Any]]:
        for p in self.patients:
            if p["id"] == patient_id:
                return p
        return None

    def get_appointment_by_id(self, appointment_id: str) -> Optional[Dict[str, Any]]:
        for a in self.appointments:
            if a["id"] == appointment_id:
                return a
        return None

    def get_appointments_for_patient(self, patient_id: str) -> List[Dict[str, Any]]:
        return [a for a in self.appointments if a["patient_id"] == patient_id and a["status"] == "booked"]

    @staticmethod
    def _add_minutes(time_str: str, minutes: int) -> str:
        h, m = map(int, time_str.split(":"))
        total = h * 60 + m + minutes
        return f"{total // 60:02d}:{total % 60:02d}"

    @staticmethod
    def get_day_name(date_str: str) -> str:
        """Returns 3-letter day name ('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun')."""
        dt = datetime.date.fromisoformat(date_str)
        return dt.strftime("%a")

    # --- Core Tool Data Operations ---

    def search_slots(self, doctor_id_or_name: str = "", date: str = "", doctor_id: str = "") -> Dict[str, Any]:
        """Calculates free slots for a doctor on a given date."""
        target_doc = doctor_id or doctor_id_or_name
        with self._lock:
            doc = self.get_doctor(target_doc)
            if not doc:
                return {"error": f"Doctor '{target_doc}' not found", "slots": []}

            # Check clinic holidays
            if date in self.holidays:
                return {
                    "doctor_id": doc["id"],
                    "doctor_name": doc["name"],
                    "date": date,
                    "reason": "clinic_holiday",
                    "message": f"Clinic is closed on holiday ({date})",
                    "slots": [],
                }

            # Check doctor leave
            if date in doc.get("leave_dates", []):
                return {
                    "doctor_id": doc["id"],
                    "doctor_name": doc["name"],
                    "date": date,
                    "reason": "doctor_on_leave",
                    "message": f"{doc['name']} is on leave on {date}",
                    "slots": [],
                }

            day_name = self.get_day_name(date)
            # Find windows matching the day of the week
            matching_windows = [w for w in doc.get("windows", []) if w["day"] == day_name]
            if not matching_windows:
                return {
                    "doctor_id": doc["id"],
                    "doctor_name": doc["name"],
                    "date": date,
                    "reason": "no_working_window",
                    "message": f"{doc['name']} does not have consultation hours on {day_name}s",
                    "slots": [],
                }

            slot_minutes = self.clinic.get("slot_minutes", 15)
            generated_slots = set()

            for window in matching_windows:
                cur = window["start"]
                end = window["end"]
                while True:
                    next_time = self._add_minutes(cur, slot_minutes)
                    if next_time > end:
                        break
                    generated_slots.add(cur)
                    cur = next_time

            # Filter existing bookings for this doctor and date
            booked_slots = set()
            for apt in self.appointments:
                if (
                    apt["doctor_id"] == doc["id"]
                    and apt["date"] == date
                    and apt["status"] == "booked"
                ):
                    booked_slots.add(apt["start"])

            available_slots = sorted(list(generated_slots - booked_slots))

            return {
                "doctor_id": doc["id"],
                "doctor_name": doc["name"],
                "date": date,
                "slots": available_slots,
                "total_available": len(available_slots),
            }

    def book_appointment(
        self, patient_id: str, doctor_id_or_name: str, date: str, start: str
    ) -> Dict[str, Any]:
        """Atomically books an appointment. Prevents double-booking race conditions."""
        with self._lock:
            patient = self.get_patient_by_id(patient_id)
            if not patient:
                return {"success": False, "error": f"Patient '{patient_id}' not found"}

            doc = self.get_doctor(doctor_id_or_name)
            if not doc:
                return {"success": False, "error": f"Doctor '{doctor_id_or_name}' not found"}

            # Verify slot is genuinely free
            slot_info = self.search_slots(doc["id"], date)
            if start not in slot_info.get("slots", []):
                return {
                    "success": False,
                    "error": f"Slot {start} on {date} is not available for {doc['name']}",
                    "reason": slot_info.get("reason", "slot_already_booked_or_invalid"),
                }

            slot_minutes = self.clinic.get("slot_minutes", 15)
            end = self._add_minutes(start, slot_minutes)

            # Generate new appointment ID: find max existing ID number
            max_id = 0
            for apt in self.appointments:
                aid = apt.get("id", "")
                if aid.startswith("ap_"):
                    try:
                        num = int(aid[3:])
                        if num > max_id:
                            max_id = num
                    except ValueError:
                        pass
            new_id = f"ap_{max_id + 1:04d}"

            new_appointment = {
                "id": new_id,
                "patient_id": patient["id"],
                "doctor_id": doc["id"],
                "date": date,
                "start": start,
                "end": end,
                "status": "booked",
            }

            self.appointments.append(new_appointment)

            return {
                "success": True,
                "appointment": new_appointment,
                "appointment_id": new_id,
                "message": f"Appointment {new_id} booked for {patient['name']} with {doc['name']} on {date} at {start}",
            }

    def reschedule_appointment(
        self, appointment_id: str, new_date: str, new_start: str
    ) -> Dict[str, Any]:
        """Atomically reschedules an existing appointment to a new slot."""
        with self._lock:
            apt = self.get_appointment_by_id(appointment_id)
            if not apt:
                return {"success": False, "error": f"Appointment '{appointment_id}' not found"}

            if apt["status"] != "booked":
                return {
                    "success": False,
                    "error": f"Appointment '{appointment_id}' cannot be rescheduled because status is '{apt['status']}'",
                }

            doc = self.get_doctor(apt["doctor_id"])
            if not doc:
                return {"success": False, "error": f"Doctor '{apt['doctor_id']}' not found"}

            # Temporarily mark old appointment as rescheduled/cancelled so its slot can be re-evaluated if same day
            old_status = apt["status"]
            old_date = apt["date"]
            old_start = apt["start"]
            old_end = apt["end"]
            apt["status"] = "cancelled"

            try:
                slot_info = self.search_slots(doc["id"], new_date)
                if new_start not in slot_info.get("slots", []):
                    apt["status"] = old_status  # Rollback
                    return {
                        "success": False,
                        "error": f"Slot {new_start} on {new_date} is not available for {doc['name']}",
                    }

                slot_minutes = self.clinic.get("slot_minutes", 15)
                new_end = self._add_minutes(new_start, slot_minutes)

                apt["date"] = new_date
                apt["start"] = new_start
                apt["end"] = new_end
                apt["status"] = "booked"

                return {
                    "success": True,
                    "appointment": apt,
                    "appointment_id": apt["id"],
                    "message": f"Appointment {apt['id']} rescheduled to {new_date} at {new_start}",
                }
            except Exception as e:
                apt["status"] = old_status
                apt["date"] = old_date
                apt["start"] = old_start
                apt["end"] = old_end
                raise e

    def cancel_appointment(self, appointment_id: str) -> Dict[str, Any]:
        """Cancels an existing appointment."""
        with self._lock:
            apt = self.get_appointment_by_id(appointment_id)
            if not apt:
                return {"success": False, "error": f"Appointment '{appointment_id}' not found"}

            if apt["status"] == "cancelled":
                return {
                    "success": False,
                    "error": f"Appointment '{appointment_id}' is already cancelled",
                }

            apt["status"] = "cancelled"
            return {
                "success": True,
                "appointment_id": apt["id"],
                "message": f"Appointment {apt['id']} has been cancelled",
            }

    def lookup_patient(self, query: str, phone: Optional[str] = None) -> Dict[str, Any]:
        """Looks up patients by name and/or phone.
        
        Returns all matching candidates. Never arbitrarily picks one if ambiguous!
        """
        clean_query = query.strip().lower() if query else ""
        clean_phone = phone.strip() if phone else ""
        matches = []

        # If phone is provided, match by phone first
        if clean_phone:
            phone_matches = [p for p in self.patients if p["phone"] == clean_phone]
            if phone_matches:
                if clean_query:
                    # 1. Try exact or full name containment
                    strict_match = [
                        p for p in phone_matches
                        if clean_query == p["name"].lower()
                        or clean_query in p["name"].lower()
                        or p["name"].lower() in clean_query
                    ]
                    if strict_match:
                        return {
                            "candidates": strict_match,
                            "total_matches": len(strict_match),
                            "is_ambiguous": len(strict_match) > 1,
                            "matched": len(strict_match) == 1,
                        }
                    # 2. Try first name or distinct tokens
                    token_matches = [
                        p for p in phone_matches
                        if any(t in p["name"].lower().split() for t in clean_query.split() if t not in ["gupta", "sharma", "ji", "kumar", "singh"])
                    ]
                    if token_matches:
                        return {
                            "candidates": token_matches,
                            "total_matches": len(token_matches),
                            "is_ambiguous": len(token_matches) > 1,
                            "matched": len(token_matches) == 1,
                        }
                return {
                    "candidates": phone_matches,
                    "total_matches": len(phone_matches),
                    "is_ambiguous": len(phone_matches) > 1,
                    "matched": len(phone_matches) == 1,
                }

        # Otherwise match by query (name or phone substring)
        matches = []
        for p in self.patients:
            p_name = p["name"].lower()
            p_phone = p["phone"]

            if clean_query == p_phone:
                matches.append(p)
                continue

            if clean_query in p_name or p_name in clean_query:
                matches.append(p)
            else:
                tokens = [t for t in clean_query.replace(".", " ").split() if len(t) > 1]
                p_tokens = [t for t in p_name.replace(".", " ").split() if len(t) > 1]
                if any(t in p_tokens for t in tokens):
                    matches.append(p)

        # De-duplicate matches by patient ID
        unique_matches = []
        seen = set()
        for m in matches:
            if m["id"] not in seen:
                seen.add(m["id"])
                unique_matches.append(m)

        return {
            "candidates": unique_matches,
            "total_matches": len(unique_matches),
            "is_ambiguous": len(unique_matches) > 1,
            "matched": len(unique_matches) == 1,
        }
