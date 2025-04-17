import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline

model_path = "./rubert_classifier"

tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForSequenceClassification.from_pretrained(model_path)
classifier = pipeline("text-classification", model=model, tokenizer=tokenizer)

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
    result = int(classifier(text)[0]['label'][6:])
    return {"class": result}

if __name__ == "__main__":
    # Получаем порт из переменных окружения (Koyeb предоставляет порт через переменную PORT)
    port = int(os.environ.get("PORT", 5000))
    # Запуск приложения на адресе 0.0.0.0, чтобы приложение было доступно извне
    uvicorn.run(app, host="0.0.0.0", port=port)
