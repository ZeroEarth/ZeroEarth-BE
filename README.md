
# Chow API with PostgreSQL (Dockerized)

This project is a **Node.js API** connected to a **PostgreSQL** database, running in **Docker** with a preloaded schema.

## 📦 Stack
- **Node.js 20** (Alpine)
- **PostgreSQL 15**
- **Docker & Docker Compose**
- **Environment Variables** from `.env`

## ⚙️ Setup

### 1️⃣ Prerequisites
Make sure you have installed:
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

---

### 2️⃣ Configure Environment Variables
Create a `.env` file in the root directory (already provided in this repo):

```env
POSTGRES_USER=<USER>
POSTGRES_PASSWORD=<PASSWORD>
POSTGRES_DB=<DBNAME>
POSTGRES_HOST=<HOST>
POSTGRES_PORT=<DBPORT>
PORT=<APIPORT>
JWT_SECRET=<jwtsecretkey>

FEED_QUANTITY_PER_CATTLE=200
FEED_DAYS=30

DEFAULT_PASSWORD=1234
SALT_ROUNDS=10 

AZURE_STORAGE_ACCOUNT_NAME=YOUR_AZURE_ACCOUNT_NAME
AZURE_STORAGE_ACCOUNT_KEY=YOUR_AZURE_KEY
AZURE_STORAGE_CONTAINER_NAME=YOUR_CONTAINER_NAME
```

### Run the API
`docker-compose up --build`
