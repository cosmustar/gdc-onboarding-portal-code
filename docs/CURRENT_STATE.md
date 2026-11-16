# CURRENT_STATE — Estado atual

> **Documento principal de continuidade. Leia este primeiro.**
> Atualizado em: 2026-11-16. Último commit verificado: `a7aa926`.

## Resumo
O portal está **funcional para demonstração local**. A última verificação foi em 2026-11-16 às 14h40:
- `npm run build` sem erros;
- 46 de 46 testes de navegador aprovados.

Rodar localmente: `npm run dev` → `http://localhost:5173`. Antes, é preciso corrigir o PATH; ver B-001.

## Implementado (verificado por teste ou inspeção)
- [x] Rotas `/overview`, `/employees`, `/accesses`; `/` e rotas desconhecidas redirecionam para `/overview`.
- [x] Sidebar fixa (`#102B4E`), header com última atualização, seletor "Switch Demo User", avatar.
- [x] Faixa de escopo: o admin tem o seletor de gestor (persistido); o gestor tem o selo "Your Team — Nome".
- [x] Overview:
  - saudação;
  - chips de unidade e de atualização;
  - 4 KPIs dinâmicos (o gestor vê "Upcoming Starts" no lugar de "Total Managers");
  - rosca de onboarding;
  - barras EMS/ESS;
  - "Attention Required";
  - tabela "Upcoming Employees" com busca e ordenação.
- [x] Employees:
  - busca por nome, LAN ID ou e-mail;
  - filtros: status, unidade, dispositivo, início;
  - ordenação, paginação (10 por página) e CSV;
  - drawer com o botão "View Employee Accesses".
- [x] Accesses:
  - busca por colaborador, ID ou acesso;
  - filtros: status (inclui os grupos "Needs action" e "Completed"), colaborador, unidade, aprovador (inclui "Not available");
  - ordenação, paginação (12 por página) e CSV;
  - drawer de rastreabilidade;
  - faixa "Showing accesses for…".
- [x] Navegação cruzada (KPIs, rosca, barras, "Attention Required", drawers) por IDs estáveis.
- [x] A troca de usuário limpa os filtros. Filtros que não existem no novo escopo são descartados.
- [x] Estados de carregamento (skeleton), vazio e erro (simular com `?simulateError=1`).
- [x] Sem rolagem horizontal da página em 390px e 1024px.
- [x] Dataset fictício: 26 colaboradores, 6 gestores, 116 solicitações.
- [x] README com instalação, regras e arquitetura futura (Okta, IDC, ServiceNow, RH).

## Parcialmente implementado
- **Responsividade no celular:** o layout funciona em 390px, mas as tabelas largas rolam horizontalmente dentro do card. Não há layout de cartões para o celular.
- **Fonte Inter:** depende do Google Fonts (internet).

## Planejado / não implementado
- Integração real: Okta OIDC, backend (BFF), IDC, ServiceNow, RH. **Apenas documentada no README.**
- `HttpOnboardingDataService`: não existe.

## Últimas mudanças
1. 2026-11-16: criado o sistema de documentação (`docs/` + `CLAUDE.md`). Código não alterado.
2. 2026-11-15: commit `a7aa926` do usuário, que adicionou "Good night" em `greeting()`.

## Erros e pendências conhecidos
- **B-001:** a correção permanente do PATH (`~/.zprofile`) não tem confirmação de que foi aplicada.
- **T-003:** o script de teste falha entre 22h e 23h59 (expressão da saudação). A aplicação está correta.

## Pontos que precisam de validação do usuário
1. **Regras de onboarding e de acesso concluído** versus a lógica do **Power BI** (D-004).
2. **KPI "Pending Accesses"** conta todos os itens não concluídos, não só "Pending" (D-009).
3. **Testes:** versionar no projeto ou manter fora (D-016)?
4. Decisões marcadas como "Proposta (implementada)" em `DECISIONS.md` (D-006 a D-012), que ainda não têm aprovação explícita.

## Observações (sem ação tomada)
- **Código sem uso:** `src/hooks/useDebouncedValue.ts` (o hook inteiro), `isAccessOutstanding` em `src/domain/status.ts` e `accessStatusSlugOf` em `src/domain/filters.ts`. Mantidos; remover só com autorização.
- **Unidades vazias:** na visão Manager, o painel "Business Units" mostra a unidade sem colaboradores (ex.: "EMS 0 · 0%"). Comportamento intencional (sempre exibe EMS e ESS), mas pode ser revisto.
- **Pasta `dist/`:** é o resultado do build e é ignorada pelo Git.

## Próximas etapas sugeridas (não aprovadas)
- Validar os itens da seção "Pontos que precisam de validação".
- Decidir sobre os testes versionados.

## Arquivos-chave para continuar
| Para mexer em… | Arquivo |
|---|---|
| Regras de status | `src/domain/status.ts` |
| KPIs / métricas | `src/domain/enrich.ts` |
| Dados fictícios | `src/data/mock/seed.ts`, `buildDataset.ts` |
| Usuário demo / filtro de gestor | `src/context/SessionContext.tsx`, `DataContext.tsx` |
| Layout geral | `src/components/layout/AppLayout.tsx`, `Sidebar.tsx` |
| Tabelas | `src/components/ui/DataTable.tsx` |
| Páginas | `src/pages/*.tsx` |
| Cores / tema | `tailwind.config.js`, `src/index.css` |
| Trocar mock por API | `src/services/index.ts` |

## Como verificar o estado (comandos)
```bash
cd ~/gdc-onboarding-portal
export PATH="$HOME/node/bin:$PATH"   # desnecessário se B-001 tiver sido corrigido
npm run build                        # deve terminar com "✓ built"
npm run dev                          # abrir http://localhost:5173
```
