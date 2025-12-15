from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional
from openai import OpenAI
import os
import json
from dotenv import load_dotenv
import PyPDF2
import io

load_dotenv()

router = APIRouter()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

print("✅ upload.py loaded with FORMATTED feedback")

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
            raise HTTPException(status_code=400, detail="File must be text-based or PDF")

def get_task_specific_prompt(task_type, has_rubric):
    """Generate comprehensive task-specific analysis prompts"""
    
    base_prompts = {
        "essay": """You are an expert essay evaluator providing detailed, constructive feedback.

ANALYZE THE ESSAY THOROUGHLY:

**Thesis & Argument:**
- Is the thesis clear, specific, and arguable?
- Does the argument flow logically?
- Are claims supported with evidence?

**Structure & Organization:**
- Introduction effectiveness
- Paragraph transitions and coherence
- Conclusion strength

**Evidence & Analysis:**
- Quality and relevance of evidence
- Depth of analysis
- Citation usage and integration

**Writing Quality:**
- Clarity and concision
- Sentence variety and flow
- Grammar, punctuation, spelling
- Word choice and tone

**Overall Impact:**
- Persuasiveness
- Originality of ideas
- Engagement with the topic""",
        
        "code": """You are an expert code reviewer providing detailed, constructive feedback.

ANALYZE THE CODE THOROUGHLY:

**Code Structure:**
- Organization and modularity
- Function/class design
- File structure

**Algorithm & Logic:**
- Efficiency and optimization
- Correctness of implementation
- Edge case handling

**Code Quality:**
- Readability and clarity
- Naming conventions
- Comments and documentation
- Code smell detection

**Best Practices:**
- Design patterns usage
- Error handling
- Security considerations
- Scalability

**Performance:**
- Time complexity
- Space complexity
- Potential bottlenecks""",
        
        "presentation": """You are an expert presentation evaluator providing detailed, constructive feedback.

ANALYZE THE PRESENTATION THOROUGHLY:

**Content & Message:**
- Clarity of main message
- Logical flow of ideas
- Depth and relevance of content

**Structure:**
- Introduction effectiveness
- Organization of slides
- Conclusion impact

**Visual Design:**
- Slide layout and balance
- Use of images and graphics
- Color scheme and consistency
- Text readability

**Delivery Elements:**
- Slide transitions
- Use of bullet points vs. visuals
- Amount of text per slide

**Overall Effectiveness:**
- Persuasiveness
- Engagement potential
- Professional appearance""",
        
        "research": """You are an expert research evaluator providing detailed, constructive feedback.

ANALYZE THE RESEARCH THOROUGHLY:

**Research Question & Hypothesis:**
- Clarity and specificity
- Significance and originality
- Feasibility

**Methodology:**
- Appropriateness of methods
- Research design soundness
- Data collection approach

**Literature Review:**
- Comprehensiveness
- Critical analysis
- Relevance to research question

**Data & Analysis:**
- Quality of data
- Appropriateness of analysis
- Interpretation of results

**Conclusions:**
- Logical flow from results
- Acknowledgment of limitations
- Implications and future research

**Academic Writing:**
- Citation quality and consistency
- Structure and clarity
- Academic tone"""
    }
    
    base_prompt = base_prompts.get(task_type, base_prompts["essay"])
    
    rubric_instruction = ""
    if has_rubric:
        rubric_instruction = """

**IMPORTANT: A grading rubric has been provided. Use it to guide your evaluation and explicitly reference rubric criteria in your feedback.**"""
    
    full_prompt = f"""{base_prompt}{rubric_instruction}

**PROVIDE COMPREHENSIVE FEEDBACK IN THIS EXACT FORMAT:**

Score: [X/100]

Strengths:
[List 3-5 specific things done well with examples from the work. Write as complete sentences in paragraph form, not bullet points.]

Areas for Improvement:
[List 3-5 specific issues with clear explanations. Write as complete sentences in paragraph form, not bullet points.]

Detailed Analysis:
[Provide 2-3 paragraphs of thorough analysis covering all major aspects evaluated. Be specific and reference actual content from the submission. Write in full paragraphs.]

Suggestions for Revision:
[Provide 3-5 specific, actionable suggestions. Write as numbered items with full explanations.]

Overall Assessment:
[Write 2-3 sentences summarizing the work's quality and main takeaway.]

IMPORTANT FORMATTING RULES:
- DO NOT use asterisks (**) for section headers
- Write section headers as plain text followed by colon
- Use complete sentences and paragraphs
- Be thorough, specific, and constructive
- Reference actual content from the submission"""

    return full_prompt

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    task_type: str = Form(...),
    rubric: Optional[str] = Form(None)
):
    print("\n" + "="*60)
    print("📤 UPLOAD REQUEST - FORMATTED FEEDBACK")
    print("="*60)
    print(f"File: {file.filename}")
    print(f"Task Type: {task_type}")
    print(f"Has Rubric: {bool(rubric)}")
    
    try:
        content_bytes = await file.read()
        file_text = extract_text_from_file(content_bytes, file.filename)
        
        print(f"Extracted text length: {len(file_text)} characters")
        
        if not file_text.strip():
            raise HTTPException(status_code=400, detail="No text could be extracted from file")
        
        # Build comprehensive prompt
        system_prompt = get_task_specific_prompt(task_type, bool(rubric))
        
        user_content = f"Please provide comprehensive feedback on this {task_type}.\n\n"
        
        if rubric:
            user_content += f"GRADING RUBRIC:\n{rubric}\n\n"
        
        user_content += f"SUBMISSION CONTENT:\n{file_text}"
        
        print("🔄 Calling OpenAI for detailed feedback...")
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            temperature=0.7,
            max_tokens=2500
        )
        
        feedback_text = response.choices[0].message.content.strip()
        
        # Remove any asterisks and clean up formatting
        feedback_text = feedback_text.replace('**', '')
        feedback_text = feedback_text.replace('*', '')
        
        print("✅ Feedback generated")
        
        # Extract score from feedback
        score = 75  # default
        if "Score:" in feedback_text:
            try:
                score_line = [line for line in feedback_text.split('\n') if 'Score:' in line][0]
                score_str = score_line.split(':')[1].strip().split('/')[0].strip()
                score = int(''.join(filter(str.isdigit, score_str)))
                score = max(0, min(100, score))
            except:
                pass
        
        print(f"📊 Score: {score}/100")
        
        return {
            "score": score,
            "feedback": feedback_text,
            "task_type": task_type,
            "filename": file.filename
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ ERROR: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

print("🔧 Formatted upload.py router ready")
