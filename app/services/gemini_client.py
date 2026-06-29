import logging
import time
import json
import google.generativeai as genai
from app.core.config import settings
from typing import Any, Dict

logger = logging.getLogger(__name__)

# Configure the Gemini client securely via environment variables
genai.configure(api_key=settings.GEMINI_API_KEY)

class GeminiClient:
    """
    Dedicated HTTP client for communicating with the Gemini 1.5 Flash API.
    Enforces JSON outputs and implements robust retry mechanics directly.
    """
    def __init__(self):
        # As per the assignment, utilizing the free-tier 1.5 flash model
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    def generate_json(self, prompt: str, max_retries: int = 3) -> Dict[str, Any]:
        """
        Calls Gemini API with the provided prompt.
        Forces structured JSON output and implements local exponential backoff.
        """
        attempt = 0
        backoff = 2
        
        while attempt <= max_retries:
            try:
                # Force structured JSON responses (Supported in Gemini 1.5 APIs)
                response = self.model.generate_content(
                    prompt,
                    generation_config=genai.types.GenerationConfig(
                        response_mime_type="application/json"
                    )
                )
                
                raw_text = response.text
                if not raw_text:
                    raise ValueError("Received empty response from Gemini API.")
                
                return json.loads(raw_text)
                
            except Exception as e:
                attempt += 1
                if attempt > max_retries:
                    logger.error(f"Gemini API permanently failed after {max_retries} retries: {e}")
                    raise e
                
                logger.warning(f"Gemini call failed (attempt {attempt}/{max_retries}): {e}. Retrying in {backoff}s...")
                time.sleep(backoff)
                backoff *= 2
