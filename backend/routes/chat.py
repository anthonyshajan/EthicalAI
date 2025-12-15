from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional
from openai import OpenAI
import os
from dotenv import load_dotenv
import PyPDF2
import io

load_dotenv()

router = APIRouter()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

print("✅ chat.py loaded with OpenAI client")

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

@router.post("/chat")
async def chat(
    message: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    print("\n" + "="*60)
    print("💬 CHAT REQUEST RECEIVED")
    print("="*60)
    
    try:
        user_message = ""
        
        # Handle file if attached
        if file:
            print(f"📎 File attached: {file.filename}")
            content_bytes = await file.read()
            
            if file.filename.lower().endswith('.pdf'):
                print("📄 Processing PDF file...")
                file_text = extract_text_from_pdf(content_bytes)
            else:
                try:
                    file_text = content_bytes.decode('utf-8')
                except UnicodeDecodeError:
                    raise HTTPException(status_code=400, detail="File must be PDF or text-based (UTF-8 encoded)")
            
            user_message = f"[User attached a file: {file.filename}]\n\n"
            if message and message.strip():
                user_message += f"User's question: {message}\n\n"
            user_message += f"File content:\n{file_text[:3000]}"  # Limit to 3000 chars
            
        elif message:
            user_message = message.strip()
        else:
            raise HTTPException(status_code=400, detail="Either message or file must be provided")
        
        print(f"📝 Message length: {len(user_message)} characters")
        print("🔄 Calling OpenAI...")
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": """You are a helpful AI tutor focused on academic integrity. Your role is to:
                    
1. Guide students to learn, not give them direct answers
2. Ask clarifying questions to help them think critically
3. Provide hints and explanations of concepts
4. Never complete assignments for them
5. Encourage original thinking and understanding

When a student asks for help:
- Help them understand the underlying concepts
- Guide them through the problem-solving process
- Ask questions that lead them to discover the answer
- Provide examples or analogies to aid understanding
- Never write full essays, complete code, or solve entire problems for them

If they attach a file and ask for a summary or analysis:
- Provide a brief overview of the main topics
- Ask what specific aspects they need help understanding
- Guide them to analyze it themselves with targeted questions
"""
                },
                {"role": "user", "content": user_message}
            ],
            temperature=0.7,
            max_tokens=800
        )
        
        ai_response = response.choices[0].message.content
        print(f"✅ OpenAI responded: {ai_response[:100]}...")
        
        return {"response": ai_response}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ ERROR: {type(e).__name__}")
        print(f"Message: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

print("🔧 chat.py router ready")

@router.post("/generate-title")
async def generate_title(request: dict):
    """Generate a concise 5-8 word title for a conversation"""
    try:
        message = request.get('message', '')
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "Generate a concise 5-8 word title that describes the topic of the user's question. Be specific and descriptive. Do not use quotes or punctuation."
                },
                {"role": "user", "content": f"Create a title for this question: {message[:200]}"}
            ],
            temperature=0.5,
            max_tokens=20
        )
        
        title = response.choices[0].message.content.strip()
        return {"title": title}
    except Exception as e:
        print(f"Error generating title: {str(e)}")
        return {"title": message[:40]}
