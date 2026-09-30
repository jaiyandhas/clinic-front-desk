from __future__ import annotations

import datetime
import re
from typing import Any, Dict, List, Optional, Tuple


HINDI_NUMBERS = {
    "ek": 1, "do": 2, "teen": 3, "char": 4, "paanch": 5, "chhe": 6, "saat": 7,
    "aath": 8, "nau": 9, "das": 10, "gyarah": 11, "barah": 12,
}

WEEKDAYS = {
    "somwar": 0, "somvaar": 0, "monday": 0, "mon": 0,
    "mangalwar": 1, "mangalvaar": 1, "tuesday": 1, "tue": 1,
    "budhwar": 2, "budhvaar": 2, "wednesday": 2, "wed": 2,
    "guruwar": 3, "brihaspativar": 3, "thursday": 3, "thu": 3,
    "shukrawar": 4, "shukravaar": 4, "friday": 4, "fri": 4,
    "shanivaar": 5, "shanivar": 5, "saturday": 5, "sat": 5,
    "ravivar": 6, "ravivaar": 6, "itwar": 6, "sunday": 6, "sun": 6,
}


def parse_date_expression(text: str, reference_date_str: str) -> Optional[str]:
    """Resolves relative and colloquial date expressions strictly against reference_date.
    
    Never uses datetime.now()!
    """
    ref_dt = datetime.date.fromisoformat(reference_date_str)
    lower = text.lower()

    # 1. Explicit tareekh / date, e.g., "3 tareekh", "7 tareekh ko", "3 October", "2026-10-08"
    # Mid-turn corrections ("nahi nahi, budhwar 7 tareekh") mean we should check the last mentioned date
    iso_matches = list(re.finditer(r"\b(202\d-\d{2}-\d{2})\b", lower))
    if iso_matches:
        return iso_matches[-1].group(1)

    tareekh_matches = list(re.finditer(r"\b(\d{1,2})\s*(tareekh|tarikh|october|oct)\b", lower))
    if tareekh_matches:
        day_num = int(tareekh_matches[-1].group(1))
        return f"{ref_dt.year:04d}-{ref_dt.month:02d}-{day_num:02d}"

    # 2. Relative keywords: "parso", "kal", "aaj"
    if "parso" in lower or "day after tomorrow" in lower:
        return (ref_dt + datetime.timedelta(days=2)).isoformat()
    if "kal" in lower or "tomorrow" in lower:
        # Note: In Hindi, "kal" can mean yesterday or tomorrow, but in scheduling context it is tomorrow
        return (ref_dt + datetime.timedelta(days=1)).isoformat()
    if "aaj" in lower or "today" in lower:
        return ref_dt.isoformat()

    # 3. Weekday name: e.g. "shanivaar", "budhwar", "sunday"
    for day_word, day_idx in WEEKDAYS.items():
        if re.search(rf"\b{day_word}\b", lower):
            # Find the upcoming occurrence of this day of week starting from reference date
            days_ahead = (day_idx - ref_dt.weekday()) % 7
            if days_ahead == 0 and ("aaj" not in lower and "today" not in lower):
                # If said day is today, check if context implies next week or today
                pass
            target_dt = ref_dt + datetime.timedelta(days=days_ahead)
            return target_dt.isoformat()

    return None


def parse_time_expression(text: str) -> Optional[str]:
    """Resolves clock times in 24-hr HH:MM format."""
    lower = text.lower()

    # 1. Exact 24-hr or 12-hr format like "9:30", "10:15", "11:00"
    colon_match = re.search(r"\b(\d{1,2}):(\d{2})\b", lower)
    if colon_match:
        h, m = int(colon_match.group(1)), int(colon_match.group(2))
        if "shaam" in lower or "evening" in lower or "pm" in lower:
            if h < 12:
                h += 12
        return f"{h:02d}:{m:02d}"

    # 2. "9 baje", "10 baje", "gyarah baje"
    baje_match = re.search(r"\b(\d{1,2}|ek|do|teen|char|paanch|chhe|saat|aath|nau|das|gyarah|barah)\s*baje\b", lower)
    if baje_match:
        val = baje_match.group(1)
        h = HINDI_NUMBERS[val] if val in HINDI_NUMBERS else int(val)
        if "shaam" in lower or "evening" in lower or "pm" in lower:
            if h < 12:
                h += 12
        return f"{h:02d}:00"

    # 3. "gyarah baje" without direct digit
    for word, num in HINDI_NUMBERS.items():
        if re.search(rf"\b{word}\s*baje\b", lower):
            return f"{num:02d}:00"

    # 4. Period preference
    if "subah" in lower or "morning" in lower:
        return "09:00"
    if "shaam" in lower or "evening" in lower:
        return "17:00"

    return None


def extract_phone(text: str) -> Optional[str]:
    """Extracts 10-digit phone number."""
    m = re.search(r"\b(\d{10})\b", text)
    return m.group(1) if m else None


def extract_doctor(text: str) -> Optional[str]:
    """Detects doctor mention."""
    lower = text.lower()
    if "sethi" in lower:
        return "dr_sethi"
    if "rao" in lower:
        return "dr_rao"
    return None
