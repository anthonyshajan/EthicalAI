from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional
from openai import OpenAI
import os
import json
from dotenv import load_dotenv
import PyPDF2
import io
import re

load_dotenv()

router = APIRouter()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

print("✅ check_ai.py - BALANCED detection")

CHUNK_SIZE = 6000

def extract_text_from_pdf(file_bytes):
    """Extract text from PDF bytes"""
    try:
        pdf_file = io.BytesIO(file_bytes)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading PDF: {str(e)}")

def extract_text_from_file(content_bytes, filename):
    """Extract text from various file types"""
    if filename.lower().endswith('.pdf'):
        return extract_text_from_pdf(content_bytes)
    else:
        try:
            return content_bytes.decode('utf-8')
        except UnicodeDecodeError:
            raise HTTPException(status_code=400, detail="File must be text-based or PDF (UTF-8 encoded)")

@router.post("/check-ai")
async def check_ai_content(
    text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    print("\n" + "="*60)
    print("🔍 AI CHECK REQUEST")
    print("="*60)
    
    try:
        if file:
            print(f"📄 File uploaded: {file.filename}")
            content_bytes = await file.read()
            input_text = extract_text_from_file(content_bytes, file.filename)
        elif text:
            print(f"📝 Text submitted: {len(text)} characters")
            input_text = text.strip()
        else:
            raise HTTPException(status_code=400, detail="Either text or file must be provided")
        
        if not input_text.strip():
            raise HTTPException(status_code=400, detail="No text could be extracted")
        
        print(f"Text length: {len(input_text)} characters")
        
        if len(input_text) > CHUNK_SIZE:
            analyzed_text = input_text[:CHUNK_SIZE]
        else:
            analyzed_text = input_text
        
        sentences = re.split(r'(?<=[.!?])\s+', analyzed_text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        print(f"📊 Analyzing {len(sentences)} sentences...")
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system", 
                    "content": """You are a BALANCED AI content detector. Be fair but thorough.

**AI INDICATORS (look for multiple):**
- Repetitive sentence structures
- Generic AI phrases: "It's important to note", "Furthermore", "In conclusion", "Additionally"
- Perfect grammar throughout with no natural errors
- Overly formal tone without personal voice
- Generic examples without specific details
- Balanced arguments without strong opinions

**HUMAN INDICATORS (strong signals):**
- Personal anecdotes or specific examples
- Natural typos or informal phrasing
- Varied sentence structure
- Strong opinions or emotional language
- Conversational tone
- Minor grammatical imperfections

**SCORING:**
- 0-30%: Clearly human
- 31-50%: Likely human, some formal elements
- 51-70%: Mixed, could be either
- 71-85%: Likely AI
- 86-100%: Very likely AI

Return JSON with detailed analysis:
{
  "ai_detected": boolean (true if confidence > 60),
  "confidence": number (0-100),
  "human_indicators": [{"point": "description", "example": "quote"}],
  "ai_indicators": [{"point": "description", "example": "quote"}],
  "line_analysis": [
    {
      "line_number": number,
      "text": "sentence",
      "likely_ai": boolean,
      "confidence": number,
      "reason": "explanation"
    }
  ]
}

Analyze first 10 sentences thoroughly."""
                },
                {"role": "user", "content": f"Analyze:\n\n{analyzed_text}"}
            ],
            temperature=0,
            max_tokens=2000,
            seed=42
        )
        
        content = response.choices[0].message.content.strip()
        print(f"✅ Analysis complete")
        
        if content.startswith("```"):
            lines = content.split("\n")
            content = "\n".join([l for l in lines if not l.strip().startswith("```")])
            content = content.replace("```json", "").replace("```", "").strip()
        
        try:
            result = json.loads(content)
        except json.JSONDecodeError:
            result = {
                "ai_detected": False,
                "confidence": 40,
                "human_indicators": [{"point": "Analysis format issue", "example": ""}],
                "ai_indicators": [],
                "line_analysis": []
            }
        
        ai_detected = result.get("ai_detected", False)
        confidence = result.get("confidence", 50)
        
        print(f"📊 Result: AI={ai_detected}, Confidence={confidence}%")
        
        return {
            "ai_detected": ai_detected,
            "confidence": confidence,
            "analysis": {
                "human_indicators": result.get("human_indicators", []),
                "ai_indicators": result.get("ai_indicators", []),
                "line_analysis": result.get("line_analysis", [])[:10]
            },
            "sentences_analyzed": min(len(sentences), 10)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

print("🔧 check_ai.py ready - BALANCED")
