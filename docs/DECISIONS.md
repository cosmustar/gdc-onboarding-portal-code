# DECISIONS — Registro de decisões técnicas

**Status usados:**
- **Aprovada:** o usuário pediu ou confirmou explicitamente.
- **Proposta (implementada):** escolha técnica do desenvolvedor (Claude) que já está no código, mas **sem aprovação explícita registrada**.
- **Proposta:** ainda não implementada.
- **Substituída / Cancelada:** não vale mais.

**Origem:**
- "Sessão 1": sessão de desenvolvimento original, interrompida. Data, pedido e raciocínio **não recuperáveis**.
- "Sessão 2": sessão de 2026-11-15 que concluiu o projeto.

Para decisões da Sessão 1, a justificativa abaixo foi **inferida a partir do código e dos comentários**. Ela não vem de um registro da decisão.

---

### D-001 — Stack React + TypeScript + Vite + Tailwind + Lucide + Recharts
- **Necessidade:** aplicação web local, moderna, com gráficos e ícones.
- **Alternativas:** não registradas (Sessão 1). Em 2026-11-16 foi avaliada uma V2 em JS puro (ver D-014).
- **Solução:** a stack acima.
- **Justificativa:** escolhida na Sessão 1. Na Sessão 2, o usuário pediu explicitamente para preservá-la.
- **Consequências:** exige Node.js e npm para rodar e compilar.
- **Data:** escolha original não informada; preservação pedida em 2026-11-15.
- **Status:** Aprovada.

### D-002 — Abstração da fonte de dados (`OnboardingDataService`)
- **Necessidade:** trocar os dados fictícios por uma API real no futuro sem reescrever a UI (requisito da Fase 10 da especificação).
- **Alternativas:** importar os dados mock diretamente nos componentes (descartada: acoplaria a UI ao mock).
- **Solução:** interface em `src/services/OnboardingDataService.ts`, implementação mock e ponto único de troca em `src/services/index.ts`.
- **Consequências:** a futura `HttpOnboardingDataService` precisa devolver os mesmos formatos de `src/types/models.ts`.
- **Data:** implementada na Sessão 1 (data não informada).
- **Status:** Aprovada (é requisito explícito).

### D-003 — Autenticação simulada com "Switch Demo User"; Okta OIDC no futuro
- **Necessidade:** demonstrar as visões Admin e Manager sem autenticação real (Fase 4).
- **Solução:**
  - `SessionContext` guarda a sessão demo no `localStorage`;
  - seletor âmbar rotulado "DEMO";
  - o README documenta que Okta autentica, o backend determina o papel e a autorização é feita no servidor.
- **Consequências:** **não há segurança real**. A filtragem no frontend não é um limite de segurança.
- **Data:** base criada na Sessão 1; rótulo "Switch Demo User" e reset de filtros na Sessão 2 (2026-11-15).
- **Status:** Aprovada.

### D-004 — Regras de status de onboarding e "Committed" condicional
- **Necessidade:** regra única e reutilizável (Fase 6).
- **Solução:** `src/domain/status.ts`. "Committed" só conta como concluído com `availabilityConfirmed = true`. Failed e Rejected nunca contam como concluídos.
- **Consequências:** é preciso **validar contra a lógica do Power BI** (pendente).
- **Data:** implementada na Sessão 1 (data não informada), conforme a especificação.
- **Status:** Aprovada (regra especificada pelo usuário). Alinhamento com o Power BI pendente.

### D-005 — Regra de dispositivo
- **Solução:** nome preenchido → "Device Assigned"; vazio ou nulo → "Not Assigned". A interface avisa que isso não comprova a entrega física.
- **Status:** Aprovada (especificação).

### D-006 — Filtro de gestor do admin como filtro de visualização global
- **Necessidade:** o admin precisa filtrar por gestor e manter a seleção entre as páginas (Fases 4 e 8).
- **Alternativas consideradas (Sessão 2):**
  - (a) guardar na URL de cada página;
  - (b) guardar no contexto de sessão, persistido.
- **Solução:** (b). `managerFilter` em `SessionContext`, persistido no `localStorage`, aplicado em `DataContext`. O seletor fica na faixa de escopo, abaixo do header, visível em todas as páginas.
- **Justificativa:** um único estado garante a consistência entre as três páginas e as métricas.
- **Consequências:**
  - os links compartilhados não carregam o filtro de gestor;
  - o filtro é zerado ao trocar de usuário demo.
- **Data:** 2026-11-15.
- **Status:** Proposta (implementada).

### D-007 — Filtros de página na URL (query string)
- **Solução:** `useUrlFilters`. Os filtros sobrevivem ao refresh e podem ser definidos por links vindos de outras páginas.
- **Data:** Sessão 1 (data não informada).
- **Status:** Proposta (implementada).

### D-008 — Na visão Manager, o KPI "Total Managers" vira "Upcoming Starts"
- **Necessidade:** a especificação permitia mostrar o escopo **ou** substituir por outra métrica relevante para a equipe.
- **Solução:** substituir por "Upcoming Starts" (colaboradores com início futuro), com link para `/employees?start=upcoming`.
- **Data:** 2026-11-15.
- **Status:** Proposta (implementada).

### D-009 — KPI "Pending Accesses" = todos os itens não concluídos
- **Necessidade:** definir o que conta como "pendente" no KPI.
- **Alternativas:**
  - (a) apenas o status bruto "Pending";
  - (b) todos os itens que não contam como concluídos.
- **Solução:** (b). O clique leva a `/accesses?status=outstanding` ("Needs action").
- **Justificativa:** é coerente com a regra de onboarding: Failed, Rejected, Unverifiable e Committed sem confirmação também exigem ação.
- **Consequências:** o número **pode divergir de relatórios** que contam só "Pending". **Precisa de validação do usuário e do Power BI.**
- **Data:** 2026-11-15.
- **Status:** Proposta (implementada).

### D-010 — Trocar de usuário demo limpa os filtros de página
- **Solução:** `DemoManagerSwitcher` chama `navigate(pathname)` após trocar a sessão. Além disso, a página Accesses descarta os filtros `employee`, `approver` e `view` que não existem no novo escopo.
- **Data:** 2026-11-15.
- **Status:** Proposta (implementada). Atende ao requisito "reset filters that no longer apply".

### D-011 — Dataset determinístico com datas relativas a "hoje"
- **Solução:** `seed.ts` guarda deslocamentos em dias e `buildDataset.ts` gera as datas a cada carregamento.
- **Justificativa (inferida do comentário no código):** a demonstração sempre tem colaboradores futuros e passados.
- **Data:** Sessão 1 (data não informada).
- **Status:** Proposta (implementada).

### D-012 — Separar React e Recharts em arquivos próprios no build
- **Necessidade:** o build avisava que o arquivo JS passava de 500 kB.
- **Solução:** `manualChunks` em `vite.config.ts` (`react`, `charts`).
- **Data:** 2026-11-15.
- **Status:** Proposta (implementada).

### D-013 — Cor da sidebar exatamente `#102B4E`
- **Necessidade:** a especificação define "Sidebar navy: #102B4E". A Sessão 1 usava `#101F3D` (navy-900) e `navy-800` valia `#162B52`.
- **Solução:** `navy-800` passou a `#102B4E` e a sidebar usa `bg-navy-800`.
- **Data:** 2026-11-15.
- **Status:** Aprovada (cor especificada pelo usuário).

### D-014 — Portal IAM V2 em HTML/CSS/JavaScript puro
- **Necessidade:** o usuário considerou uma versão sem instalação, para um computador corporativo com restrições.
- **Proposta (Etapa 1, apenas planejamento):**
  - pasta separada `portal-iam-v2`;
  - navegação por hash;
  - scripts com `defer`;
  - gráficos em SVG.
- **Resultado:** **cancelada pelo usuário** ("cancelar, vou manter a v1 mesmo"). Nenhum arquivo da V2 foi criado.
- **Data:** 2026-11-16.
- **Status:** Cancelada.

### D-015 — Sistema de documentação permanente em `docs/`
- **Necessidade:** evitar perda de contexto, inconsistências e respostas inventadas entre conversas.
- **Solução:**
  - cinco documentos em `docs/`;
  - `CLAUDE.md` na raiz, com as regras de trabalho (é lido automaticamente pelo Claude Code em novas sessões).
- **Data:** 2026-11-16.
- **Status:** Aprovada (pedido explícito do usuário). O `CLAUDE.md` é uma escolha de implementação do desenvolvedor.

### D-016 — Testes de ponta a ponta fora do projeto
- **Situação atual:** os 46 testes de navegador (`e2e.mjs`, puppeteer-core + Chrome local) estão numa **pasta temporária do sistema**, fora do repositório, e podem ser apagados a qualquer momento.
- **Alternativas:**
  - (a) manter fora do projeto;
  - (b) versionar em `tests/e2e/` e adicionar `puppeteer-core` como dependência de desenvolvimento.
- **Status:** Proposta. **Aguarda decisão do usuário.** Nada foi alterado no projeto.
