from __future__ import annotations

import glob
import json
import pathlib
import sys
import time
from typing import Any, Dict, List

from backend.models import AgentRequest
from backend.orchestrator import AgentOrchestrator

CONVERSATIONS_DIR = pathlib.Path(__file__).resolve().parent.parent / "swasthiq-front-desk-agent-starter-pack" / "conversations"


def grade_all(repeat: int = 1) -> bool:
    files = sorted(CONVERSATIONS_DIR.glob("*.json"))
    if not files:
        print(f"No conversation files found in {CONVERSATIONS_DIR}")
        return False

    total = len(files)
    passed = 0
    failed = 0
    all_runs_stable = True

    print(f"\n=======================================================")
    print(f"  SwasthiQ Agent Automated Grader — {total} Test Scripts")
    print(f"=======================================================\n")

    for fpath in files:
        with open(fpath, "r", encoding="utf-8") as f:
            script = json.load(f)

        cid = script["id"]
        today = script.get("today", "2026-10-01")
        turns = script["turns"]
        expected = script["expected"]

        req = AgentRequest(conversation_id=cid, today=today, turns=turns)

        fingerprints = set()
        last_resp = None
        case_passed = True
        error_reasons = []

        for r in range(1, repeat + 1):
            resp = AgentOrchestrator.run_conversation(req)
            last_resp = resp
            called_tools = [c.name for c in resp.tool_calls]
            fp = f"{resp.terminal_state}/{resp.escalation_reason}/{','.join(sorted(set(called_tools)))}"
            fingerprints.add(fp)

            # Check terminal state
            if resp.terminal_state != expected["terminal_state"]:
                case_passed = False
                error_reasons.append(f"terminal_state expected {expected['terminal_state']}, got {resp.terminal_state}")

            # Check escalation reason
            if resp.escalation_reason != expected["escalation_reason"]:
                case_passed = False
                error_reasons.append(f"escalation_reason expected {expected['escalation_reason']}, got {resp.escalation_reason}")

            # Check must_call
            for must in expected.get("must_call", []):
                if must not in called_tools:
                    case_passed = False
                    error_reasons.append(f"must_call missed: {must}")

            # Check must_not_call
            for must_not in expected.get("must_not_call", []):
                if must_not in called_tools:
                    case_passed = False
                    error_reasons.append(f"must_not_call violated: {must_not}")

        is_stable = len(fingerprints) == 1
        if not is_stable:
            all_runs_stable = False

        if case_passed and is_stable:
            passed += 1
            print(f"  [PASS] {cid}: state={last_resp.terminal_state:<12} reason={str(last_resp.escalation_reason):<18} tools={','.join([c.name for c in last_resp.tool_calls])}")
        else:
            failed += 1
            print(f"  [FAIL] {cid}:")
            for err in set(error_reasons):
                print(f"         - {err}")
            if not is_stable:
                print(f"         - Flaky across {repeat} runs: {fingerprints}")

    print(f"\n-------------------------------------------------------")
    print(f"SUMMARY: {passed}/{total} Passed, {failed} Failed. Determinism: {'STABLE (100%)' if all_runs_stable else 'UNSTABLE'}")
    print(f"-------------------------------------------------------\n")
    return failed == 0 and all_runs_stable


if __name__ == "__main__":
    repeat_count = int(sys.argv[1]) if len(sys.argv) > 1 else 3
    success = grade_all(repeat=repeat_count)
    sys.exit(0 if success else 1)
