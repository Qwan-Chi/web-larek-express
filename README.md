# Веб-Ларёк (Express) 🛒

Полнофункциональный интернет-магазин мерча для веб-разработчиков. Full-stack версия проекта: Express API + фронтенд, контейнеризировано через Docker Compose.

Учебный проект Яндекс.Практикума.

## Технологии

- **Frontend:** TypeScript, SCSS
- **Backend:** Node.js, Express
- **Infra:** Docker Compose, nginx (reverse proxy)
- **Тестирование:** Postman-коллекция в комплекте

## Возможности

- Каталог товаров с фильтрацией и сортировкой
- Корзина и оформление заказа
- Адаптивная вёрстка

## Запуск

### Через Docker

```bash
docker-compose up -d
```

Приложение будет доступно через nginx reverse proxy.

### Локально (разработка)

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## Структура проекта

```
web-larek-express/
├── backend/              # Express API
├── frontend/             # Фронтенд на TypeScript
├── docker-compose.yml    # Оркестрация контейнеров
├── nginx/                # Конфиг reverse proxy
└── WebLarek.postman_collection.json  # Тесты API
```

## Лицензия

MIT
