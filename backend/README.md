# RoomPulse FastAPI Backend

FastAPI microservice for intelligent campus electricity waste detection.

---

## 🚀 Quickstart

### 1. Create Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run the FastAPI Server
```bash
uvicorn main:app --reload --port 8000
```
Interactive Swagger API documentation will be available at:
👉 **`http://localhost:8000/docs`**

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Healthcheck and service status |
| `GET` | `/api/rooms` | Retrieve monitored campus rooms & baselines |
| `POST` | `/api/analyze` | Run deterministic waste detection on intervals |
| `PATCH` | `/api/alerts/{id}/status` | Update alert status (`investigating`, `resolved`) |
| `POST` | `/api/upload-csv` | Upload meter log CSV for instant analysis |

---

## 🧪 Run Tests
```bash
pytest test_api.py
```
