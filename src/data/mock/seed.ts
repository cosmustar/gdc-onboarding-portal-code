/**
 * FICTIONAL SEED DATA — for local demonstration only.
 *
 * Every name, LAN ID, email, device name and request ID in this file is invented.
 * Emails use the reserved `example.test` domain. No real people, companies,
 * credentials or production identifiers are present.
 *
 * Start dates are stored as offsets (in days) from "today" so the demo always
 * contains both upcoming and already-started employees, whenever it is run.
 */
import type { AccessCatalogItem, BusinessUnit, Manager } from '../../types/models';

export const MANAGERS: Manager[] = [
  { managerId: 'MGR-001', name: 'Laura Mendes', email: 'laura.mendes@example.test', title: 'Manufacturing Operations Manager', businessUnit: 'EMS' },
  { managerId: 'MGR-002', name: 'Rafael Costa', email: 'rafael.costa@example.test', title: 'Test Engineering Manager', businessUnit: 'EMS' },
  { managerId: 'MGR-003', name: 'Beatriz Almeida', email: 'beatriz.almeida@example.test', title: 'Software Delivery Manager', businessUnit: 'ESS' },
  { managerId: 'MGR-004', name: 'Thiago Ribeiro', email: 'thiago.ribeiro@example.test', title: 'Solutions Engineering Manager', businessUnit: 'ESS' },
  { managerId: 'MGR-005', name: 'Camila Ferreira', email: 'camila.ferreira@example.test', title: 'Supply Chain Manager', businessUnit: 'EMS' },
  { managerId: 'MGR-006', name: 'Gustavo Lima', email: 'gustavo.lima@example.test', title: 'Platform & Security Manager', businessUnit: 'ESS' },
];

export const ACCESS_CATALOG: AccessCatalogItem[] = [
  { accessId: 'ACC-001', name: 'Network Account (AD)', application: 'Directory Services', category: 'Identity' },
  { accessId: 'ACC-002', name: 'Corporate Email & Calendar', application: 'Mail Platform', category: 'Collaboration' },
  { accessId: 'ACC-003', name: 'VPN Remote Access', application: 'Remote Access Gateway', category: 'Network' },
  { accessId: 'ACC-004', name: 'Collaboration Suite', application: 'Team Workspace', category: 'Collaboration' },
  { accessId: 'ACC-005', name: 'ERP Finance – Read Only', application: 'ERP Core', category: 'Business Application' },
  { accessId: 'ACC-006', name: 'MES Shop Floor Operator', application: 'Manufacturing Execution', category: 'Business Application' },
  { accessId: 'ACC-007', name: 'Shared Drive – Engineering', application: 'File Services', category: 'Data' },
  { accessId: 'ACC-008', name: 'IT Service Portal', application: 'Service Desk', category: 'Collaboration' },
  { accessId: 'ACC-009', name: 'Source Code Repository', application: 'Code Hosting', category: 'Engineering' },
  { accessId: 'ACC-010', name: 'Data Warehouse Reader', application: 'Analytics Platform', category: 'Data' },
  { accessId: 'ACC-011', name: 'Expense Management', application: 'Travel & Expense', category: 'Business Application' },
  { accessId: 'ACC-012', name: 'Quality Records (QMS)', application: 'Quality Management', category: 'Business Application' },
  { accessId: 'ACC-013', name: 'Cloud Console – Developer', application: 'Cloud Platform', category: 'Engineering' },
  { accessId: 'ACC-014', name: 'Corporate Wi-Fi', application: 'Wireless Network', category: 'Network' },
];

/** Fictional application owners / approvers. */
export const APPROVERS = ['Fernanda Souza', 'Ricardo Nunes', 'Juliana Prates', 'Otávio Brandão', 'Lívia Sampaio'];

/** Fictional onboarding coordinators who may submit requests on a manager's behalf. */
export const REQUESTERS = ['Sofia Rocha (HR Onboarding)', 'Marcos Pinto (HR Onboarding)'];

/**
 * Compact status code per access item:
 *   F = Finished          C = Committed (availability confirmed)
 *   c = Committed (availability NOT confirmed)
 *   P = Pending           A = Pending Approval     V = Provisioning
 *   X = Failed            R = Rejected             U = Unverifiable
 * An empty string means the employee has no IDC requests at all.
 */
export interface EmployeeSeed {
  employeeId: string;
  lanId: string;
  fullName: string;
  businessUnit: BusinessUnit;
  jobTitle: string;
  managerId: string;
  startOffsetDays: number;
  deviceName: string | null;
  deviceType: 'Laptop' | 'Desktop' | null;
  accessCodes: string;
}

export const EMPLOYEE_SEEDS: EmployeeSeed[] = [
  // Laura Mendes — EMS
  { employeeId: 'EMP-1001', lanId: 'BRX10231', fullName: 'Ana Carvalho', businessUnit: 'EMS', jobTitle: 'Process Engineer', managerId: 'MGR-001', startOffsetDays: -45, deviceName: 'GDCBR-LT-0101', deviceType: 'Laptop', accessCodes: 'FFFFCF' },
  { employeeId: 'EMP-1002', lanId: 'BRX10232', fullName: 'Bruno Teixeira', businessUnit: 'EMS', jobTitle: 'Quality Analyst', managerId: 'MGR-001', startOffsetDays: -30, deviceName: 'GDCBR-LT-0102', deviceType: 'Laptop', accessCodes: 'FFFAF' },
  { employeeId: 'EMP-1003', lanId: 'BRX10233', fullName: 'Carla Nogueira', businessUnit: 'EMS', jobTitle: 'Production Planner', managerId: 'MGR-001', startOffsetDays: 5, deviceName: null, deviceType: null, accessCodes: 'AAVP' },
  { employeeId: 'EMP-1004', lanId: 'BRX10234', fullName: 'Diego Martins', businessUnit: 'EMS', jobTitle: 'Maintenance Technician', managerId: 'MGR-001', startOffsetDays: 12, deviceName: 'GDCBR-DT-0104', deviceType: 'Desktop', accessCodes: '' },
  { employeeId: 'EMP-1005', lanId: 'BRX10235', fullName: 'Elisa Barros', businessUnit: 'EMS', jobTitle: 'Supply Chain Analyst', managerId: 'MGR-001', startOffsetDays: -20, deviceName: 'GDCBR-LT-0105', deviceType: 'Laptop', accessCodes: 'FFXFF' },

  // Rafael Costa — EMS
  { employeeId: 'EMP-1006', lanId: 'BRX10236', fullName: 'Felipe Araújo', businessUnit: 'EMS', jobTitle: 'Test Engineer', managerId: 'MGR-002', startOffsetDays: -60, deviceName: 'GDCBR-DT-0106', deviceType: 'Desktop', accessCodes: 'FFFFF' },
  { employeeId: 'EMP-1007', lanId: 'BRX10237', fullName: 'Gabriela Pires', businessUnit: 'EMS', jobTitle: 'Manufacturing Engineer', managerId: 'MGR-002', startOffsetDays: -15, deviceName: 'GDCBR-LT-0107', deviceType: 'Laptop', accessCodes: 'FFFRF' },
  { employeeId: 'EMP-1008', lanId: 'BRX10238', fullName: 'Henrique Dias', businessUnit: 'EMS', jobTitle: 'Logistics Coordinator', managerId: 'MGR-002', startOffsetDays: 3, deviceName: 'GDCBR-LT-0108', deviceType: 'Laptop', accessCodes: 'FAPV' },
  { employeeId: 'EMP-1009', lanId: 'BRX10239', fullName: 'Isabela Freitas', businessUnit: 'EMS', jobTitle: 'Data Analyst', managerId: 'MGR-002', startOffsetDays: -8, deviceName: null, deviceType: null, accessCodes: 'FFUcF' },

  // Beatriz Almeida — ESS
  { employeeId: 'EMP-1010', lanId: 'BRX10240', fullName: 'João Pedro Lopes', businessUnit: 'ESS', jobTitle: 'Software Engineer', managerId: 'MGR-003', startOffsetDays: -40, deviceName: 'GDCBR-LT-0110', deviceType: 'Laptop', accessCodes: 'FFFFFFC' },
  { employeeId: 'EMP-1011', lanId: 'BRX10241', fullName: 'Karina Moura', businessUnit: 'ESS', jobTitle: 'Product Owner', managerId: 'MGR-003', startOffsetDays: -25, deviceName: 'GDCBR-LT-0111', deviceType: 'Laptop', accessCodes: 'FFFFAA' },
  { employeeId: 'EMP-1012', lanId: 'BRX10242', fullName: 'Lucas Rezende', businessUnit: 'ESS', jobTitle: 'DevOps Engineer', managerId: 'MGR-003', startOffsetDays: 8, deviceName: null, deviceType: null, accessCodes: 'AAAP' },
  { employeeId: 'EMP-1013', lanId: 'BRX10243', fullName: 'Mariana Castro', businessUnit: 'ESS', jobTitle: 'UX Designer', managerId: 'MGR-003', startOffsetDays: 20, deviceName: null, deviceType: null, accessCodes: '' },
  { employeeId: 'EMP-1014', lanId: 'BRX10244', fullName: 'Nicolas Farias', businessUnit: 'ESS', jobTitle: 'QA Engineer', managerId: 'MGR-003', startOffsetDays: -10, deviceName: 'GDCBR-LT-0114', deviceType: 'Laptop', accessCodes: 'FFVFF' },

  // Thiago Ribeiro — ESS
  { employeeId: 'EMP-1015', lanId: 'BRX10245', fullName: 'Olívia Batista', businessUnit: 'ESS', jobTitle: 'Solutions Architect', managerId: 'MGR-004', startOffsetDays: -50, deviceName: 'GDCBR-LT-0115', deviceType: 'Laptop', accessCodes: 'FFFFCF' },
  { employeeId: 'EMP-1016', lanId: 'BRX10246', fullName: 'Paulo Guimarães', businessUnit: 'ESS', jobTitle: 'Support Analyst', managerId: 'MGR-004', startOffsetDays: -5, deviceName: 'GDCBR-DT-0116', deviceType: 'Desktop', accessCodes: 'FFAXF' },
  { employeeId: 'EMP-1017', lanId: 'BRX10247', fullName: 'Renata Siqueira', businessUnit: 'ESS', jobTitle: 'Business Analyst', managerId: 'MGR-004', startOffsetDays: 15, deviceName: 'GDCBR-LT-0117', deviceType: 'Laptop', accessCodes: 'APAV' },
  { employeeId: 'EMP-1018', lanId: 'BRX10248', fullName: 'Samuel Tavares', businessUnit: 'ESS', jobTitle: 'Cloud Engineer', managerId: 'MGR-004', startOffsetDays: -35, deviceName: 'GDCBR-DT-0118', deviceType: 'Desktop', accessCodes: 'FFFFF' },

  // Camila Ferreira — EMS
  { employeeId: 'EMP-1019', lanId: 'BRX10249', fullName: 'Tatiana Leal', businessUnit: 'EMS', jobTitle: 'Procurement Specialist', managerId: 'MGR-005', startOffsetDays: -28, deviceName: 'GDCBR-LT-0119', deviceType: 'Laptop', accessCodes: 'FFFFF' },
  { employeeId: 'EMP-1020', lanId: 'BRX10250', fullName: 'Vinícius Campos', businessUnit: 'EMS', jobTitle: 'Electrical Engineer', managerId: 'MGR-005', startOffsetDays: -12, deviceName: null, deviceType: null, accessCodes: 'FFPcF' },
  { employeeId: 'EMP-1021', lanId: 'BRX10251', fullName: 'Yasmin Correia', businessUnit: 'EMS', jobTitle: 'Production Supervisor', managerId: 'MGR-005', startOffsetDays: 25, deviceName: null, deviceType: null, accessCodes: '' },
  { employeeId: 'EMP-1022', lanId: 'BRX10252', fullName: 'André Monteiro', businessUnit: 'EMS', jobTitle: 'Industrial Engineer', managerId: 'MGR-005', startOffsetDays: -3, deviceName: 'GDCBR-LT-0122', deviceType: 'Laptop', accessCodes: 'FFAAR' },

  // Gustavo Lima — ESS
  { employeeId: 'EMP-1023', lanId: 'BRX10253', fullName: 'Bianca Rangel', businessUnit: 'ESS', jobTitle: 'Security Analyst', managerId: 'MGR-006', startOffsetDays: -55, deviceName: 'GDCBR-LT-0123', deviceType: 'Laptop', accessCodes: 'FFFFFF' },
  { employeeId: 'EMP-1024', lanId: 'BRX10254', fullName: 'Caio Fontes', businessUnit: 'ESS', jobTitle: 'Data Engineer', managerId: 'MGR-006', startOffsetDays: -18, deviceName: 'GDCBR-LT-0124', deviceType: 'Laptop', accessCodes: 'FFFUA' },
  { employeeId: 'EMP-1025', lanId: 'BRX10255', fullName: 'Débora Vieira', businessUnit: 'ESS', jobTitle: 'Scrum Master', managerId: 'MGR-006', startOffsetDays: 2, deviceName: 'GDCBR-LT-0125', deviceType: 'Laptop', accessCodes: 'FAVPA' },
  { employeeId: 'EMP-1026', lanId: 'BRX10256', fullName: 'Eduardo Prado', businessUnit: 'ESS', jobTitle: 'Network Engineer', managerId: 'MGR-006', startOffsetDays: -7, deviceName: null, deviceType: null, accessCodes: 'FFVA' },
];
