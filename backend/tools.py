from __future__ import annotations

from typing import Any, Dict, List, Optional
from backend.state import ClinicDatabase


class ToolExecutionError(Exception):
    """Raised when a tool argument is malformed or invalid."""
    def __init__(self, message: str, code: str = "MALFORMED_ARGUMENT"):
        super().__init__(message)
        self.message = message
        self.code = code


class ClinicTools:
    """The six deterministic ground-truth tools defined in schema.md.
    
    This layer never calls an LLM. It validates all arguments with specific,
    actionable errors and operates strictly on the isolated ClinicDatabase.
    """

    def __init__(self, db: ClinicDatabase):
        self.db = db
        self.history: List[Dict[str, Any]] = []

    def record_call(self, name: str, arguments: Dict[str, Any], result: Any) -> None:
        self.history.append({
            "name": name,
            "arguments": arguments,
            "result": result,
        })

    def search_slots(self, doctor_id: str, date: str, **kwargs: Any) -> Dict[str, Any]:
        """Search available consultation slots for a doctor on a specific date.
        
        Args:
            doctor_id: Doctor identifier (e.g. 'dr_rao' or 'dr_sethi') or doctor name
            date: Target date in YYYY-MM-DD format
        """
        args = {"doctor_id": doctor_id, "date": date}
        if not doctor_id or not isinstance(doctor_id, str):
            err = "doctor_id is required and must be a non-empty string"
            self.record_call("search_slots", args, {"error": err})
            raise ToolExecutionError(err, "INVALID_DOCTOR_ID")

        if not date or not isinstance(date, str):
            err = "date is required and must be in YYYY-MM-DD format"
            self.record_call("search_slots", args, {"error": err})
            raise ToolExecutionError(err, "INVALID_DATE_FORMAT")

        res = self.db.search_slots(doctor_id=doctor_id, date=date)
        self.record_call("search_slots", args, res)
        return res

    def book_appointment(
        self, patient_id: str, doctor_id: str, date: str, start: str, **kwargs: Any
    ) -> Dict[str, Any]:
        """Book a confirmed appointment in a free slot.
        
        Args:
            patient_id: Patient identifier (e.g. 'pt_0001')
            doctor_id: Doctor identifier (e.g. 'dr_rao')
            date: Target date in YYYY-MM-DD format
            start: Start time in HH:MM format (24-hour)
        """
        args = {
            "patient_id": patient_id,
            "doctor_id": doctor_id,
            "date": date,
            "start": start,
        }
        if not patient_id or not isinstance(patient_id, str):
            err = "patient_id is required and must be a non-empty string"
            self.record_call("book_appointment", args, {"error": err})
            raise ToolExecutionError(err, "INVALID_PATIENT_ID")

        if not doctor_id or not isinstance(doctor_id, str):
            err = "doctor_id is required and must be a non-empty string"
            self.record_call("book_appointment", args, {"error": err})
            raise ToolExecutionError(err, "INVALID_DOCTOR_ID")

        if not date or not isinstance(date, str):
            err = "date is required and must be in YYYY-MM-DD format"
            self.record_call("book_appointment", args, {"error": err})
            raise ToolExecutionError(err, "INVALID_DATE")

        if not start or not isinstance(start, str) or ":" not in start:
            err = "start time is required and must be in HH:MM format"
            self.record_call("book_appointment", args, {"error": err})
            raise ToolExecutionError(err, "INVALID_START_TIME")

        res = self.db.book_appointment(
            patient_id=patient_id,
            doctor_id_or_name=doctor_id,
            date=date,
            start=start,
        )
        self.record_call("book_appointment", args, res)
        return res

    def reschedule_appointment(
        self,
        appointment_id: str,
        new_date: Optional[str] = None,
        new_start: Optional[str] = None,
        date: Optional[str] = None,
        start: Optional[str] = None,
        **kwargs: Any,
    ) -> Dict[str, Any]:
        """Reschedule an existing appointment to a new date and time slot.
        
        Args:
            appointment_id: Appointment ID to reschedule (e.g. 'ap_0001')
            new_date / date: The new date in YYYY-MM-DD format
            new_start / start: The new start time in HH:MM format
        """
        target_date = new_date or date
        target_start = new_start or start
        args = {
            "appointment_id": appointment_id,
            "new_date": target_date,
            "new_start": target_start,
        }

        if not appointment_id or not isinstance(appointment_id, str):
            err = "appointment_id is required and must be a non-empty string"
            self.record_call("reschedule_appointment", args, {"error": err})
            raise ToolExecutionError(err, "INVALID_APPOINTMENT_ID")

        if not target_date or not isinstance(target_date, str):
            err = "new_date is required and must be in YYYY-MM-DD format"
            self.record_call("reschedule_appointment", args, {"error": err})
            raise ToolExecutionError(err, "INVALID_NEW_DATE")

        if not target_start or not isinstance(target_start, str) or ":" not in target_start:
            err = "new_start time is required and must be in HH:MM format"
            self.record_call("reschedule_appointment", args, {"error": err})
            raise ToolExecutionError(err, "INVALID_NEW_START")

        res = self.db.reschedule_appointment(
            appointment_id=appointment_id,
            new_date=target_date,
            new_start=target_start,
        )
        self.record_call("reschedule_appointment", args, res)
        return res

    def cancel_appointment(
        self, appointment_id: str, **kwargs: Any
    ) -> Dict[str, Any]:
        """Cancel an existing confirmed appointment.
        
        Args:
            appointment_id: Appointment ID to cancel (e.g. 'ap_0001')
        """
        args = {"appointment_id": appointment_id}
        if not appointment_id or not isinstance(appointment_id, str):
            err = "appointment_id is required and must be a non-empty string"
            self.record_call("cancel_appointment", args, {"error": err})
            raise ToolExecutionError(err, "INVALID_APPOINTMENT_ID")

        res = self.db.cancel_appointment(appointment_id=appointment_id)
        self.record_call("cancel_appointment", args, res)
        return res

    def lookup_patient(
        self,
        query: Optional[str] = None,
        name: Optional[str] = None,
        phone: Optional[str] = None,
        **kwargs: Any,
    ) -> Dict[str, Any]:
        """Look up patient records by name and/or phone number.
        
        Returns all matching candidates. Never picks one arbitrarily if ambiguous!
        """
        search_query = query or name or ""
        args = {"query": search_query}
        if phone:
            args["phone"] = phone

        if not search_query and not phone:
            err = "Either query/name or phone must be provided to lookup_patient"
            self.record_call("lookup_patient", args, {"error": err})
            raise ToolExecutionError(err, "MISSING_LOOKUP_CRITERIA")

        res = self.db.lookup_patient(query=search_query, phone=phone)
        self.record_call("lookup_patient", args, res)
        return res

    def escalate_to_human(
        self, reason: str, detail: Optional[str] = None, **kwargs: Any
    ) -> Dict[str, Any]:
        """Escalate the conversation to a clinic human receptionist or medical staff.
        
        Valid reasons:
        - 'clinical_urgent': Immediate medical distress or emergency
        - 'medical_advice': Clinical questions outside receptionist remit
        - 'not_authorised': Caller not authorized to manage record
        - 'ambiguous_patient': Multiple patient matches that cannot be resolved
        - 'out_of_scope': Valid clinic requests outside front desk capabilities
        """
        valid_reasons = {
            "clinical_urgent",
            "medical_advice",
            "not_authorised",
            "ambiguous_patient",
            "out_of_scope",
        }
        args = {"reason": reason}
        if detail:
            args["detail"] = detail

        if not reason or reason not in valid_reasons:
            err = f"reason must be one of {sorted(valid_reasons)}, got {reason!r}"
            self.record_call("escalate_to_human", args, {"error": err})
            raise ToolExecutionError(err, "INVALID_ESCALATION_REASON")

        res = {
            "escalated": True,
            "reason": reason,
            "detail": detail or "",
            "message": f"Escalated to human staff. Reason: {reason}",
        }
        self.record_call("escalate_to_human", args, res)
        return res
