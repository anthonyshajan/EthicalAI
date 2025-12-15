from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import check_ai, chat, analyze, upload
import uvicorn

app = FastAPI(title="Academic Honesty AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://*.vercel.app",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(check_ai.router, tags=["ai-detection"])
app.include_router(chat.router, tags=["chat"])
app.include_router(upload.router, tags=["upload"])
app.include_router(analyze.router, tags=["analysis"])

@app.get("/")
def root():
    return {"status": "Backend running", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
