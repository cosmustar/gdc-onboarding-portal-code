/**
 * Reads reports exported from Power BI (CSV files in `public/real-data/`)
 * and converts them into the portal's data model.
 *
 * Column names, status values and date format live in `csvConfig.ts`.
 * Scope filtering here is a LOCAL VIEW FILTER, not authorization.
 */
import type { AccessRequest, BusinessUnit, Employee, Manager, Session } from '../../types/models';
import type { OnboardingDataService, ScopedData } from '../OnboardingDataService';
import {
  ACCESS_COLUMNS,
  BUSINESS_UNIT,
  COMMITTED_COUNTS_AS_CONFIRMED,
  DATE_ORDER,
  EMPLOYEE_COLUMNS,
  EMPTY_DEVICE_VALUES,
  FILES,
  STATUS_MAPPING,
} from './csvConfig';
import { parseCsv, type CsvTable } from './parseCsv';

interface Dataset {
  managers: Manager[];
  employees: Employee[];
  accessRequests: AccessRequest[];
  lastUpdatedAt: string;
}

const norm = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

const slug = (s: string) => norm(s).replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

async function loadFile(fileName: string): Promise<{ table: CsvTable; lastModified: string | null }> {
  const url = `${import.meta.env.BASE_URL}real-data/${fileName}`;
  let res: Response;
  try {
    res = await fetch(url, { cache: 'no-store' });
  } catch {
    throw new Error(`Could not read "${fileName}". Check that the file is in public/real-data/.`);
  }
  // The dev server answers missing files with index.html, so check the content too.
  const text = res.ok ? await res.text() : '';
  if (!res.ok || /^\s*<!doctype html/i.test(text)) {
    throw new Error(`File "${fileName}" not found. Save the Power BI export as public/real-data/${fileName}.`);
  }
  return { table: parseCsv(text), lastModified: res.headers.get('last-modified') };
}

/** Returns a getter that reads a configured column, failing with a clear message if it is missing. */
function columnReader<K extends string>(table: CsvTable, columns: Record<K, string>, fileName: string) {
  const byNorm = new Map(table.headers.map((h) => [norm(h), h]));
  const missing = Object.values<string>(columns).filter((c) => !byNorm.has(norm(c)));
  if (missing.length > 0) {
    throw new Error(
      `${fileName}: column(s) not found: ${missing.map((c) => `"${c}"`).join(', ')}. ` +
        `Columns in the file: ${table.headers.map((c) => `"${c}"`).join(', ')}. Adjust src/services/csv/csvConfig.ts.`,
    );
  }
  return (row: Record<string, string>, key: K) => row[byNorm.get(norm(columns[key]))!] ?? '';
}

/** Accepts 2026-12-25, 25/12/2026, 25-12-2026, 25.12.2026, with optional time (14:30[:00] [AM|PM]). */
function parseDate(value: string): Date | null {
  const v = value.trim();
  if (!v) return null;
  const iso = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T ](\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (iso) return build(+iso[1], +iso[2], +iso[3], iso[4], iso[5], iso[6], '');
  const m = v.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})(?:,?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?)?$/i);
  if (!m) return null;
  const [a, b] = [+m[1], +m[2]];
  const [day, month] = DATE_ORDER === 'DMY' ? [a, b] : [b, a];
  const year = m[3].length === 2 ? 2000 + +m[3] : +m[3];
  return build(year, month, day, m[4], m[5], m[6], m[7] ?? '');
}

function build(y: number, mo: number, d: number, h = '0', mi = '0', s = '0', ampm: string): Date | null {
  let hour = +(h ?? 0);
  if (/pm/i.test(ampm) && hour < 12) hour += 12;
  if (/am/i.test(ampm) && hour === 12) hour = 0;
  const date = new Date(y, mo - 1, d, hour, +(mi ?? 0), +(s ?? 0));
  return date.getFullYear() === y && date.getMonth() === mo - 1 && date.getDate() === d ? date : null;
}

const toIsoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const inList = (value: string, list: string[] | undefined) => !!list?.some((x) => norm(x) === norm(value));

function mapStatus(provisioning: string, approval: string): AccessRequest['status'] | null {
  const prov = (Object.keys(STATUS_MAPPING.provisioning) as AccessRequest['status'][]).find((s) =>
    inList(provisioning, STATUS_MAPPING.provisioning[s]),
  );
  // Rejected / expired approval ends the request, even if IDC still shows provisioning as Pending.
  if (inList(approval, STATUS_MAPPING.approvalRejected)) return 'Rejected';
  if (inList(approval, STATUS_MAPPING.approvalExpired)) return 'Expired';
  if (prov === 'Finished' || prov === 'Committed' || prov === 'Failed') return prov;
  if (inList(approval, STATUS_MAPPING.approvalPending)) return 'Pending Approval';
  return prov ?? null;
}

function mapBusinessUnit(value: string): BusinessUnit | null {
  const v = norm(value);
  for (const bu of Object.keys(BUSINESS_UNIT.values) as BusinessUnit[]) {
    if (BUSINESS_UNIT.values[bu].some((t) => t && v.includes(norm(t)))) return bu;
  }
  return null;
}

class Warnings {
  private counts = new Map<string, Set<string>>();
  add(kind: string, example: string) {
    if (!this.counts.has(kind)) this.counts.set(kind, new Set());
    this.counts.get(kind)!.add(example);
  }
  report() {
    if (this.counts.size === 0) return;
    console.groupCollapsed(`[Onboarding Portal] ${this.counts.size} data warning type(s) while reading the Power BI files`);
    for (const [kind, examples] of this.counts) console.warn(`${kind}:`, [...examples].slice(0, 20));
    console.groupEnd();
  }
}

async function loadDataset(): Promise<Dataset> {
  const [emp, acc] = await Promise.all([loadFile(FILES.employees), loadFile(FILES.accesses)]);
  const warn = new Warnings();

  // ---------- Employees + managers ----------
  const e = columnReader(emp.table, EMPLOYEE_COLUMNS, FILES.employees);
  const managerByKey = new Map<string, Manager>();
  const employees: Employee[] = [];
  const seenLan = new Set<string>();

  for (const row of emp.table.rows) {
    const name = e(row, 'name');
    const lanId = e(row, 'lanId');
    if (!name && !lanId) continue;
    const employeeId = lanId || `NO-LAN-${slug(name)}`;
    if (!lanId) warn.add('Employee without LAN ID', name);
    if (seenLan.has(norm(employeeId))) {
      warn.add('Duplicate employee (same LAN ID) — kept the first row', employeeId);
      continue;
    }
    seenLan.add(norm(employeeId));

    const buRaw = e(row, BUSINESS_UNIT.column);
    let bu = mapBusinessUnit(buRaw);
    if (!bu) {
      warn.add(`Business unit not recognized — used ${BUSINESS_UNIT.fallback}`, buRaw || '(empty)');
      bu = BUSINESS_UNIT.fallback;
    }

    const managerName = e(row, 'manager') || 'No manager informed';
    const managerKey = norm(managerName);
    if (!managerByKey.has(managerKey)) {
      managerByKey.set(managerKey, {
        managerId: `MGR-${slug(managerName)}`,
        name: managerName,
        email: '',
        title: 'Manager',
        businessUnit: bu,
      });
    }

    const startRaw = e(row, 'hrStartDate');
    const start = parseDate(startRaw);
    if (!start) warn.add('Invalid or empty HR Start Date', `${name}: "${startRaw}"`);

    const desktop = e(row, 'desktop');
    const hasDevice = !EMPTY_DEVICE_VALUES.some((x) => norm(x) === norm(desktop));

    employees.push({
      employeeId,
      lanId: lanId || '—',
      fullName: name || lanId,
      email: e(row, 'email'),
      businessUnit: bu,
      jobTitle: e(row, 'jobFunction'),
      managerId: managerByKey.get(managerKey)!.managerId,
      startDate: start ? toIsoDate(start) : '1900-01-01',
      device: { deviceName: hasDevice ? desktop : null, deviceType: null, source: 'servicenow' },
    });
  }

  // Manager business unit = most common unit of the team.
  for (const m of managerByKey.values()) {
    const team = employees.filter((x) => x.managerId === m.managerId);
    const ems = team.filter((x) => x.businessUnit === 'EMS').length;
    m.businessUnit = ems >= team.length - ems ? 'EMS' : 'ESS';
  }

  // ---------- Access requests ----------
  const a = columnReader(acc.table, ACCESS_COLUMNS, FILES.accesses);
  const byName = new Map<string, Employee[]>();
  const byLan = new Map<string, Employee>();
  for (const x of employees) {
    byName.set(norm(x.fullName), [...(byName.get(norm(x.fullName)) ?? []), x]);
    byLan.set(norm(x.lanId), x);
  }

  const usedIds = new Map<string, number>();
  const accessRequests: AccessRequest[] = [];

  for (const row of acc.table.rows) {
    const who = a(row, 'employeeName');
    const group = a(row, 'group');
    if (!who && !group) continue;

    let employee = byLan.get(norm(who)) ?? null;
    if (!employee) {
      const matches = byName.get(norm(who)) ?? [];
      if (matches.length > 1) {
        // Same name twice: use the manager column to disambiguate.
        const mgr = norm(a(row, 'manager'));
        employee = matches.find((x) => norm(managerName(managerByKey, x.managerId)) === mgr) ?? matches[0];
        warn.add('Employee name appears more than once — matched using Manager', who);
      } else employee = matches[0] ?? null;
    }
    if (!employee) {
      warn.add('Access ignored: employee not found in employees.csv', who || '(empty name)');
      continue;
    }

    const prov = a(row, 'statusProvisioning');
    const appr = a(row, 'statusApproval');
    let status = mapStatus(prov, appr);
    if (!status) {
      warn.add('Status not recognized — shown as Unverifiable (add it to STATUS_MAPPING)', `provisioning="${prov}" approval="${appr}"`);
      status = 'Unverifiable';
    }

    const reqDateRaw = a(row, 'requestDate');
    const reqDate = parseDate(reqDateRaw);
    if (!reqDate) warn.add('Invalid or empty Request Date', `"${reqDateRaw}"`);
    const requestedAt = (reqDate ?? new Date(0)).toISOString();

    // One request ID can contain several groups: keep row keys unique.
    const baseId = a(row, 'requestId') || 'NO-ID';
    const n = (usedIds.get(baseId) ?? 0) + 1;
    usedIds.set(baseId, n);
    const requestId = n === 1 ? baseId : `${baseId}-${n}`;

    const approver = a(row, 'accessApproval');
    accessRequests.push({
      requestId,
      // Shown on screen: a numeric ID without its "-<number>" suffix (000072747-1 → 000072747).
      // IDs like REQ-1001 (prefix is not a number) are kept as they are.
      displayRequestId: baseId.replace(/^(\d+)-\d+$/, '$1'),
      accessId: slug(group) || 'unknown',
      accessName: group || '(no group)',
      application: group || '(no group)',
      category: 'Not available',
      employeeId: employee.employeeId,
      status,
      availabilityConfirmed: status === 'Committed' ? COMMITTED_COUNTS_AS_CONFIRMED : false,
      requestedBy: a(row, 'requestorName'),
      pendingApprover: status === 'Pending Approval' && approver ? approver : null,
      requestedAt,
      lastUpdatedAt: requestedAt,
      comments: appr ? `Power BI — Status Approval: ${appr}; Status Provisioning: ${prov || '(empty)'}` : null,
    });
  }

  warn.report();
  const lm = emp.lastModified ? new Date(emp.lastModified) : null;
  return {
    managers: [...managerByKey.values()].sort((x, y) => x.name.localeCompare(y.name)),
    employees,
    accessRequests,
    lastUpdatedAt: (lm && !isNaN(lm.getTime()) ? lm : new Date()).toISOString(),
  };
}

function managerName(map: Map<string, Manager>, id: string) {
  for (const m of map.values()) if (m.managerId === id) return m.name;
  return '';
}

export class CsvOnboardingDataService implements OnboardingDataService {
  private dataset: Promise<Dataset> | null = null;

  private load(): Promise<Dataset> {
    this.dataset ??= loadDataset().catch((err) => {
      this.dataset = null; // allow "Try again" after fixing the file
      throw err;
    });
    return this.dataset;
  }

  async listDemoManagers(): Promise<Manager[]> {
    return structuredClone((await this.load()).managers);
  }

  async getScopedData(scope: Session): Promise<ScopedData> {
    const { managers, employees, accessRequests, lastUpdatedAt } = await this.load();
    const visibleEmployees = scope.role === 'admin' ? employees : employees.filter((x) => x.managerId === scope.managerId);
    const ids = new Set(visibleEmployees.map((x) => x.employeeId));
    return structuredClone({
      managers: scope.role === 'admin' ? managers : managers.filter((m) => m.managerId === scope.managerId),
      employees: visibleEmployees,
      accessRequests: accessRequests.filter((r) => ids.has(r.employeeId)),
      metadata: { lastUpdatedAt, sourceLabel: 'Power BI export (CSV)' },
    });
  }
}
