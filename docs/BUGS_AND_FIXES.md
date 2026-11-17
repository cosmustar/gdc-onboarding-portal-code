# BUGS_AND_FIXES — Histórico de erros

**Status:**
- **Aberto**
- **Corrigido:** houve correção **e** um teste executado confirmou.
- **Aguardando validação:** houve correção, mas sem confirmação.

Erros eventualmente ocorridos na Sessão 1 (sessão original, interrompida) **não podem ser recuperados**. Não há registro deles.

---

### B-001 — `npm: command not found`
- **Descrição:** o usuário relatou que o comando `npm` não era encontrado no terminal.
- **Mensagem original:** relatada pelo usuário como "command not found". Reproduzida na Sessão 2 (2026-11-15): `(eval):1: command not found: npm` e `command not found: node`.
- **Arquivos envolvidos:** nenhum do projeto. É configuração do shell (`~/.zprofile`).
- **Causa identificada:** o Node.js v22.11.0 está instalado em `~/node/bin` (instalação manual por arquivo compactado), e essa pasta não está no PATH. Chamar `~/node/bin/npm` diretamente também falha (`env: node: No such file or directory`), porque o npm procura `node` no PATH.
- **Solução aplicada:**
  - nos comandos executados pelo Claude, foi usado o prefixo `export PATH="$HOME/node/bin:$PATH"`;
  - a correção permanente para o usuário está documentada no README, seção 1.1.
- **Como foi testado:** com o prefixo, `npm install`, `npm run build` e `npm run dev` funcionaram (2026-11-15 e 2026-11-16).
- **Status:** **Aguardando validação.** Não há registro de que o usuário aplicou a linha no `~/.zprofile`, nem de que `npm` funciona no terminal dele sem o prefixo.

### B-002 — Aplicação não executava: arquivos de entrada ausentes
- **Descrição:** ao retomar o projeto, faltavam `src/main.tsx` (referenciado por `index.html`), `src/App.tsx` (rotas) e `src/index.css`. Este último contém a classe `focus-ring`, usada em vários componentes.
- **Causa:** a Sessão 1 foi interrompida antes de criá-los (hipótese baseada na ausência dos arquivos).
- **Solução:** os três arquivos foram criados na Sessão 2.
- **Como foi testado:** `npm run build` sem erros; 46 testes de navegador aprovados (2026-11-15; repetido em 2026-11-16).
- **Status:** Corrigido.

### B-003 — Ordenar uma coluna mantinha a página atual da paginação
- **Descrição:** estando na página 3 de Employees, clicar em "Start Date" ordenava os dados, mas continuava exibindo a página 3.
- **Arquivo:** `src/components/ui/DataTable.tsx`.
- **Causa:** `toggleSort` não reiniciava o estado `page`.
- **Solução:** `setPage(1)` dentro de `toggleSort`.
- **Como foi testado:** teste "Sort returns to page 1 & sorts by start date asc" aprovado (2026-11-15 e 2026-11-16).
- **Status:** Corrigido.

### B-004 — Coluna "Pending Approver" cortada e nomes de gestor quebrando linha (Accesses, 1440px)
- **Arquivos:** `src/components/ui/DataTable.tsx` (espaçamento das células), `src/pages/AccessesPage.tsx`.
- **Causa:** largura total das colunas maior que o card.
- **Solução:**
  - espaçamento horizontal das células reduzido de 16px para 12px (com 20px na primeira coluna);
  - removida a etiqueta de unidade sob o nome do colaborador (a unidade já é um filtro da página);
  - `whitespace-nowrap` em Manager.
- **Como foi testado:** captura de tela de 1440px gerada em 2026-11-16 e inspecionada: todas as colunas visíveis.
- **Status:** Corrigido.

### B-005 — Seletor demo cortava "Alex Moreno · Administrator"
- **Arquivo:** `src/components/layout/DemoManagerSwitcher.tsx`.
- **Solução:** rótulo encurtado para "Alex Moreno · Admin".
- **Como foi testado:** captura de tela de 2026-11-16 inspecionada: texto completo.
- **Status:** Corrigido.

### B-006 — "View Details" quebrava em duas linhas no KPI "Upcoming Starts" (visão Manager)
- **Arquivo:** `src/pages/OverviewPage.tsx`.
- **Solução:** texto auxiliar encurtado para "Not started yet".
- **Como foi testado:** captura de tela de 2026-11-16 (visão de Beatriz Almeida) inspecionada: uma linha.
- **Status:** Corrigido.

### B-007 — Aviso de build: arquivo JS maior que 500 kB
- **Mensagem original:** `(!) Some chunks are larger than 500 kB after minification.`
- **Solução:** `manualChunks` em `vite.config.ts` (DECISIONS D-012).
- **Como foi testado:** `npm run build` sem aviso. Maior arquivo: `charts` com 372,8 kB (2026-11-16).
- **Status:** Corrigido.

### B-008 — Coluna "Onboarding Status" invisível na página Employees em telas de notebook
- **Descrição:** encontrado pelo desenvolvedor em 2026-11-16. A coluna existia, mas ficava fora da área visível do card, e só aparecia rolando a tabela para o lado.
- **Nota de correção (2026-11-16):** a primeira versão deste registro dizia que o usuário havia relatado o problema. Na verdade, a pergunta do usuário ("a coluna status onboarding de employees não tem") era sobre o `csvConfig.ts` não listar as colunas "Onboarding" e "Access Approval". O desenvolvedor interpretou a pergunta como um problema de layout. A correção de layout foi feita **sem pedido do usuário**, e manter ou reverter aguarda a decisão dele.
- **Medição antes da correção (dados fictícios):**
  - Employees precisava de 1261px e cabia inteira só em janelas de 1920px;
  - Accesses transbordava em 1280px e 1366px.
- **Arquivos:** `src/pages/EmployeesPage.tsx`, `src/pages/AccessesPage.tsx`, `src/components/ui/DataTable.tsx`.
- **Causa:** muitas colunas que não quebram linha. O e-mail, sem espaços, era o maior fator.
- **Solução:**
  - **Employees:**
    - o e-mail saiu da coluna própria e foi para baixo do nome, podendo quebrar antes do "@";
    - os cabeçalhos "Business Unit", "Desktop / Device" e "Onboarding Status" podem ocupar duas linhas.
  - **Accesses:** o LAN ID saiu da coluna própria e foi para baixo do nome do colaborador.
  - **DataTable:** os cabeçalhos ordenáveis ficam alinhados à esquerda quando quebram linha.
  - A busca por e-mail e por LAN ID e o CSV exportado continuam iguais.
- **Como foi testado (2026-11-16, ~18h50):**
  - tabelas medidas em 1280, 1366, 1440, 1536 e 1920px: Employees, Accesses e Overview cabem inteiras a partir de **1366px**;
  - captura de 1366px inspecionada: a coluna Onboarding Status está visível;
  - `npm run build` sem erros;
  - 46 de 46 testes aprovados.
- **Limitação:** em 1280px ainda há rolagem dentro do card (Employees 45px, Accesses 75px, Overview 16px). Não foi testado com os dados reais, em que e-mails e nomes podem ser mais longos.
- **Status:** Corrigido (para telas ≥1366px).

### B-009 — Accesses: valores longos de números esticavam a tabela (dados reais)
- **Descrição:** relatado pelo usuário em 2026-11-16, no notebook da empresa com dados reais. Os números se estendiam até o fim, a barra de rolagem ia até o final deles e o resto do conteúdo não acompanhava. No Mac (dados fictícios), a página estava correta.
- **Coluna afetada no notebook:** **não confirmada.** Hipótese: "Access Approval" (lista de IDs) ou "Requested ID".
- **Reprodução (Mac, modo CSV, arquivo fictício):**
  - um Request ID de 64 caracteres e uma lista de 25 IDs separados por ";", ambos sem espaços;
  - a tabela ficou com 3286px (o card tinha 1044px), e a coluna Pending Approver sozinha com 2014px;
  - rolando até o fim, só apareciam os números.
- **Causa:** o navegador não quebra linha em textos sem espaço, então a coluna cresce até caber o valor inteiro.
- **Solução:**
  - `src/pages/AccessesPage.tsx`: as colunas Request ID, Requested By e Pending Approver têm largura máxima de 220px, e Access Name de 260px; valores longos podem quebrar linha (`overflow-wrap: anywhere`);
  - `src/services/csv/CsvOnboardingDataService.ts`: no campo Access Approval, é inserido um espaço após `;`, `,` e `|`, para que a quebra aconteça entre um ID e outro.
- **Como foi testado (2026-11-16):**
  - com os mesmos dados fictícios longos, a tabela caiu para 1096px (Pending Approver com 167px), e a página não tem rolagem horizontal;
  - capturas inspecionadas;
  - gaveta de detalhes sem transbordamento;
  - `npm run build` sem erros;
  - 46 de 46 testes no modo fictício.
- **Status:** **Aguardando validação** no notebook da empresa com os dados reais.
- **Nota de correção (2026-11-16):** **diagnóstico errado.** Com uma captura de tela, o usuário esclareceu que o problema eram os **números da paginação** (ver B-010), e não valores longos nas células. A correção acima **foi desfeita**, pois não foi pedida: `AccessesPage.tsx` e `CsvOnboardingDataService.ts` voltaram ao estado anterior, e nada dela foi enviado ao GitHub. O comportamento com valores longos sem espaço continua sem tratamento. Não há relato de que isso ocorra com os dados reais.
- **Status (atualizado):** Cancelado (diagnóstico incorreto; código revertido).

### B-010 — Paginação mostrava todos os números de página e estourava a largura
- **Descrição:** relatado pelo usuário em 2026-11-16, com captura de tela, no notebook da empresa com dados reais. Na página Accesses, os números da paginação "saíram" da área entre as setas e criaram uma rolagem horizontal até o final da página. No Mac (116 itens fictícios = 10 páginas), cabia.
- **Arquivo:** `src/components/ui/DataTable.tsx` (afeta todas as tabelas).
- **Causa:** um botão para **cada** página (`Array.from({ length: pageCount })`), sem limite. Com milhares de acessos reais (12 por página), são centenas de botões.
- **Solução:**
  - a função `pageItems` mostra no máximo 7 posições: primeira página, última página, as vizinhas da atual e "…" no lugar das demais (ex.: `1 … 49 50 51 … 250`). Com 7 páginas ou menos, nada muda;
  - os botões podem descer de linha em telas estreitas (`flex-wrap`).
- **Como foi testado (2026-11-16):**
  - modo CSV, com um arquivo **fictício** de 3.000 acessos (250 páginas), em 1366px:
    - início: `[1] 2 3 4 5 … 250`;
    - página 5: `1 … 4 [5] 6 … 250`;
    - "próxima": `1 … 5 [6] 7 … 250`;
    - página 250: `1 … 246 247 248 249 [250]`;
    - "anterior": `1 … 246 247 248 [249] 250`;
    - em todos os casos, a contagem "Showing" estava correta e a página não tinha rolagem horizontal;
  - em 390px, sem rolagem horizontal depois do `flex-wrap` (antes passava 5px);
  - captura inspecionada;
  - `npm run build` sem erros;
  - 46 de 46 testes no modo fictício.
- **Status:** **Aguardando validação** no notebook da empresa com os dados reais.

---

## Erros no script de teste (não eram erros da aplicação)

### T-001 — Expectativa errada: "Laura = 19 acessos"
- O teste esperava 19; a aplicação mostrou 20. Contagem pela seed: 6+5+4+0+5 = **20**. A aplicação estava certa. O teste foi corrigido em 2026-11-15.

### T-002 — Verificação de texto do drawer falhava por causa de maiúsculas do CSS
- `innerText` retorna "COMMENTS" (o CSS aplica `uppercase`). O teste passou a usar `textContent`. A aplicação estava correta.

### T-003 — Teste de saudação não cobre "Good night" (aberto)
- Em 2026-11-15, o usuário adicionou "Good night" (a partir das 22h) em `greeting()` (commit `a7aa926`). A expressão do teste é `/Good (morning|afternoon|evening), Beatriz/`. **Se executado entre 22h00 e 23h59, o teste falha**, embora a aplicação esteja correta.
- **Status:** Aberto (limitação do script de teste, que fica fora do projeto; ver D-016).
- **Atualização (2026-11-16, 23h33):** o teste falhou neste horário, como previsto. A expressão passou a aceitar "night", e o teste passou na mesma execução. **Status: Corrigido.**

### T-004 — Teste do escopo do gestor dependia da posição da coluna
- Após B-008, a coluna Manager passou da 6ª para a 5ª posição, e 2 verificações falharam ("All rows belong to Beatriz" e "Accesses scoped to Beatriz"). A aplicação estava correta.
- O teste passou a localizar a coluna pelo cabeçalho "Manager". 46 de 46 aprovados (2026-11-16).
