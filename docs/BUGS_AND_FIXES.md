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

---

## Erros no script de teste (não eram erros da aplicação)

### T-001 — Expectativa errada: "Laura = 19 acessos"
- O teste esperava 19; a aplicação mostrou 20. Contagem pela seed: 6+5+4+0+5 = **20**. A aplicação estava certa. O teste foi corrigido em 2026-11-15.

### T-002 — Verificação de texto do drawer falhava por causa de maiúsculas do CSS
- `innerText` retorna "COMMENTS" (o CSS aplica `uppercase`). O teste passou a usar `textContent`. A aplicação estava correta.

### T-003 — Teste de saudação não cobre "Good night" (aberto)
- Em 2026-11-15, o usuário adicionou "Good night" (a partir das 22h) em `greeting()` (commit `a7aa926`). A expressão do teste é `/Good (morning|afternoon|evening), Beatriz/`. **Se executado entre 22h00 e 23h59, o teste falha**, embora a aplicação esteja correta.
- **Status:** Aberto (limitação do script de teste, que fica fora do projeto; ver D-016).
