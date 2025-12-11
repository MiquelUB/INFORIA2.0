import os

# Base URL for the application
# Default to localhost:3000 if not specified
BASE_URL = os.getenv("BASE_URL", "http://localhost:3000")

# Timeout settings
DEFAULT_TIMEOUT = int(os.getenv("DEFAULT_TIMEOUT", "5000"))
LONG_TIMEOUT = int(os.getenv("LONG_TIMEOUT", "30000"))

# Browser settings
HEADLESS = os.getenv("HEADLESS", "true").lower() == "true"
WINDOW_SIZE = os.getenv("WINDOW_SIZE", "1280,720")

def get_url(path):
    """Helper to construct full URLs"""
    if path.startswith("/"):
        return f"{BASE_URL}{path}"
    return f"{BASE_URL}/{path}"
