# ==============================================================================
# AGRISENSE AGRI-ONLY AI CHATBOT ROUTER
# Handles farmer conversations restricted strictly to agricultural queries.
# ==============================================================================

from fastapi import APIRouter, HTTPException, Depends
from models.schemas import ChatRequest, ChatResponse
from services.gemini_service import chat
import uuid

router = APIRouter(prefix="/api/chat", tags=["Chat"])

# In-memory session tracking for active conversations (no DB dependency required)
_in_memory_chat_history = {}

@router.post("", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Agri-Chat Endpoint:
    - Restricts conversation strictly to agriculture, plant diseases, crop schedules, and market pricing.
    - If user asks non-agricultural questions (e.g. politics, coding, sports), gracefully redirects back to farming.
    - Retrieves preceding multi-turn chat history using session_id in memory.
    - Prompts Gemini AI with agricultural guardrails and requested language.
    """
    # Initialize or reuse conversation session UUID
    session_id = request.session_id or str(uuid.uuid4())
    language = request.language or "English"
    mode = request.mode or "crop"
    
    # STEP 1: Fetch recent multi-turn chat history for context continuity
    history = _in_memory_chat_history.get(session_id, [])

    # STEP 2: Call Gemini AI
    ai_response = await chat(request.message, history, session_id, language, mode)

    # STEP 3: Persist user message and AI response in session context (keep last 10 turns)
    if session_id not in _in_memory_chat_history:
        _in_memory_chat_history[session_id] = []
    _in_memory_chat_history[session_id].append({"role": "user", "content": request.message})
    _in_memory_chat_history[session_id].append({"role": "assistant", "content": ai_response})
    _in_memory_chat_history[session_id] = _in_memory_chat_history[session_id][-10:]

    # STEP 4: Return response text alongside the active session ID
    return ChatResponse(response=ai_response, session_id=session_id)
