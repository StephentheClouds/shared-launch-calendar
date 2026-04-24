/**
 * generator.js
 * Cohort instance generator — given a month and selected orgs,
 * outputs the list of cohort instances to create in the LMS.
 *
 * ENGINEERING:
 * This logic should live server-side as a service/job:
 *   POST /api/generator/run { month: "2026-06", partner_ids: [1,2,6] }
 *   → returns array of cohort instances to create
 *
 * The sharing logic (buildSharingKey) is the critical piece.
 * See utils.js for the key algorithm and full documentation.
 *
 * This file handles:
 *   - Org selector UI (multi-select chips)
 *   - Month picker
 *   - Running the sharing calculation
 *   - Rendering the output table
 *   - Export to CSV
 */

// ─── State ────────────────────────────────────────────────────────────────

let GEN_STATE = {
  selectedMonth: '',      // "YYYY-MM"
  selectedPartners: [],   // array of partner IDs
  instances: [],          // computed cohort instances
};

// ─── Init ─────────────────────────────────────────────────────────────────

function initGenerator() {
  // Default to next month
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  GEN_STATE.selectedMonth = `${next.getFullYear()}-${String(next.getMonth()+1).padStart(2,'0')}`;

  // Default to all active partners selected
  GEN_STATE.selectedPartners = PARTNERS.filter(p => p.active).map(p => p.id);

  populateMonthPicker();
  renderOrgSelector();
  runGenerator();
}

// ─── Month picker ─────────────────────────────────────────────────────────

function populateMonthPicker() {
  const select = document.getElementById('gen-month');
  if (!select) return;

  // Show next 12 months
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const val = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    const label = `${d.toLocaleString('default', { month: 'long' })} ${d.getFullYear()}`;
    const opt = document.createElement('option');
    opt.value = val;
    opt.textContent = label;
    if (val === GEN_STATE.selectedMonth) opt.selected = true;
    select.appendChild(opt);
  }

  select.addEventListener('change', e => {
    GEN_STATE.selectedMonth = e.target.value;
    runGenerator();
  });
}

// ─── Org selector ─────────────────────────────────────────────────────────

function renderOrgSelector() {
  const container = document.getElementById('org-selector');
  if (!container) return;

  container.innerHTML = PARTNERS
    .filter(p => p.active)
    .map(p => {
      const isSelected = GEN_STATE.selectedPartners.includes(p.id);
      return `
        <button
          class="org-chip${isSelected ? ' selected' : ''}"
          data-partner-id="${p.id}"
          onclick="togglePartner(${p.id})"
        >
          ${p.short_name}
        </button>
      `;
    }).join('');
}

function togglePartner(partnerId) {
  const idx = GEN_STATE.selectedPartners.indexOf(partnerId);
  if (idx === -1) {
    GEN_STATE.selectedPartners.push(partnerId);
  } else {
    GEN_STATE.selectedPartners.splice(idx, 1);
  }

  // Update chip appearance
  const chip = document.querySelector(`.org-chip[data-partner-id="${partnerId}"]`);
  if (chip) chip.classList.toggle('selected');

  runGenerator();
}

function selectAllPartners() {
  GEN_STATE.selectedPartners = PARTNERS.filter(p => p.active).map(p => p.id);
  renderOrgSelector();
  runGenerator();
}

function clearAllPartners() {
  GEN_STATE.selectedPartners = [];
  renderOrgSelector();
  runGenerator();
}

// ─── Core generator logic ─────────────────────────────────────────────────

function runGenerator() {
  /**
   * Main generator algorithm.
   *
   * For each selected partner, get their cohorts in the target month.
   * Group by sharing key (SKU + start_date + early_access_date).
   * Partners with the same key share one cohort instance.
   * Partners with different keys get separate instances.
   *
   * ENGINEERING: This runs client-side in the prototype.
   * In production, POST this to /api/generator/run and display the response.
   * The server has better access to historical cohort data for EA date computation.
   *
   * Input: GEN_STATE.selectedMonth, GEN_STATE.selectedPartners
   * Output: GEN_STATE.instances (array of cohort instance objects)
   */

  const { selectedMonth, selectedPartners } = GEN_STATE;
  if (!selectedPartners.length) {
    GEN_STATE.instances = [];
    renderGeneratorOutput();
    return;
  }

  // Get all cohorts for selected partners in the target month
  const cohorts = COHORT_DATA.filter(c =>
    selectedPartners.includes(c.partner_id) &&
    c.start.startsWith(selectedMonth)
  );

  // Group by sharing key
  // Key = SKU + start_date + early_access_date (see utils.js)
  const groups = {};

  cohorts.forEach(c => {
    const partner = getPartner(c.partner_id);
    const program = getProgram(c.sku);
    if (!partner || !program) return;

    // Use early_access_date from data (pre-computed)
    // In production this comes from the API
    const earlyAccessDate = c.early_access || c.start;

    const key = buildSharingKey(c.sku, c.start, earlyAccessDate);

    if (!groups[key]) {
      groups[key] = {
        key,
        sku: c.sku,
        program_name: program.name,
        program_short: program.short_name,
        start: c.start,
        early_access: earlyAccessDate,
        partners: [],
        // We'll use the first partner's working deadline as representative
        // In production, each partner has their own working_deadline in partner_cohorts
        working_deadline: c.working_deadline,
        instance_name: buildInstanceName(c.sku, c.start, earlyAccessDate),
      };
    }

    groups[key].partners.push({
      id: partner.id,
      name: partner.short_name,
      deadline_rule: partner.deadline_rule,
      working_deadline: c.working_deadline,
    });
  });

  // Convert to sorted array (by start date, then SKU)
  GEN_STATE.instances = Object.values(groups)
    .sort((a, b) => a.start.localeCompare(b.start) || a.sku.localeCompare(b.sku));

  renderGeneratorOutput();
  updateGeneratorStats();
}

// ─── Output rendering ─────────────────────────────────────────────────────

function renderGeneratorOutput() {
  const container = document.getElementById('generator-output');
  if (!container) return;

  const { instances, selectedMonth } = GEN_STATE;

  if (!instances.length) {
    container.innerHTML = `
      <div style="padding:24px;text-align:center;color:#9E9E9E;font-size:13px">
        No cohorts found. Select partners and a month above.
      </div>
    `;
    return;
  }

  // Group instances by start date for section dividers
  const byStartDate = {};
  instances.forEach(inst => {
    if (!byStartDate[inst.start]) byStartDate[inst.start] = [];
    byStartDate[inst.start].push(inst);
  });

  let html = `
    <table class="generator-table" id="gen-table">
      <thead>
        <tr>
          <th style="width:200px">Cohort instance name</th>
          <th style="width:80px">Program</th>
          <th style="width:55px">Start</th>
          <th style="width:55px">EA date</th>
          <th style="width:55px">Deadline</th>
          <th>Partners sharing this instance</th>
          <th style="width:100px">Status</th>
          <th style="width:60px">Copy</th>
        </tr>
      </thead>
      <tbody>
  `;

  Object.entries(byStartDate).forEach(([startDate, insts]) => {
    // Section divider row
    const partnerNames = [...new Set(insts.flatMap(i => i.partners.map(p => p.name)))].join(' · ');
    html += `
      <tr class="section-divider">
        <td colspan="8">${displayDate(startDate)} cohorts — ${partnerNames}</td>
      </tr>
    `;

    insts.forEach(inst => {
      const isShared = inst.partners.length > 1;
      const pillsHtml = inst.partners.map(p => `
        <span class="partner-pill${isShared ? ' partner-pill-shared' : ''}">${p.name}</span>
      `).join('');

      const badge = isShared
        ? `<span class="badge badge-shared">${inst.partners.length} partners</span>`
        : `<span class="badge badge-standalone">Standalone</span>`;

      html += `
        <tr>
          <td class="td-mono" id="name-${inst.key.replace(/[|]/g,'-')}">${inst.instance_name}</td>
          <td class="td-name">${inst.program_short}</td>
          <td>${displayDate(inst.start)}</td>
          <td>${displayDate(inst.early_access)}</td>
          <td>${inst.working_deadline ? displayDate(inst.working_deadline) : '—'}</td>
          <td><div class="partner-pills">${pillsHtml}</div></td>
          <td>${badge}</td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="copyName('${inst.instance_name}', this)">
              Copy
            </button>
          </td>
        </tr>
      `;
    });
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

function updateGeneratorStats() {
  const { instances, selectedPartners, selectedMonth } = GEN_STATE;

  // Total partner+SKU combos (before sharing)
  const totalCombos = COHORT_DATA.filter(c =>
    selectedPartners.includes(c.partner_id) &&
    c.start.startsWith(selectedMonth)
  ).length;

  const totalInstances = instances.length;
  const saved = totalCombos - totalInstances;
  const startDates = [...new Set(instances.map(i => i.start))].length;

  setStat2('gen-stat-combos', totalCombos);
  setStat2('gen-stat-instances', totalInstances);
  setStat2('gen-stat-saved', saved);
  setStat2('gen-stat-dates', startDates);
}

function setStat2(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// ─── Copy utilities ───────────────────────────────────────────────────────

function copyName(name, btn) {
  navigator.clipboard.writeText(name).then(() => {
    const original = btn.textContent;
    btn.textContent = 'Copied!';
    btn.style.color = '#2E7D32';
    setTimeout(() => {
      btn.textContent = original;
      btn.style.color = '';
    }, 1500);
  });
}

function copyAllNames() {
  const names = GEN_STATE.instances.map(i => i.instance_name).join('\n');
  navigator.clipboard.writeText(names).then(() => {
    const btn = document.getElementById('btn-copy-all');
    if (btn) {
      const original = btn.textContent;
      btn.textContent = '✓ Copied all';
      setTimeout(() => btn.textContent = original, 2000);
    }
  });
}

// ─── CSV export ───────────────────────────────────────────────────────────

function exportCSV() {
  const headers = ['Instance name', 'Program', 'SKU', 'Start', 'EA date', 'Deadline', 'Partners', 'Partner count'];
  const rows = GEN_STATE.instances.map(inst => [
    inst.instance_name,
    inst.program_short,
    inst.sku,
    displayDate(inst.start),
    displayDate(inst.early_access),
    inst.working_deadline ? displayDate(inst.working_deadline) : '',
    inst.partners.map(p => p.name).join('; '),
    inst.partners.length,
  ]);

  const csv = [headers, ...rows].map(row =>
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cohort-instances-${GEN_STATE.selectedMonth}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Init on load ─────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', initGenerator);
