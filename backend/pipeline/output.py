from typing import Dict, Any, List
from datetime import datetime, timedelta
import pytz
import numpy as np

def convert_numpy_types(obj):
    """Convert numpy types to native Python types for JSON serialization"""
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, np.bool_):
        return bool(obj)
    elif isinstance(obj, dict):
        return {key: convert_numpy_types(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(item) for item in obj]
    return obj

class OutputGenerator:
    def __init__(self):
        self.ist_tz = pytz.timezone('Asia/Kolkata')
    
    def generate_final_output(self, 
                            top_recommendation: Dict[str, Any],
                            ranked_suppliers: List[Dict[str, Any]],
                            signal_summary: str,
                            gemini_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate final output JSON structure"""
        
        # Get current IST time
        now_ist = datetime.now(self.ist_tz)
        
        # Use top-ranked supplier from IBN if Gemini didn't identify one
        top_supplier_name = top_recommendation.get("supplier_name", "Unknown")
        if top_supplier_name == "Unknown" and ranked_suppliers:
            top_supplier_name = ranked_suppliers[0].get("supplier_name", "Unknown")
            top_recommendation["supplier_name"] = top_supplier_name
            top_recommendation["ibn_score"] = ranked_suppliers[0].get("ibn_score", 0.0)
        
        # Generate SAP PO draft
        sap_po_draft = self._generate_sap_po_draft(top_recommendation, ranked_suppliers)
        
        # Determine if human review is required
        requires_human_review = (
            top_recommendation.get("requires_human_review", False) or
            top_recommendation.get("confidence_score", 0.0) < 0.55 or
            top_recommendation.get("requires_dual_approval", False)
        )
        
        # Build final output
        output = {
            "recommendation": top_recommendation.get("recommended_action", "WAIT"),
            "top_supplier": top_supplier_name,
            "ibn_score": float(top_recommendation.get("ibn_score", 0.0)),
            "confidence": float(top_recommendation.get("confidence_score", 0.0)),
            "confidence_pct": f"{int(top_recommendation.get('confidence_score', 0.0) * 100)}%",
            "reason": top_recommendation.get("reasoning", "No reasoning provided"),
            "ranked_suppliers": self._format_ranked_suppliers(ranked_suppliers),
            "signal_summary": signal_summary,
            "requires_human_review": bool(requires_human_review),
            "sap_po_draft": sap_po_draft,
            "generated_at": now_ist.strftime("%I:%M %p IST"),
            "generated_timestamp": now_ist.isoformat(),
            
            # Additional metadata
            "confidence_gate_applied": bool(top_recommendation.get("confidence_gate_applied", False)),
            "confidence_gate_reason": top_recommendation.get("confidence_gate_reason", ""),
            "circuit_breaker_alert": bool(top_recommendation.get("circuit_breaker_alert", False)),
            "circuit_breaker_message": top_recommendation.get("circuit_breaker_message", ""),
            "requires_dual_approval": bool(top_recommendation.get("requires_dual_approval", False)),
            "dual_approval_reason": top_recommendation.get("dual_approval_reason", ""),
            "estimated_value": float(top_recommendation.get("estimated_value", 0)),
            
            # RAG information
            "rag_deviation": float(top_recommendation.get("rag_deviation", 0.0)),
            "similar_cases": top_recommendation.get("similar_cases", []),
            "baseline_score": float(top_recommendation.get("baseline_score", 0.0)),
            
            # Processing metadata
            "total_signals_processed": len(gemini_results),
            "pipeline_completion_time": now_ist.strftime("%I:%M %p IST"),
            "time_to_market_open": self._calculate_time_to_market_open(now_ist)
        }
        
        # Convert all numpy types to native Python types
        output = convert_numpy_types(output)
        
        return output
    
    def _generate_sap_po_draft(self, recommendation: Dict[str, Any], suppliers: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate SAP Purchase Order draft"""
        
        # Find top supplier details
        top_supplier_name = recommendation.get("supplier_name", "Unknown")
        top_supplier = next((s for s in suppliers if s["supplier_name"] == top_supplier_name), {})
        
        # Calculate delivery date (typically 2-4 weeks for rubber)
        delivery_date = datetime.now() + timedelta(days=21)  # 3 weeks
        
        # Determine quantity based on supplier grade and capacity
        grade = top_supplier.get("grade", "RSS2")
        if grade == "RSS1":
            quantity = "300 MT"  # Premium grade, smaller quantities
        elif grade in ["RSS2", "RSS3"]:
            quantity = "500 MT"  # Standard quantities
        else:
            quantity = "400 MT"  # Other grades
        
        # Determine if approval is required
        requires_approval = (
            recommendation.get("requires_dual_approval", False) or
            recommendation.get("confidence_score", 0.0) < 0.75 or
            recommendation.get("recommended_action", "") != "BUY"
        )
        
        sap_po_draft = {
            "vendor": top_supplier_name,
            "vendor_code": self._generate_vendor_code(top_supplier_name),
            "material": f"{grade} Natural Rubber",
            "material_code": f"MAT-{grade}-001",
            "quantity": quantity,
            "unit": "MT",
            "delivery_date": delivery_date.strftime("%Y-%m-%d"),
            "delivery_location": "CEAT Tyres - Halol Plant",
            "price_basis": "Bangkok Exchange + 2%",
            "payment_terms": "30 days from delivery",
            "quality_spec": f"Mooney Viscosity as per {grade} standards",
            "requires_approval": requires_approval,
            "approval_level": "Dual" if recommendation.get("requires_dual_approval", False) else "Single",
            "created_by": "ProcureIQ System",
            "priority": "High" if recommendation.get("recommended_action") == "BUY" else "Normal"
        }
        
        return sap_po_draft
    
    def _generate_vendor_code(self, supplier_name: str) -> str:
        """Generate vendor code from supplier name"""
        # Simple vendor code generation
        words = supplier_name.replace(" ", "").upper()
        if len(words) >= 6:
            return words[:6]
        else:
            return words.ljust(6, "0")
    
    def _format_ranked_suppliers(self, suppliers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Format supplier rankings for output"""
        formatted = []
        
        for supplier in suppliers:
            formatted.append({
                "rank": int(supplier.get("rank", 0)),
                "supplier_name": supplier.get("supplier_name", ""),
                "country": supplier.get("country", ""),
                "grade": supplier.get("grade", ""),
                "ibn_score": float(supplier.get("ibn_score", 0.0)),
                "quality_score": float(supplier.get("quality_score", 0.0)),
                "cost_score": float(supplier.get("cost_score", 0.0)),
                "lead_time_score": float(supplier.get("lead_time_score", 0.0)),
                "carbon_score": float(supplier.get("carbon_score", 0.0)),
                "signal_adjustment": float(supplier.get("signal_adjustment", 0.0)),
                "review_flag": bool(supplier.get("ibn_score", 0.0) < 0.60)
            })
        
        return formatted
    
    def _calculate_time_to_market_open(self, current_time: datetime) -> Dict[str, Any]:
        """Calculate time remaining until Bangkok market opens (6:30 AM IST)"""
        
        # Bangkok market opens at 6:30 AM IST
        market_open_time = current_time.replace(hour=6, minute=30, second=0, microsecond=0)
        
        # If current time is past 6:30 AM, market open is next day
        if current_time.time() > market_open_time.time():
            market_open_time += timedelta(days=1)
        
        time_diff = market_open_time - current_time
        
        hours = int(time_diff.total_seconds() // 3600)
        minutes = int((time_diff.total_seconds() % 3600) // 60)
        
        # Determine urgency level
        total_minutes = hours * 60 + minutes
        if total_minutes > 60:
            urgency = "low"
            color = "green"
        elif total_minutes > 30:
            urgency = "medium"
            color = "yellow"
        else:
            urgency = "high"
            color = "red"
        
        return {
            "hours": hours,
            "minutes": minutes,
            "total_minutes": total_minutes,
            "urgency": urgency,
            "color": color,
            "market_opens_at": market_open_time.strftime("%I:%M %p IST"),
            "is_market_open": total_minutes <= 0
        }
    
    def generate_signal_summary(self, processed_signals: List[Dict[str, Any]], 
                              gemini_results: List[Dict[str, Any]]) -> str:
        """Generate comprehensive signal summary"""
        
        if not processed_signals and not gemini_results:
            return "No signals processed"
        
        summary_parts = []
        
        # Signal source summary
        sources = set()
        languages = set()
        grades_detected = set()
        
        for signal in processed_signals:
            original = signal.get("original_signal", {})
            sources.add(original.get("source", "Unknown"))
            languages.add(signal.get("language_detected", "unknown"))
            
            # Extract grades from entities
            entities = signal.get("entities", {})
            for grade in entities.get("grades", []):
                grades_detected.add(grade)
        
        # Build comprehensive summary
        summary_parts.append(f"Processed {len(processed_signals)} signals")
        
        if len(languages) > 1:
            lang_list = ', '.join(sorted([l for l in languages if l != 'unknown']))
            if lang_list:
                summary_parts.append(f"Languages: {lang_list}")
        
        # Add grades detected
        if grades_detected:
            summary_parts.append(f"Grades detected: {', '.join(sorted(grades_detected))}")
        
        # Add reasoning from top Gemini result if available
        if gemini_results:
            top_result = max(gemini_results, key=lambda x: x.get("confidence_score", 0.0))
            reasoning = top_result.get("reasoning", "")
            if reasoning and reasoning != "No reasoning provided":
                summary_parts.append(reasoning)
        
        return ". ".join(summary_parts)
    
    def format_for_dashboard(self, output: Dict[str, Any]) -> Dict[str, Any]:
        """Format output specifically for dashboard display"""
        
        # Determine badge color
        recommendation = output.get("recommendation", "WAIT")
        if recommendation == "BUY":
            badge_color = "#22c55e"  # Green
        elif recommendation == "WAIT":
            badge_color = "#eab308"   # Yellow
        elif recommendation == "SWITCH":
            badge_color = "#ef4444"  # Red
        else:
            badge_color = "#6b7280"  # Gray
        
        # Ensure estimated_value has a default
        estimated_value = output.get("estimated_value", 75000000.0)  # Default ₹7.5 Cr
        if estimated_value is None or estimated_value == 0:
            estimated_value = 75000000.0
        
        dashboard_output = {
            **output,
            "badge_color": badge_color,
            "confidence_percentage": int(output.get("confidence", 0.0) * 100),
            "show_warning": output.get("requires_human_review", False),
            "warning_message": self._get_warning_message(output),
            "can_approve": recommendation != "WAIT" and not output.get("circuit_breaker_alert", False),
            "approval_button_text": "APPROVE ORDER" if recommendation == "BUY" else "APPROVE DECISION",
            "estimated_value": estimated_value,
            "requires_dual_approval": output.get("requires_dual_approval", True),
            "dual_approval_reason": output.get("dual_approval_reason", f"Order value ₹{estimated_value:,.0f} exceeds auto-approval limit")
        }
        
        return dashboard_output
    
    def _get_warning_message(self, output: Dict[str, Any]) -> str:
        """Generate appropriate warning message"""
        warnings = []
        
        if output.get("confidence_gate_applied", False):
            warnings.append("Low confidence score")
        
        if output.get("requires_dual_approval", False):
            warnings.append("Dual approval required")
        
        if output.get("circuit_breaker_alert", False):
            warnings.append("Multiple consecutive WAIT recommendations")
        
        if output.get("rag_deviation", 0.0) > 0.30:
            warnings.append("Significant deviation from historical patterns")
        
        if not warnings:
            warnings.append("Human review recommended")
        
        return " • ".join(warnings)