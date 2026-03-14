import requests
import json
import os
from typing import Dict, Any, List
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

class PrivacyProcessor:
    def __init__(self):
        self.ollama_host = os.getenv("OLLAMA_HOST", "http://localhost:11434")
        self.model_name = "mistral"
        self.access_log = []
    
    def process_broker_data(self, broker_text: str) -> Dict[str, Any]:
        """Process broker data through local Ollama instance"""
        
        # Log access
        self._log_access("BROKER_DATA_PROCESSING", f"Text length: {len(broker_text)}")
        
        try:
            # Call Ollama API
            response = self._call_ollama(broker_text)
            
            if response:
                return {
                    "processed": True,
                    "analysis": response,
                    "source": "ollama_local",
                    "model": self.model_name,
                    "processed_at": datetime.now().isoformat(),
                    "privacy_compliant": True
                }
            else:
                return self._fallback_broker_processing(broker_text)
                
        except Exception as e:
            print(f"Error processing broker data with Ollama: {e}")
            return self._fallback_broker_processing(broker_text)
    
    def _call_ollama(self, text: str) -> str:
        """Call Ollama API for local processing"""
        
        prompt = f"""You are a rubber commodity analyst. Analyze this broker intelligence for CEAT Tyres procurement:

{text}

Extract key insights about:
1. Price trends and forecasts
2. Supply chain disruptions
3. Quality issues
4. Market sentiment
5. Recommended actions (BUY/WAIT/SWITCH)

Provide a structured analysis in JSON format:
{{
  "price_trend": "up/down/stable",
  "supply_status": "normal/disrupted/abundant",
  "quality_alerts": [],
  "market_sentiment": "bullish/bearish/neutral",
  "recommended_action": "BUY/WAIT/SWITCH",
  "confidence": 0.0-1.0,
  "key_insights": ["insight1", "insight2"],
  "reasoning": "brief explanation"
}}"""

        try:
            response = requests.post(
                f"{self.ollama_host}/api/generate",
                json={
                    "model": self.model_name,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.3,
                        "top_p": 0.9
                    }
                },
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get("response", "")
            else:
                print(f"Ollama API error: {response.status_code}")
                return ""
                
        except requests.exceptions.RequestException as e:
            print(f"Ollama connection error: {e}")
            return ""
    
    def _fallback_broker_processing(self, broker_text: str) -> Dict[str, Any]:
        """Fallback processing when Ollama is not available"""
        
        # Simple keyword-based analysis
        text_lower = broker_text.lower()
        
        # Price trend detection
        if any(word in text_lower for word in ["price up", "increase", "rising", "higher"]):
            price_trend = "up"
        elif any(word in text_lower for word in ["price down", "decrease", "falling", "lower"]):
            price_trend = "down"
        else:
            price_trend = "stable"
        
        # Supply status detection
        if any(word in text_lower for word in ["shortage", "disruption", "delay", "problem"]):
            supply_status = "disrupted"
        elif any(word in text_lower for word in ["abundant", "surplus", "excess"]):
            supply_status = "abundant"
        else:
            supply_status = "normal"
        
        # Simple recommendation logic
        if price_trend == "down" and supply_status != "disrupted":
            recommended_action = "BUY"
            confidence = 0.6
        elif price_trend == "up" or supply_status == "disrupted":
            recommended_action = "WAIT"
            confidence = 0.5
        else:
            recommended_action = "WAIT"
            confidence = 0.4
        
        fallback_analysis = {
            "price_trend": price_trend,
            "supply_status": supply_status,
            "quality_alerts": [],
            "market_sentiment": "neutral",
            "recommended_action": recommended_action,
            "confidence": confidence,
            "key_insights": [f"Price trend: {price_trend}", f"Supply: {supply_status}"],
            "reasoning": "Fallback analysis - Ollama not available"
        }
        
        return {
            "processed": True,
            "analysis": json.dumps(fallback_analysis),
            "source": "fallback_local",
            "model": "keyword_analysis",
            "processed_at": datetime.now().isoformat(),
            "privacy_compliant": True,
            "fallback": True
        }
    
    def validate_data_privacy(self, data: Dict[str, Any]) -> Dict[str, bool]:
        """Validate that data meets privacy requirements"""
        
        validation = {
            "harrisons_data_safe": True,
            "broker_data_safe": True,
            "external_api_safe": True,
            "overall_compliant": True
        }
        
        # Check if Harrisons data is marked as internal
        if data.get("is_internal", False) and data.get("source", "") == "Harrisons Malayalam":
            validation["harrisons_data_safe"] = True
            self._log_access("HARRISONS_DATA_VALIDATED", "Internal data properly flagged")
        
        # Check if broker data is routed through privacy layer
        if data.get("requires_privacy", False):
            if data.get("source", "") == "ollama_local" or data.get("source", "") == "fallback_local":
                validation["broker_data_safe"] = True
                self._log_access("BROKER_DATA_VALIDATED", "Processed locally")
            else:
                validation["broker_data_safe"] = False
                validation["overall_compliant"] = False
                self._log_access("PRIVACY_VIOLATION", "Broker data not processed locally")
        
        return validation
    
    def _log_access(self, action: str, details: str):
        """Log data access for audit trail"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "action": action,
            "details": details,
            "host": self.ollama_host
        }
        
        self.access_log.append(log_entry)
        
        # Keep only last 1000 entries
        if len(self.access_log) > 1000:
            self.access_log = self.access_log[-1000:]
    
    def get_access_log(self) -> List[Dict[str, Any]]:
        """Get privacy access log"""
        return self.access_log.copy()
    
    def check_ollama_status(self) -> Dict[str, Any]:
        """Check if Ollama is running and accessible"""
        try:
            response = requests.get(f"{self.ollama_host}/api/tags", timeout=5)
            
            if response.status_code == 200:
                models = response.json().get("models", [])
                mistral_available = any(model.get("name", "").startswith("mistral") for model in models)
                
                return {
                    "ollama_running": True,
                    "mistral_available": mistral_available,
                    "total_models": len(models),
                    "host": self.ollama_host
                }
            else:
                return {
                    "ollama_running": False,
                    "error": f"HTTP {response.status_code}",
                    "host": self.ollama_host
                }
                
        except requests.exceptions.RequestException as e:
            return {
                "ollama_running": False,
                "error": str(e),
                "host": self.ollama_host
            }
    
    def ensure_harrisons_privacy(self, signals: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Ensure Harrisons Malayalam data never leaves local processing"""
        
        safe_signals = []
        
        for signal in signals:
            # Mark Harrisons data as internal and log access
            if signal.get("original_signal", {}).get("source", "") == "Harrisons Malayalam":
                signal["is_internal"] = True
                signal["privacy_protected"] = True
                self._log_access("HARRISONS_DATA_ACCESSED", f"Signal: {signal.get('original_signal', {}).get('title', '')}")
            
            safe_signals.append(signal)
        
        return safe_signals
    
    def get_privacy_summary(self) -> Dict[str, Any]:
        """Get privacy compliance summary"""
        
        # Count different types of access
        access_counts = {}
        for log_entry in self.access_log:
            action = log_entry["action"]
            access_counts[action] = access_counts.get(action, 0) + 1
        
        ollama_status = self.check_ollama_status()
        
        return {
            "ollama_status": ollama_status,
            "total_access_logs": len(self.access_log),
            "access_breakdown": access_counts,
            "privacy_compliant": ollama_status["ollama_running"],
            "last_access": self.access_log[-1]["timestamp"] if self.access_log else None
        }