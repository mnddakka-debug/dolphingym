"""
AI Chat Server using g4f (GPT4Free)
This server provides a free AI chat API compatible with OpenAI format.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Dict
import logging
import uuid
import time
import json
from g4f.client import Client
from g4f.Provider import PollinationsAI

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = FastAPI(title="Free AI Chat API", version="2.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class ChatMessage(BaseModel):
    role: str
    content: Optional[str] = None

class ChatCompletionRequest(BaseModel):
    model: str
    messages: List[ChatMessage]
    conversation_id: Optional[str] = None
    stream: Optional[bool] = False
    temperature: Optional[float] = 1.0

class ModelInfo(BaseModel):
    id: str
    object: str = "model"
    created: int = int(time.time())
    owned_by: str = "free"

# Available models mapping - all use 'openai' for PollinationsAI
MODEL_MAPPING = {
    "keyless-gpt-4o-mini": "openai",
    "keyless-gpt-4": "openai",
    "keyless-gpt-4o": "openai",
    "keyless-claude-3-haiku": "openai",
    "keyless-claude-3.5-sonnet": "openai",
    "keyless-llama-3.1-70b": "openai",
    "keyless-mixtral-8x7b": "openai",
}

# Store conversations
conversations: Dict[str, List[ChatMessage]] = {}

# Initialize g4f client
client = Client()

def chat_with_ai(messages: List[dict], model: str) -> str:
    """Send chat request to g4f via PollinationsAI and get response"""
    
    # All models use 'openai' for PollinationsAI
    actual_model = MODEL_MAPPING.get(model, "openai")
    
    try:
        logging.info(f"Sending request with model: {actual_model} via PollinationsAI")
        
        response = client.chat.completions.create(
            model=actual_model,
            messages=messages,
            provider=PollinationsAI
        )
        
        result = response.choices[0].message.content
        if result:
            logging.info("Got successful response from PollinationsAI")
            return result
            
    except Exception as e:
        logging.error(f"PollinationsAI Error: {e}")
        raise HTTPException(status_code=500, detail=f"AI request failed: {str(e)}")
    
    raise HTTPException(status_code=500, detail="No response from AI")

@app.get("/v1/models")
async def list_models():
    """List available models"""
    logging.info("Listing available models")
    models = [ModelInfo(id=model_id) for model_id in MODEL_MAPPING.keys()]
    return {"data": models, "object": "list"}

@app.post("/v1/chat/completions")
async def chat_completion(request: ChatCompletionRequest):
    """Handle chat completion request"""
    
    conversation_id = request.conversation_id or str(uuid.uuid4())
    logging.info(f"Chat request for conversation {conversation_id}")
    logging.info(f"Model: {request.model}, Messages: {len(request.messages)}")
    
    # Get or create conversation history
    conversation_history = conversations.get(conversation_id, [])
    
    # Add new messages to history
    for msg in request.messages:
        if not any(existing.content == msg.content and existing.role == msg.role 
                  for existing in conversation_history):
            conversation_history.append(msg)
    
    conversations[conversation_id] = conversation_history
    
    # Prepare messages for API
    messages = [{"role": msg.role, "content": msg.content} for msg in conversation_history]
    
    try:
        # Get AI response
        full_response = chat_with_ai(messages, request.model)
        
        # Store assistant response
        assistant_message = ChatMessage(role="assistant", content=full_response)
        conversation_history.append(assistant_message)
        conversations[conversation_id] = conversation_history
        
        # Calculate tokens (approximate)
        prompt_tokens = sum(len(msg.content.split()) if msg.content else 0 for msg in conversation_history[:-1])
        completion_tokens = len(full_response.split())
        
        response = {
            "id": conversation_id,
            "object": "chat.completion",
            "created": int(time.time()),
            "model": request.model,
            "choices": [
                {
                    "index": 0,
                    "message": {
                        "role": "assistant",
                        "content": full_response
                    },
                    "finish_reason": "stop"
                }
            ],
            "usage": {
                "prompt_tokens": prompt_tokens,
                "completion_tokens": completion_tokens,
                "total_tokens": prompt_tokens + completion_tokens
            }
        }
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error in chat completion: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/v1/conversations/{conversation_id}")
async def end_conversation(conversation_id: str):
    """Delete a conversation"""
    if conversation_id in conversations:
        del conversations[conversation_id]
        logging.info(f"Conversation {conversation_id} deleted")
        return {"message": f"Conversation {conversation_id} deleted"}
    raise HTTPException(status_code=404, detail="Conversation not found")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": int(time.time())}

if __name__ == "__main__":
    import uvicorn
    print("=" * 50)
    print("   Free AI Chat API Server")
    print("   Using g4f (GPT4Free)")
    print("=" * 50)
    print()
    print("Available models:")
    for model in MODEL_MAPPING.keys():
        print(f"  - {model}")
    print()
    print("Starting server on http://0.0.0.0:1337")
    print()
    uvicorn.run(app, host="0.0.0.0", port=1337)
