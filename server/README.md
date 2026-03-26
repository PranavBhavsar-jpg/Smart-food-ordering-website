# TCET Canteen Backend (Express + MongoDB)

## Setup

1. Install dependencies:

```bash
cd server
npm install
```

2. Create your env file:

- Copy `server/.env.example` → `server/.env`
- Update `MONGODB_URI` if needed.

## Start MongoDB

### Option A: Docker (recommended)

```bash
docker run --name tcet-mongo -p 27017:27017 -d mongo:7
```

### Option B: Local MongoDB install

- Ensure MongoDB is running on `mongodb://127.0.0.1:27017`

## Run the server

```bash
cd server
npm run dev
```

Server starts at `http://localhost:5000`.

## API

### GET /menu

Returns the available menu items from MongoDB.

- First run will auto-seed your 12 items if the collection is empty.

Test:

```bash
curl http://localhost:5000/menu
```

Response:

```json
{ "items": [ ... ] }
```

