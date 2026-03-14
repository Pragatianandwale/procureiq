from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import uvicorn
from datetime import datetime

# Import pipeline components
from database import Database
from pipeline.ingestion import DataIngestion
from pipeline.nlp import NLPProcessor
from pipeline.gemini import GeminiProcessor
from pipeline.rag import RAGProcessor
from pipeline.ibn import IBNRoutingEngine
from pipeline.confidence import ConfidenceGate
from pipeline.output import OutputGenerator
from pipeline.privacy import PrivacyProcessor
from models.sgd_feedback import SGDFeedbackModel

app = FastAPI(title="ProcureIQ API", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Vercel + localhost
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
db = Database()
ingestion = DataIngestion()
nlp_processor = NLPProcessor()
gemini_processor = GeminiProcessor()
rag_processor = RAGProcessor()
ibn_engine = IBNRoutingEngine()
confidence_gate = ConfidenceGate()
output_generator = OutputGenerator()
privacy_processor = PrivacyProcessor()
sgd_model = SGDFeedbackModel()

# Pydantic models
class OverrideRequest(BaseModel):
    recommendation_id: Optional[int] = None
    original_recommendation: str
    manager_decision: str
    reason: str
    outcome: str = ""
    supplier_name: str = ""
    confidence_score: float = 0.5
    ibn_score: float = 0.5

class WeightsUpdate(BaseModel):
    quality: float
    cost: float
    lead_time: float
    carbon: float

class BrokerInput(BaseModel):
    text: str
@app.get("/")
async def root():
    return {"message": "ProcureIQ API is running", "version": "1.0.0"}

@app.post("/api/pipeline/run")
async def run_pipeline(broker_input: Optional[BrokerInput] = None):
    """Manually trigger the full pipeline"""
    try:
        # Step 1: Data Ingestion
        broker_text = broker_input.text if broker_input else None
        raw_signals = ingestion.ingest_all(broker_text)
        
        # Step 2: NLP Processing
        processed_signals = nlp_processor.process_signals(raw_signals)
        
        # Step 3: Privacy Protection
        safe_signals = privacy_processor.ensure_harrisons_privacy(processed_signals)
        
        # Step 4: Gemini Processing (external signals only)
        gemini_results = gemini_processor.process_signals(safe_signals)
        
        # Step 5: RAG Cross-check
        rag_results = rag_processor.process_recommendations(gemini_results)
        
        # Step 6: IBN Routing
        ranked_suppliers = ibn_engine.apply_signal_adjustments(rag_results)
        top_recommendation = gemini_processor.get_top_recommendation(rag_results)
        
        # Add IBN score to top recommendation
        if top_recommendation.get("supplier_name"):
            supplier_data = ibn_engine.get_supplier_by_name(top_recommendation["supplier_name"])
            top_recommendation["ibn_score"] = supplier_data.get("ibn_score", 0.0)
        
        # Step 7: Confidence Gate
        final_recommendation = confidence_gate.process_recommendation(top_recommendation)
        
        # Step 8: Generate Output
        signal_summary = nlp_processor.get_signal_summary(processed_signals)
        final_output = output_generator.generate_final_output(
            final_recommendation, ranked_suppliers, signal_summary, rag_results
        )
        
        # Step 9: Save to Database
        rec_id = db.save_recommendation(final_output)
        final_output["id"] = rec_id
        
        return final_output
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline error: {str(e)}")

@app.get("/api/recommendation/latest")
async def get_latest_recommendation():
    """Get the latest recommendation"""
    try:
        recommendation = db.get_latest_recommendation()
        if not recommendation:
            return {"message": "No recommendations found"}
        
        # Add current supplier rankings from IBN engine
        ranked_suppliers = ibn_engine.rank_suppliers()
        recommendation["ranked_suppliers"] = ranked_suppliers
        
        # Format for dashboard
        dashboard_output = output_generator.format_for_dashboard(recommendation)
        return dashboard_output
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching recommendation: {str(e)}")

@app.post("/api/override")
async def submit_override(override: OverrideRequest):
    """Submit manager override and trigger SGD update"""
    try:
        # Save override to database
        override_id = db.save_override(
            override.recommendation_id or 0,
            override.original_recommendation,
            override.manager_decision,
            override.reason,
            override.outcome
        )
        
        # Update SGD model
        sgd_result = sgd_model.process_override({
            "original_recommendation": override.original_recommendation,
            "manager_decision": override.manager_decision,
            "reason": override.reason,
            "supplier_name": override.supplier_name,
            "confidence_score": override.confidence_score,
            "ibn_score": override.ibn_score
        })
        
        return {
            "override_id": override_id,
            "sgd_update": sgd_result,
            "message": "Override processed and model updated"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing override: {str(e)}")

@app.get("/api/suppliers")
async def get_suppliers():
    """Get ranked supplier list with IBN scores"""
    try:
        ranked_suppliers = ibn_engine.rank_suppliers()
        return {
            "suppliers": ranked_suppliers,
            "weights": ibn_engine.get_weights(),
            "total_suppliers": len(ranked_suppliers)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching suppliers: {str(e)}")

@app.get("/api/signals")
async def get_signals():
    """Get latest translated signal feed with original language + translation"""
    try:
        raw_signals = ingestion.fetch_rss_feeds()
        # Also add Harrisons internal signals
        harrisons = ingestion.fetch_harrisons_data()

        formatted_signals = []

        # Add RSS signals
        for signal in raw_signals:
            data = signal.get("data", {})
            original_text = data.get("original_text", signal.get("title", ""))
            clean_title = signal.get("title", "")
            lang = signal.get("language", "en")
            lang_code = data.get("lang_code", lang.upper()[:2])
            flag = signal.get("flag", "🌐")
            link = data.get("link", "")

            # For non-English, show original + EN translation
            is_translated = lang not in ("en",)

            formatted_signals.append({
                "timestamp": signal.get("published", "")[:16].replace("T", " "),
                "source": signal.get("source", "Unknown"),
                "flag": flag,
                "lang_code": lang_code,
                "language": lang,
                "is_internal": signal.get("is_internal", False),
                "original_text": original_text if is_translated else "",
                "title": clean_title,
                "summary": signal.get("summary", "")[:200],
                "link": link,
                "is_translated": is_translated,
            })

        # Add Harrisons internal signals (marked RPG Internal)
        for signal in harrisons[:2]:
            formatted_signals.append({
                "timestamp": signal.get("published", "")[:16].replace("T", " "),
                "source": "RPG Internal",
                "flag": "🇮🇳",
                "lang_code": "IN",
                "language": "en",
                "is_internal": True,
                "original_text": "ഹാരിസൺസ് മലയാളം വിളവെടുപ്പ് ട്രാക്കിൽ",
                "title": signal.get("summary", ""),
                "summary": signal.get("summary", ""),
                "link": "",
                "is_translated": True,
            })

        return {"signals": formatted_signals}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching signals: {str(e)}")

@app.get("/api/history")
async def get_history(days: int = 30):
    """Get recommendation history"""
    try:
        history = db.get_history(days)
        
        # Calculate accuracy
        total = len(history)
        if total > 0:
            matches = sum(1 for h in history if h["recommendation"] == h["manager_decision"])
            accuracy = matches / total
        else:
            accuracy = 0.0
        
        return {
            "history": history,
            "accuracy": accuracy,
            "total_decisions": total,
            "period_days": days
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching history: {str(e)}")

@app.post("/api/settings/weights")
async def update_weights(weights: WeightsUpdate):
    """Update IBN weights and rerun ranking"""
    try:
        new_weights = {
            "quality": weights.quality,
            "cost": weights.cost,
            "lead_time": weights.lead_time,
            "carbon": weights.carbon
        }
        
        result = ibn_engine.update_weights(new_weights)
        
        return {
            "message": "Weights updated successfully",
            "new_weights": result["weights"],
            "updated_rankings": result["ranked_suppliers"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating weights: {str(e)}")

@app.get("/api/audit")
async def get_audit_log(limit: int = 100):
    """Get audit log"""
    try:
        audit_log = db.get_audit_log(limit)
        confidence_log = confidence_gate.get_audit_log()
        privacy_log = privacy_processor.get_access_log()
        sgd_log = sgd_model.get_training_log()
        
        return {
            "database_audit": audit_log,
            "confidence_audit": confidence_log[-20:],  # Last 20 entries
            "privacy_audit": privacy_log[-20:],
            "sgd_training": sgd_log[-10:],  # Last 10 training entries
            "total_entries": len(audit_log) + len(confidence_log) + len(privacy_log)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching audit log: {str(e)}")

@app.get("/api/status")
async def get_system_status():
    """Get system status and health checks"""
    try:
        # Check various components
        ollama_status = privacy_processor.check_ollama_status()
        sgd_stats = sgd_model.get_model_stats()
        confidence_stats = confidence_gate.get_confidence_stats()
        supplier_validation = ibn_engine.validate_supplier_data()
        
        return {
            "system_healthy": True,
            "ollama": ollama_status,
            "sgd_model": sgd_stats,
            "confidence_gate": confidence_stats,
            "suppliers": supplier_validation,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {
            "system_healthy": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

@app.get("/api/data-sources/live")
async def get_live_data_sources():
    """Fetch and return all live data sources"""
    try:
        # Ingest all data sources
        signals = ingestion.ingest_all()
        
        return signals
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching live data sources: {str(e)}")

@app.post("/api/simulate")
async def simulate_scenario(scenario: dict):
    """Simulate a scenario by adjusting supplier scores and returning new rankings"""
    try:
        import copy

        scenario_type = scenario.get("type", "normal")

        # Base supplier data
        base_suppliers = [
            {"supplier_name": "Thai Rubber Co",        "country": "Thailand",  "grade": "RSS2", "quality_score": 0.85, "cost_score": 0.72, "lead_time_score": 0.80, "carbon_score": 0.65},
            {"supplier_name": "Vietnamese Rubber Group","country": "Vietnam",   "grade": "RSS3", "quality_score": 0.78, "cost_score": 0.81, "lead_time_score": 0.72, "carbon_score": 0.70},
            {"supplier_name": "Harrisons Malayalam",   "country": "India",     "grade": "RSS1", "quality_score": 0.92, "cost_score": 0.68, "lead_time_score": 0.95, "carbon_score": 0.88},
            {"supplier_name": "PT Rubber Indonesia",   "country": "Indonesia", "grade": "RSS2", "quality_score": 0.80, "cost_score": 0.75, "lead_time_score": 0.65, "carbon_score": 0.60},
        ]

        weights = {"quality": 0.40, "cost": 0.30, "lead_time": 0.20, "carbon": 0.10}
        suppliers = copy.deepcopy(base_suppliers)

        scenario_label = ""
        scenario_description = ""
        signal_change = ""

        if scenario_type == "kerala_flood":
            # Kerala heavy rain — Harrisons lead time collapses
            for s in suppliers:
                if s["supplier_name"] == "Harrisons Malayalam":
                    s["lead_time_score"] = 0.40  # Harvest delayed 2 weeks
                    s["quality_score"] = 0.88    # Slight quality risk
            scenario_label = "Kerala Flooding"
            scenario_description = "OpenWeatherMap: Kerala humidity 94%, heavy rain. Harrisons harvest delayed 2 weeks."
            signal_change = "Harrisons lead_time: 0.95 → 0.40 (harvest delayed)"

        elif scenario_type == "harrisons_not_ready":
            # Harrisons delivery_ready: false
            for s in suppliers:
                if s["supplier_name"] == "Harrisons Malayalam":
                    s["lead_time_score"] = 0.20  # Not available
                    s["quality_score"] = 0.92
            scenario_label = "Harrisons Harvest Not Ready"
            scenario_description = "harrisons_harvest.csv: delivery_ready = false for all upcoming dates."
            signal_change = "Harrisons lead_time: 0.95 → 0.20 (not available)"

        elif scenario_type == "bangkok_price_crash":
            # Bangkok prices crash — cost becomes dominant, Thai wins
            for s in suppliers:
                if s["supplier_name"] == "Thai Rubber Co":
                    s["cost_score"] = 0.95  # Very cheap now
                if s["supplier_name"] == "Vietnamese Rubber Group":
                    s["cost_score"] = 0.92
            scenario_label = "Bangkok Price Crash"
            scenario_description = "Bangkok Exchange: prices down 18%. External suppliers now significantly cheaper than Harrisons."
            signal_change = "Thai cost: 0.72 → 0.95, Vietnamese cost: 0.81 → 0.92"

        elif scenario_type == "low_confidence":
            # Contradictory signals — confidence drops below 55%
            scenario_label = "Contradictory Signals — WAIT"
            scenario_description = "Vietnamese harvest delayed + Indonesian exports down + Bangkok prices spiking. Signals contradictory."
            signal_change = "Confidence: 85% → 43% (below 55% threshold)"
            # Return WAIT immediately
            return {
                "scenario_type": scenario_type,
                "scenario_label": scenario_label,
                "scenario_description": scenario_description,
                "signal_change": signal_change,
                "recommendation": "WAIT",
                "top_supplier": None,
                "confidence": 0.43,
                "ranked_suppliers": [],
                "reason": "Confidence 43% — below 55% threshold. Vietnamese harvest delayed, Indonesian exports down, Bangkok prices spiking. Signals contradictory — no recommendation generated.",
                "wait_reason": "System refuses to recommend on weak signals. Silence is smarter than a wrong Rs.10 Cr order."
            }

        else:
            # Normal / today's scenario
            scenario_label = "Today — Normal Conditions"
            scenario_description = "Kerala optimal, Harrisons 450MT RSS1 ready, Bangkok prices rising."
            signal_change = "No adjustments — baseline scores"

        # Calculate IBN scores
        for s in suppliers:
            s["ibn_score"] = round(
                s["quality_score"] * weights["quality"] +
                s["cost_score"] * weights["cost"] +
                s["lead_time_score"] * weights["lead_time"] +
                s["carbon_score"] * weights["carbon"],
                3
            )

        # Rank
        suppliers.sort(key=lambda x: x["ibn_score"], reverse=True)
        for i, s in enumerate(suppliers):
            s["rank"] = i + 1

        top = suppliers[0]
        confidence = min(0.92, 0.55 + top["ibn_score"] * 0.45)

        return {
            "scenario_type": scenario_type,
            "scenario_label": scenario_label,
            "scenario_description": scenario_description,
            "signal_change": signal_change,
            "recommendation": "BUY",
            "top_supplier": top["supplier_name"],
            "confidence": round(confidence, 2),
            "ranked_suppliers": suppliers,
            "reason": f"{top['supplier_name']} ranks #1 with IBN score {int(top['ibn_score']*100)}. {scenario_description}"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
