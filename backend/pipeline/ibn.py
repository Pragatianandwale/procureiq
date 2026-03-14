import pandas as pd
import numpy as np
import os
from typing import List, Dict, Any, Tuple

class IBNRoutingEngine:
    def __init__(self):
        self.suppliers_data = []
        self.weights = {
            "quality": 0.40,
            "cost": 0.30,
            "lead_time": 0.20,
            "carbon": 0.10
        }
        self.data_path = os.path.join(os.path.dirname(__file__), "..", "data", "suppliers.csv")
        self._load_suppliers()
    
    def _load_suppliers(self):
        """Load supplier data from CSV"""
        try:
            df = pd.read_csv(self.data_path)
            self.suppliers_data = df.to_dict('records')
            print(f"Loaded {len(self.suppliers_data)} suppliers")
        except Exception as e:
            print(f"Error loading suppliers data: {e}")
            # Fallback data
            self.suppliers_data = [
                {
                    "supplier_name": "Thai Rubber Co",
                    "country": "Thailand",
                    "grade": "RSS2",
                    "quality_score": 0.85,
                    "cost_score": 0.72,
                    "lead_time_score": 0.80,
                    "carbon_score": 0.65
                },
                {
                    "supplier_name": "Vietnamese Rubber Group",
                    "country": "Vietnam",
                    "grade": "RSS3",
                    "quality_score": 0.78,
                    "cost_score": 0.81,
                    "lead_time_score": 0.72,
                    "carbon_score": 0.70
                },
                {
                    "supplier_name": "Harrisons Malayalam",
                    "country": "India",
                    "grade": "RSS1",
                    "quality_score": 0.92,
                    "cost_score": 0.68,
                    "lead_time_score": 0.95,
                    "carbon_score": 0.88
                },
                {
                    "supplier_name": "PT Rubber Indonesia",
                    "country": "Indonesia",
                    "grade": "RSS2",
                    "quality_score": 0.80,
                    "cost_score": 0.75,
                    "lead_time_score": 0.65,
                    "carbon_score": 0.60
                }
            ]
    
    def calculate_ibn_score(self, supplier: Dict[str, Any]) -> float:
        """Calculate IBN score for a supplier"""
        try:
            ibn_score = (
                supplier["quality_score"] * self.weights["quality"] +
                supplier["cost_score"] * self.weights["cost"] +
                supplier["lead_time_score"] * self.weights["lead_time"] +
                supplier["carbon_score"] * self.weights["carbon"]
            )
            return round(ibn_score, 3)
        except KeyError as e:
            print(f"Missing score field for supplier {supplier.get('supplier_name', 'Unknown')}: {e}")
            return 0.0
    
    def rank_suppliers(self) -> List[Dict[str, Any]]:
        """Rank all suppliers by IBN score"""
        ranked_suppliers = []
        
        for supplier in self.suppliers_data:
            supplier_with_score = supplier.copy()
            supplier_with_score["ibn_score"] = self.calculate_ibn_score(supplier)
            ranked_suppliers.append(supplier_with_score)
        
        # Sort by IBN score descending
        ranked_suppliers.sort(key=lambda x: x["ibn_score"], reverse=True)
        
        # Add rank
        for i, supplier in enumerate(ranked_suppliers):
            supplier["rank"] = i + 1
        
        return ranked_suppliers
    
    def get_top_supplier(self) -> Dict[str, Any]:
        """Get the top-ranked supplier"""
        ranked = self.rank_suppliers()
        return ranked[0] if ranked else {}
    
    def update_weights(self, new_weights: Dict[str, float]) -> Dict[str, Any]:
        """Update IBN weights and return new rankings"""
        # Validate weights sum to 1.0
        total_weight = sum(new_weights.values())
        if abs(total_weight - 1.0) > 0.01:
            # Normalize weights
            for key in new_weights:
                new_weights[key] = new_weights[key] / total_weight
        
        # Update weights
        self.weights.update(new_weights)
        
        # Return new rankings
        return {
            "weights": self.weights,
            "ranked_suppliers": self.rank_suppliers()
        }
    
    def get_supplier_by_name(self, supplier_name: str) -> Dict[str, Any]:
        """Get supplier data by name"""
        for supplier in self.suppliers_data:
            if supplier["supplier_name"].lower() == supplier_name.lower():
                supplier_with_score = supplier.copy()
                supplier_with_score["ibn_score"] = self.calculate_ibn_score(supplier)
                return supplier_with_score
        return {}
    
    def apply_signal_adjustments(self, gemini_results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Apply signal-based adjustments to supplier rankings"""
        adjusted_suppliers = self.rank_suppliers()
        
        # Create adjustment factors based on signals
        adjustments = {}
        
        for result in gemini_results:
            supplier_name = result.get("supplier_name", "")
            signal_type = result.get("signal_type", "normal")
            signal_strength = result.get("signal_strength", 0.0)
            
            if supplier_name and supplier_name != "Unknown":
                # Calculate adjustment factor
                if signal_type == "price_up":
                    # Negative adjustment for price increases
                    adjustment = -0.1 * signal_strength
                elif signal_type == "price_down":
                    # Positive adjustment for price decreases
                    adjustment = 0.1 * signal_strength
                elif signal_type == "supply_disruption":
                    # Strong negative adjustment for supply issues
                    adjustment = -0.2 * signal_strength
                elif signal_type == "quality_alert":
                    # Negative adjustment for quality issues
                    adjustment = -0.15 * signal_strength
                elif signal_type == "harvest_delay":
                    # Moderate negative adjustment for delays
                    adjustment = -0.1 * signal_strength
                else:
                    adjustment = 0.0
                
                adjustments[supplier_name] = adjustment
        
        # Apply adjustments
        for supplier in adjusted_suppliers:
            supplier_name = supplier["supplier_name"]
            if supplier_name in adjustments:
                original_score = supplier["ibn_score"]
                adjusted_score = max(0.0, min(1.0, original_score + adjustments[supplier_name]))
                supplier["ibn_score"] = round(adjusted_score, 3)
                supplier["signal_adjustment"] = adjustments[supplier_name]
            else:
                supplier["signal_adjustment"] = 0.0
        
        # Re-sort by adjusted scores
        adjusted_suppliers.sort(key=lambda x: x["ibn_score"], reverse=True)
        
        # Update ranks
        for i, supplier in enumerate(adjusted_suppliers):
            supplier["rank"] = i + 1
        
        return adjusted_suppliers
    
    def get_weights(self) -> Dict[str, float]:
        """Get current IBN weights"""
        return self.weights.copy()
    
    def validate_supplier_data(self) -> Dict[str, Any]:
        """Validate supplier data integrity"""
        issues = []
        
        for supplier in self.suppliers_data:
            # Check required fields
            required_fields = ["supplier_name", "country", "grade", "quality_score", "cost_score", "lead_time_score", "carbon_score"]
            for field in required_fields:
                if field not in supplier:
                    issues.append(f"Missing {field} for {supplier.get('supplier_name', 'Unknown')}")
            
            # Check score ranges
            score_fields = ["quality_score", "cost_score", "lead_time_score", "carbon_score"]
            for field in score_fields:
                if field in supplier:
                    score = supplier[field]
                    if not (0.0 <= score <= 1.0):
                        issues.append(f"Invalid {field} for {supplier['supplier_name']}: {score}")
        
        return {
            "valid": len(issues) == 0,
            "issues": issues,
            "total_suppliers": len(self.suppliers_data)
        }