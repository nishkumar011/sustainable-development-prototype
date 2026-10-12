from datetime import datetime
from typing import List, Dict, Tuple
from models import RoomInterval, EnergyAlert, AnalysisSettings, Room

def calculate_excess_energy(actual_kwh: float, expected_kwh: float) -> float:
    return max(0.0, round(actual_kwh - expected_kwh, 4))

def calculate_potential_cost(excess_kwh: float, tariff: float) -> float:
    if excess_kwh <= 0 or tariff <= 0:
        return 0.0
    return round(excess_kwh * tariff, 2)

def run_detection_engine(
    intervals: List[RoomInterval],
    rooms_map: Dict[str, Room],
    settings: AnalysisSettings,
    existing_statuses: Dict[str, str] = None,
) -> Tuple[List[EnergyAlert], float, float]:
    if existing_statuses is None:
        existing_statuses = {}

    # Group intervals by room
    by_room: Dict[str, List[RoomInterval]] = {}
    for inv in intervals:
        by_room.setdefault(inv.room_id, []).append(inv)

    alerts: List[EnergyAlert] = []
    total_excess = 0.0
    total_cost = 0.0

    for room_id, room_intervals in by_room.items():
        # Sort chronologically
        room_intervals.sort(key=lambda x: x.timestamp)
        room_info = rooms_map.get(room_id)
        room_name = room_info.name if room_info else (room_intervals[0].room_name or f"Room {room_id}")
        building = room_info.building if room_info else (room_intervals[0].building or "Main Campus")

        consecutive_empty_breaches = 0
        consecutive_occupied_breaches = 0

        for inv in room_intervals:
            excess_kwh = calculate_excess_energy(inv.actual_kwh, inv.expected_kwh)
            total_excess += excess_kwh
            cost_inr = calculate_potential_cost(excess_kwh, settings.tariff_per_kwh)

            # Rule 1: Empty Room Wastage
            if inv.expected_occupancy == "empty":
                if excess_kwh > settings.empty_room_threshold_kwh:
                    consecutive_empty_breaches += 1
                    is_persistent = consecutive_empty_breaches >= settings.persistence_intervals

                    severity = "low"
                    if is_persistent or excess_kwh >= settings.empty_room_threshold_kwh * 3 or excess_kwh >= 2.0:
                        severity = "high"
                    elif excess_kwh >= settings.empty_room_threshold_kwh * 1.5:
                        severity = "medium"

                    alert_id = f"alert-{room_id}-{inv.timestamp}-wastage"
                    status = existing_statuses.get(alert_id, "new")

                    evidence = [
                        f"Status: Room is scheduled to be EMPTY ({inv.occupancy_source})",
                        f"Power used: {inv.actual_kwh:.2f} kWh | Normal baseline: {inv.expected_kwh:.2f} kWh",
                        f"Wasted energy: {excess_kwh:.2f} kWh above cutoff",
                        f"Estimated cost loss: ₹{cost_inr:.2f} (at ₹{settings.tariff_per_kwh:.2f}/kWh)",
                        "⚠️ Notice: Power left running for consecutive hours" if is_persistent else "Single hour occurrence",
                    ]

                    reason = (
                        f"{room_name} in {building} has been empty for consecutive hours, but equipment is still running and drawing {inv.actual_kwh:.2f} kWh."
                        if is_persistent
                        else f"{room_name} in {building} is scheduled to be empty, but is drawing {inv.actual_kwh:.2f} kWh instead of idling at {inv.expected_kwh:.2f} kWh."
                    )

                    action = (
                        f"Urgent: Turn off high-power equipment (ACs, projectors, or computers) left running in {room_name}."
                        if is_persistent
                        else f"Inspect {room_name} switches and ensure lights/fans were turned off after class."
                    )

                    total_cost += cost_inr
                    alerts.append(
                        EnergyAlert(
                            id=alert_id,
                            roomId=room_id,
                            roomName=room_name,
                            building=building,
                            intervalId=inv.id,
                            timestamp=inv.timestamp,
                            excessKwh=excess_kwh,
                            potentialCostInr=cost_inr,
                            severity=severity,
                            status=status,
                            type="potential_wastage",
                            ruleTriggered="Persistent Empty Room Waste" if is_persistent else "Power Left On in Empty Room",
                            reason=reason,
                            recommendedAction=action,
                            evidence=evidence,
                            dataSource=inv.data_source,
                            createdAt=inv.timestamp,
                            updatedAt=datetime.utcnow().isoformat() + "Z",
                        )
                    )
                else:
                    consecutive_empty_breaches = 0

            # Rule 2: Occupied Elevated Usage
            elif inv.expected_occupancy == "occupied":
                if excess_kwh > settings.occupied_room_threshold_kwh:
                    consecutive_occupied_breaches += 1
                    is_persistent = consecutive_occupied_breaches >= settings.persistence_intervals
                    severity = "high" if is_persistent or excess_kwh >= settings.occupied_room_threshold_kwh * 2 else "medium"

                    alert_id = f"alert-{room_id}-{inv.timestamp}-elevated"
                    status = existing_statuses.get(alert_id, "new")

                    evidence = [
                        f"Status: Room is in use for scheduled class ({inv.occupancy_source})",
                        f"Power used: {inv.actual_kwh:.2f} kWh vs expected class load: {inv.expected_kwh:.2f} kWh",
                        f"Higher by: {excess_kwh:.2f} kWh",
                        f"Estimated cost difference: ₹{cost_inr:.2f}",
                    ]

                    reason = f"{room_name} was in use for class, but drew {inv.actual_kwh:.2f} kWh ({excess_kwh:.2f} kWh higher than standard class load)."
                    action = "Verify if extra equipment (stage lighting, multiple heaters, or laboratory apparatus) was running."

                    total_cost += cost_inr
                    alerts.append(
                        EnergyAlert(
                            id=alert_id,
                            roomId=room_id,
                            roomName=room_name,
                            building=building,
                            intervalId=inv.id,
                            timestamp=inv.timestamp,
                            excessKwh=excess_kwh,
                            potentialCostInr=cost_inr,
                            severity=severity,
                            status=status,
                            type="elevated_usage",
                            ruleTriggered="High Usage During Class",
                            reason=reason,
                            recommendedAction=action,
                            evidence=evidence,
                            dataSource=inv.data_source,
                            createdAt=inv.timestamp,
                            updatedAt=datetime.utcnow().isoformat() + "Z",
                        )
                    )
                else:
                    consecutive_occupied_breaches = 0

            # Rule 3: Unknown Occupancy Warning
            elif inv.expected_occupancy == "unknown":
                if excess_kwh > settings.empty_room_threshold_kwh:
                    alert_id = f"alert-{room_id}-{inv.timestamp}-unknown"
                    status = existing_statuses.get(alert_id, "new")

                    evidence = [
                        "Status: Timetable booking is unrecorded or inconclusive",
                        f"Observed power: {inv.actual_kwh:.2f} kWh ({excess_kwh:.2f} kWh above idle)",
                        f"Potential cost exposure: ₹{cost_inr:.2f}",
                    ]

                    reason = f"No timetable schedule found for {room_name}, but energy is being drawn ({inv.actual_kwh:.2f} kWh)."
                    action = "Check if an unscheduled meeting or student project session took place."

                    alerts.append(
                        EnergyAlert(
                            id=alert_id,
                            roomId=room_id,
                            roomName=room_name,
                            building=building,
                            intervalId=inv.id,
                            timestamp=inv.timestamp,
                            excessKwh=excess_kwh,
                            potentialCostInr=cost_inr,
                            severity="low",
                            status=status,
                            type="review_warning",
                            ruleTriggered="Unscheduled Room Activity",
                            reason=reason,
                            recommendedAction=action,
                            evidence=evidence,
                            dataSource=inv.data_source,
                            createdAt=inv.timestamp,
                            updatedAt=datetime.utcnow().isoformat() + "Z",
                        )
                    )

    # Sort alerts by severity and excess
    severity_rank = {"high": 3, "medium": 2, "low": 1}
    alerts.sort(key=lambda a: (severity_rank.get(a.severity, 0), a.excess_kwh), reverse=True)

    return alerts, round(total_excess, 2), round(total_cost, 2)
