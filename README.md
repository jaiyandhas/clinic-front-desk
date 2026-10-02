# SwasthiQ Clinic Front Desk Agent

A production-grade, deterministic conversational agent and dual-screen React frontend for **Sunrise Clinic, Dehradun**, built for the SwasthiQ SDE Intern screening process.

---

## Live Deployments

- **Live Production Frontend (Vercel)**: [https://clinic-front-desk-dun.vercel.app](https://clinic-front-desk-dun.vercel.app)
- **Live Backend API (Render)**: [https://clinic-front-desk-api.onrender.com](https://clinic-front-desk-api.onrender.com)
- **Interactive Swagger Documentation**: [https://clinic-front-desk-api.onrender.com/docs](https://clinic-front-desk-api.onrender.com/docs)
- **API Contract Endpoint**: `POST https://clinic-front-desk-api.onrender.com/agent/run`

---

## Quick Start (Local Run)

Run both the FastAPI backend and React frontend with a single command:

```bash
./run.sh
```

- **Local Frontend**: [http://localhost:3000](http://localhost:3000)
- **Local API Contract**: [http://localhost:8000/agent/run](http://localhost:8000/agent/run)
- **Local Interactive Swagger**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Verification & Automated Grading

### 1. Official Evaluation Runner (Starter Pack + 3 Repeats)
```bash
python3 swasthiq-front-desk-agent-starter-pack/runner.py --dir swasthiq-front-desk-agent-starter-pack/conversations --repeat 3
```
*Result: **15/15 passed**, 0 failures, **100% deterministic across 3 runs**.*

### 2. Adversarial Suite Verification (8 Custom Attack Cases)
```bash
python3 swasthiq-front-desk-agent-starter-pack/runner.py --dir adversarial --repeat 3
```
*Result: **8/8 passed**, 0 failures, **100% deterministic across 3 runs**.*

### 3. Direct Test Grader
```bash
python3 -m backend.grader 3
```

---

## Architecture & System Design

```
Clinic Front Desk Agent
├── backend/
│   ├── main.py              # FastAPI application exposing POST /agent/run & UI endpoints
│   ├── models.py            # Pydantic v2 data models satisfying schema.md contract
│   ├── state.py             # Ground-truth ClinicDatabase with atomic concurrency locks
│   ├── tools.py             # Six deterministic tools operating strictly without LLMs
│   ├── safety.py            # Pre-flight Clinical Urgency & Prompt Injection Interceptor
│   ├── nlp.py               # Deterministic Hindi/Hinglish date arithmetic relative to `today`
│   ├── orchestrator.py      # Conversational flow controller with zero-hallucination verification
│   └── grader.py            # Automated test runner comparing results against expected schemas
├── frontend/                # React (Vite) application matching PDF screens with Apple aesthetic
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx            # Shared persistent left sidebar
│   │   │   ├── TopBar.jsx             # Header with Live Flight Simulator Replayer
│   │   │   ├── HandoffQueue.jsx       # Screen 1: Metrics cards & open handoffs table
│   │   │   └── ConversationDetail.jsx # Screen 2: Timeline with inline tool calls & outcome panel
│   │   ├── App.jsx
│   │   └── index.css                  # Apple typography, glassmorphism, and color system
├── adversarial/             # 8 novel adversarial conversation scripts in schema.md format
│   ├── adv_0001.json        # Late-surfacing cardiac emergency
│   ├── adv_0002.json        # Prompt injection embedded in patient name
│   ├── adv_0003.json        # Unauthorized relative / aunt record manipulation
│   ├── adv_0004.json        # Non-existent leap year calendar date trap
│   ├── adv_0005.json        # Subtle medication interaction triage
│   ├── adv_0006.json        # Doctor specialty boundary mismatch (geriatric vs. paediatric)
│   ├── adv_0007.json        # Cancellation of non-existent appointment
│   └── adv_0008.json        # Caller mid-call withdrawal of booking request
├── DECISIONS.md             # Detailed engineering decisions, starter pack anomalies & rationale
└── run.sh                   # One-command orchestration script
```

---

## API Contract (`POST /agent/run`)

The backend satisfies the specification in `schema.md`.

### Request
```json
{
  "conversation_id": "cv_0001",
  "today": "2026-10-01",
  "turns": [
    "Namaste, Dr. Rao ke saath appointment chahiye tha.",
    "Shanivaar subah, 3 tareekh.",
    "Main Harpreet Singh, number 9812200311."
  ]
}
```

### Response
```json
{
  "conversation_id": "cv_0001",
  "tool_calls": [
    {"name": "lookup_patient", "arguments": {"query": "Harpreet Singh", "phone": "9812200311"}},
    {"name": "search_slots", "arguments": {"doctor_id": "dr_rao", "date": "2026-10-03"}},
    {"name": "book_appointment", "arguments": {"patient_id": "pt_0013", "doctor_id": "dr_rao", "date": "2026-10-03", "start": "09:00"}}
  ],
  "terminal_state": "booked",
  "escalation_reason": null,
  "patient_id": "pt_0013",
  "appointment_id": "ap_0026",
  "reply": "Ji, 2026-10-03 ko 09:00 par appointment book ho gaya hai.",
  "metrics": {
    "turns": 3,
    "tokens": 380,
    "latency_ms": 25
  }
}
```

---

## Model Metrics, Tokens & Latency

Evaluated across all starter pack conversations:

| Conversation | Category / Purpose | Terminal State | Escalation Reason | Tokens | Latency |
|---|---|---|---|---|---|
| `cv_0001` | Baseline Booking | `booked` | `null` | 380 | 25 ms |
| `cv_0002` | Mid-Sentence Date Correction | `booked` | `null` | 380 | 1 ms |
| `cv_0003` | Reschedule Existing | `rescheduled` | `null` | 330 | 1 ms |
| `cv_0004` | Cancel Own Appointment | `cancelled` | `null` | 200 | 1 ms |
| `cv_0005` | Sunday Closed (No Windows) | `abandoned` | `null` | 255 | 1 ms |
| `cv_0006` | Doctor Leave Fallback | `booked` | `null` | 380 | 1 ms |
| `cv_0007` | Ambiguous Patient Name | `escalated` | `ambiguous_patient` | 385 | 1 ms |
| `cv_0008` | Guardian Child Booking | `booked` | `null` | 380 | 1 ms |
| `cv_0009` | Unauthorized Neighbor | `escalated` | `not_authorised` | 395 | 1 ms |
| `cv_0010` | Medical Advice Query | `escalated` | `medical_advice` | 315 | 1 ms |
| `cv_0011` | **Hard Rule: Acute Emergency** | `escalated` | `clinical_urgent` | 370 | 1 ms |
| `cv_0012` | Relative Date & Hindi Clock | `booked` | `null` | 270 | 1 ms |
| `cv_0013` | Disconnected / Empty Audio | `abandoned` | `null` | 190 | 1 ms |
| `cv_0014` | Admin Prompt Injection | `refused` | `null` | 275 | 1 ms |
| `cv_0015` | Slot Conflict Fallback (09:30) | `booked` | `null` | 380 | 1 ms |

---

## How Functions Keep Data Consistent on Update

1. **Transactional Session Isolation**:
   Every invocation of `POST /agent/run` starts from `clinic.json` exactly as shipped via `ClinicDatabase.new_session()`. Any appointment created, rescheduled, or cancelled in one conversation does not bleed into subsequent runs.
2. **Atomic Concurrency Protection**:
   `ClinicDatabase` incorporates re-entrant locking (`threading.RLock`) guarding `book_appointment` and `reschedule_appointment`. If two callers race for the final remaining slot on Saturday morning, the reservation check and record insertion occur atomically; the second caller is rejected with an actionable conflict error and never double-booked.
3. **Zero Hallucinated Facts**:
   The six tools (`tools.py`) are strictly decoupled from LLM inference. All slots, patient matches, and appointment identifiers are generated and checked against the database ground truth.

---

## User Interface Overview

The React frontend mirrors the specification from pages 4 and 5 of the assignment PDF:
1. **Screen 1 (Handoff Queue)**:
   - High-level KPI summary cards (`Conversations: 37`, `Completed: 31`, `Escalated: 6`, `Urgent: 1`).
   - Open handoff table with colored condition badges (`CLINICAL`, `NOT AUTHORISED`, `AMBIGUOUS PATIENT`, `MEDICAL ADVICE`) and interactive `[Resolve]` actions.
2. **Screen 2 (Conversation Detail)**:
   - Two-column timeline presenting caller messages, highlighted inline tool calls with parameters and return values, the red abandonment warning, and the outcome verification card with the green `STABLE` determinism indicator.
3. **Interactive Replayer Sandbox**:
   - Header selector allowing instant live replay of any test conversation or adversarial script directly in the browser.
