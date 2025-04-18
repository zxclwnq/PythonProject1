import json
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
# from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline
import requests

API_KEY = "sk-4ac17203bf044f3b9fb922b5270ae975"
API_URL = "https://api.deepseek.com/v1/chat/completions"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}


def get_label_from_deepseek(message):
    system_prompt = (
        "Ты классификатор. Отвечай ТОЛЬКО в формате {'label': LABEL_{I}}, "
        "где I — одна из категорий: phishing(I = 0), spam(I = 1),  manipulation (I = 2), safe(I=3)."
    )

    data = {
        "model": "deepseek-chat",  # или "deepseek-coder" если используешь кодовую модель
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message}
        ],
        "temperature": 0
    }

    response = requests.post(API_URL, headers=headers, json=data)

    if response.status_code == 200:
        result = response.json()
        return result['choices'][0]['message']['content']
    else:
        print("Ошибка:", response.status_code, response.text)
        return None

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    message: str

@app.post("/validate")
def validate(data: Message):
    text = data.message
    label_response = get_label_from_deepseek(text)
    label_json = json.loads(label_response.replace("'", '"'))
    return {"class": label_json["label"][6:]}
