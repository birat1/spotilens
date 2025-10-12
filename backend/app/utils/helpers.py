def format_duration(ms: int) -> str:
    seconds = ms // 1000
    minutes = seconds // 60
    return f"{minutes}:{seconds % 60:02d}"
