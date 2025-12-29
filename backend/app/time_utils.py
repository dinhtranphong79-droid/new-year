from datetime import datetime, timezone, timedelta

UTC_PLUS_11 = timezone(timedelta(hours=11))

NEW_YEAR_UTC = datetime(
    2026, 1, 1, 0, 0, 0,
    tzinfo=UTC_PLUS_11
).astimezone(timezone.utc)

def get_remaining_seconds():
    now = datetime.now(timezone.utc)
    return max((NEW_YEAR_UTC - now).total_seconds(), 0)
