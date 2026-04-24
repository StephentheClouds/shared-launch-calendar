# Shared Launch Calendar — Prototype

A working frontend prototype of the B2B Cohort Launch Calendar, built to be handed off to engineering for integration into Sabrina (Avo/Rails).

## What this is

This prototype demonstrates the full interaction model for the launch calendar V2. It uses hardcoded sample data so it runs without a backend. Engineering's job is to:

1. Replace the hardcoded `SAMPLE_DATA` in each JS file with real API/database calls
2. Wire up status updates to write back to the database
3. Integrate the pages into Avo as custom pages or tools
4. Add authentication (already handled by Sabrina/Avo)

All business logic, UI interactions, and data structures are fully implemented and documented.

---

## File structure

```
shared-launch-calendar/
├── README.md                          ← This file
├── public/
│   ├── index.html                     ← Calendar grid view (main view)
│   ├── generator.html                 ← Cohort instance generator
│   ├── css/
│   │   └── sabrina.css                ← Shared styles matching Sabrina/Avo UI
│   └── js/
│       ├── data.js                    ← REPLACE THIS: hardcoded sample data → API calls
│       ├── calendar.js                ← Calendar grid rendering + interactions
│       ├── generator.js               ← Cohort sharing logic + instance naming
│       └── utils.js                   ← Date utilities (enrollment windows, EA dates, deadlines)
└── docs/
    └── requirements.md                ← Full V2 requirements document
```

---

## Running locally

No build step required. Just open in a browser:

```bash
cd shared-launch-calendar
open public/index.html
```

Or serve with any static server:

```bash
npx serve public
# → http://localhost:3000
```

---

## Integration into Sabrina (Avo)

### Option A — Avo custom page (recommended)
Add a custom Avo page that renders this as a Rails view. The JS files can be included via the asset pipeline or importmapped.

```ruby
# In your Avo configuration
Avo.configure do |config|
  config.main_menu = -> {
    section "Launch", icon: "calendar" do
      link "Launch calendar", path: "/avo/launch_calendar"
      link "Cohort generator", path: "/avo/cohort_generator"
    end
  }
end
```

### Option B — iframe embed
Host this as a standalone static app and embed via iframe in an Avo custom tool. Faster to ship, easier to iterate on independently.

---

## Data model

See `docs/requirements.md` Section 4 for the full field spec.

### Key tables engineering will need:

**partners**
- id, name, short_name, branding_partner, deadline_rule, cadence, application_window_days, contract_expiration, active

**programs**
- id, name, short_name, sku, cf_code, course_length_weeks, program_status, lxd_notes_url

**cohorts**
- id, program_id, start_date, end_date, status, sku_conflict, created_at

**partner_cohorts** (join table — many-to-many)
- id, partner_id, cohort_id, enrollment_open_date, content_ready_date, early_access_date, working_deadline, cohort_instance_name

### Why the join table matters
A single cohort instance (cohort) can be shared by multiple partners. Each partner gets their own enrollment_open_date and early_access_date even when sharing the same cohort start date. This is the core of the shared cohort model — see requirements Section 7.

---

## API endpoints needed

```
GET  /api/partners                          → list of all partners with config
GET  /api/cohorts?month=2026-06             → cohorts for a given month
GET  /api/cohorts?partner_id=X             → cohorts for a specific partner
GET  /api/cohorts?sku=ps004_018            → cohorts for a specific program (LXD view)
PATCH /api/partner_cohorts/:id/status      → update cohort status
POST /api/generator/run                    → generate cohort instances for a month
GET  /api/programs                         → list of all programs/SKUs
```

---

## Business logic (already implemented in JS — needs porting to backend)

All of the following is implemented in `public/js/utils.js` and `public/js/generator.js`. Engineering should port this logic to the backend so it's authoritative:

### Enrollment open date
= previous cohort start date for the same partner + SKU

### Early access date  
= MAX(enrollment_open_date, content_ready_date)
If content_ready_date is null, early_access_date = enrollment_open_date

### Working enrollment deadline
= MIN(cohort_start - deadline_rule_days, cohort_start - application_window_days)
If no application window, = cohort_start - deadline_rule_days

### Cohort sharing key
Two partners can share a cohort instance if and only if:
1. Same SKU
2. Same cohort start date  
3. Same early_access_date (this changes monthly based on each partner's previous cohort)

Note: deadline rule lives at the program_cohort level, NOT the cohort level,
so it does NOT factor into sharing eligibility.

### Cohort instance naming convention
p-chrys-EA[MMDD]-[sku]-26[MMDD]
Example: p-chrys-EA519-ps002_009-26616
= early access May 19, PM Certificate, cohort starts June 16 2026

If no early access: p-chrys-all[MMDD]-[sku]-26[MMDD]

---

## Status values

| Value       | Meaning                              | Color  |
|-------------|--------------------------------------|--------|
| `setup`     | Configured in LMS (past cohorts)     | Blue   |
| `confirmed` | Active / confirmed upcoming          | Green  |
| `tentative` | Planned but not yet confirmed        | Amber  |
| `cancelled` | Cancelled                            | Red    |

---

## Questions for engineering

1. Does Sabrina already have a Partner/Organization model that maps to the partners table above, or does this need to be a new table?
2. Is there an existing Cohort or Program model in Sabrina that this should extend?
3. What's the preferred approach for the Avo integration — custom page or iframe?
4. Is there an existing API pattern in Sabrina we should follow for the endpoints above?
