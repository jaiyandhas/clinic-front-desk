from __future__ import annotations

from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field

TerminalState = Literal[
    "booked",
    "rescheduled",
    "cancelled",
    "escalated",
    "refused",
    "abandoned",
]

EscalationReason = Literal[
    "clinical_urgent",
    "medical_advice",
    "not_authorised",
    "ambiguous_patient",
    "out_of_scope",
]


class AgentRequest(BaseModel):
    conversation_id: str
    today: str = "2026-10-01"
    turns: List[str]


class ToolCallRecord(BaseModel):
    name: str
    arguments: Dict[str, Any]


class Metrics(BaseModel):
    turns: int
    tokens: int
    latency_ms: int


class AgentResponse(BaseModel):
    conversation_id: str
    tool_calls: List[ToolCallRecord]
    terminal_state: TerminalState
    escalation_reason: Optional[EscalationReason] = None
    patient_id: Optional[str] = None
    appointment_id: Optional[str] = None
    reply: str
    metrics: Metrics


class Window(BaseModel):
    day: str
    start: str
    end: str


class Doctor(BaseModel):
    id: str
    name: str
    speciality: str
    windows: List[Window]
    leave_dates: List[str]


class Patient(BaseModel):
    id: str
    name: str
    phone: str
    dob: str
    guardian_of: List[str] = Field(default_factory=list)


class Appointment(BaseModel):
    id: str
    patient_id: str
    doctor_id: str
    date: str
    start: str
    end: str
    status: Literal["booked", "cancelled", "rescheduled"] = "booked"


class ClinicInfo(BaseModel):
    id: str
    name: str
    city: str
    timezone: str
    slot_minutes: int
    reference_date: str
