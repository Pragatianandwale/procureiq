import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Any, Optional

class Database:
    def __init__(self, db_path: str = "procureiq.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize SQLite database with required tables"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Recommendations table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS recommendations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT,
                recommendation TEXT,
                top_supplier TEXT,
                ibn_score REAL,
                confidence REAL,
                signal_summary TEXT,
                sap_po_draft TEXT,
                requires_human_review INTEGER,
                approved INTEGER DEFAULT 0,
                generated_at TEXT
            )
        """)
        
        # Overrides table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS overrides (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                recommendation_id INTEGER,
                original_recommendation TEXT,
                manager_decision TEXT,
                reason TEXT,
                outcome TEXT,
                timestamp TEXT
            )
        """)
        
        # Audit log table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS audit_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                action TEXT,
                details TEXT,
                timestamp TEXT
            )
        """)
        
        conn.commit()
        conn.close()
    
    def save_recommendation(self, recommendation: Dict[str, Any]) -> int:
        """Save recommendation to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO recommendations 
            (date, recommendation, top_supplier, ibn_score, confidence, 
             signal_summary, sap_po_draft, requires_human_review, generated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            datetime.now().strftime("%Y-%m-%d"),
            recommendation["recommendation"],
            recommendation["top_supplier"],
            recommendation["ibn_score"],
            recommendation["confidence"],
            recommendation["signal_summary"],
            json.dumps(recommendation["sap_po_draft"]),
            1 if recommendation["requires_human_review"] else 0,
            recommendation["generated_at"]
        ))
        
        rec_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        self.log_audit("RECOMMENDATION_SAVED", f"ID: {rec_id}")
        return rec_id
    
    def get_latest_recommendation(self) -> Optional[Dict[str, Any]]:
        """Get the latest recommendation"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM recommendations 
            ORDER BY id DESC LIMIT 1
        """)
        
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return None
        
        return {
            "id": row[0],
            "date": row[1],
            "recommendation": row[2],
            "top_supplier": row[3],
            "ibn_score": row[4],
            "confidence": row[5],
            "signal_summary": row[6],
            "sap_po_draft": json.loads(row[7]) if row[7] else {},
            "requires_human_review": bool(row[8]),
            "approved": bool(row[9]),
            "generated_at": row[10]
        }
    
    def save_override(self, recommendation_id: int, original_rec: str, 
                     manager_decision: str, reason: str, outcome: str = "") -> int:
        """Save manager override"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO overrides 
            (recommendation_id, original_recommendation, manager_decision, reason, outcome, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            recommendation_id,
            original_rec,
            manager_decision,
            reason,
            outcome,
            datetime.now().isoformat()
        ))
        
        override_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        self.log_audit("OVERRIDE_SAVED", f"Rec ID: {recommendation_id}, Decision: {manager_decision}")
        return override_id
    
    def get_history(self, days: int = 30) -> List[Dict[str, Any]]:
        """Get recommendation history"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT r.date, r.recommendation, r.top_supplier, r.confidence,
                   o.manager_decision, o.outcome, o.reason
            FROM recommendations r
            LEFT JOIN overrides o ON r.id = o.recommendation_id
            WHERE date(r.date) >= date('now', '-{} days')
            ORDER BY r.date DESC
        """.format(days))
        
        rows = cursor.fetchall()
        conn.close()
        
        return [{
            "date": row[0],
            "recommendation": row[1],
            "top_supplier": row[2],
            "confidence": row[3],
            "manager_decision": row[4] or row[1],
            "outcome": row[5] or "pending",
            "reason": row[6] or ""
        } for row in rows]
    
    def log_audit(self, action: str, details: str):
        """Log audit trail"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO audit_log (action, details, timestamp)
            VALUES (?, ?, ?)
        """, (action, details, datetime.now().isoformat()))
        
        conn.commit()
        conn.close()
    
    def get_audit_log(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get audit log"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT action, details, timestamp FROM audit_log
            ORDER BY timestamp DESC LIMIT ?
        """, (limit,))
        
        rows = cursor.fetchall()
        conn.close()
        
        return [{
            "action": row[0],
            "details": row[1],
            "timestamp": row[2]
        } for row in rows]