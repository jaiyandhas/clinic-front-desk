# AI Coding Assistant Transcript

This document contains the prompt transcript used while developing the SwasthiQ Clinic Front Desk Agent, as requested in Item 4 of the submission guidelines.

---

### Prompt 1: Project Intake & Strategic Planning
```text
our assignment
Files for this assignment swasthiq-front-desk-agent-starter-pack.zip
SwasthiQ-Hiring-Assignment-September2026.pdf
A three day take-home. Due three days after this was sent.
...
The Task:
Build a Python REST API exposing a conversational agent with six tools over a clinic's schedule, plus a React frontend with the two screens shown in the UI Requirements section.
What We're Evaluating:
Whether you can keep an agent safe, predictable and honest when the model is free to do anything. Not how well you can prompt one.
...
i have attached the pdf and the task i need to do, i need to stand out on what im gonna do. lets draft a plan
```

### Prompt 2: Verifying Evaluation Traps & Hidden Mechanisms
```text
wait is there anything hidden to check if i use ai majorly?
```

### Prompt 3: Standing Out & Outperforming Naive Implementations
```text
they will most likely use AI to evaluate as well so i think we need to do something extra i everything to impress them. do you have any idea on that
```

### Prompt 4: Apple-Grade Design & Implementation Trigger
```text
lets do smooth apple like UI i think ui is given in the pdf but yeah lets start building
```

---

### Key Architectural Directives & Engineering Iterations

1. **Safety Interceptor Priority**:
   - Explicit instruction to enforce the Hard Rule: clinical emergencies (chest pain, dyspnea, acute distress) in English, Hindi, or Hinglish must preempt any booking flow immediately and trigger `escalate_to_human(reason="clinical_urgent")`.
2. **State & Concurrency Management**:
   - Identified that `threading.Lock` inside nested method calls causes a deadlock; re-architected to re-entrant locking (`threading.RLock`) to ensure thread-safe slot claiming without deadlock or race condition double-booking.
3. **Starter Pack Anomaly Discovery**:
   - Discovered and addressed the overlapping Monday window for Dr. Rao in `clinic.json` (`09:00-12:00` vs. `11:45-15:00`). Implemented de-duplication to prevent duplicate `11:45` slot generation.
4. **Adversarial Suite Design**:
   - Engineered 8 novel attack cases (`adv_0001` through `adv_0008`) targeting prompt injection, relative guardian spoofing, leap-year hallucination, polypharmacy queries, doctor specialty mismatches, and request withdrawals.
5. **UI Fidelity**:
   - Built dual-screen React frontend matching the assignment PDF wireframes (Handoff Queue with KPI counters + Conversation Detail with visual timeline and determinism inspector). Added an interactive live runner sandbox in the header.
