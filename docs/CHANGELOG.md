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

## 2026-11-16 — Tabelas cabem em telas de notebook (B-008)
- **Motivo:** interpretação equivocada do desenvolvedor de uma pergunta do usuário (ver nota de correção em B-008). A mudança **não foi pedida** e aguarda a decisão do usuário de manter ou reverter. Não foi enviada ao GitHub.
- **Modificados:**
  - `src/pages/EmployeesPage.tsx`: e-mail sob o nome; cabeçalhos longos quebram linha;
  - `src/pages/AccessesPage.tsx`: LAN ID sob o nome;
  - `src/components/ui/DataTable.tsx`: cabeçalho ordenável alinhado à esquerda.
- **Testes:**
  - medição de largura em 5 resoluções;
  - captura de 1366px inspecionada;
  - build OK;
  - 46 de 46 testes, após ajustar o script (T-004).

## 2026-11-16 — Valores longos na página Accesses (B-009)
- **Motivo:** o usuário relatou que, no notebook da empresa, números longos esticavam a tabela de Accesses.
- **Modificados:**
  - `src/pages/AccessesPage.tsx`: largura máxima e quebra de linha nas colunas de texto livre;
  - `src/services/csv/CsvOnboardingDataService.ts`: espaço após separadores no Access Approval.
- **Testes:**
  - reprodução e correção verificadas com dados fictícios longos;
  - build OK;
  - 46 de 46 testes.
  - **Não testado com os dados reais.**

## 2026-11-16 — Paginação limitada (B-010); B-009 revertido
- **Motivo:** o usuário mostrou, com captura de tela, que o problema em Accesses eram os números da paginação, e não valores longos (B-009 foi um diagnóstico errado).
- **Modificados:**
  - `src/components/ui/DataTable.tsx`: paginação com no máximo 7 posições e "…"; botões podem quebrar linha.
- **Revertidos (B-009):** as alterações de valores longos em `src/pages/AccessesPage.tsx` e `src/services/csv/CsvOnboardingDataService.ts`.
- **Testes:**
  - paginação verificada com 3.000 acessos fictícios (250 páginas) em 1366px e 390px;
  - build OK;
  - 46 de 46 testes.
  - **Não testado com os dados reais.**

## 2026-11-16 — Nova regra de Onboarding Status (D-018)
- **Motivo:** especificação enviada pelo usuário ("Lógica de Onboarding Status — GDC Brazil").
- **Modificados:**
  - `src/domain/status.ts`: `keepsOnboardingPending` e o novo `calculateOnboardingStatus`;
  - `src/types/models.ts`: novo campo `provisioningPending`;
  - `src/domain/enrich.ts`: `keepsOnboardingPending` em cada acesso;
  - `src/services/csv/CsvOnboardingDataService.ts`: preenche `provisioningPending`;
  - `src/components/accesses/AccessDrawer.tsx`: o aviso da gaveta segue a regra nova;
  - `README.md` e `docs/PROJECT_CONTEXT.md`: descrição da regra.
- **Não alterados:** o KPI "Pending Accesses" e os filtros de Accesses continuam com a regra D-004.
- **Testes:**
  - **Os 7 exemplos da especificação, mais o caso "em provisionamento":** 8 de 8, em modo CSV com arquivos fictícios.
  - **Gaveta:** 8 de 8.
  - **Rosca do Overview:** 4 / 3 / 1, como esperado.
  - **Modo fictício:** novas contagens (10 / 13 / 3, Laura 2) conferidas por cálculo independente; 3 expectativas do script atualizadas.
  - **Saudação:** a expressão do teste foi corrigida (T-003).
  - 46 de 46 testes; build OK.
  - **Não testado com os dados reais.**

## 2026-11-16 — Rejected e Expired encerram a solicitação (alteração da D-018)
- **Motivo:** o usuário informou que o IDC deixa "Status Provisioning" como Pending por padrão quando a aprovação é Rejected ou Expired. Nesses casos a solicitação já está encerrada e deve contar como Finished.
- **Modificados:**
  - `src/types/models.ts`: novo status **Expired**; removido `provisioningPending`;
  - `src/domain/status.ts`: regra do Expired; `keepsOnboardingPending` simplificado;
  - `src/components/ui/Badge.tsx`: ícone do Expired;
  - `src/components/accesses/AccessDrawer.tsx`;
  - `src/services/csv/csvConfig.ts`: `approvalExpired`; "Reject" em `approvalRejected`;
  - `src/services/csv/CsvOnboardingDataService.ts`;
  - `README.md` e `docs/PROJECT_CONTEXT.md`.
- **Testes:**
  - **Modo CSV, arquivos fictícios:** 10 de 10 cenários de onboarding. Rejected + Pending, Expired + Pending e "Reject" + Pending resultaram em Finished.
  - **Gaveta:** 12 de 12; selo e filtro "Expired" verificados por captura.
  - **Rosca do Overview:** 7 / 2 / 1, como esperado.
  - **Modo fictício:** contagens inalteradas (10 / 13 / 3), conferidas por cálculo independente; 46 de 46 testes; build OK.
  - **Não testado com os dados reais.**

## 2026-11-17 — Menu lateral recolhível em telas grandes
- **Motivo:** pedido do usuário para o menu lateral não ficar sempre fixo e ganhar espaço na página.
- **Comportamento:**
  - **Telas grandes (≥1024px):** o menu continua fixo por padrão. O botão "Hide menu" (ícone no topo do menu) o esconde, e o conteúdo passa a ocupar a largura toda.
  - **Com o menu escondido:** o botão ☰ do cabeçalho abre o menu por cima da página. Ele fecha ao clicar num item, ao clicar fora ou com Esc. "Keep menu open" volta a fixá-lo.
  - **Preferência:** fica salva no navegador (`localStorage`, chave `gdc-onboarding.sidebar-pinned.v1`).
  - **Celular:** sem mudança. O menu continua sobreposto e abre pelo ☰.
- **Modificados:** `src/components/layout/Sidebar.tsx` e `src/components/layout/AppLayout.tsx`.
- **Testes:**
  - 10 de 10 verificações do menu em 1366px e 390px: padrão fixo; esconder; abrir sobreposto; fechar por link, por Esc e por clique fora; preferência lembrada após recarregar; fixar de novo; comportamento no celular;
  - capturas inspecionadas: com o menu escondido, a tabela de Employees cabe inteira em 1366px (1300px disponíveis);
  - build OK;
  - 46 de 46 testes.

## 2026-11-17 — Nome do grupo repetido em "Access Name"
- **Motivo:** o usuário informou que, na página Accesses, o nome do grupo aparecia duas vezes na coluna Access Name (dados reais).
- **Causa:** no modo CSV, `accessName` e `application` vêm da mesma coluna "Group" (`CsvOnboardingDataService.ts`, linhas 252-253). A célula mostrava os dois.
- **Correção:** a segunda linha (aplicação) só aparece quando é diferente do nome do acesso. Com os dados fictícios, que têm aplicação própria, nada muda.
- **Modificado:** `src/pages/AccessesPage.tsx`.
- **Não alterado:** o painel lateral do acesso continua mostrando o campo "Application" (no modo CSV, igual ao nome do grupo).
- **Testes:** build OK; 46 de 46 testes (modo fictício). **Não testado no modo CSV nem com os dados reais.**

## 2026-11-24 — KPI "Pending Accesses" segue a regra D-018
- **Motivo:** o usuário viu, com os dados reais, 498 em "Pending Accesses" e 19 em "awaiting approval", e pediu que o KPI siga a lógica de onboarding que passou.
- **Mudança:**
  - o KPI conta só Pending Approval, Pending e Provisioning (antes: tudo que não estava concluído, incluindo Committed, Failed, Rejected, Expired e Unverifiable);
  - o clique no card abre Accesses com o novo filtro "Pending (keeps onboarding pending)";
  - a dica de "Total Accesses" diz "closed" em vez de "completed".
- **Modificados:** `src/domain/enrich.ts`, `src/domain/filters.ts`, `src/pages/OverviewPage.tsx`; documentação: `DECISIONS.md` (D-009, D-018), `PROJECT_CONTEXT.md`, `CURRENT_STATE.md`, `README.md`.
- **Testes:**
  - build OK;
  - cálculo independente com os dados fictícios (script compilado com esbuild): KPI 38 → **30** = 18 Pending Approval + 6 Pending + 6 Provisioning; o novo filtro retorna os mesmos 30; o filtro do status bruto "Pending" continua com 6; onboarding sem mudança (10 / 13 / 3).
- **Não executados:** os testes automáticos de navegador (46 testes). A pasta temporária onde ficavam foi apagada; eles não estavam no projeto (D-016). **Não testado na tela nem com os dados reais.**
