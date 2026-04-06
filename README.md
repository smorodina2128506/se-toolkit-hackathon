# FridgeTracker

Трекер продуктов с истекающим сроком годности.

## Запуск

```bash
docker compose up --build
```

Открой в браузере: http://localhost:3000

## Что умеет (Version 1)

- Добавить продукт с названием, датой истечения и категорией
- Видеть список продуктов, отсортированных по срочности
- Цветовая индикация: 🔴 истекает сегодня/завтра, 🟡 в течение 3 дней, 🟢 всё хорошо
- Удалить использованный продукт
- Счётчики сверху: сколько продуктов в каждой зоне

## Стек

- **Backend**: FastAPI + SQLAlchemy + PostgreSQL
- **Frontend**: React + Vite
- **Запуск**: Docker Compose

## API

| Метод | URL | Описание |
|-------|-----|----------|
| GET | /products | Все продукты |
| POST | /products | Добавить продукт |
| DELETE | /products/{id} | Удалить продукт |
| GET | /health | Проверка сервера |

## Структура

```
fridge-tracker/
├── backend/
│   ├── main.py        # FastAPI роуты
│   ├── models.py      # SQLAlchemy модели
│   ├── schemas.py     # Pydantic схемы
│   ├── database.py    # Подключение к БД
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx    # Главный компонент
│   │   └── index.css  # Стили
│   └── package.json
└── docker-compose.yml
```
