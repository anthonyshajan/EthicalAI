from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional
import openai
import os
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

router = APIRouter()

class AnalyzeTextRequest(BaseModel):
    text: str

@router.post("/check-ai")
async def check_ai(request: AnalyzeTextRequest):
    try:
        response = openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "Analyze text for AI vs human likelihood. Return JSON."},
                {"role": "user", "content": f"Analyze: {request.text[:3000]}\nReturn: ai_score, human_score, explanation, suggestions"}
            ],
            response_format={"type": "json_object"}
        )
        return {"status": "success", "result": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
