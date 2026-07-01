import logging
import time
import json
from google import genai
from google.genai import types
from app.core.config import settings
from typing import Any, Dict

logger = logging.getLogger(__name__)

class GeminiClient:
    """
    Dedicated HTTP client for communicating with the Gemini 2.5 Flash API.
    Enforces JSON outputs and implements robust retry mechanics directly.
    """
    def __init__(self):
        self.model_name = "gemini-2.5-flash"
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)

    def generate_json(self, prompt: str, max_retries: int = 3) -> Dict[str, Any]:
        """
        Calls Gemini API with the provided prompt.
        Forces structured JSON output and implements local exponential backoff.
        """
        attempt = 0
        backoff = 2
        
        while attempt <= max_retries:
            try:
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
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
                    logger.error(f"Gemini API failed after {max_retries} retries: {e}")
                    raise e
                
                logger.warning(f"Gemini call failed, retrying in {backoff}s...")
                time.sleep(backoff)
                backoff *= 2
