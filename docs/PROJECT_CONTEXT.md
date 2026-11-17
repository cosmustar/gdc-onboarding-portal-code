# PROJECT_CONTEXT — GDC Brazil | Onboarding Portal

> Contexto geral e estável do projeto. Para o estado atual e próximos passos, ver `CURRENT_STATE.md`.
> Última revisão: 2026-11-16.

## 1. Objetivo

Protótipo local de um portal corporativo em que **gestores acompanham o onboarding de novos colaboradores**:
- solicitações de acesso no IDC (Oracle/SailPoint),
- status de aprovação,
- atribuição de dispositivo (desktop/notebook).

O protótipo serve para **demonstração local antes de solicitar a integração corporativa**. Usa apenas dados fictícios.

## 2. Problema que resolve

Hoje (segundo a especificação do usuário), a informação de onboarding está distribuída entre o IDC, o ServiceNow, as fontes de RH e relatórios Power BI. O portal reúne essa visão em uma interface simples para gestores não técnicos. Cada gestor vê apenas a própria equipe; o administrador vê o projeto inteiro.

## 3. Tecnologias

| Item | Versão declarada (`package.json`) |
|---|---|
| React / React DOM | ^18.3.1 |
| TypeScript | ~5.6.3 |
| Vite (+ @vitejs/plugin-react) | ^5.4.11 (instalado: 5.4.21) |
| Tailwind CSS (+ PostCSS, Autoprefixer) | ^3.4.15 |
| React Router DOM | ^6.28.0 |
| Recharts (gráficos) | ^2.15.0 |
| Lucide React (ícones) | ^0.460.0 |

- **Ambiente local verificado:** macOS 26.7.3, Intel (x86_64), Node.js v22.11.0 instalado em `~/node/bin`. Essa pasta **não está no PATH** por padrão; ver `BUGS_AND_FIXES.md` B-001.
- **Fonte:** Inter, carregada do Google Fonts em `index.html`. Exige internet; sem ela, cai para a fonte do sistema.
- **Controle de versão:** Git (repositório local; primeiro commit do usuário em 2026-11-15).

## 4. Arquitetura

```
BrowserRouter
 └─ SessionProvider     quem está "logado" (mock) + filtro de gestor do admin
     └─ DataProvider    carrega dados autorizados para a sessão via dataService
         └─ AppLayout   sidebar + header + faixa de escopo + <Outlet/>
             ├─ /overview   OverviewPage
             ├─ /employees  EmployeesPage
             └─ /accesses   AccessesPage
```

Princípios:
1. **A UI depende apenas da interface `OnboardingDataService`** (`src/services/OnboardingDataService.ts`). Hoje a implementação é `MockOnboardingDataService`. Uma futura `HttpOnboardingDataService` substitui o mock em `src/services/index.ts` sem mudar a UI.
2. **As regras de negócio ficam centralizadas** em `src/domain/status.ts`. Nenhum componente reimplementa regra de status.
3. **Todas as métricas são calculadas** em `src/domain/enrich.ts` a partir dos mesmos dados. Nada fica fixo no código da interface.
4. **Os filtros de página ficam na URL** (query string, `src/hooks/useUrlFilters.ts`). Isso permite links entre páginas, preservação no refresh e "limpar filtros" sem alterar o escopo do gestor.
5. **Há dois conceitos distintos de escopo:**
   - `session`: quem está logado (admin ou um gestor). Determina os dados retornados; em produção, isso é autorização no servidor.
   - `managerFilter`: filtro de visualização opcional do admin, aplicado no `DataContext`. Não é autorização.

## 5. Estrutura de pastas

```
docs/                       documentação e memória técnica (este conjunto)
public/favicon.svg
src/
  App.tsx, main.tsx, index.css
  types/models.ts           contratos de dados (Employee, AccessRequest, Session...)
  services/                 interface + mock + ponto único de troca da fonte de dados
  data/mock/                seed fictícia + gerador determinístico do dataset
  domain/
    status.ts               regras centralizadas (acesso, onboarding, dispositivo, aprovador)
    enrich.ts               junção de registros e cálculo de KPIs
    filters.ts              slugs de filtro compartilhados pelos links entre páginas
  context/                  SessionContext (demo login + filtro admin), DataContext
  hooks/                    useUrlFilters, useDebouncedValue (sem uso; ver CURRENT_STATE)
  components/
    layout/                 AppLayout, Sidebar, DemoManagerSwitcher
    ui/                     primitives, DataTable, Drawer, Badge
    employees/EmployeeDrawer.tsx
    accesses/AccessDrawer.tsx
  pages/                    OverviewPage, EmployeesPage, AccessesPage
  utils/                    cn, csv, date
README.md                   instalação, uso, regras e arquitetura futura
```

## 6. Funcionalidades principais

- **Overview:**
  - saudação e indicação de última atualização;
  - 4 KPIs dinâmicos;
  - gráfico de rosca do status de onboarding;
  - barras por unidade de negócio (EMS/ESS);
  - faixa "Attention Required";
  - tabela "Upcoming Employees".
- **Employees:** busca, filtros, ordenação, paginação, exportação CSV e drawer de detalhes com o botão "View Employee Accesses".
- **Accesses:** busca, 5 filtros, ordenação, paginação, exportação CSV e drawer de rastreabilidade.
- **Admin e Manager:**
  - seletor "Switch Demo User";
  - filtro global de gestor (somente admin);
  - selo "Your Team — Nome" (somente gestor).
- **Navegação cruzada** entre as páginas, por IDs estáveis (`employeeId`, `requestId`).

## 7. Regras de negócio (implementadas em `src/domain/status.ts`)

| Regra | Definição atual |
|---|---|
| **Acesso concluído** (KPI "Pending Accesses" e filtros de Accesses) | `Finished`; ou `Committed` **com** `availabilityConfirmed = true` |
| Acesso não concluído | Pending, Pending Approval, Provisioning, Failed, Rejected, Unverifiable, Committed sem confirmação |
| **Onboarding "Not Requested in IDC"** | colaborador sem nenhum item de solicitação |
| **Onboarding "Pending"** | ≥ 1 item pendente: Pending Approval, Pending ou Provisioning (D-018) |
| **Onboarding "Finished"** | há itens e nenhum está pendente. Finished, Committed, Rejected, Expired, Failed e Unverifiable contam como encerrados. Com aprovação Rejected ou Expired, o "Pending" do provisionamento (padrão do IDC) é ignorado (D-018). Não significa que todos os acessos foram concedidos |
| **Dispositivo** | nome preenchido → "Device Assigned"; nulo/vazio → "Not Assigned". **Não** comprova entrega física |
| **Aprovador pendente** | exibido apenas em `Pending Approval`; sem nome → "Not available"; outros status → "Not applicable" |
| **KPI "Pending Accesses"** | conta **todos os itens não concluídos**, não só o status "Pending". Ver DECISIONS D-009 |

⚠️ Essas regras precisam ser **alinhadas com a lógica existente no Power BI** (pendência registrada em `CURRENT_STATE.md`).

## 8. Dependências externas em tempo de execução

- Google Fonts (fonte Inter). É opcional: o portal funciona sem ela, só com outra fonte.
- Nenhuma API, banco de dados ou sistema corporativo.

## 9. Limitações técnicas

- **Autenticação simulada.** O escopo por gestor é filtragem no cliente. **Não é um limite de segurança.**
- O dataset é gerado em memória a cada carregamento. As datas de início são relativas a "hoje".
- O CSV é gerado no navegador, apenas com as linhas visíveis no escopo e filtros atuais.
- Não há testes automatizados versionados no projeto (ver DECISIONS D-016).
- O layout é desktop-first. No celular funciona, mas as tabelas rolam horizontalmente dentro do card.

## 10. Decisões confirmadas pelo usuário

Requisitos **explicitamente pedidos pelo usuário** na especificação de 2026-11-15 (detalhes em `DECISIONS.md`):
- preservar a stack React + TS + Vite + Tailwind + Lucide + Recharts;
- paleta de cores navy/azul definida;
- layout de referência: sidebar fixa, 4 KPIs, 2 painéis, tabela;
- três páginas: Overview, Employees, Accesses;
- **interface em inglês**;
- dados fictícios, emails `example.test`;
- dois perfis (Administrator e Manager) com autenticação simulada; Okta OIDC no futuro;
- regras de onboarding, dispositivo e aprovador (seção 7);
- abstração da fonte de dados para integrações futuras (IDC, ServiceNow, RH, Okta);
- autorização real deve ser feita no servidor.

Também confirmado pelo usuário em 2026-11-16: **manter a V1 (React)** e não criar a V2 em JavaScript puro.
