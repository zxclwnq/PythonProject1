import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

app = FastAPI()

# Настройка CORS для разрешения запросов с любых источников
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # разрешаем запросы с любых доменов
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Модель для входящих данных
class Message(BaseModel):
    message: str

@app.post("/validate")
def validate(data: Message):
    text = data.message
    if "ошибка" in text.lower():
        return {"class": 1, "suspect": "Ошибка обнаружена"}
    return {"class": 3}

if __name__ == "__main__":
    # Получаем порт из переменных окружения (Koyeb предоставляет порт через переменную PORT)
    port = int(os.environ.get("PORT", 5000))
    # Запуск приложения на адресе 0.0.0.0, чтобы приложение было доступно извне
    uvicorn.run(app, host="0.0.0.0", port=port)
