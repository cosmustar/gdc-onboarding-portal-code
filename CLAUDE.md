# Regras de trabalho neste projeto

GDC Brazil | Onboarding Portal: protótipo React + TypeScript + Vite com dados fictícios. A interface fica em **inglês**; a conversa e a documentação ficam em **português**.

## Ao iniciar qualquer conversa
Leia, nesta ordem:
1. `docs/CURRENT_STATE.md`
2. `docs/PROJECT_CONTEXT.md`
3. `docs/DECISIONS.md`
4. `docs/BUGS_AND_FIXES.md`
5. `docs/CHANGELOG.md` (quando precisar do histórico)

Depois, rode `git log --oneline -5` e `git status`, e confira se o código ainda corresponde à documentação. Mudanças feitas pelo usuário fora das conversas devem ser registradas no CHANGELOG, com o motivo marcado como "não registrado" se ele não for informado.

## Antes de alterar código
- Consulte as decisões e os erros relacionados e inspecione os arquivos envolvidos.
- Identifique os impactos em outras funcionalidades.
- Faça alterações localizadas; não reescreva componentes inteiros sem necessidade.
- Preserve o comportamento existente, salvo pedido explícito.

## Depois de uma alteração significativa
- Atualize `CHANGELOG.md`, `CURRENT_STATE.md` e, se aplicável, `DECISIONS.md` e `BUGS_AND_FIXES.md`.
- Registre os testes **efetivamente executados** e seus resultados.
- Finalize com o relatório: O que foi feito / Por que / Arquivos modificados / Testes / Pendências / Documentação.

## Regras contra informações inventadas
- Verifique o código e os documentos antes de afirmar que algo existe, foi testado ou foi decidido.
- Diferencie **fato documentado** de **hipótese**, e rotule hipóteses como tal.
- Sem registro, responda: "Não encontrei um registro que confirme essa informação."
- Não atribua ao usuário decisões que ele não confirmou. Escolhas do desenvolvedor ficam como "Proposta (implementada)".
- Não use datas inventadas. Sem data, escreva "não informada".
- Não marque um bug como corrigido sem um teste que confirme.

## Proteção do histórico
- Nunca apague registros antigos sem autorização. Para corrigir um registro, acrescente uma nota de correção datada.
- Nunca registre senhas, tokens, credenciais ou dados corporativos reais.

## Ambiente
- O Node.js fica em `~/node/bin` e pode não estar no PATH. Prefixe os comandos com `export PATH="$HOME/node/bin:$PATH" &&`.
- Build: `npm run build`. Desenvolvimento: `npm run dev` (http://localhost:5173).
- Não instale software no sistema sem permissão.
