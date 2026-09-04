# PIPEFORGE

Визуальный конструктор ML-пайплайнов: перетаскивай блоки, соединяй стрелками,
запускай обучение с автоподбором гиперпараметров (Optuna) и объяснением
модели (SHAP).

Состоит из двух независимых сервисов:

- **Frontend** — Next.js 14 (App Router, TypeScript), Tailwind, ReactFlow,
  Framer Motion, Recharts, NextAuth v5, Prisma + PostgreSQL.
- **Backend** — FastAPI (Python 3.11), sklearn / XGBoost / LightGBM /
  CatBoost, Optuna, SHAP, joblib.

## Требования

- Node.js 18+ и npm
- Python **3.11** (важно: XGBoost/LightGBM/CatBoost/SHAP на момент написания
  ещё не имеют колёс под более новые версии Python)
- PostgreSQL 14+ (локально, в Docker или у облачного провайдера — например,
  Railway PostgreSQL)

## 1. Frontend (Next.js)

```bash
npm install
```

Скопируй `.env.example` в `.env` и заполни переменные (см. раздел ниже).

Примени миграции Prisma к твоей базе PostgreSQL:

```bash
npx prisma migrate dev --name init
```

Засей тестового пользователя и 5 демо-пайплайнов:

```bash
npx prisma db seed
```

Это создаст пользователя `test@pipeforge.ru` / `test12345` с планом **PRO**.

Запусти дев-сервер:

```bash
npm run dev
```

Frontend поднимется на http://localhost:3000.

## 2. Backend (FastAPI)

```bash
cd backend
python -m venv venv
```

Активируй окружение:

```bash
# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

Установи зависимости и запусти сервер:

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend поднимется на http://localhost:8000. Проверить:
`GET http://localhost:8000/datasets`.

Датасет Titanic — синтетическая репродукция с реалистичными статистическими
закономерностями (пол/класс/возраст влияют на выживаемость), сгенерированная
скриптом `backend/generate_titanic.py` — это исключает зависимость от
внешней сети при установке и деплое. Iris и California Housing загружаются
через `sklearn.datasets` напрямую.

## 3. Переменные окружения

`.env` (frontend, в корне проекта):

```
DATABASE_URL="postgresql://user:password@localhost:5432/pipeforge?schema=public"
NEXTAUTH_SECRET="случайная-длинная-строка"
NEXTAUTH_URL="http://localhost:3000"
FASTAPI_URL="http://localhost:8000"
INTERNAL_API_SECRET="ещё-одна-случайная-строка-совпадающая-с-бэкендом"
```

`NEXTAUTH_SECRET` и `INTERNAL_API_SECRET` можно сгенерировать командой:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Backend читает `INTERNAL_API_SECRET` из переменной окружения процесса
(например, `INTERNAL_API_SECRET=... uvicorn main:app ...` или переменная
окружения сервиса на Railway) — значение должно быть **одинаковым** на
фронтенде и бэкенде.

## 4. Как связаны frontend и backend

Next.js API-роуты (`/api/pipelines/[id]/run`) выступают прокси: проверяют
авторизацию и лимиты тарифа (дневные запуски, доступные модели, кол-во
Optuna-триалов), затем шлют граф пайплайна на `FASTAPI_URL/run` вместе с
заголовком `X-Internal-Secret`. FastAPI не знает о пользователях и БД, но
проверяет этот заголовок на `/run` — без него запрос отклоняется с 401.
Это защищает от прямого вызова backend API в обход тарифных ограничений
Next.js: без секрета никто не может дёрнуть `/run` напрямую с `plan: "pro"`.
Дублирующая проверка модели/SHAP на Python-стороне остаётся как вторая линия
защиты, но именно секрет закрывает сам доступ к обучению.

## 5. Тарифы

| | FREE | PRO |
|---|---|---|
| Модели | XGBoost, RandomForest, LinearReg | + LightGBM, CatBoost, SVM, KNN, MLP |
| Optuna | 10 триалов | 50 триалов |
| Обучение | по одной модели | параллельно (joblib) |
| Запусков в день | 5 | без лимита |
| SHAP | недоступен | включён |
| Экспорт .pkl | недоступен | включён |

## Структура проекта

```
/app                    Next.js App Router: страницы и API-роуты
/components             UI, лендинг, конструктор, результаты, история
/lib                     Prisma-клиент, auth, planGuard, мост к FastAPI
/hooks                   useRunPipeline
/types                   Общие TypeScript-типы
/prisma                  schema.prisma, seed.ts
/backend                 FastAPI-сервис
  main.py                Роуты + CORS
  graph_parser.py        JSON-граф → топологическая сортировка → sklearn Pipeline
  optimizer.py            Optuna-подбор гиперпараметров по моделям
  evaluator.py           Метрики, SHAP, генерация Python-кода
  runner.py              Оркестрация запуска (сплит, обучение, сравнение)
  datasets.py            Встроенные датасеты + загруженные файлы
```
