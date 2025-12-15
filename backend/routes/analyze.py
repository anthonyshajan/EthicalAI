from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
import os
from openai import OpenAI

router = APIRouter()

def get_openai_client():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY not set")
    return OpenAI(api_key=api_key)

@router.post("/analyze")
async def analyze(request: Request):
    try:
        data = await request.json()
        text = data.get("text", "")
        
        client = get_openai_client()
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "Analyze the following text and provide insights on writing quality, structure, and suggestions for improvement."
                },
                {
                    "role": "user",
                    "content": text[:4000]
                }
            ]
        )
        
        analysis = response.choices[0].message.content
        
        return {"analysis": analysis}
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )
