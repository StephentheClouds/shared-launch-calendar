/**
 * utils.js
 * Date utilities and business logic for enrollment windows, EA dates, and deadlines.
 *
 * ENGINEERING: Port this logic to the backend (Ruby/Rails).
 * These functions should run server-side so the API returns pre-computed dates.
 * The frontend should just display what the API returns — not recompute.
 *
 * All date strings are ISO format: "YYYY-MM-DD"
 */

// ─── Date parsing ─────────────────────────────────────────────────────────

function parseDate(str) {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(date) {
  if (!date) return null;
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

function displayDate(str) {
  // "2026-06-16" → "6/16"
  if (!str) return '—';
  const d = parseDate(str);
  return `${d.getMonth()+1}/${d.getDate()}`;
}

function displayMonth(str) {
  // "2026-06" → "Jun 2026"
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const [y, m] = str.split('-').map(Number);
  return `${months[m-1]} ${y}`;
}

function monthKey(dateStr) {
  // "2026-06-16" → "2026-06"
  return dateStr.substring(0, 7);
}

function isCurrentMonth(monthStr) {
  const now = new Date();
  const current = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  return monthStr === current;
}

function isPast(dateStr) {
  const d = parseDate(dateStr);
  const today = new Date();
  today.setHours(0,0,0,0);
  return d < today;
}

function addDays(dateStr, days) {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

// ─── Enrollment window calculations ──────────────────────────────────────
//
// See requirements Section 6 for the full model.

/**
 * Compute enrollment open date for a cohort.
 * = previous cohort start date for the same partner + SKU
 *
 * ENGINEERING: This should be a database query, not JS.
 * SELECT MAX(start_date) FROM cohorts
 *   WHERE partner_id = ? AND sku = ? AND start_date < this_start_date
 *
 * @param {string} partnerId
 * @param {string} sku
 * @param {string} startDate - this cohort's start date
 * @param {Array} allCohorts - all cohorts for this partner+sku
 * @returns {string|null} ISO date string
 */
function computeEnrollmentOpenDate(partnerId, sku, startDate, allCohorts) {
  const previous = allCohorts
    .filter(c => c.partner_id === partnerId && c.sku === sku && c.start < startDate)
    .sort((a, b) => b.start.localeCompare(a.start));
  return previous.length ? previous[0].start : null;
}

/**
 * Compute early access date.
 * = MAX(enrollment_open_date, content_ready_date)
 * If content_ready_date is null, = enrollment_open_date
 *
 * Requirements Section 6.2: EA date is NOT the same as enrollment open date
 * when content isn't ready yet. The gap between enrollment open and EA is
 * a period where learners are enrolled but can't access content — this should
 * be visually flagged in the calendar.
 *
 * @param {string} enrollmentOpenDate
 * @param {string|null} contentReadyDate - set by LXD when content is confirmed live
 * @returns {string}
 */
function computeEarlyAccessDate(enrollmentOpenDate, contentReadyDate) {
  if (!contentReadyDate) return enrollmentOpenDate;
  return contentReadyDate > enrollmentOpenDate ? contentReadyDate : enrollmentOpenDate;
}

/**
 * Compute working enrollment deadline.
 * = MIN(start - rule_days, start - application_window_days)
 *
 * Requirements Section 6.2: The application window can pull the deadline
 * EARLIER than the contractual rule. The contractual rule (T-1 etc) is the
 * FLOOR (latest possible deadline), not the target.
 *
 * @param {string} startDate
 * @param {string} deadlineRule - "T-1", "T-7", "T-15", "T+10"
 * @param {number} applicationWindowDays - 0 if no application process
 * @returns {string}
 */
function computeWorkingDeadline(startDate, deadlineRule, applicationWindowDays = 0) {
  // Parse rule days
  let ruleDays = 1; // default T-1
  if (deadlineRule === 'T-7')  ruleDays = 7;
  if (deadlineRule === 'T-15') ruleDays = 15;
  if (deadlineRule === 'T+10') ruleDays = -10; // post-start enrollment

  const ruleDeadline = addDays(startDate, -ruleDays);

  // If there's an application window, it may pull the deadline earlier
  if (applicationWindowDays > 0) {
    const appDeadline = addDays(startDate, -applicationWindowDays);
    // Return the EARLIER of the two (more restrictive)
    return appDeadline < ruleDeadline ? appDeadline : ruleDeadline;
  }

  return ruleDeadline;
}

/**
 * Check if a cohort has a content gap (enrolled but can't access content).
 * = early_access_date > enrollment_open_date
 *
 * Requirements Section 6.6: These cohorts must be visually flagged.
 */
function hasContentGap(enrollmentOpenDate, earlyAccessDate) {
  if (!enrollmentOpenDate || !earlyAccessDate) return false;
  return earlyAccessDate > enrollmentOpenDate;
}

// ─── Cohort sharing logic ─────────────────────────────────────────────────
//
// See requirements Section 7 for the full sharing model.

/**
 * Generate a sharing key for a cohort.
 * Two partners can share a cohort instance if and only if their sharing keys match.
 *
 * Sharing conditions (all must match):
 *   1. Same SKU
 *   2. Same cohort start date
 *   3. Same early access date (changes monthly based on each partner's previous cohort)
 *
 * NOTE: Deadline rule is NOT part of the sharing key.
 * The deadline lives at the program_cohort level (per partner), not the cohort level.
 * So T-1 and T-15 partners CAN share a cohort instance — they just have different
 * program_cohort deadline dates. What matters for sharing is the EA date,
 * because comms (Customer.io) fire off the EA date. Different EA = different comms
 * timing = different learner journey = cannot share.
 *
 * @param {string} sku
 * @param {string} startDate
 * @param {string} earlyAccessDate
 * @returns {string}
 */
function buildSharingKey(sku, startDate, earlyAccessDate) {
  return `${sku}|${startDate}|${earlyAccessDate}`;
}

/**
 * Generate a cohort instance name following the naming convention.
 *
 * Format: p-chrys-EA[MMDD]-[sku]-26[MMDD]
 * Example: p-chrys-EA519-ps002_009-26616
 *   = early access May 19, PM Certificate, cohort starts June 16 2026
 *
 * If no early access (content not ready at enrollment): p-chrys-all[MMDD]-[sku]-26[MMDD]
 *
 * @param {string} sku
 * @param {string} startDate - "2026-06-16"
 * @param {string} earlyAccessDate - "2026-05-19"
 * @param {boolean} hasEarlyAccess - false if content not ready
 * @returns {string}
 */
function buildInstanceName(sku, startDate, earlyAccessDate, hasEarlyAccess = true) {
  const ea = parseDate(earlyAccessDate);
  const start = parseDate(startDate);

  const eaMMDD = `${ea.getMonth()+1}${ea.getDate()}`;
  const startMMDD = `${start.getMonth()+1}${start.getDate()}`;
  const year = String(start.getFullYear()).slice(2); // "26"

  const prefix = hasEarlyAccess ? `p-chrys-EA${eaMMDD}` : `p-chrys-all${eaMMDD}`;
  return `${prefix}-${sku}-${year}${startMMDD}`;
}

// ─── Status helpers ───────────────────────────────────────────────────────

const STATUS_CONFIG = {
  setup:     { label: 'Set up',    cssClass: 'chip-setup',     color: '#1565C0' },
  confirmed: { label: 'Confirmed', cssClass: 'chip-confirmed', color: '#2E7D32' },
  tentative: { label: 'Tentative', cssClass: 'chip-tentative', color: '#F57F17' },
  cancelled: { label: 'Cancelled', cssClass: 'chip-cancelled', color: '#C62828' },
};

function getStatusConfig(status) {
  return STATUS_CONFIG[status] || STATUS_CONFIG.tentative;
}

// ─── Month utilities ──────────────────────────────────────────────────────

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function getMonthRange(startMonthStr, count) {
  // Returns array of "YYYY-MM" strings
  const [year, month] = startMonthStr.split('-').map(Number);
  const result = [];
  for (let i = 0; i < count; i++) {
    const m = ((month - 1 + i) % 12) + 1;
    const y = year + Math.floor((month - 1 + i) / 12);
    result.push(`${y}-${String(m).padStart(2,'0')}`);
  }
  return result;
}

function monthLabel(monthStr) {
  const [, m] = monthStr.split('-').map(Number);
  return MONTH_NAMES[m - 1];
}
