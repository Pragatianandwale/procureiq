try:
    import spacy
    SPACY_AVAILABLE = True
except Exception as e:
    print(f"Warning: spaCy not available due to compatibility issue: {e}")
    SPACY_AVAILABLE = False
    spacy = None

from deep_translator import GoogleTranslator
from typing import List, Dict, Any
import json

class NLPProcessor:
    def __init__(self):
        self.translator = GoogleTranslator(source='auto', target='en')
        self.nlp = None
        if SPACY_AVAILABLE:
            self._load_spacy_model()
            self._setup_entity_ruler()
        else:
            print("Running in fallback mode without spaCy NLP features")
    
    def _load_spacy_model(self):
        """Load spaCy model with error handling"""
        if not SPACY_AVAILABLE:
            return
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            print("spaCy model 'en_core_web_sm' not found. Please install it with: python -m spacy download en_core_web_sm")
            # Create a basic nlp object for fallback
            self.nlp = spacy.blank("en")
    
    def _setup_entity_ruler(self):
        """Add custom entity patterns for rubber industry"""
        if not SPACY_AVAILABLE or not self.nlp:
            return
        if not self.nlp.has_pipe("entity_ruler"):
            ruler = self.nlp.add_pipe("entity_ruler", before="ner")
        else:
            ruler = self.nlp.get_pipe("entity_ruler")
        
        patterns = [
            {"label": "RUBBER_GRADE", "pattern": "RSS1"},
            {"label": "RUBBER_GRADE", "pattern": "RSS2"},
            {"label": "RUBBER_GRADE", "pattern": "RSS3"},
            {"label": "RUBBER_GRADE", "pattern": "RSS4"},
            {"label": "RUBBER_GRADE", "pattern": "RSS5"},
            {"label": "RUBBER_GRADE", "pattern": "GSNR"},
            {"label": "PRICE_SIGNAL", "pattern": "Mooney viscosity"},
            {"label": "EXCHANGE", "pattern": "Bangkok Exchange"},
            {"label": "EXCHANGE", "pattern": "SICOM"},
            {"label": "SUPPLIER", "pattern": "Thai Rubber Co"},
            {"label": "SUPPLIER", "pattern": "Vietnamese Rubber Group"},
            {"label": "SUPPLIER", "pattern": "Harrisons Malayalam"},
            {"label": "SUPPLIER", "pattern": "PT Rubber Indonesia"}
        ]
        
        ruler.add_patterns(patterns)
    
    def translate_text(self, text: str, source_lang: str) -> str:
        """Translate text to English if not already English"""
        if source_lang == "en":
            return text
        
        try:
            # deep-translator handles language detection automatically with 'auto'
            result = self.translator.translate(text)
            return result
        except Exception as e:
            print(f"Translation error: {e}")
            return text  # Return original if translation fails
    
    def extract_entities(self, text: str) -> Dict[str, List[str]]:
        """Extract named entities from text"""
        entities = {
            "suppliers": [],
            "grades": [],
            "locations": [],
            "dates": [],
            "volumes": [],
            "prices": [],
            "exchanges": []
        }
        
        if not SPACY_AVAILABLE or not self.nlp:
            # Fallback: basic keyword extraction
            text_lower = text.lower()
            if "rss" in text_lower:
                for grade in ["RSS1", "RSS2", "RSS3", "RSS4", "RSS5"]:
                    if grade.lower() in text_lower:
                        entities["grades"].append(grade)
            return entities
        
        doc = self.nlp(text)
        
        entities = {
            "suppliers": [],
            "grades": [],
            "locations": [],
            "dates": [],
            "volumes": [],
            "prices": [],
            "exchanges": []
        }
        
        for ent in doc.ents:
            if ent.label_ == "SUPPLIER":
                entities["suppliers"].append(ent.text)
            elif ent.label_ == "RUBBER_GRADE":
                entities["grades"].append(ent.text)
            elif ent.label_ == "GPE":  # Geopolitical entity (locations)
                entities["locations"].append(ent.text)
            elif ent.label_ == "DATE":
                entities["dates"].append(ent.text)
            elif ent.label_ == "CARDINAL":  # Numbers (volumes)
                entities["volumes"].append(ent.text)
            elif ent.label_ == "MONEY":
                entities["prices"].append(ent.text)
            elif ent.label_ == "EXCHANGE":
                entities["exchanges"].append(ent.text)
            elif ent.label_ == "ORG":  # Organizations (potential suppliers)
                if any(keyword in ent.text.lower() for keyword in ["rubber", "latex", "plantation"]):
                    entities["suppliers"].append(ent.text)
        
        # Remove duplicates
        for key in entities:
            entities[key] = list(set(entities[key]))
        
        return entities
    
    def process_signal(self, signal: Dict[str, Any]) -> Dict[str, Any]:
        """Process a single signal through NLP pipeline"""
        # Skip translation and external NLP for internal data
        if signal.get("is_internal", False):
            return {
                "original_signal": signal,
                "translated_text": signal["text"],
                "entities": self.extract_entities(signal["text"]),
                "language_detected": signal["language"],
                "processed": True,
                "is_internal": True
            }
        
        # Translate if needed
        translated_text = self.translate_text(signal["text"], signal["language"])
        
        # Extract entities
        entities = self.extract_entities(translated_text)
        
        return {
            "original_signal": signal,
            "translated_text": translated_text,
            "entities": entities,
            "language_detected": signal["language"],
            "processed": True,
            "is_internal": False
        }
    
    def process_signals(self, signals: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Process multiple signals through NLP pipeline"""
        processed_signals = []
        
        for signal in signals:
            try:
                processed_signal = self.process_signal(signal)
                processed_signals.append(processed_signal)
            except Exception as e:
                print(f"Error processing signal: {e}")
                # Add unprocessed signal with error flag
                processed_signals.append({
                    "original_signal": signal,
                    "translated_text": signal["text"],
                    "entities": {},
                    "language_detected": signal["language"],
                    "processed": False,
                    "error": str(e)
                })
        
        return processed_signals
    
    def get_signal_summary(self, processed_signals: List[Dict[str, Any]]) -> str:
        """Generate a summary of all processed signals"""
        total_signals = len(processed_signals)
        languages = set()
        suppliers = set()
        grades = set()
        
        for signal in processed_signals:
            languages.add(signal.get("language_detected", "unknown"))
            entities = signal.get("entities", {})
            suppliers.update(entities.get("suppliers", []))
            grades.update(entities.get("grades", []))
        
        summary_parts = [
            f"Processed {total_signals} signals",
            f"Languages: {', '.join(languages)}",
        ]
        
        if suppliers:
            summary_parts.append(f"Suppliers mentioned: {', '.join(list(suppliers)[:3])}")
        
        if grades:
            summary_parts.append(f"Grades detected: {', '.join(list(grades))}")
        
        return ". ".join(summary_parts)