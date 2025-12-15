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

@router.post("/chat")
async def chat(request: Request):
    try:
        data = await request.json()
        message = data.get("message", "")
        history = data.get("history", [])
        
        client = get_openai_client()
        
        messages = [
            {
                "role": "system",
                "content": """You are an AI learning buddy that helps students learn and improve, but you NEVER do their work for them. Your role is to:
1. Guide students to find answers themselves through questions
2. Explain concepts when asked
3. Provide hints, not solutions
4. Encourage critical thinking
5. Help them understand WHY, not just WHAT

If a student asks you to write an essay, solve homework, or do any assignment for them, politely decline and instead offer to help them understand the topic or break down the problem."""
            }
        ]
        
        for h in history:
            messages.append({"role": h["role"], "content": h["content"]})
        
        messages.append({"role": "user", "content": message})
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages
        )
        
        reply = response.choices[0].message.content
        
        return {"response": reply}
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )
