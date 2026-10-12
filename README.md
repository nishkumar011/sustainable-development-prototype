# RoomPulse
### Intelligent Campus Electricity Waste Detection and Prevention Platform
> *"Detect waste before it becomes the norm."*

RoomPulse is an explainable campus energy management platform that cross-references classroom timetables, expected room occupancy, actual energy meter readings, and idle baselines to identify unnecessary electricity waste.

---

## ⚡ Core Philosophy & Differentiator

Most energy dashboards simply display consumption graphs without operational context. RoomPulse differentiates itself by:
1. **Context-Aware Cross-Referencing**: Evaluating energy draw in relation to scheduled room occupancy.
2. **Transparent Mathematical Proof**: Explaining *why* an interval was flagged, *which* rule triggered, the exact calculated excess (kWh), and the potential cost exposure (₹).
3. **Deterministic & Explainable**: Pure rule-based detection engine with zero black-box AI claims.
4. **Actionable Next Steps**: Recommending concrete inspection tasks for facility staff and maintenance crews.

---

## 🏗️ Architecture & Project Structure

```
roompulse/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── README.md
├── public/
│   └── sample-data.csv
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── types/
    │   └── index.ts                 # Full TypeScript domain models
    ├── data/
    │   ├── roomConfig.ts            # 12 campus spaces across Aryabhata, Ramanujan & Tagore blocks
    │   └── sampleData.ts            # Deterministic intervals & flawed test datasets
    ├── engine/
    │   ├── validation.ts            # Row-level CSV validation & deduplication
    │   ├── detection.ts             # Occupancy-aware deterministic detection rules
    │   ├── calculations.ts          # Energy (kWh) and Indian Rupee (₹) cost calculations
    │   └── analytics.ts             # Aggregations, severity ranking & time series series
    ├── services/
    │   ├── storageService.ts        # Browser localStorage persistence
    │   └── roomPulseService.ts      # Application service layer
    ├── context/
    │   └── RoomPulseContext.tsx     # Centralized reactive application state
    ├── hooks/
    │   ├── useRoomData.ts           # Room queries and filters
    │   └── useAlerts.ts             # Alert queries, sorting and search
    ├── components/
    │   ├── layout/                  # AppShell, Sidebar, Topbar
    │   ├── dashboard/               # MetricCards, EnergyTrendChart, AlertDistribution, RoomUsageTable
    │   ├── analysis/                # DataUpload, AnalysisControls, AnalysisResults
    │   ├── alerts/                  # AlertList, AlertDetail, AlertStatusControl
    │   ├── rooms/                   # RoomList, RoomDetail
    │   └── common/                  # StatusBadge, EmptyState, ErrorMessage, LoadingState, ConfirmationModal
    ├── pages/
    │   ├── DashboardPage.tsx        # Executive summary overview
    │   ├── AnalysisPage.tsx         # CSV ingestion, parameters, ledger & overrides
    │   ├── AlertsPage.tsx           # Anomaly tracking, proof breakdown & workflow status
    │   ├── RoomsPage.tsx            # Campus space profiles, equipment, and readings
    │   └── SettingsPage.tsx         # Tariff & threshold configurations
    ├── utils/
    │   ├── csvParser.ts             # Client-side quote-safe CSV parser
    │   ├── csvExporter.ts           # CSV export for alerts, room summaries & templates
    │   ├── formatters.ts            # Currency (₹), kWh and badge formatters
    │   └── dates.ts                 # ISO 8601 formatting helpers
    └── test/
        └── detection.test.ts        # Vitest suite covering 10 required test scenarios
```

---

## 📐 Detection Rules Summary

- **Rule EW-01: Empty Room Wastage**
  - **Condition**: Room expected to be `empty` AND `(actualKwh - expectedKwh) > emptyRoomThresholdKwh`.
  - **Output**: Potential-wastage alert with calculated excess energy and INR cost.
- **Rule EW-02: Persistent Empty Room Wastage**
  - **Condition**: Consecutive empty intervals breaching threshold $\ge$ `persistenceIntervals`.
  - **Output**: Severity automatically elevated to `High Priority`.
- **Rule EU-01: Occupied Room Abnormal Elevated Load**
  - **Condition**: Room expected to be `occupied` AND `(actualKwh - expectedKwh) > occupiedRoomThresholdKwh`.
  - **Output**: Elevated-usage review alert (not labeled as pure waste; prompts activity audit).
- **Rule DQ-01: Unverified Occupancy Anomaly**
  - **Condition**: Occupancy is `unknown` with unusually elevated energy draw.
  - **Output**: Data quality audit warning.

---

## 🧪 Testing

Run the Vitest suite:
```bash
npx vitest run
```
Covering all 10 scenarios:
1. Normal occupied room
2. Empty room with elevated usage
3. Empty room below threshold
4. Exact threshold comparison (strict greater-than)
5. Unknown occupancy
6. Negative energy reading rejection
7. INR cost calculation accuracy
8. Multi-interval persistence elevation
9. Determinism on repeated analysis
10. CSV import validation and corrupted row reporting
