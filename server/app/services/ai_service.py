# app/services/ai_service.py
import google.generativeai as genai
from app.core.config import settings
from typing import Dict, List
import json
import re
from bson.objectid import ObjectId
from datetime import datetime

class AIService:
    """
    AI Service using Google Gemini for health insights
    """
    
    def __init__(self):
        print("Initializing AI Service with Gemini model")
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
        else:
            self.model = None

    def _sanitize_for_json(self, data):
        """Convert non-serializable objects to serializable formats"""
        if isinstance(data, dict):
            return {k: self._sanitize_for_json(v) for k, v in data.items()}
        if isinstance(data, list):
            return [self._sanitize_for_json(i) for i in data]
        if isinstance(data, ObjectId):
            return str(data)
        if isinstance(data, datetime):
            return data.isoformat()
        return data
    
    async def summarize_medical_history(self, medical_records: List[Dict]) -> Dict:
        """
        Summarize patient's medical history using AI
        """
        if not self.model:
            return {"error": "Gemini API key not configured"}
        
        try:
            # Prepare medical data
            records_text = self._format_records_for_ai(medical_records)
            print("Medical Records for AI:\n", records_text)
            
            prompt = f"""
            You are a medical AI assistant. Analyze the following patient medical records and provide a structured analysis.
            
            Medical Records:
            {records_text}
            
            Provide your response in this EXACT JSON format (no markdown, no code blocks):
            {{
                "summary": "A concise 2-3 sentence summary of the patient's overall health status",
                "key_conditions": ["condition1", "condition2", "condition3"],
                "medications": ["medication1", "medication2"],
                "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
                "risk_factors": ["risk1", "risk2"]
            }}
            
            Important rules:
            - All fields must be present
            - key_conditions, medications, recommendations, and risk_factors must be arrays of strings
            - If no data available for a field, use an empty array []
            - Do not include any markdown formatting or code blocks
            - Return ONLY valid JSON
            """
            
            response = self.model.generate_content(prompt)
            print("AI Response:\n", response.text)
            
            result = self._parse_ai_response(response.text)
            
            # Ensure all required fields are lists
            result = self._ensure_valid_summary_format(result)
            
            return result
            
        except Exception as e:
            print("AI Summarization Error:", str(e))
            return {
                "summary": f"Error generating summary: {str(e)}",
                "key_conditions": [],
                "medications": [],
                "recommendations": [],
                "risk_factors": []
            }
    
    def _ensure_valid_summary_format(self, result: Dict) -> Dict:
        """Ensure the summary response has the correct format"""
        # Default structure
        formatted = {
            "summary": "",
            "key_conditions": [],
            "medications": [],
            "recommendations": [],
            "risk_factors": []
        }
        
        # Extract summary
        if "summary" in result:
            formatted["summary"] = str(result["summary"])
        
        # Convert all list fields to proper lists
        for field in ["key_conditions", "medications", "recommendations", "risk_factors"]:
            if field in result:
                value = result[field]
                # If it's already a list, use it
                if isinstance(value, list):
                    formatted[field] = [str(item) for item in value]
                # If it's a string, try to split it or wrap it
                elif isinstance(value, str):
                    if value.strip():
                        # Try to split by newlines, commas, or bullets
                        items = re.split(r'[\n,•\-]\s*', value)
                        formatted[field] = [item.strip() for item in items if item.strip()]
                    else:
                        formatted[field] = []
                else:
                    formatted[field] = []
        
        return formatted
    
    async def predict_disease_risk(self, patient_data: Dict) -> Dict:
        """
        Predict disease risk based on patient data
        """
        if not self.model:
            return {"error": "Gemini API key not configured"}
        
        try:
            clean_data = self._sanitize_for_json(patient_data)
            print("Patient Data for Prediction:\n", json.dumps(clean_data, indent=2))
            
            prompt = f"""
            As a medical AI, analyze this patient data and predict potential disease risks.

            Patient Data:
            {json.dumps(clean_data, indent=2)}
            
            Provide your response in this EXACT JSON format (no markdown, no code blocks):
            {{
                "risks": {{
                    "cardiovascular": {{"risk_level": "low", "confidence": 0.75, "probability": 25}},
                    "diabetes": {{"risk_level": "medium", "confidence": 0.68, "probability": 45}},
                    "respiratory": {{"risk_level": "low", "confidence": 0.82, "probability": 15}}
                }},
                "confidence": 0.75,
                "recommendations": ["recommendation1", "recommendation2", "recommendation3"]
            }}
            
            Rules:
            - risk_level must be one of: "low", "medium", "high"
            - confidence must be a number between 0.0 and 1.0
            - probability must be a number between 0 and 100
            - recommendations must be an array of strings
            - Return ONLY valid JSON, no markdown
            """
            
            response = self.model.generate_content(prompt)
            print("AI Prediction Response:\n", response.text)
            
            result = self._parse_ai_response(response.text)
            
            # Ensure valid format
            result = self._ensure_valid_prediction_format(result)
            
            return result
            
        except Exception as e:
            print(f"Risk prediction error: {str(e)}")
            return {
                "risks": {
                    "cardiovascular": {"risk_level": "unknown", "confidence": 0.0, "probability": 0},
                    "diabetes": {"risk_level": "unknown", "confidence": 0.0, "probability": 0},
                    "respiratory": {"risk_level": "unknown", "confidence": 0.0, "probability": 0}
                },
                "confidence": 0.0,
                "recommendations": [f"Error: {str(e)}"]
            }
    
    def _ensure_valid_prediction_format(self, result: Dict) -> Dict:
        """Ensure prediction response has correct format"""
        formatted = {
            "risks": {},
            "confidence": 0.0,
            "recommendations": []
        }
        
        # Handle risks
        if "risks" in result and isinstance(result["risks"], dict):
            formatted["risks"] = result["risks"]
        elif "risks" in result and isinstance(result["risks"], list):
            # Convert list to dict format
            for risk_item in result["risks"]:
                if isinstance(risk_item, dict) and "condition" in risk_item:
                    condition = risk_item["condition"]
                    formatted["risks"][condition] = {
                        "risk_level": risk_item.get("risk_level", "unknown"),
                        "confidence": float(risk_item.get("confidence", 0.0)),
                        "probability": int(risk_item.get("probability", 0))
                    }
        
        # Handle confidence
        if "confidence" in result:
            try:
                formatted["confidence"] = float(result["confidence"])
            except (ValueError, TypeError):
                formatted["confidence"] = 0.0
        
        # Handle recommendations
        if "recommendations" in result:
            if isinstance(result["recommendations"], list):
                formatted["recommendations"] = [str(r) for r in result["recommendations"]]
            elif isinstance(result["recommendations"], str):
                formatted["recommendations"] = [result["recommendations"]]
        
        return formatted
    
    async def generate_health_recommendations(self, patient_profile: Dict) -> List[str]:
        """
        Generate personalized health recommendations
        """
        if not self.model:
            return ["Gemini API key not configured"]
        
        try:
            clean_profile = self._sanitize_for_json(patient_profile)
            
            prompt = f"""
            Based on this patient profile, provide 5-7 actionable health recommendations.
            
            Patient Profile:
            {json.dumps(clean_profile, indent=2)}
            
            Provide your response as a JSON array of strings in this EXACT format:
            ["recommendation 1", "recommendation 2", "recommendation 3", "recommendation 4", "recommendation 5"]
            
            Focus on:
            - Diet improvements
            - Exercise suggestions
            - Medication adherence
            - Lifestyle changes
            - Preventive care
            
            Return ONLY a JSON array, no markdown, no code blocks.
            """
            
            response = self.model.generate_content(prompt)
            print("Health Recommendations AI Response:\n", response.text)
            
            result = self._parse_ai_response(response.text)
            
            # Ensure it's a list
            if isinstance(result, list):
                return [str(item) for item in result]
            elif isinstance(result, dict) and "recommendations" in result:
                recs = result["recommendations"]
                if isinstance(recs, list):
                    return [str(item) for item in recs]
                return [str(recs)]
            else:
                return ["Unable to generate recommendations at this time"]
            
        except Exception as e:
            print(f"Error generating recommendations: {str(e)}")
            return [f"Error generating recommendations: {str(e)}"]
    
    def _format_records_for_ai(self, records: List[Dict]) -> str:
        """Format medical records for AI processing"""
        if not records:
            return "No medical records available"
        
        formatted = []
        for record in records:
            formatted.append(f"""
            Type: {record.get('record_type', 'Unknown')}
            Title: {record.get('title', 'No title')}
            Description: {record.get('description', 'N/A')}
            Date: {record.get('created_at', 'Unknown date')}
            Diagnosis: {record.get('diagnosis', 'N/A')}
            Medications: {', '.join(record.get('medications', [])) or 'None'}
            """)
        return "\n---\n".join(formatted)
    
    def _parse_ai_response(self, response_text: str) -> Dict:
        """Parse AI response, handle JSON extraction"""
        try:
            text = response_text.strip()
            
            # Remove markdown code blocks
            # Look for ```json ... ```
            json_match = re.search(r'```json\s*(.*?)\s*```', text, re.DOTALL | re.IGNORECASE)
            if json_match:
                text = json_match.group(1).strip()
            else:
                # Look for ``` ... ```
                code_match = re.search(r'```\s*(.*?)\s*```', text, re.DOTALL)
                if code_match:
                    text = code_match.group(1).strip()
                    # Remove "json" if it's at the start
                    if text.lower().startswith('json'):
                        text = text[4:].strip()
            
            # Try to find JSON object/array in the text
            # Look for { ... } or [ ... ]
            json_pattern = r'(\{.*\}|\[.*\])'
            json_match = re.search(json_pattern, text, re.DOTALL)
            if json_match:
                text = json_match.group(1)
            
            # Parse JSON
            result = json.loads(text)
            return result
            
        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {e}")
            print(f"Attempted to parse: {text[:500]}...")
            
            # Return a safe default structure
            return {
                "error": "Failed to parse AI response",
                "raw_response": response_text[:500]
            }
        except Exception as e:
            print(f"Unexpected error in _parse_ai_response: {e}")
            return {
                "error": str(e),
                "raw_response": response_text[:500]
            }

# Global AI service instance
ai_service = AIService()