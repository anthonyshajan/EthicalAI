from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import JSONResponse
import os
from openai import OpenAI
import PyPDF2
import io

router = APIRouter()

def get_openai_client():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY not set")
    return OpenAI(api_key=api_key)

@router.post("/check-ai")
async def check_ai(
    file: UploadFile = File(None),
    text: str = Form(None)
):
    try:
        content = ""
        
        if file:
            file_content = await file.read()
            if file.filename.endswith('.pdf'):
                pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
                for page in pdf_reader.pages:
                    content += page.extract_text() or ""
            else:
                content = file_content.decode('utf-8')
        elif text:
            content = text
        else:
            return JSONResponse(
                status_code=400,
                content={"error": "No file or text provided"}
            )
        
        client = get_openai_client()
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are an AI detection expert. Analyze the following text and determine the likelihood it was written by AI. Provide a percentage (0-100%) and a brief explanation. Format: 'AI Probability: X%\n\nExplanation: ...'"
                },
                {
                    "role": "user",
                    "content": f"Analyze this text for AI-generated content:\n\n{content[:4000]}"
                }
            ]
        )
        
        result = response.choices[0].message.content
        
        return {"result": result}
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )
