import pytest
from engine import calculate_excess_energy, calculate_potential_cost, run_detection_engine
from models import RoomInterval, AnalysisSettings, Room

def test_calculate_excess_energy():
    assert calculate_excess_energy(1.10, 0.40) == 0.70
    assert calculate_excess_energy(0.40, 0.40) == 0.0
    assert calculate_excess_energy(0.30, 0.40) == 0.0

def test_calculate_potential_cost():
    assert calculate_potential_cost(2.5, 8.0) == 20.0
    assert calculate_potential_cost(0.70, 8.0) == 5.60

def test_empty_room_detection():
    room = Room(
        id="R-101",
        name="Classroom 101",
        building="Aryabhata Hall",
        floor="1st Floor",
        capacity=60,
        expectedBaselineKwh=0.35,
        roomType="Classroom",
        installedEquipment=["Fans"],
    )
    rooms_map = {"R-101": room}
    settings = AnalysisSettings(tariffPerKwh=8.0, emptyRoomThresholdKwh=0.5)

    interval = RoomInterval(
        id="inv-1",
        roomId="R-101",
        timestamp="2026-10-12T11:00:00Z",
        expectedOccupancy="empty",
        actualKwh=1.05,
        expectedKwh=0.35, # Excess = 0.70 > 0.50 cutoff
        dataSource="simulated",
    )

    alerts, total_excess, total_cost = run_detection_engine([interval], rooms_map, settings)
    assert len(alerts) == 1
    assert alerts[0].type == "potential_wastage"
    assert alerts[0].excess_kwh == 0.70
    assert alerts[0].potential_cost_inr == 5.60
    assert "Empty Room" in alerts[0].rule_triggered
