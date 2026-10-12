from typing import List, Optional, Literal
from pydantic import BaseModel, Field

OccupancyStatus = Literal["occupied", "empty", "unknown"]
OccupancySource = Literal["timetable", "manual", "simulated"]
DataSource = Literal["simulated", "uploaded", "measured"]
AlertSeverity = Literal["low", "medium", "high"]
AlertStatus = Literal["new", "acknowledged", "investigating", "resolved"]
AlertType = Literal["potential_wastage", "elevated_usage", "review_warning"]

class Room(BaseModel):
    id: str
    name: str
    building: str
    floor: str
    capacity: int
    expected_baseline_kwh: float = Field(alias="expectedBaselineKwh")
    room_type: str = Field(alias="roomType")
    installed_equipment: List[str] = Field(alias="installedEquipment")
    notes: Optional[str] = None

    class Config:
        populate_by_name = True

class RoomInterval(BaseModel):
    id: str
    room_id: str = Field(alias="roomId")
    timestamp: str
    interval_minutes: int = Field(default=60, alias="intervalMinutes")
    expected_occupancy: OccupancyStatus = Field(alias="expectedOccupancy")
    occupancy_source: OccupancySource = Field(default="timetable", alias="occupancySource")
    actual_kwh: float = Field(alias="actualKwh")
    expected_kwh: float = Field(alias="expectedKwh")
    data_source: DataSource = Field(default="simulated", alias="dataSource")
    building: Optional[str] = None
    room_name: Optional[str] = Field(default=None, alias="roomName")

    class Config:
        populate_by_name = True

class EnergyAlert(BaseModel):
    id: str
    room_id: str = Field(alias="roomId")
    room_name: str = Field(alias="roomName")
    building: str
    interval_id: str = Field(alias="intervalId")
    timestamp: str
    excess_kwh: float = Field(alias="excessKwh")
    potential_cost_inr: float = Field(alias="potentialCostInr")
    severity: AlertSeverity
    status: AlertStatus = "new"
    type: AlertType
    rule_triggered: str = Field(alias="ruleTriggered")
    reason: str
    recommended_action: str = Field(alias="recommendedAction")
    evidence: List[str]
    data_source: DataSource = Field(alias="dataSource")
    created_at: str = Field(alias="createdAt")
    updated_at: str = Field(alias="updatedAt")

    class Config:
        populate_by_name = True

class AnalysisSettings(BaseModel):
    tariff_per_kwh: float = Field(default=8.0, alias="tariffPerKwh")
    empty_room_threshold_kwh: float = Field(default=0.5, alias="emptyRoomThresholdKwh")
    occupied_room_threshold_kwh: float = Field(default=0.8, alias="occupiedRoomThresholdKwh")
    persistence_intervals: int = Field(default=2, alias="persistenceIntervals")
    default_interval_minutes: int = Field(default=60, alias="defaultIntervalMinutes")

    class Config:
        populate_by_name = True

class AnalyzeRequest(BaseModel):
    intervals: List[RoomInterval]
    settings: Optional[AnalysisSettings] = None

class StatusUpdateRequest(BaseModel):
    status: AlertStatus

class AnalyzeResponse(BaseModel):
    alerts: List[EnergyAlert]
    total_excess_kwh: float = Field(alias="totalExcessKwh")
    total_potential_cost_inr: float = Field(alias="totalPotentialCostInr")
    intervals_analyzed: int = Field(alias="intervalsAnalyzed")

    class Config:
        populate_by_name = True
