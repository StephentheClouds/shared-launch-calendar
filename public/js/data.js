/**
 * data.js
 * Sample data for the prototype. 
 *
 * ENGINEERING: Replace everything in this file with real API calls.
 * The data structures here define the shape your API should return.
 * See README.md for the full list of API endpoints needed.
 *
 * Quick reference:
 *   GET /api/partners          → returns PARTNERS array
 *   GET /api/cohorts?month=... → returns COHORTS array filtered by month
 *   GET /api/programs          → returns PROGRAMS array
 *
 * All computed fields (early_access_date, working_deadline, enrollment_open_date)
 * should be computed server-side and returned pre-computed — not computed in the frontend.
 * See utils.js for the computation logic to port to the backend.
 */

// ─── Partner configuration ────────────────────────────────────────────────
//
// ENGINEERING: This comes from your partners/organizations table.
// Key fields for the calendar:
//   - cadence: how often they launch cohorts ("monthly_3rd_tue", "biweekly", "weekly")
//   - deadline_rule: T-1, T-7, T-15, T+10
//   - application_window_days: days needed for application review (0 if none)
//
const PARTNERS = [
  {
    id: 1,
    name: "Palmetto",
    short_name: "Palmetto",
    branding_partner: "Texas A&M",      // University brand — separate from client
    deadline_rule: "T-1",
    cadence: "monthly_3rd_tue",          // 3rd Tuesday of each month
    application_window_days: 0,
    contract_expiration: "2027-06-30",
    active: true,
  },
  {
    id: 2,
    name: "Citizens Bank",
    short_name: "Citizens Bank",
    branding_partner: "Texas A&M",
    deadline_rule: "T-1",
    cadence: "biweekly",                 // 1st and 3rd Tuesday
    application_window_days: 0,
    contract_expiration: "2026-12-31",
    active: true,
  },
  {
    id: 3,
    name: "Northwestern Mutual",
    short_name: "Northwestern",
    branding_partner: "Texas A&M",
    deadline_rule: "T-1",
    cadence: "monthly_3rd_tue",
    application_window_days: 0,
    contract_expiration: "2027-03-31",
    active: true,
  },
  {
    id: 4,
    name: "Pearson Clinical Assessments",
    short_name: "Pearson TAM",
    branding_partner: "Texas A&M",
    deadline_rule: "T-15",
    cadence: "weekly",                   // Every Tuesday
    application_window_days: 10,         // 10-day TA submission window
    contract_expiration: "2026-12-31",
    active: true,
  },
  {
    id: 5,
    name: "Pearson VUE",
    short_name: "Pearson VUE",
    branding_partner: "Texas A&M",
    deadline_rule: "T-15",
    cadence: "weekly",
    application_window_days: 10,
    contract_expiration: "2026-12-31",
    active: true,
  },
  {
    id: 6,
    name: "PGBA",
    short_name: "PGBA",
    branding_partner: "Texas A&M",
    deadline_rule: "T-1",
    cadence: "monthly_3rd_tue",
    application_window_days: 0,
    contract_expiration: "2027-06-30",
    active: true,
  },
  {
    id: 7,
    name: "PSD Internal",
    short_name: "PSD Internal",
    branding_partner: "Texas A&M",
    deadline_rule: "T-1",
    cadence: "monthly_3rd_tue",
    application_window_days: 0,
    contract_expiration: null,
    active: true,
  },
  {
    id: 8,
    name: "Alorica",
    short_name: "Alorica",
    branding_partner: "Texas A&M",
    deadline_rule: "T-1",
    cadence: "biweekly",
    application_window_days: 0,
    contract_expiration: "2026-09-30",
    active: true,
  },
];

// ─── Programs / SKUs ──────────────────────────────────────────────────────
//
// ENGINEERING: This comes from your programs table.
// short_name is what displays in the grid chip cells.
// cf_code is the curriculum framework code — links to LXD documentation.
//
const PROGRAMS = [
  { id: 1,  sku: "ps004_018", name: "Business and Data Analytics Certificate",                            short_name: "B&DA",         cf_code: "TB.DA-1.3Q",    course_length_weeks: 9  },
  { id: 2,  sku: "ps002_009", name: "Project Management Certificate",                                    short_name: "PM",           cf_code: "AS.PM1.3Q",     course_length_weeks: 9  },
  { id: 3,  sku: "ps007_032", name: "Operational Excellence and Process Improvement Certificate (HT)",   short_name: "OpEx-HT",      cf_code: "OP.EX-1.0_HT", course_length_weeks: 9  },
  { id: 4,  sku: "ps002_008", name: "Agile Methodologies Certificate",                                   short_name: "Agile",        cf_code: "AS.PM-4.1Q",   course_length_weeks: 9  },
  { id: 5,  sku: "ps004_020", name: "SQL for Data Analytics Certificate",                                short_name: "SQL",          cf_code: "TB.DA-2.1Q",   course_length_weeks: 9  },
  { id: 6,  sku: "ps004_021", name: "Data Visualization for Analytics Certificate",                     short_name: "DataViz",      cf_code: "TB.DA-3.3Q",   course_length_weeks: 9  },
  { id: 7,  sku: "ps007_034", name: "Customer Experience Certificate: Skills of Highly Effective Pros", short_name: "CX-HT",        cf_code: "PS.CS-1.1Q_HT",course_length_weeks: 7  },
  { id: 8,  sku: "ps007_018", name: "Power Skills for Business Operations Certificate",                  short_name: "PS-BizOps",    cf_code: "PS.OP-1.0",    course_length_weeks: 12 },
  { id: 9,  sku: "ps007_019", name: "Power Skills for Analytics Certificate",                           short_name: "PS-Analytics", cf_code: "PS.AN-1.0",    course_length_weeks: 12 },
  { id: 10, sku: "ps007_027", name: "Coaching and Quality Assurance Certificate",                       short_name: "Coaching-QA",  cf_code: "CO.QA-1.1Q",  course_length_weeks: 9  },
  { id: 11, sku: "ps004_025", name: "AI-Ready Customer Experience Certificate",                         short_name: "AI-CX",        cf_code: "AI.CX-1.0Q_HT",course_length_weeks: 9  },
  { id: 12, sku: "ps007_040", name: "Leadership & Management Certificate for Operations Leaders (HT)",  short_name: "L&M Ops-HT",   cf_code: "MG.OP-1.1Q_HT",course_length_weeks: 9  },
  { id: 13, sku: "ps007_036", name: "Leadership & Management Certificate for Customer Experience Leaders",short_name: "L&M-CX-HT",  cf_code: "MG.CX-1.1Q_HT",course_length_weeks: 9  },
  { id: 14, sku: "ps007_039", name: "Advanced Leadership & Management Certificate for CX Leaders",      short_name: "AdvL&M-CX",    cf_code: "MG.CX-2.0Q_HT",course_length_weeks: 9  },
  { id: 15, sku: "ps007_041", name: "Building Client Relationships in Banking Certificate (HT)",        short_name: "Banking",      cf_code: "SA.BK-1.1Q_HT",course_length_weeks: 7  },
];

// ─── Cohort data ──────────────────────────────────────────────────────────
//
// ENGINEERING: This is the partner_cohorts join table — one record per
// partner per cohort. A single cohort (by start_date + sku) can appear
// multiple times here with different partners.
//
// Key computed fields (compute server-side, return pre-computed):
//   enrollment_open_date  = previous cohort start_date for this partner+sku
//   early_access_date     = MAX(enrollment_open_date, content_ready_date)
//   working_deadline      = MIN(start_date - rule_days, start_date - app_window_days)
//
// content_ready_date is set by LXD. Null = assume content is ready by enrollment open.
//
// IMPORTANT: early_access_date determines cohort sharing eligibility.
// Two partners can share a cohort instance only if they have the same
// start_date, sku, AND early_access_date. See generator.js for the logic.
//
const COHORT_DATA = [
  // ── PALMETTO ──────────────────────────────────────────────────────────────
  { partner_id:1, sku:"ps004_018", start:"2026-01-20", end:"2026-03-23", status:"setup",     enrollment_open:"2026-01-20", early_access:"2026-01-20", working_deadline:"2026-01-19", content_ready:null },
  { partner_id:1, sku:"ps004_018", start:"2026-02-17", end:"2026-04-20", status:"setup",     enrollment_open:"2026-02-17", early_access:"2026-02-17", working_deadline:"2026-02-16", content_ready:null },
  { partner_id:1, sku:"ps004_018", start:"2026-03-17", end:"2026-05-18", status:"setup",     enrollment_open:"2026-03-17", early_access:"2026-03-17", working_deadline:"2026-03-16", content_ready:null },
  { partner_id:1, sku:"ps004_018", start:"2026-04-21", end:"2026-06-22", status:"setup",     enrollment_open:"2026-04-21", early_access:"2026-04-21", working_deadline:"2026-04-20", content_ready:null },
  { partner_id:1, sku:"ps004_018", start:"2026-05-19", end:"2026-07-20", status:"confirmed", enrollment_open:"2026-05-19", early_access:"2026-05-19", working_deadline:"2026-05-18", content_ready:null },
  { partner_id:1, sku:"ps004_018", start:"2026-06-16", end:"2026-08-17", status:"tentative", enrollment_open:"2026-06-16", early_access:"2026-06-16", working_deadline:"2026-06-15", content_ready:null },
  { partner_id:1, sku:"ps007_032", start:"2026-03-17", end:"2026-05-18", status:"setup",     enrollment_open:"2026-03-17", early_access:"2026-03-17", working_deadline:"2026-03-16", content_ready:null },
  { partner_id:1, sku:"ps007_032", start:"2026-04-21", end:"2026-06-22", status:"setup",     enrollment_open:"2026-04-21", early_access:"2026-04-21", working_deadline:"2026-04-20", content_ready:null },
  { partner_id:1, sku:"ps007_032", start:"2026-05-19", end:"2026-07-20", status:"confirmed", enrollment_open:"2026-05-19", early_access:"2026-05-19", working_deadline:"2026-05-18", content_ready:null },
  { partner_id:1, sku:"ps007_032", start:"2026-06-17", end:"2026-08-18", status:"tentative", enrollment_open:"2026-06-17", early_access:"2026-06-17", working_deadline:"2026-06-16", content_ready:null },
  { partner_id:1, sku:"ps007_040", start:"2026-03-17", end:"2026-05-18", status:"setup",     enrollment_open:"2026-03-17", early_access:"2026-03-17", working_deadline:"2026-03-16", content_ready:null },
  { partner_id:1, sku:"ps007_040", start:"2026-04-21", end:"2026-06-22", status:"setup",     enrollment_open:"2026-04-21", early_access:"2026-04-21", working_deadline:"2026-04-20", content_ready:null },
  { partner_id:1, sku:"ps007_040", start:"2026-05-19", end:"2026-07-20", status:"confirmed", enrollment_open:"2026-05-19", early_access:"2026-05-19", working_deadline:"2026-05-18", content_ready:null },
  { partner_id:1, sku:"ps007_040", start:"2026-06-16", end:"2026-08-17", status:"tentative", enrollment_open:"2026-06-16", early_access:"2026-06-16", working_deadline:"2026-06-15", content_ready:null },
  { partner_id:1, sku:"ps002_009", start:"2026-01-20", end:"2026-03-23", status:"setup",     enrollment_open:"2026-01-20", early_access:"2026-01-20", working_deadline:"2026-01-19", content_ready:null },
  { partner_id:1, sku:"ps002_009", start:"2026-02-17", end:"2026-04-20", status:"setup",     enrollment_open:"2026-02-17", early_access:"2026-02-17", working_deadline:"2026-02-16", content_ready:null },
  { partner_id:1, sku:"ps002_009", start:"2026-03-17", end:"2026-05-18", status:"setup",     enrollment_open:"2026-03-17", early_access:"2026-03-17", working_deadline:"2026-03-16", content_ready:null },
  { partner_id:1, sku:"ps002_009", start:"2026-04-21", end:"2026-06-22", status:"setup",     enrollment_open:"2026-04-21", early_access:"2026-04-21", working_deadline:"2026-04-20", content_ready:null },
  { partner_id:1, sku:"ps002_009", start:"2026-05-19", end:"2026-07-20", status:"confirmed", enrollment_open:"2026-05-19", early_access:"2026-05-19", working_deadline:"2026-05-18", content_ready:null },
  { partner_id:1, sku:"ps002_009", start:"2026-06-16", end:"2026-08-17", status:"tentative", enrollment_open:"2026-06-16", early_access:"2026-06-16", working_deadline:"2026-06-15", content_ready:null },

  // ── CITIZENS BANK ─────────────────────────────────────────────────────────
  // Citizens runs biweekly (1st + 3rd Tuesday), so two cohorts per month
  { partner_id:2, sku:"ps004_018", start:"2026-01-06", end:"2026-03-09", status:"setup",     enrollment_open:"2026-01-06", early_access:"2026-01-06", working_deadline:"2026-01-05", content_ready:null },
  { partner_id:2, sku:"ps004_018", start:"2026-01-20", end:"2026-03-23", status:"setup",     enrollment_open:"2026-01-20", early_access:"2026-01-20", working_deadline:"2026-01-19", content_ready:null },
  { partner_id:2, sku:"ps004_018", start:"2026-02-03", end:"2026-04-06", status:"setup",     enrollment_open:"2026-02-03", early_access:"2026-02-03", working_deadline:"2026-02-02", content_ready:null },
  { partner_id:2, sku:"ps004_018", start:"2026-02-17", end:"2026-04-20", status:"setup",     enrollment_open:"2026-02-17", early_access:"2026-02-17", working_deadline:"2026-02-16", content_ready:null },
  { partner_id:2, sku:"ps004_018", start:"2026-03-03", end:"2026-05-04", status:"setup",     enrollment_open:"2026-03-03", early_access:"2026-03-03", working_deadline:"2026-03-02", content_ready:null },
  { partner_id:2, sku:"ps004_018", start:"2026-03-17", end:"2026-05-18", status:"setup",     enrollment_open:"2026-03-17", early_access:"2026-03-17", working_deadline:"2026-03-16", content_ready:null },
  { partner_id:2, sku:"ps004_018", start:"2026-04-07", end:"2026-06-08", status:"setup",     enrollment_open:"2026-04-07", early_access:"2026-04-07", working_deadline:"2026-04-06", content_ready:null },
  { partner_id:2, sku:"ps004_018", start:"2026-04-21", end:"2026-06-22", status:"setup",     enrollment_open:"2026-04-21", early_access:"2026-04-21", working_deadline:"2026-04-20", content_ready:null },
  { partner_id:2, sku:"ps004_018", start:"2026-05-05", end:"2026-07-06", status:"confirmed", enrollment_open:"2026-05-05", early_access:"2026-05-05", working_deadline:"2026-05-04", content_ready:null },
  { partner_id:2, sku:"ps004_018", start:"2026-05-19", end:"2026-07-20", status:"confirmed", enrollment_open:"2026-05-19", early_access:"2026-05-19", working_deadline:"2026-05-18", content_ready:null },
  // June: 6/2 is confirmed, 6/16 is tentative. Note different EA dates — they cannot share a cohort instance.
  { partner_id:2, sku:"ps004_018", start:"2026-06-02", end:"2026-08-03", status:"confirmed", enrollment_open:"2026-05-19", early_access:"2026-05-19", working_deadline:"2026-06-01", content_ready:null },
  { partner_id:2, sku:"ps004_018", start:"2026-06-16", end:"2026-08-17", status:"tentative", enrollment_open:"2026-06-02", early_access:"2026-06-02", working_deadline:"2026-06-15", content_ready:null },

  { partner_id:2, sku:"ps002_009", start:"2026-01-06", end:"2026-03-09", status:"setup",     enrollment_open:"2026-01-06", early_access:"2026-01-06", working_deadline:"2026-01-05", content_ready:null },
  { partner_id:2, sku:"ps002_009", start:"2026-01-20", end:"2026-03-23", status:"setup",     enrollment_open:"2026-01-20", early_access:"2026-01-20", working_deadline:"2026-01-19", content_ready:null },
  { partner_id:2, sku:"ps002_009", start:"2026-05-05", end:"2026-07-06", status:"confirmed", enrollment_open:"2026-05-05", early_access:"2026-05-05", working_deadline:"2026-05-04", content_ready:null },
  { partner_id:2, sku:"ps002_009", start:"2026-05-19", end:"2026-07-20", status:"confirmed", enrollment_open:"2026-05-19", early_access:"2026-05-19", working_deadline:"2026-05-18", content_ready:null },
  { partner_id:2, sku:"ps002_009", start:"2026-06-02", end:"2026-08-03", status:"confirmed", enrollment_open:"2026-05-19", early_access:"2026-05-19", working_deadline:"2026-06-01", content_ready:null },
  { partner_id:2, sku:"ps002_009", start:"2026-06-16", end:"2026-08-17", status:"tentative", enrollment_open:"2026-06-02", early_access:"2026-06-02", working_deadline:"2026-06-15", content_ready:null },

  { partner_id:2, sku:"ps007_032", start:"2026-05-05", end:"2026-07-06", status:"confirmed", enrollment_open:"2026-05-05", early_access:"2026-05-05", working_deadline:"2026-05-04", content_ready:null },
  { partner_id:2, sku:"ps007_032", start:"2026-05-19", end:"2026-07-20", status:"confirmed", enrollment_open:"2026-05-19", early_access:"2026-05-19", working_deadline:"2026-05-18", content_ready:null },
  { partner_id:2, sku:"ps007_032", start:"2026-06-02", end:"2026-08-03", status:"confirmed", enrollment_open:"2026-05-19", early_access:"2026-05-19", working_deadline:"2026-06-01", content_ready:null },
  { partner_id:2, sku:"ps007_032", start:"2026-06-16", end:"2026-08-17", status:"tentative", enrollment_open:"2026-06-02", early_access:"2026-06-02", working_deadline:"2026-06-15", content_ready:null },

  { partner_id:2, sku:"ps007_041", start:"2026-05-05", end:"2026-07-06", status:"confirmed", enrollment_open:"2026-05-05", early_access:"2026-05-05", working_deadline:"2026-05-04", content_ready:null },
  { partner_id:2, sku:"ps007_041", start:"2026-05-19", end:"2026-07-20", status:"confirmed", enrollment_open:"2026-05-19", early_access:"2026-05-19", working_deadline:"2026-05-18", content_ready:null },
  { partner_id:2, sku:"ps007_041", start:"2026-06-02", end:"2026-08-03", status:"confirmed", enrollment_open:"2026-05-19", early_access:"2026-05-19", working_deadline:"2026-06-01", content_ready:null },
  { partner_id:2, sku:"ps007_041", start:"2026-06-16", end:"2026-08-17", status:"tentative", enrollment_open:"2026-06-02", early_access:"2026-06-02", working_deadline:"2026-06-15", content_ready:null },

  // ── PGBA ──────────────────────────────────────────────────────────────────
  // PGBA started June 2026 — no cohorts before June
  { partner_id:6, sku:"ps004_018", start:"2026-04-21", end:"2026-06-22", status:"setup",     enrollment_open:"2026-04-21", early_access:"2026-04-21", working_deadline:"2026-04-20", content_ready:null },
  { partner_id:6, sku:"ps004_018", start:"2026-05-19", end:"2026-07-20", status:"confirmed", enrollment_open:"2026-05-19", early_access:"2026-05-19", working_deadline:"2026-05-18", content_ready:null },
  { partner_id:6, sku:"ps004_018", start:"2026-06-16", end:"2026-08-17", status:"tentative", enrollment_open:"2026-06-16", early_access:"2026-06-16", working_deadline:"2026-06-15", content_ready:null },
  { partner_id:6, sku:"ps002_009", start:"2026-04-21", end:"2026-06-22", status:"setup",     enrollment_open:"2026-04-21", early_access:"2026-04-21", working_deadline:"2026-04-20", content_ready:null },
  { partner_id:6, sku:"ps002_009", start:"2026-05-19", end:"2026-07-20", status:"confirmed", enrollment_open:"2026-05-19", early_access:"2026-05-19", working_deadline:"2026-05-18", content_ready:null },
  { partner_id:6, sku:"ps002_009", start:"2026-06-16", end:"2026-08-17", status:"tentative", enrollment_open:"2026-06-16", early_access:"2026-06-16", working_deadline:"2026-06-15", content_ready:null },

  // ── NORTHWESTERN ──────────────────────────────────────────────────────────
  { partner_id:3, sku:"ps004_018", start:"2026-01-20", end:"2026-03-23", status:"setup",     enrollment_open:"2026-01-20", early_access:"2026-01-20", working_deadline:"2026-01-19", content_ready:null },
  { partner_id:3, sku:"ps004_018", start:"2026-02-17", end:"2026-04-20", status:"setup",     enrollment_open:"2026-02-17", early_access:"2026-02-17", working_deadline:"2026-02-16", content_ready:null },
  { partner_id:3, sku:"ps004_018", start:"2026-03-17", end:"2026-05-18", status:"setup",     enrollment_open:"2026-03-17", early_access:"2026-03-17", working_deadline:"2026-03-16", content_ready:null },
  { partner_id:3, sku:"ps004_018", start:"2026-04-21", end:"2026-06-22", status:"setup",     enrollment_open:"2026-04-21", early_access:"2026-04-21", working_deadline:"2026-04-20", content_ready:null },
  { partner_id:3, sku:"ps004_018", start:"2026-05-19", end:"2026-07-20", status:"confirmed", enrollment_open:"2026-05-19", early_access:"2026-05-19", working_deadline:"2026-05-18", content_ready:null },
  { partner_id:3, sku:"ps004_018", start:"2026-06-16", end:"2026-08-17", status:"tentative", enrollment_open:"2026-06-16", early_access:"2026-06-16", working_deadline:"2026-06-15", content_ready:null },
];

// ─── Helper: get partner by id ────────────────────────────────────────────
function getPartner(id) {
  return PARTNERS.find(p => p.id === id);
}

// ─── Helper: get program by SKU ───────────────────────────────────────────
function getProgram(sku) {
  return PROGRAMS.find(p => p.sku === sku);
}

// ─── Helper: get all cohorts for a partner ────────────────────────────────
function getCohortsForPartner(partnerId) {
  return COHORT_DATA.filter(c => c.partner_id === partnerId);
}

// ─── Helper: get all cohorts for a month (YYYY-MM) ───────────────────────
function getCohortsForMonth(monthStr) {
  return COHORT_DATA.filter(c => c.start.startsWith(monthStr));
}

// ─── Helper: get all cohorts for a SKU ───────────────────────────────────
function getCohortsForSku(sku) {
  return COHORT_DATA.filter(c => c.sku === sku);
}

// ENGINEERING: Replace all of the above with fetch() calls to your API.
// Example:
//
// async function getCohortsForMonth(monthStr) {
//   const res = await fetch(`/api/cohorts?month=${monthStr}`, {
//     headers: { 'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content }
//   });
//   return res.json();
// }
//
// async function updateCohortStatus(partnerCohortId, newStatus) {
//   await fetch(`/api/partner_cohorts/${partnerCohortId}/status`, {
//     method: 'PATCH',
//     headers: {
//       'Content-Type': 'application/json',
//       'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
//     },
//     body: JSON.stringify({ status: newStatus })
//   });
// }
