import csv
import io
from typing import List, Dict
from fastapi import FastAPI, HTTPException, UploadFile, File, status
from fastapi.middleware.cors import CORSMiddleware

from models import (
    Room,
    RoomInterval,
    EnergyAlert,
    AnalysisSettings,
    AnalyzeRequest,
    AnalyzeResponse,
    StatusUpdateRequest,
)
from engine import run_detection_engine

app = FastAPI(
    title="RoomPulse API",
    description="Campus Electricity Waste Detection Platform Backend",
    version="1.0.0",
)

# CORS configuration for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pre-configured campus rooms
CAMPUS_ROOMS: List[Room] = [
    Room(
        id="R-101",
        name="Classroom 101",
        building="Aryabhata Hall",
        floor="Ground Floor",
        capacity=60,
        expectedBaselineKwh=0.35,
        roomType="Classroom",
        installedEquipment=["6 Ceiling Fans", "8 LED Battens", "1 Projector"],
        notes="Standard lecture room with mechanical switches.",
    ),
    Room(
        id="R-102",
        name="Embedded Systems Lab",
        building="Aryabhata Hall",
        floor="Ground Floor",
        capacity=40,
        expectedBaselineKwh=0.65,
        roomType="Computer Lab",
        installedEquipment=["35 Desktop PCs", "2 Split ACs (2-Ton)", "Oscilloscopes"],
        notes="High idle draw if PC power strips and AC units are left running.",
    ),
    Room(
        id="R-103",
        name="Faculty Lounge A",
        building="Aryabhata Hall",
        floor="1st Floor",
        capacity=25,
        expectedBaselineKwh=0.40,
        roomType="Faculty Room",
        installedEquipment=["2 Cassette ACs", "Water Dispenser", "Mini Refrigerator"],
    ),
    Room(
        id="R-104",
        name="Seminar Hall North",
        building="Aryabhata Hall",
        floor="1st Floor",
        capacity=120,
        expectedBaselineKwh=0.80,
        roomType="Seminar Hall",
        installedEquipment=["4 Cassette ACs", "Laser Projector", "Stage Lights"],
    ),
    Room(
        id="S-301",
        name="Physics Optics Lab",
        building="Ramanujan Tower",
        floor="3rd Floor",
        capacity=30,
        expectedBaselineKwh=0.45,
        roomType="Research Lab",
        installedEquipment=["Optics Benches", "Sodium Lamps", "1 Split AC"],
    ),
    Room(
        id="S-302",
        name="Auditorium Magna",
        building="Ramanujan Tower",
        floor="Ground Floor",
        capacity=250,
        expectedBaselineKwh=1.20,
        roomType="Lecture Hall",
        installedEquipment=["Central HVAC", "High-Lumen Projector", "Stage Spotlights"],
    ),
    Room(
        id="T-401",
        name="Smart Classroom 401",
        building="Tagore Humanities",
        floor="1st Floor",
        capacity=70,
        expectedBaselineKwh=0.40,
        roomType="Classroom",
        installedEquipment=["Smart Podium", "Interactive Display", "6 Ceiling Fans"],
    ),
]

ROOMS_MAP: Dict[str, Room] = {r.id: r for r in CAMPUS_ROOMS}

# In-memory alert status store
ALERT_STATUS_STORE: Dict[str, str] = {}

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "RoomPulse FastAPI Detection Backend",
        "version": "1.0.0",
    }

@app.get("/api/rooms", response_model=List[Room])
def get_rooms():
    """Retrieve all monitored campus rooms and baselines."""
    return CAMPUS_ROOMS

@app.post("/api/analyze", response_model=AnalyzeResponse)
def analyze_intervals(request: AnalyzeRequest):
    """Run deterministic waste detection on a batch of room intervals."""
    settings = request.settings or AnalysisSettings()
    alerts, excess_kwh, cost_inr = run_detection_engine(
        intervals=request.intervals,
        rooms_map=ROOMS_MAP,
        settings=settings,
        existing_statuses=ALERT_STATUS_STORE,
    )
    return AnalyzeResponse(
        alerts=alerts,
        totalExcessKwh=excess_kwh,
        totalPotentialCostInr=cost_inr,
        intervalsAnalyzed=len(request.intervals),
    )

@app.patch("/api/alerts/{alert_id}/status")
def update_alert_status(alert_id: str, payload: StatusUpdateRequest):
    """Update workflow status for an alert (e.g., investigating or resolved)."""
    ALERT_STATUS_STORE[alert_id] = payload.status
    return {"alertId": alert_id, "status": payload.status, "updated": True}

@app.post("/api/upload-csv", response_model=AnalyzeResponse)
async def upload_csv_and_analyze(file: UploadFile = File(...)):
    """Upload CSV meter log and run instant detection."""
    content = await file.read()
    text = content.decode("utf-8")
    reader = csv.DictReader(io.StringIO(text))

    intervals: List[RoomInterval] = []
    for row in reader:
        try:
            room_id = row.get("room_id", "").strip()
            if not room_id:
                continue
            inv = RoomInterval(
                id=f"{room_id}-{row.get('timestamp')}",
                roomId=room_id,
                timestamp=row.get("timestamp", ""),
                intervalMinutes=int(row.get("interval_minutes", 60)),
                expectedOccupancy=row.get("expected_occupancy", "empty"),
                occupancySource=row.get("occupancy_source", "timetable"),
                actualKwh=float(row.get("actual_kwh", 0.0)),
                expectedKwh=float(row.get("expected_kwh", 0.35)),
                dataSource="uploaded",
                building=row.get("building"),
                roomName=row.get("room_name"),
            )
            intervals.append(inv)
        except Exception:
            continue

    if not intervals:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid interval rows found in CSV.",
        )

    alerts, excess_kwh, cost_inr = run_detection_engine(
        intervals=intervals,
        rooms_map=ROOMS_MAP,
        settings=AnalysisSettings(),
        existing_statuses=ALERT_STATUS_STORE,
    )

    return AnalyzeResponse(
        alerts=alerts,
        totalExcessKwh=excess_kwh,
        totalPotentialCostInr=cost_inr,
        intervalsAnalyzed=len(intervals),
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
