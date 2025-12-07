# app/services/ai_service.py
import google.generativeai as genai
from app.core.config import settings
from typing import Dict, List
import json
from bson.objectid import ObjectId
from datetime import datetime

class AIService:
    """
    AI Service using Google Gemini for health insights
    """
    
    def __init__(self):
        print("Initializing AI Service with Gemini model",settings.GEMINI_API_KEY)
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
        else:
            self.model = None

    def _sanitize_for_json(self, data):
        if isinstance(data, dict):
            return {k: self._sanitize_for_json(v) for k, v in data.items()}
        if isinstance(data, list):
            return [self._sanitize_for_json(i) for i in data]
        if isinstance(data, ObjectId):
            return str(data)
        if isinstance(data, datetime):
            return data.isoformat()  # <-- convert to string
        return data

    
    async def summarize_medical_history(self, medical_records: List[Dict]) -> Dict:
        """
        Summarize patient's medical history using AI
        """
        print("Initializing AI Service with Gemini model",settings.GEMINI_API_KEY)
        if not self.model:
            return {"error": "Gemini API key not configured"}
        
        try:
            # Prepare medical data
            records_text = self._format_records_for_ai(medical_records)
            print("Medical Records for AI:\n", records_text)
            
            prompt = f"""
            You are a medical AI assistant. Analyze the following patient medical records and provide:
            1. A concise summary of the patient's medical history
            2. Key medical conditions identified
            3. Current medications
            4. Health recommendations
            5. Potential risk factors
            
            Medical Records:
            {records_text}
            
            Provide the response in JSON format with keys: summary, key_conditions, medications, recommendations, risk_factors
            """
            
            response = self.model.generate_content(prompt)
            print("AI Response:\n", response.text)
            result = self._parse_ai_response(response.text)
            
            return result
            
        except Exception as e:
            print("AI Summarization Error:", str(e))
            return {"error": f"AI summarization failed: {str(e)}"}
    
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
            As a medical AI, analyze this patient data and predict potential disease risks:

            Patient Data:
            {json.dumps(clean_data, indent=2)}
            
            Provide risk assessment for:
            - Cardiovascular diseases
            - Diabetes
            - Respiratory conditions
            - Other relevant conditions
            
            Return JSON with this EXACT structure:
            {{
                "risks": {{
                    "cardiovascular": {{"risk_level": "low|medium|high", "confidence": 0.0-1.0}},
                    "diabetes": {{"risk_level": "low|medium|high", "confidence": 0.0-1.0}},
                    "respiratory": {{"risk_level": "low|medium|high", "confidence": 0.0-1.0}}
                }},
                "confidence": 0.85,
                "recommendations": ["recommendation1", "recommendation2"]
            }}
            """
            
            response = self.model.generate_content(prompt)
            result = self._parse_ai_response(response.text)
            
            # Ensure risks is a dict, not a list
            if "risks" in result and isinstance(result["risks"], list):
                # Convert list to dict format
                risks_dict = {}
                for risk_item in result["risks"]:
                    condition = risk_item.get("condition", "unknown")
                    risks_dict[condition] = {
                        "risk_level": risk_item.get("risk_level", "unknown"),
                        "confidence": risk_item.get("confidence", 0.0)
                    }
                result["risks"] = risks_dict
            
            return result
            
        except Exception as e:
            print(f"Risk prediction error: {str(e)}")
            return {"error": f"Risk prediction failed: {str(e)}"}
    async def verify_insurance_claim(self, claim_data: Dict, medical_records: List[Dict]) -> Dict:
        """
        Verify insurance claim against medical records
        """
        if not self.model:
            return {"error": "Gemini API key not configured"}
        
        try:
            prompt = f"""
            Verify this insurance claim against patient medical records:
            
            Claim Data:
            {json.dumps(claim_data, indent=2)}
            
            Medical Records:
            {self._format_records_for_ai(medical_records[:5])}
            
            Check for:
            1. Treatment consistency with diagnosis
            2. Cost reasonableness
            3. Potential fraud indicators
            4. Missing documentation
            
            Return JSON with: is_valid, confidence, issues, recommendations
            """
            
            response = self.model.generate_content(prompt)
            result = self._parse_ai_response(response.text)
            
            return result
            
        except Exception as e:
            return {"error": f"Insurance verification failed: {str(e)}"}
    
    async def generate_health_recommendations(self, patient_profile: Dict) -> List[str]:
        """
        Generate personalized health recommendations
        """
        if not self.model:
            return ["Gemini API key not configured"]
        
        try:
            prompt = f"""
            Based on this patient profile, provide 5-7 actionable health recommendations:
            
            {json.dumps(patient_profile, indent=2)}
            
            Focus on:
            - Diet improvements
            - Exercise suggestions
            - Medication adherence
            - Lifestyle changes
            - Preventive care
            
            Return as a JSON array of strings.
            """
            
            response = self.model.generate_content(prompt)
            result = self._parse_ai_response(response.text)
            
            return result if isinstance(result, list) else result.get('recommendations', [])
            
        except Exception as e:
            return [f"Error generating recommendations: {str(e)}"]
    
    def _format_records_for_ai(self, records: List[Dict]) -> str:
        """Format medical records for AI processing"""
        formatted = []
        for record in records:
            formatted.append(f"""
            Type: {record.get('record_type')}
            Title: {record.get('title')}
            Description: {record.get('description', 'N/A')}
            Date: {record.get('created_at')}
            Diagnosis: {record.get('diagnosis', 'N/A')}
            Medications: {', '.join(record.get('medications', []))}
            """)
        return "\n---\n".join(formatted)
    
    def _parse_ai_response(self, response_text: str) -> Dict:
        """Parse AI response, handle JSON extraction"""
        try:
            text = response_text.strip()
            
            # Try to find JSON in code blocks first
            import re
            
            # Look for ```json ... ``` blocks
            json_match = re.search(r'```json\s*(.*?)\s*```', text, re.DOTALL)
            if json_match:
                json_str = json_match.group(1).strip()
                return json.loads(json_str)
            
            # Look for ``` ... ``` blocks (without json marker)
            code_match = re.search(r'```\s*(.*?)\s*```', text, re.DOTALL)
            if code_match:
                json_str = code_match.group(1).strip()
                # Remove "json" if it's at the start
                if json_str.startswith('json'):
                    json_str = json_str[4:].strip()
                return json.loads(json_str)
            
            # Try to find JSON object in the text using { ... }
            json_obj_match = re.search(r'\{.*\}', text, re.DOTALL)
            if json_obj_match:
                return json.loads(json_obj_match.group(0))
            
            # If no JSON found, try parsing the entire text
            return json.loads(text)
            
        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {e}")
            print(f"Attempted to parse: {text[:500]}...")
            # If parsing fails, return as text wrapped in response key
            return {"response": response_text}
        except Exception as e:
            print(f"Unexpected error in _parse_ai_response: {e}")
            return {"response": response_text}

ai_service = AIService()