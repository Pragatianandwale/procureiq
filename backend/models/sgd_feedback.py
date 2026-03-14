import pickle
import numpy as np
import os
from sklearn.linear_model import SGDRegressor
from sklearn.preprocessing import StandardScaler
from typing import Dict, Any, List, Tuple
from datetime import datetime

class SGDFeedbackModel:
    def __init__(self):
        self.model = SGDRegressor(
            loss='squared_error',
            learning_rate='adaptive',
            eta0=0.01,
            random_state=42
        )
        self.scaler = StandardScaler()
        self.is_fitted = False
        self.feature_names = [
            'quality_score', 'cost_score', 'lead_time_score', 'carbon_score',
            'confidence_score', 'signal_strength', 'ibn_score'
        ]
        self.weights_path = os.path.join(os.path.dirname(__file__), "sgd_weights.pkl")
        self.training_log = []
        
        # Load existing model if available
        self._load_model()
    
    def _load_model(self):
        """Load existing SGD model from disk"""
        try:
            if os.path.exists(self.weights_path):
                with open(self.weights_path, 'rb') as f:
                    model_data = pickle.load(f)
                
                self.model = model_data['model']
                self.scaler = model_data['scaler']
                self.is_fitted = model_data['is_fitted']
                self.training_log = model_data.get('training_log', [])
                
                print(f"Loaded SGD model with {len(self.training_log)} training examples")
            else:
                print("No existing SGD model found - will create new one")
                self._initialize_with_historical_data()
                
        except Exception as e:
            print(f"Error loading SGD model: {e}")
            self._initialize_with_historical_data()
    
    def _initialize_with_historical_data(self):
        """Initialize model with historical decisions data"""
        try:
            import pandas as pd
            
            # Load historical decisions
            hist_path = os.path.join(os.path.dirname(__file__), "..", "data", "historical_decisions.csv")
            suppliers_path = os.path.join(os.path.dirname(__file__), "..", "data", "suppliers.csv")
            
            if os.path.exists(hist_path) and os.path.exists(suppliers_path):
                hist_df = pd.read_csv(hist_path)
                suppliers_df = pd.read_csv(suppliers_path)
                
                # Prepare training data
                X_init = []
                y_init = []
                
                for _, row in hist_df.iterrows():
                    # Find supplier data
                    supplier_data = suppliers_df[suppliers_df['supplier_name'] == row['supplier']]
                    
                    if not supplier_data.empty:
                        supplier = supplier_data.iloc[0]
                        
                        # Create feature vector
                        features = [
                            supplier['quality_score'],
                            supplier['cost_score'],
                            supplier['lead_time_score'],
                            supplier['carbon_score'],
                            row['score'],  # Use historical score as confidence
                            0.7,  # Default signal strength
                            (supplier['quality_score'] * 0.4 + supplier['cost_score'] * 0.3 + 
                             supplier['lead_time_score'] * 0.2 + supplier['carbon_score'] * 0.1)  # IBN score
                        ]
                        
                        # Target: 1 for positive outcome, 0 for negative
                        target = 1.0 if row['outcome'] == 'positive' else 0.0
                        
                        X_init.append(features)
                        y_init.append(target)
                
                if X_init:
                    X_init = np.array(X_init)
                    y_init = np.array(y_init)
                    
                    # Fit scaler and model
                    X_scaled = self.scaler.fit_transform(X_init)
                    self.model.fit(X_scaled, y_init)
                    self.is_fitted = True
                    
                    # Save initial model
                    self._save_model()
                    
                    print(f"Initialized SGD model with {len(X_init)} historical examples")
                
        except Exception as e:
            print(f"Error initializing with historical data: {e}")
    
    def _save_model(self):
        """Save SGD model to disk"""
        try:
            os.makedirs(os.path.dirname(self.weights_path), exist_ok=True)
            
            model_data = {
                'model': self.model,
                'scaler': self.scaler,
                'is_fitted': self.is_fitted,
                'training_log': self.training_log,
                'feature_names': self.feature_names,
                'saved_at': datetime.now().isoformat()
            }
            
            with open(self.weights_path, 'wb') as f:
                pickle.dump(model_data, f)
            
            print(f"Saved SGD model to {self.weights_path}")
            
        except Exception as e:
            print(f"Error saving SGD model: {e}")
    
    def process_override(self, override_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process manager override and update model"""
        
        try:
            # Extract features from override data
            features = self._extract_features(override_data)
            
            if features is None:
                return {"success": False, "error": "Could not extract features"}
            
            # Determine target value based on manager decision vs original recommendation
            original_rec = override_data.get('original_recommendation', '')
            manager_decision = override_data.get('manager_decision', '')
            
            # If manager agreed with original recommendation, target = 1.0
            # If manager disagreed, target = 0.0
            target = 1.0 if original_rec == manager_decision else 0.0
            
            # Update model with partial_fit
            X = np.array([features])
            y = np.array([target])
            
            if self.is_fitted:
                # Scale features
                X_scaled = self.scaler.transform(X)
                # Partial fit (online learning)
                self.model.partial_fit(X_scaled, y)
            else:
                # First training example
                X_scaled = self.scaler.fit_transform(X)
                self.model.fit(X_scaled, y)
                self.is_fitted = True
            
            # Log training example
            training_entry = {
                'timestamp': datetime.now().isoformat(),
                'original_recommendation': original_rec,
                'manager_decision': manager_decision,
                'target_value': target,
                'features': features,
                'reason': override_data.get('reason', '')
            }
            
            self.training_log.append(training_entry)
            
            # Save updated model
            self._save_model()
            
            return {
                "success": True,
                "target_value": target,
                "total_training_examples": len(self.training_log),
                "model_updated": True
            }
            
        except Exception as e:
            print(f"Error processing override: {e}")
            return {"success": False, "error": str(e)}
    
    def _extract_features(self, override_data: Dict[str, Any]) -> List[float]:
        """Extract feature vector from override data"""
        
        try:
            # Get supplier data
            supplier_name = override_data.get('supplier_name', '')
            
            # Load supplier scores
            import pandas as pd
            suppliers_path = os.path.join(os.path.dirname(__file__), "..", "data", "suppliers.csv")
            suppliers_df = pd.read_csv(suppliers_path)
            
            supplier_data = suppliers_df[suppliers_df['supplier_name'] == supplier_name]
            
            if supplier_data.empty:
                print(f"Supplier {supplier_name} not found in suppliers data")
                return None
            
            supplier = supplier_data.iloc[0]
            
            # Extract features in the same order as training
            features = [
                float(supplier['quality_score']),
                float(supplier['cost_score']),
                float(supplier['lead_time_score']),
                float(supplier['carbon_score']),
                float(override_data.get('confidence_score', 0.5)),
                float(override_data.get('signal_strength', 0.5)),
                float(override_data.get('ibn_score', 0.5))
            ]
            
            return features
            
        except Exception as e:
            print(f"Error extracting features: {e}")
            return None
    
    def predict_outcome(self, recommendation_data: Dict[str, Any]) -> Dict[str, Any]:
        """Predict outcome probability for a recommendation"""
        
        if not self.is_fitted:
            return {
                "prediction": 0.5,
                "confidence": 0.0,
                "model_ready": False,
                "message": "Model not yet trained"
            }
        
        try:
            features = self._extract_features(recommendation_data)
            
            if features is None:
                return {
                    "prediction": 0.5,
                    "confidence": 0.0,
                    "model_ready": False,
                    "message": "Could not extract features"
                }
            
            # Scale features and predict
            X = np.array([features])
            X_scaled = self.scaler.transform(X)
            
            # Get prediction (probability of positive outcome)
            prediction = self.model.predict(X_scaled)[0]
            
            # Clip prediction to [0, 1] range
            prediction = max(0.0, min(1.0, prediction))
            
            # Calculate confidence based on distance from 0.5
            confidence = abs(prediction - 0.5) * 2
            
            return {
                "prediction": float(prediction),
                "confidence": float(confidence),
                "model_ready": True,
                "training_examples": len(self.training_log),
                "message": f"Prediction based on {len(self.training_log)} training examples"
            }
            
        except Exception as e:
            print(f"Error making prediction: {e}")
            return {
                "prediction": 0.5,
                "confidence": 0.0,
                "model_ready": False,
                "message": f"Prediction error: {str(e)}"
            }
    
    def get_model_stats(self) -> Dict[str, Any]:
        """Get model statistics and performance metrics"""
        
        return {
            "is_fitted": self.is_fitted,
            "total_training_examples": len(self.training_log),
            "feature_names": self.feature_names,
            "model_type": "SGDRegressor",
            "learning_rate": self.model.learning_rate,
            "weights_file_exists": os.path.exists(self.weights_path),
            "last_training": self.training_log[-1]["timestamp"] if self.training_log else None,
            "recent_overrides": len([log for log in self.training_log 
                                   if log.get("target_value", 1.0) == 0.0])  # Count disagreements
        }
    
    def get_training_log(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get recent training log entries"""
        return self.training_log[-limit:] if self.training_log else []