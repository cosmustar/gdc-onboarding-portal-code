/**
 * CONFIGURAÇÃO DOS ARQUIVOS EXPORTADOS DO POWER BI
 * ------------------------------------------------
 * Este é o ÚNICO arquivo que normalmente precisa ser ajustado.
 *
 * - Os nomes das colunas abaixo devem ser IGUAIS ao cabeçalho do CSV
 *   (maiúsculas/minúsculas e espaços nas pontas são ignorados).
 * - Os arquivos ficam em `public/real-data/` (pasta ignorada pelo Git).
 * - Nunca coloque dados reais neste arquivo — apenas nomes de colunas e valores de status.
 */
import type { AccessStatus, BusinessUnit } from '../../types/models';

/** Nomes dos arquivos dentro de `public/real-data/`. */
export const FILES = {
  employees: 'employees.csv',
  accesses: 'accesses.csv',
} as const;

/** Tabela "Employee" do Power BI. */
export const EMPLOYEE_COLUMNS = {
  name: 'Name',
  lanId: 'LAN ID',
  email: 'Email',
  desktop: 'Desktop',
  department: 'Department',
  area: 'Area',
  jobFunction: 'Job Function',
  manager: 'Manager',
  hrStartDate: 'HR Start Date',
} as const;

/** Tabela "Access" do Power BI. */
export const ACCESS_COLUMNS = {
  requestId: 'Requested ID',
  statusProvisioning: 'Status Provisioning',
  group: 'Group',
  /** Nome do colaborador que recebe o acesso (é assim que o acesso é ligado ao colaborador). */
  employeeName: 'Name',
  statusApproval: 'Status Approval',
  /** Hipótese: quem precisa aprovar. Ajuste se a coluna significar outra coisa. */
  accessApproval: 'Access Approval',
  requestorName: 'Requestor Name',
  requestDate: 'Request Date',
  manager: 'Manager',
} as const;

/**
 * Formato das datas no CSV.
 *  'DMY' = 25/12/2026 (padrão brasileiro)
 *  'MDY' = 12/25/2026 (padrão americano)
 * Datas no formato 2026-12-25 são reconhecidas automaticamente.
 */
export const DATE_ORDER: 'DMY' | 'MDY' = 'DMY';

/**
 * Unidade de negócio (o portal trabalha com EMS e ESS).
 * `column`: qual coluna da tabela Employee contém a unidade.
 * `values`: textos que identificam cada unidade (basta CONTER o texto).
 * `fallback`: unidade usada quando nenhum texto bate (gera um aviso no console).
 */
export const BUSINESS_UNIT: {
  column: keyof typeof EMPLOYEE_COLUMNS;
  values: Record<BusinessUnit, string[]>;
  fallback: BusinessUnit;
} = {
  column: 'department',
  values: { EMS: ['EMS'], ESS: ['ESS'] },
  fallback: 'EMS',
};

/**
 * Tradução dos status do Power BI para os status do portal.
 * Coloque, em cada lista, os textos EXATOS que aparecem no CSV.
 *
 * Ordem de prioridade:
 *  1. "Status Approval" em `approvalRejected`  → Rejected
 *  2. "Status Provisioning" reconhecido como Finished/Committed/Failed → esse status
 *  3. "Status Approval" em `approvalPending`   → Pending Approval
 *  4. "Status Provisioning" nas demais listas  → esse status
 *  5. Nada reconhecido → Unverifiable (e aviso no console)
 */
export const STATUS_MAPPING: {
  approvalPending: string[];
  approvalRejected: string[];
  provisioning: Partial<Record<AccessStatus, string[]>>;
} = {
  approvalPending: ['Pending', 'Pending Approval', 'Waiting Approval', 'Aguardando Aprovação'],
  approvalRejected: ['Rejected', 'Denied', 'Rejeitado', 'Negado'],
  provisioning: {
    Finished: ['Finished', 'Completed', 'Complete', 'Success', 'Concluído'],
    Committed: ['Committed'],
    Failed: ['Failed', 'Error', 'Falha'],
    Provisioning: ['Provisioning', 'In Progress', 'Em andamento'],
    Pending: ['Pending', 'Queued', 'Pendente'],
    Rejected: ['Rejected'],
  },
};

/**
 * Regra do portal: "Committed" só conta como concluído se a disponibilidade
 * foi confirmada. O relatório não tem coluna de confirmação, então:
 *  false = Committed NUNCA conta como concluído (regra original, mais conservadora)
 *  true  = Committed SEMPRE conta como concluído
 */
export const COMMITTED_COUNTS_AS_CONFIRMED = false;

/** Valores de "Desktop" que significam "sem dispositivo". */
export const EMPTY_DEVICE_VALUES = ['', '-', 'N/A', 'NA', 'None', 'null', '(Blank)'];
