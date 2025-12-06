# app/services/ai_service.py
import google.generativeai as genai
from app.core.config import settings
from typing import Dict, List
import json


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
            prompt = f"""
            As a medical AI, analyze this patient data and predict potential disease risks:
            
            Patient Data:
            {json.dumps(patient_data, indent=2)}
            
            Provide risk assessment for:
            - Cardiovascular diseases
            - Diabetes
            - Respiratory conditions
            - Other relevant conditions
            
            Return JSON with: prediction_type, risks (array of {{condition, risk_level, confidence}}), recommendations
            """
            
            response = self.model.generate_content(prompt)
            result = self._parse_ai_response(response.text)
            
            return result
            
        except Exception as e:
            return {"error": f"Risk prediction failed: {str(e)}"}
    
    async def extract_prescription_data(self, image_data: bytes) -> Dict:
        """
        Extract data from prescription images using OCR + NLP
        """
        if not self.model:
            return {"error": "Gemini API key not configured"}
        
        try:
            # Use Gemini Vision for OCR
            prompt = """
            Extract the following information from this medical prescription:
            - Patient name
            - Doctor name
            - Medications (name, dosage, frequency)
            - Diagnosis
            - Date
            
            Return in JSON format.
            """
            
            # In production, send image to Gemini Vision
            # For now, return placeholder
            return {
                "extracted": True,
                "patient_name": "Extracted from image",
                "medications": []
            }
            
        except Exception as e:
            return {"error": f"Prescription extraction failed: {str(e)}"}
    
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
            # Remove markdown code blocks if present
            text = response_text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            
            return json.loads(text.strip())
        except:
            # If parsing fails, return as text
            return {"response": response_text}

ai_service = AIService()