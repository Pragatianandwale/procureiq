import pandas as pd
import numpy as np
import faiss
import pickle
import os
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any, Tuple

class RAGProcessor:
    def __init__(self):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.index = None
        self.historical_data = []
        self.index_path = os.path.join(os.path.dirname(__file__), "..", "models", "faiss_index.bin")
        self.data_path = os.path.join(os.path.dirname(__file__), "..", "data", "historical_decisions.csv")
        self._load_or_build_index()
    
    def _load_or_build_index(self):
        """Load existing FAISS index or build new one"""
        try:
            if os.path.exists(self.index_path):
                self._load_index()
            else:
                self._build_index()
        except Exception as e:
            print(f"Error with FAISS index: {e}")
            self._build_index()
    
    def _build_index(self):
        """Build FAISS index from historical decisions"""
        try:
            # Load historical data
            df = pd.read_csv(self.data_path)
            self.historical_data = df.to_dict('records')
            
            # Create text representations for embedding
            texts = []
            for record in self.historical_data:
                text = f"{record['supplier']} {record['grade']} {record['recommendation']} score:{record['score']}"
                texts.append(text)
            
            # Generate embeddings
            embeddings = self.model.encode(texts)
            
            # Build FAISS index
            dimension = embeddings.shape[1]
            self.index = faiss.IndexFlatL2(dimension)
            self.index.add(embeddings.astype('float32'))
            
            # Save index
            os.makedirs(os.path.dirname(self.index_path), exist_ok=True)
            faiss.write_index(self.index, self.index_path)
            
            # Save historical data reference
            with open(self.index_path + ".data", "wb") as f:
                pickle.dump(self.historical_data, f)
            
            print(f"Built FAISS index with {len(self.historical_data)} records")
            
        except Exception as e:
            print(f"Error building FAISS index: {e}")
            # Create empty index as fallback
            self.index = faiss.IndexFlatL2(384)  # MiniLM dimension
            self.historical_data = []
    
    def _load_index(self):
        """Load existing FAISS index"""
        try:
            self.index = faiss.read_index(self.index_path)
            
            # Load historical data reference
            with open(self.index_path + ".data", "rb") as f:
                self.historical_data = pickle.load(f)
            
            print(f"Loaded FAISS index with {len(self.historical_data)} records")
            
        except Exception as e:
            print(f"Error loading FAISS index: {e}")
            self._build_index()
    
    def cross_check_recommendation(self, gemini_result: Dict[str, Any]) -> Dict[str, Any]:
        """Cross-check Gemini recommendation against historical data"""
        if not self.index or len(self.historical_data) == 0:
            return {
                **gemini_result,
                "requires_human_review": True,
                "rag_deviation": 0.0,
                "similar_cases": [],
                "rag_note": "No historical data available"
            }
        
        try:
            # Create query text
            query_text = f"{gemini_result['supplier_name']} {gemini_result['grade_detected']} {gemini_result['recommended_action']}"
            
            # Get embedding for query
            query_embedding = self.model.encode([query_text])
            
            # Search for similar cases
            k = min(3, len(self.historical_data))  # Top 3 or less if not enough data
            distances, indices = self.index.search(query_embedding.astype('float32'), k)
            
            # Get similar cases
            similar_cases = []
            baseline_scores = []
            
            for i, idx in enumerate(indices[0]):
                if idx < len(self.historical_data):
                    case = self.historical_data[idx]
                    similar_cases.append({
                        "supplier": case["supplier"],
                        "grade": case["grade"],
                        "recommendation": case["recommendation"],
                        "manager_decision": case["manager_decision"],
                        "outcome": case["outcome"],
                        "score": case["score"],
                        "similarity": float(1.0 / (1.0 + distances[0][i]))  # Convert distance to similarity
                    })
                    baseline_scores.append(case["score"])
            
            # Calculate deviation from baseline
            if baseline_scores:
                avg_baseline = np.mean(baseline_scores)
                current_confidence = gemini_result["confidence_score"]
                deviation = abs(current_confidence - avg_baseline) / avg_baseline
            else:
                deviation = 0.0
            
            # Determine if human review is required
            requires_review = deviation > 0.30 or gemini_result["confidence_score"] < 0.55
            
            return {
                **gemini_result,
                "requires_human_review": requires_review,
                "rag_deviation": float(deviation),
                "similar_cases": similar_cases,
                "baseline_score": float(np.mean(baseline_scores)) if baseline_scores else 0.0,
                "rag_note": f"Deviation: {deviation:.2%}" if deviation > 0.30 else "Within normal range"
            }
            
        except Exception as e:
            print(f"Error in RAG cross-check: {e}")
            return {
                **gemini_result,
                "requires_human_review": True,
                "rag_deviation": 0.0,
                "similar_cases": [],
                "rag_note": f"RAG processing error: {str(e)}"
            }
    
    def process_recommendations(self, gemini_results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Process multiple recommendations through RAG"""
        rag_results = []
        
        for result in gemini_results:
            rag_result = self.cross_check_recommendation(result)
            rag_results.append(rag_result)
        
        return rag_results
    
    def update_historical_data(self, new_decision: Dict[str, Any]):
        """Update historical data with new decision (for future use)"""
        try:
            # Add to in-memory data
            self.historical_data.append(new_decision)
            
            # Rebuild index with new data
            self._build_index()
            
        except Exception as e:
            print(f"Error updating historical data: {e}")
    
    def get_historical_accuracy(self, days: int = 30) -> Dict[str, Any]:
        """Calculate historical accuracy metrics"""
        try:
            df = pd.read_csv(self.data_path)
            
            # Filter recent data
            df['date'] = pd.to_datetime(df['date'])
            recent_df = df[df['date'] >= pd.Timestamp.now() - pd.Timedelta(days=days)]
            
            if len(recent_df) == 0:
                return {"accuracy": 0.0, "total_decisions": 0, "correct_decisions": 0}
            
            # Calculate accuracy
            correct = len(recent_df[recent_df['recommendation'] == recent_df['manager_decision']])
            total = len(recent_df)
            accuracy = correct / total if total > 0 else 0.0
            
            return {
                "accuracy": accuracy,
                "total_decisions": total,
                "correct_decisions": correct,
                "period_days": days
            }
            
        except Exception as e:
            print(f"Error calculating historical accuracy: {e}")
            return {"accuracy": 0.0, "total_decisions": 0, "correct_decisions": 0}