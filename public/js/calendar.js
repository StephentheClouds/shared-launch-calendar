/**
 * calendar.js
 * Calendar grid rendering and interaction logic.
 *
 * ENGINEERING:
 * This file renders the partner-program matrix grid (requirements Section 5.1-5.6).
 * Key things to wire up for production:
 *
 * 1. Replace initCalendar() data loading with real API calls (see data.js)
 * 2. Wire updateChipStatus() to PATCH /api/partner_cohorts/:id/status
 * 3. The popover (requirements Section 5.4) is fully implemented — just needs real IDs
 * 4. Partner rowspan logic handles the multi-row partner grouping
 *
 * Architecture:
 *   initCalendar()           → loads data, builds grid
 *   buildGridData()          → organizes cohorts into partner → program → month → chips
 *   renderGrid()             → writes HTML to the DOM
 *   showChipPopover()        → shows detail panel on chip hover/click
 *   updateChipStatus()       → updates status (currently in-memory, needs API call)
 *   applyFilters()           → filters grid by partner, status, program
 */

// ─── State ────────────────────────────────────────────────────────────────

let CALENDAR_STATE = {
  months: [],           // array of "YYYY-MM" strings to display
  gridData: [],         // organized data for rendering
  activePopover: null,  // currently open popover data
  filters: {
    partner: '',
    status: '',
    program: '',
  },
  // In-memory status overrides (replaced by API in production)
  statusOverrides: {},  // key: `${partner_id}|${sku}|${start}` → status
};

// ─── Init ─────────────────────────────────────────────────────────────────

function initCalendar() {
  // Show 6 months starting from current month minus 4 (to show some history)
  // ENGINEERING: Make this configurable or derive from URL params
  const now = new Date();
  const startMonth = new Date(now.getFullYear(), now.getMonth() - 4, 1);
  const startStr = `${startMonth.getFullYear()}-${String(startMonth.getMonth()+1).padStart(2,'0')}`;

  CALENDAR_STATE.months = getMonthRange(startStr, 10); // show 10 months

  buildGridData();
  populateFilterDropdowns();
  renderGrid();
  initPopover();
}

// ─── Data organization ────────────────────────────────────────────────────

function buildGridData() {
  /**
   * Organizes COHORT_DATA into a nested structure for grid rendering:
   * partner → programs[] → cells{month: cohorts[]}
   *
   * ENGINEERING: When replacing with API data, the API should return data
   * in a similar shape, or this function can transform the API response.
   */

  const { filters } = CALENDAR_STATE;
  const result = [];

  PARTNERS.forEach(partner => {
    // Apply partner filter
    if (filters.partner && partner.id !== parseInt(filters.partner)) return;

    // Get all cohorts for this partner
    const partnerCohorts = COHORT_DATA.filter(c => c.partner_id === partner.id);
    if (!partnerCohorts.length) return;

    // Get unique SKUs for this partner
    const skus = [...new Set(partnerCohorts.map(c => c.sku))];

    const programs = [];
    skus.forEach(sku => {
      const program = getProgram(sku);
      if (!program) return;

      // Apply program filter
      if (filters.program && sku !== filters.program) return;

      const cells = {};
      CALENDAR_STATE.months.forEach(month => {
        const monthCohorts = partnerCohorts.filter(c =>
          c.sku === sku && c.start.startsWith(month)
        );

        // Apply status filter
        const filtered = filters.status
          ? monthCohorts.filter(c => getEffectiveStatus(partner.id, sku, c.start, c.status) === filters.status)
          : monthCohorts;

        if (filtered.length) {
          cells[month] = filtered.map(c => ({
            ...c,
            status: getEffectiveStatus(partner.id, sku, c.start, c.status),
            program_name: program.name,
            program_short: program.short_name,
          }));
        }
      });

      programs.push({ sku, program, cells });
    });

    if (programs.length) {
      result.push({ partner, programs });
    }
  });

  CALENDAR_STATE.gridData = result;
}

function getEffectiveStatus(partnerId, sku, start, originalStatus) {
  // Check for in-memory overrides (in production, this comes from the DB)
  const key = `${partnerId}|${sku}|${start}`;
  return CALENDAR_STATE.statusOverrides[key] || originalStatus;
}

// ─── Grid rendering ───────────────────────────────────────────────────────

function renderGrid() {
  const { months, gridData } = CALENDAR_STATE;
  const today = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`;

  // Build header
  const headerCells = months.map(m => {
    const isToday = m === today;
    const label = monthLabel(m);
    return `<th class="col-month${isToday ? ' col-today' : ''}">${label}${isToday ? ' ★' : ''}</th>`;
  }).join('');

  let thead = `
    <thead>
      <tr>
        <th class="col-partner">Partner</th>
        <th class="col-prog">Program</th>
        ${headerCells}
      </tr>
    </thead>
  `;

  // Build body
  let tbody = '<tbody>';

  gridData.forEach(({ partner, programs }) => {
    programs.forEach((prog, progIndex) => {
      const isFirstRow = progIndex === 0;

      // Partner cell only on first program row, with rowspan
      // ENGINEERING: rowspan = programs.length for the partner td
      const partnerCell = isFirstRow
        ? `<td class="col-partner" rowspan="${programs.length}">
             <a href="#" onclick="filterToPartner(${partner.id}); return false;">
               ${partner.name}
             </a>
           </td>`
        : '';

      const monthCells = months.map(month => {
        const isToday = month === today;
        const cohorts = prog.cells[month] || [];

        const chips = cohorts.map(c => buildChip(c, partner, prog.program)).join('');

        return `<td class="grid-cell${isToday ? ' col-today' : ''}">${chips}</td>`;
      }).join('');

      tbody += `
        <tr class="${isFirstRow ? 'partner-first' : ''}">
          ${partnerCell}
          <td class="col-prog" title="${prog.program.name}">${prog.program.short_name}</td>
          ${monthCells}
        </tr>
      `;
    });
  });

  tbody += '</tbody>';

  const table = document.getElementById('calendar-table');
  if (table) {
    table.innerHTML = thead + tbody;
  }

  updateSummary();
}

function buildChip(cohort, partner, program) {
  /**
   * Builds the HTML for a single cohort chip.
   *
   * Requirements Section 5.2:
   * - Shows start date (e.g. "5/19")
   * - Color coded by status
   * - Clickable to open popover
   * - Each chip is independent — clicking one doesn't affect others in the cell
   */
  const statusCfg = getStatusConfig(cohort.status);
  const startDisplay = displayDate(cohort.start);

  // Flag if there's a content gap (enrolled but can't access content)
  // Requirements Section 6.6
  const hasGap = hasContentGap(cohort.enrollment_open, cohort.early_access);
  const gapAttr = hasGap ? ' data-has-gap="true"' : '';

  // Encode cohort data for the popover
  const data = encodeURIComponent(JSON.stringify({
    partner_id: partner.id,
    partner_name: partner.name,
    branding_partner: partner.branding_partner,
    sku: cohort.sku,
    program_name: program.name,
    program_short: program.short_name,
    start: cohort.start,
    end: cohort.end,
    status: cohort.status,
    enrollment_open: cohort.enrollment_open,
    early_access: cohort.early_access,
    working_deadline: cohort.working_deadline,
    content_ready: cohort.content_ready,
    deadline_rule: partner.deadline_rule,
  }));

  return `
    <span
      class="chip ${statusCfg.cssClass}"
      data-cohort="${data}"
      ${gapAttr}
      onmouseenter="showChipPopover(event, this)"
      onmouseleave="scheduleHidePopover()"
    >
      <span class="chip-dot"></span>${startDisplay}${hasGap ? ' ⚠' : ''}
    </span>
  `;
}

// ─── Popover ──────────────────────────────────────────────────────────────

let popoverHideTimer = null;

function initPopover() {
  const pop = document.getElementById('chip-popover');
  if (!pop) return;
  pop.addEventListener('mouseenter', () => clearTimeout(popoverHideTimer));
  pop.addEventListener('mouseleave', () => scheduleHidePopover());
}

function showChipPopover(event, chipEl) {
  clearTimeout(popoverHideTimer);
  const pop = document.getElementById('chip-popover');
  if (!pop) return;

  const data = JSON.parse(decodeURIComponent(chipEl.dataset.cohort));
  CALENDAR_STATE.activePopover = data;

  const hasGap = chipEl.dataset.hasGap === 'true';

  pop.innerHTML = buildPopoverHTML(data, hasGap);
  pop.style.display = 'block';

  // Position the popover
  const rect = chipEl.getBoundingClientRect();
  let left = rect.left + window.scrollX;
  let top = rect.bottom + window.scrollY + 6;

  // Prevent overflow off screen
  if (left + 280 > window.innerWidth) left = window.innerWidth - 288;
  if (top + 300 > window.innerHeight) top = rect.top + window.scrollY - 300;

  pop.style.left = `${left}px`;
  pop.style.top = `${top}px`;
}

function scheduleHidePopover() {
  popoverHideTimer = setTimeout(() => {
    const pop = document.getElementById('chip-popover');
    if (pop) pop.style.display = 'none';
    CALENDAR_STATE.activePopover = null;
  }, 200);
}

function buildPopoverHTML(data, hasGap) {
  /**
   * Requirements Section 5.4: The popover must show:
   * - Full program name + partner
   * - Cohort start and end dates
   * - Computed enrollment deadline (real date, not rule)
   * - SKU
   * - Status selector (updates this cohort only)
   *
   * Additional fields from Section 6.6:
   * - Enrollment open date
   * - Early access date
   * - Flag if content gap exists
   */

  const statusCfg = getStatusConfig(data.status);
  const statuses = ['setup', 'confirmed', 'tentative', 'cancelled'];

  const statusBtns = statuses.map(s => {
    const cfg = getStatusConfig(s);
    const isActive = s === data.status;
    return `
      <button
        class="status-btn${isActive ? ` active-${s}` : ''}"
        onclick="updateChipStatus('${data.partner_id}', '${data.sku}', '${data.start}', '${s}')"
      >
        ${cfg.label}
      </button>
    `;
  }).join('');

  const gapWarning = hasGap ? `
    <div class="popover-row">
      <span class="popover-label">⚠ Content gap</span>
      <span class="popover-flag">Enrolled but no access until ${displayDate(data.early_access)}</span>
    </div>
  ` : '';

  return `
    <div class="popover-title">${data.program_name}</div>
    <div class="popover-row">
      <span class="popover-label">Partner</span>
      <span class="popover-value">${data.partner_name}</span>
    </div>
    <div class="popover-row">
      <span class="popover-label">University</span>
      <span class="popover-value">${data.branding_partner}</span>
    </div>
    <div class="popover-row">
      <span class="popover-label">SKU</span>
      <span class="popover-value" style="font-family:monospace;font-size:10px">${data.sku}</span>
    </div>
    <div class="popover-row">
      <span class="popover-label">Start</span>
      <span class="popover-value">${displayDate(data.start)}</span>
    </div>
    <div class="popover-row">
      <span class="popover-label">End</span>
      <span class="popover-value">${data.end ? displayDate(data.end) : '—'}</span>
    </div>
    <div class="popover-row">
      <span class="popover-label">Enroll opens</span>
      <span class="popover-value">${data.enrollment_open ? displayDate(data.enrollment_open) : '—'}</span>
    </div>
    <div class="popover-row">
      <span class="popover-label">Early access</span>
      <span class="popover-value">${data.early_access ? displayDate(data.early_access) : '—'}</span>
    </div>
    ${gapWarning}
    <div class="popover-row">
      <span class="popover-label">Deadline</span>
      <span class="popover-value" style="color:#C62828;font-weight:700">${data.working_deadline ? displayDate(data.working_deadline) : '—'}</span>
    </div>
    <div class="popover-status-section">
      <div class="popover-status-label">Update status</div>
      <div class="status-btns">${statusBtns}</div>
    </div>
  `;
}

function updateChipStatus(partnerId, sku, start, newStatus) {
  /**
   * Updates status for a single cohort.
   *
   * ENGINEERING: Replace the in-memory override with a real API call:
   *
   * const partnerCohortId = ...; // you'll need the actual ID from the API
   * await fetch(`/api/partner_cohorts/${partnerCohortId}/status`, {
   *   method: 'PATCH',
   *   headers: {
   *     'Content-Type': 'application/json',
   *     'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
   *   },
   *   body: JSON.stringify({ status: newStatus })
   * });
   *
   * The response should include the updated partner_cohort record.
   * On success, call rebuildAndRender() to refresh the grid.
   * On error, show a toast/error message.
   */

  // In-memory override for prototype
  const key = `${partnerId}|${sku}|${start}`;
  CALENDAR_STATE.statusOverrides[key] = newStatus;

  // Update the active popover data and re-render popover status buttons
  if (CALENDAR_STATE.activePopover) {
    CALENDAR_STATE.activePopover.status = newStatus;
    const pop = document.getElementById('chip-popover');
    if (pop && pop.style.display !== 'none') {
      pop.innerHTML = buildPopoverHTML(CALENDAR_STATE.activePopover, false);
    }
  }

  // Re-render the grid to update chip color
  rebuildAndRender();
}

function rebuildAndRender() {
  buildGridData();
  renderGrid();
}

// ─── Filtering ────────────────────────────────────────────────────────────

function populateFilterDropdowns() {
  // Partner dropdown
  const partnerSelect = document.getElementById('filter-partner');
  if (partnerSelect) {
    PARTNERS.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name;
      partnerSelect.appendChild(opt);
    });
    partnerSelect.addEventListener('change', e => {
      CALENDAR_STATE.filters.partner = e.target.value;
      rebuildAndRender();
    });
  }

  // Status dropdown
  const statusSelect = document.getElementById('filter-status');
  if (statusSelect) {
    statusSelect.addEventListener('change', e => {
      CALENDAR_STATE.filters.status = e.target.value;
      rebuildAndRender();
    });
  }

  // Program dropdown
  const programSelect = document.getElementById('filter-program');
  if (programSelect) {
    PROGRAMS.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.sku;
      opt.textContent = `${p.short_name} (${p.sku})`;
      programSelect.appendChild(opt);
    });
    programSelect.addEventListener('change', e => {
      CALENDAR_STATE.filters.program = e.target.value;
      rebuildAndRender();
    });
  }
}

function filterToPartner(partnerId) {
  // Click partner name → filter to that partner (account view)
  CALENDAR_STATE.filters.partner = String(partnerId);
  const select = document.getElementById('filter-partner');
  if (select) select.value = String(partnerId);
  rebuildAndRender();
}

function clearFilters() {
  CALENDAR_STATE.filters = { partner: '', status: '', program: '' };
  ['filter-partner', 'filter-status', 'filter-program'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  rebuildAndRender();
}

// ─── Summary stats ────────────────────────────────────────────────────────

function updateSummary() {
  const allCohorts = COHORT_DATA;
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}`;

  const thisMonth = allCohorts.filter(c => c.start.startsWith(currentMonth));
  const upcoming = allCohorts.filter(c => c.start > `${currentMonth}-31`);
  const tentative = allCohorts.filter(c =>
    (getEffectiveStatus(c.partner_id, c.sku, c.start, c.status) === 'tentative') &&
    c.start >= currentMonth
  );

  setStat('stat-this-month', thisMonth.length);
  setStat('stat-upcoming', upcoming.length);
  setStat('stat-tentative', tentative.length);
  setStat('stat-partners', PARTNERS.filter(p => p.active).length);
}

function setStat(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// ─── Close popover on outside click ──────────────────────────────────────

document.addEventListener('click', e => {
  if (!e.target.closest('.chip') && !e.target.closest('.popover')) {
    const pop = document.getElementById('chip-popover');
    if (pop) pop.style.display = 'none';
  }
});

// ─── Init on load ─────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', initCalendar);
