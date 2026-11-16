# CHANGELOG — Histórico de alterações

Ordem cronológica, do mais antigo para o mais recente. As datas vêm de registros verificáveis: o histórico do Git, as datas da própria conversa ou a data do sistema no momento da alteração. Quando não há registro, o texto diz isso.

---

## Sessão 1 — Construção inicial (interrompida)
- **Data:** **não informada.** Os arquivos de configuração têm data de modificação 2026-11-15 11:43, mas isso é só um indício: a data pode refletir uma cópia ou edição posterior.
- **Registros:** o pedido original, as decisões e os testes desta sessão **não estão disponíveis**. A sessão foi interrompida quando o usuário trocou de workspace no VS Code.
- **Arquivos que já existiam no início da Sessão 2** (portanto criados aqui ou antes):
  - configuração: `package.json`, `index.html`, `vite.config.ts`, `tsconfig*.json`, `tailwind.config.js`, `postcss.config.js`, `.gitignore`, `public/favicon.svg`;
  - `src/types/models.ts`, `src/services/*`, `src/data/mock/*`, `src/domain/*`, `src/context/*`, `src/hooks/*`, `src/utils/*`;
  - `src/components/ui/*`, `src/components/layout/*`, `src/components/employees/EmployeeDrawer.tsx`, `src/components/accesses/AccessDrawer.tsx`;
  - `src/pages/EmployeesPage.tsx`.
- **Testes:** não há registro. Hipótese: o Node não estava no PATH (B-001), então provavelmente não foi possível compilar. **Não confirmado.**
- **Pendências deixadas:** arquivos de entrada, páginas Overview e Accesses, README (ver Sessão 2).

## 2026-11-15 — Sessão 2: conclusão do portal (Claude Code)
- **Motivo:** o usuário pediu para continuar o projeto interrompido sem reconstruí-lo (especificação em 12 fases).
- **Criados:**
  - `src/main.tsx`, `src/App.tsx` (rotas `/overview`, `/employees`, `/accesses`; `/` e rotas desconhecidas redirecionam para `/overview`);
  - `src/index.css`;
  - `src/pages/OverviewPage.tsx`, `src/pages/AccessesPage.tsx`;
  - `README.md`;
  - `package-lock.json` (gerado pelo `npm install`).
- **Modificados:**
  - `src/context/SessionContext.tsx`: filtro de gestor do admin persistido; `scopedManager`; `firstName`.
  - `src/context/DataContext.tsx`: aplica o filtro de gestor.
  - `src/components/layout/AppLayout.tsx`: faixa de escopo com o seletor de gestor (admin) ou o selo "Your Team — Nome" (manager).
  - `src/components/layout/DemoManagerSwitcher.tsx`: rótulo "Switch Demo User"; limpa os filtros ao trocar de usuário.
  - `src/components/layout/Sidebar.tsx` e `tailwind.config.js`: sidebar em `#102B4E`.
  - `src/components/employees/EmployeeDrawer.tsx`: botão "View Employee Accesses"; campos LAN ID e Job title.
  - `src/components/ui/Badge.tsx`: `BuTag` movido de `EmployeesPage.tsx` para cá.
  - `src/components/ui/DataTable.tsx`: reset de página ao ordenar; espaçamento menor.
  - `vite.config.ts`: separação em `react` e `charts`.
- **Resultado esperado:** as três páginas funcionais, as visões Admin e Manager e a navegação entre páginas, conforme a especificação.
- **Resultado verificado:**
  - `npm run build` sem erros nem avisos;
  - 46 testes de navegador (headless Chrome) aprovados;
  - dataset conferido: 26 colaboradores, 6 gestores, 116 solicitações, IDs únicos, emails `@example.test`;
  - servidor de desenvolvimento respondeu HTTP 200 em `http://localhost:5173`.
- **Problemas encontrados:** B-001 a B-007; T-001 e T-002.
- **Pendências:** alinhar as regras com o Power BI; validar o KPI "Pending Accesses" (D-009); correção permanente do PATH (B-001).

## 2026-11-15 14:04 — Commit `2722caf` (usuário)
- **Mensagem:** "Código completo do site GDC BR". 44 arquivos e 6.449 linhas. Primeiro commit do repositório Git.
- **Motivo:** não registrado.

## 2026-11-15 18:52 — Commit `a7aa926` (usuário)
- **Mensagem:** "Alteração das mensagens prontas na função greeting()".
- **Arquivo:** `src/pages/OverviewPage.tsx`. A saudação passou a ter "Good evening" das 18h às 21h59 e "Good night" a partir das 22h (antes era "Good evening" a partir das 18h).
- **Motivo:** **não registrado.**
- **Verificado em 2026-11-16:** build sem erros; 46 testes aprovados às 14h40 (o intervalo de "Good night" não foi exercitado; ver T-003).

## 2026-11-16 — Planejamento da V2 (cancelado)
- Plano de um "Portal IAM V2" em HTML/CSS/JS puro, apresentado somente como análise (Etapa 1).
- **Cancelado pelo usuário.** Nenhum arquivo foi criado ou alterado. Ver D-014.

## 2026-11-16 — Sistema de documentação
- **Motivo:** pedido do usuário para criar memória técnica permanente e rastreabilidade.
- **Criados:** `docs/PROJECT_CONTEXT.md`, `docs/CHANGELOG.md`, `docs/DECISIONS.md`, `docs/BUGS_AND_FIXES.md`, `docs/CURRENT_STATE.md` e `CLAUDE.md` (regras de trabalho lidas automaticamente pelo Claude Code).
- **Código da aplicação:** **não alterado.**
- **Verificação antes de documentar (14h40):**
  - `git status` limpo;
  - `npm run build` sem erros;
  - 46 de 46 testes de navegador aprovados;
  - capturas de tela inspecionadas (B-004, B-005 e B-006 confirmados).

## 2026-11-16 — Leitura de dados reais exportados do Power BI
- **Motivo:** pedido do usuário para usar os dados reais (D-017). O usuário vai aplicar a mudança no notebook da empresa, a partir de um guia.
- **Criados:**
  - `src/services/csv/csvConfig.ts`: nomes das colunas, tradução dos status, formato de data e unidade de negócio;
  - `src/services/csv/parseCsv.ts`: leitor de CSV sem dependência externa (vírgula ou ponto e vírgula, aspas, BOM);
  - `src/services/csv/CsvOnboardingDataService.ts`;
  - `docs/GUIA_DADOS_REAIS.md`: passo a passo para o notebook da empresa.
- **Modificados:**
  - `src/services/index.ts`: escolhe a fonte de dados pela variável `VITE_DATA_SOURCE`;
  - `src/types/models.ts`: `category` aceita "Not available";
  - `src/components/layout/Sidebar.tsx`: o aviso "All data is fictional" muda no modo CSV;
  - `.gitignore`: passa a ignorar `public/real-data/`.
- **Comportamento padrão:** inalterado. Sem `.env.local`, o portal continua com os dados fictícios.
- **Testes executados (2026-11-16, ~17h50):**
  - `npm run build` sem erros, nos dois modos.
  - **Modo CSV**, com arquivos **fictícios** criados com as colunas informadas pelo usuário: 14 de 14 verificações aprovadas. Foram cobertos:
    - colaboradores carregados e gestores derivados;
    - Request ID duplicado;
    - acesso de colaborador inexistente ignorado;
    - status desconhecido → Unverifiable; aprovação rejeitada → Rejected; aprovação pendente → Pending Approval;
    - colaborador sem acessos → Not Requested in IDC;
    - avisos no console para unidade, data inválida, status e colaborador inexistente.
  - **Mensagens de erro na tela** verificadas para "arquivo ausente" e "coluna não encontrada".
  - **Modo fictício:** 46 de 46 testes originais aprovados (executados duas vezes).
  - **Não testado:** com os arquivos reais do Power BI (não disponíveis nesta máquina).
