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

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    assignment_type: str = Form("essay")
):
    try:
        content = ""
        file_content = await file.read()
        
        if file.filename.endswith('.pdf'):
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
            for page in pdf_reader.pages:
                content += page.extract_text() or ""
        else:
            content = file_content.decode('utf-8')
        
        client = get_openai_client()
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": f"You are a helpful academic tutor. Review this {assignment_type} and provide constructive feedback. Focus on: structure, clarity, argument strength, and areas for improvement. Be encouraging but honest."
                },
                {
                    "role": "user",
                    "content": f"Please review my {assignment_type}:\n\n{content[:4000]}"
                }
            ]
        )
        
        feedback = response.choices[0].message.content
        
        return {"feedback": feedback, "filename": file.filename}
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )
