from typing import Dict, Any, List
from datetime import datetime

class ConfidenceGate:
    def __init__(self):
        self.confidence_threshold = 0.55
        self.consecutive_waits = 0
        self.max_consecutive_waits = 3
        self.audit_log = []
    
    def apply_confidence_gate(self, recommendation: Dict[str, Any]) -> Dict[str, Any]:
        """Apply confidence gate to recommendation"""
        original_action = recommendation.get("recommended_action", "WAIT")
        confidence = recommendation.get("confidence_score", 0.0)
        
        # Apply confidence threshold rule
        if confidence < self.confidence_threshold:
            recommendation["recommended_action"] = "WAIT"
            recommendation["confidence_gate_applied"] = True
            recommendation["confidence_gate_reason"] = f"Confidence {confidence:.2f} below threshold {self.confidence_threshold}"
            
            # Track consecutive waits
            if original_action != "WAIT":
                self.consecutive_waits += 1
                self._log_confidence_gate(recommendation, "CONFIDENCE_GATE_TRIGGERED")
            else:
                self.consecutive_waits += 1
        else:
            recommendation["confidence_gate_applied"] = False
            self.consecutive_waits = 0  # Reset counter on non-WAIT
        
        # Check circuit breaker
        if self.consecutive_waits >= self.max_consecutive_waits:
            recommendation["circuit_breaker_alert"] = True
            recommendation["circuit_breaker_message"] = f"Alert: {self.consecutive_waits} consecutive WAIT recommendations"
            self._log_confidence_gate(recommendation, "CIRCUIT_BREAKER_ALERT")
        else:
            recommendation["circuit_breaker_alert"] = False
        
        return recommendation
    
    def validate_recommendation(self, recommendation: Dict[str, Any]) -> Dict[str, Any]:
        """Validate recommendation meets all business rules"""
        validation_results = {
            "valid": True,
            "issues": [],
            "warnings": []
        }
        
        # Check confidence score
        confidence = recommendation.get("confidence_score", 0.0)
        if confidence < 0.0 or confidence > 1.0:
            validation_results["issues"].append(f"Invalid confidence score: {confidence}")
            validation_results["valid"] = False
        
        # Check recommendation action
        valid_actions = ["BUY", "WAIT", "SWITCH"]
        action = recommendation.get("recommended_action", "")
        if action not in valid_actions:
            validation_results["issues"].append(f"Invalid recommendation action: {action}")
            validation_results["valid"] = False
        
        # Check supplier name
        supplier = recommendation.get("supplier_name", "")
        if not supplier or supplier == "Unknown":
            validation_results["warnings"].append("No specific supplier identified")
        
        # Check IBN score
        ibn_score = recommendation.get("ibn_score", 0.0)
        if ibn_score < 0.0 or ibn_score > 1.0:
            validation_results["warnings"].append(f"IBN score out of range: {ibn_score}")
        
        # Check if human review is required
        if recommendation.get("requires_human_review", False):
            validation_results["warnings"].append("Human review required")
        
        recommendation["validation"] = validation_results
        return recommendation
    
    def check_auto_approval_limits(self, recommendation: Dict[str, Any]) -> Dict[str, Any]:
        """Check if recommendation meets auto-approval limits"""
        # Auto-order cap: Rs. 25 lakh
        auto_approval_limit = 2500000  # Rs. 25 lakh
        
        sap_po = recommendation.get("sap_po_draft", {})
        
        # Extract quantity and estimate value (simplified calculation)
        quantity_str = sap_po.get("quantity", "500 MT")
        try:
            quantity = float(quantity_str.split()[0])  # Extract number from "500 MT"
            # Rough estimate: Rs. 150,000 per MT for RSS2
            estimated_value = quantity * 150000
            
            if estimated_value > auto_approval_limit:
                recommendation["requires_dual_approval"] = True
                recommendation["estimated_value"] = estimated_value
                recommendation["auto_approval_limit"] = auto_approval_limit
                recommendation["dual_approval_reason"] = f"Order value Rs.{estimated_value:,.0f} exceeds limit Rs.{auto_approval_limit:,.0f}"
                self._log_confidence_gate(recommendation, "DUAL_APPROVAL_REQUIRED")
            else:
                recommendation["requires_dual_approval"] = False
                recommendation["estimated_value"] = estimated_value
                
        except (ValueError, IndexError):
            # If we can't parse quantity, require dual approval as safety measure
            recommendation["requires_dual_approval"] = True
            recommendation["dual_approval_reason"] = "Unable to determine order value"
        
        return recommendation
    
    def process_recommendation(self, recommendation: Dict[str, Any]) -> Dict[str, Any]:
        """Process recommendation through all confidence checks"""
        # Apply confidence gate
        recommendation = self.apply_confidence_gate(recommendation)
        
        # Validate recommendation
        recommendation = self.validate_recommendation(recommendation)
        
        # Check auto-approval limits
        recommendation = self.check_auto_approval_limits(recommendation)
        
        # Add processing timestamp
        recommendation["confidence_processed_at"] = datetime.now().isoformat()
        
        return recommendation
    
    def _log_confidence_gate(self, recommendation: Dict[str, Any], event_type: str):
        """Log confidence gate events"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "event_type": event_type,
            "supplier": recommendation.get("supplier_name", "Unknown"),
            "confidence": recommendation.get("confidence_score", 0.0),
            "action": recommendation.get("recommended_action", "UNKNOWN"),
            "consecutive_waits": self.consecutive_waits
        }
        
        self.audit_log.append(log_entry)
        
        # Keep only last 100 entries
        if len(self.audit_log) > 100:
            self.audit_log = self.audit_log[-100:]
    
    def get_confidence_stats(self) -> Dict[str, Any]:
        """Get confidence gate statistics"""
        return {
            "confidence_threshold": self.confidence_threshold,
            "consecutive_waits": self.consecutive_waits,
            "max_consecutive_waits": self.max_consecutive_waits,
            "circuit_breaker_active": self.consecutive_waits >= self.max_consecutive_waits,
            "total_gate_events": len(self.audit_log)
        }
    
    def reset_consecutive_waits(self):
        """Reset consecutive waits counter (for manual override)"""
        self.consecutive_waits = 0
        self._log_confidence_gate({}, "CONSECUTIVE_WAITS_RESET")
    
    def get_audit_log(self) -> List[Dict[str, Any]]:
        """Get confidence gate audit log"""
        return self.audit_log.copy()
    
    def update_threshold(self, new_threshold: float) -> bool:
        """Update confidence threshold"""
        if 0.0 <= new_threshold <= 1.0:
            old_threshold = self.confidence_threshold
            self.confidence_threshold = new_threshold
            
            log_entry = {
                "timestamp": datetime.now().isoformat(),
                "event_type": "THRESHOLD_UPDATED",
                "old_threshold": old_threshold,
                "new_threshold": new_threshold
            }
            self.audit_log.append(log_entry)
            
            return True
        return False