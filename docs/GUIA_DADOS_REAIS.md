# Guia — Usar os dados reais do Power BI no portal

Este guia é para o **notebook da empresa**. Siga as etapas na ordem.
Os dados reais ficam **só no notebook**: a pasta `public/real-data/` e o arquivo `.env.local` são ignorados pelo Git.

---

## Etapa 1 — Levar o código novo para o notebook da empresa

**Opção A: o projeto do notebook foi baixado do GitHub (`git clone`).**
Depois que o código novo for enviado ao GitHub (commit + push), abra o terminal na pasta do projeto e rode:
```bash
git pull
```

**Opção B: você copiou os arquivos manualmente.**
Copie estes arquivos do projeto original para o mesmo lugar no notebook:

| Arquivo | O que fazer |
|---|---|
| `src/services/csv/csvConfig.ts` | Arquivo novo: copiar |
| `src/services/csv/parseCsv.ts` | Arquivo novo: copiar |
| `src/services/csv/CsvOnboardingDataService.ts` | Arquivo novo: copiar |
| `src/services/index.ts` | Substituir |
| `src/types/models.ts` | Substituir |
| `src/components/layout/Sidebar.tsx` | Substituir |
| `.gitignore` | Substituir. As duas últimas linhas protegem os dados reais |
| `docs/` | Substituir a pasta inteira (documentação atualizada) |

> O `.gitignore` começa com ponto, e por isso fica oculto. No Finder do Mac, use `Cmd + Shift + .` para mostrar arquivos ocultos. No Windows Explorer, use **Exibir → Itens ocultos**.

---

## Etapa 2 — Exportar as tabelas do Power BI

São **2 arquivos**. A tabela "Upcoming Start" **não é necessária**: o portal monta a lista de próximos colaboradores a partir da tabela Employee, filtrando pela data de início.

1. No Power BI, abra a página onde fica a tabela **Employee**.
2. Passe o mouse sobre a tabela, clique nos **três pontinhos (…)** no canto e escolha **Exportar dados**.
3. Escolha **Dados resumidos** e o formato **.csv** (não `.xlsx`). Clique em **Exportar**.
4. Repita o processo com a tabela **Access**.

> **Atenção aos filtros:** a exportação respeita os filtros aplicados no Power BI. Para ver todos os colaboradores no portal, limpe os filtros antes de exportar.

---

## Etapa 3 — Colocar os arquivos no lugar certo

1. Dentro da pasta do projeto, entre em `public` e crie uma pasta chamada **`real-data`**.
2. Renomeie e mova os arquivos exportados:
   - tabela Employee → `public/real-data/employees.csv`
   - tabela Access → `public/real-data/accesses.csv`

O resultado deve ficar assim:
```
gdc-onboarding-portal/
└── public/
    ├── favicon.svg
    └── real-data/
        ├── employees.csv
        └── accesses.csv
```

---

## Etapa 4 — Ligar o modo "dados reais"

1. Na **raiz** do projeto (onde está o `package.json`), crie um arquivo chamado exatamente **`.env.local`**.
2. Escreva dentro dele esta única linha e salve:
   ```
   VITE_DATA_SOURCE=csv
   ```

Sem esse arquivo, o portal continua usando os dados fictícios. Para voltar a eles, basta apagar o `.env.local`.

---

## Etapa 5 — Conferir o nome das colunas

Abra `src/services/csv/csvConfig.ts`. Os nomes das colunas ali precisam ser **iguais** ao cabeçalho dos seus CSVs. Diferenças de maiúsculas e minúsculas não importam; diferenças de letras importam.

Para ver o cabeçalho, abra o CSV no Bloco de Notas ou no VS Code (não no Excel) e olhe a primeira linha.

Exemplo: se no seu arquivo a coluna se chama `Job Function` e não `Job Fuction`, ajuste a linha correspondente:
```ts
jobFunction: 'Job Function',
```

**Não precisa acertar de primeira.** Se algum nome estiver errado, o portal mostra na tela qual coluna não encontrou e a lista das colunas que existem no arquivo.

---

## Etapa 6 — Rodar o portal

No terminal, dentro da pasta do projeto:
```bash
npm run dev
```
Abra `http://localhost:5173`.

> Se o servidor já estava rodando, **pare-o com `Ctrl + C` e rode `npm run dev` de novo**. O `.env.local` só é lido quando o servidor inicia.

---

## Etapa 7 — Verificar os avisos

1. Com o portal aberto no navegador, aperte **F12**. No Mac, use `Cmd + Option + I`.
2. Clique na aba **Console**.
3. Procure a linha **`[Onboarding Portal] … data warning type(s)`** e clique nela para abrir.

Avisos possíveis:

| Aviso | O que significa | Como resolver |
|---|---|---|
| `Status not recognized — shown as Unverifiable` | Um status do Power BI não está na tradução | Adicione o texto exato em `STATUS_MAPPING` no `csvConfig.ts` |
| `Business unit not recognized` | A coluna de unidade não tem "EMS" nem "ESS" | Ajuste `BUSINESS_UNIT` no `csvConfig.ts` (qual coluna e quais textos) |
| `Access ignored: employee not found` | O nome em Access não bate com nenhum nome em Employee | Confira a grafia, ou se o colaborador está fora do filtro exportado |
| `Invalid or empty HR Start Date` | Data vazia ou em formato inesperado | Confira `DATE_ORDER` (`'DMY'` = 25/12/2026; `'MDY'` = 12/25/2026) |
| `Employee name appears more than once` | Há dois colaboradores com o mesmo nome | O portal usa a coluna Manager para desempatar. Confira o resultado |

Se não aparecer nenhum aviso, os dados foram lidos sem problemas.

---

## Etapa 8 — Atualizar os dados (rotina)

1. Exporte de novo as duas tabelas do Power BI.
2. Substitua `employees.csv` e `accesses.csv` em `public/real-data/`.
3. Atualize a página no navegador (F5).

---

## Como o portal interpreta cada coluna

**Employee → colaborador**
| Coluna do Power BI | No portal |
|---|---|
| Name | Nome |
| LAN ID | LAN ID (também é o identificador único) |
| Email | Email |
| Desktop | Dispositivo. Vazio, `-` ou `N/A` → "Not Assigned" |
| Department | Unidade de negócio (EMS/ESS). Configurável |
| Area | Lida, mas ainda não exibida |
| Job Function | Job title |
| Manager | Gestor. A lista de gestores é montada a partir desta coluna |
| HR Start Date | Data de início |
| Onboarding | **Não é usada.** O portal calcula o status de onboarding pelos acessos (regra D-004) |

**Access → acesso**
| Coluna do Power BI | No portal |
|---|---|
| Requested ID | Request ID. Se repetir, vira `REQ-1-2`, `REQ-1-3`… |
| Status Provisioning + Status Approval | Status do acesso (ver `STATUS_MAPPING`) |
| Group | Nome do acesso |
| Name | Liga o acesso ao colaborador (pelo nome ou pelo LAN ID) |
| Access Approval | Aprovador pendente (hipótese; ver abaixo) |
| Requestor Name | Requested by |
| Request Date | Data da solicitação |
| Manager | Usada só para desempatar nomes iguais |

---

## Pontos ainda não confirmados

- **"Access Approval":** considerei que é o nome de quem precisa aprovar. Se for outra coisa, avise.
- **Valores de status:** a tradução em `STATUS_MAPPING` foi escrita sem conhecer os valores reais. Os avisos da Etapa 7 mostram quais faltam.
- **Committed:** o relatório não informa se a disponibilidade foi confirmada. Por padrão, Committed **não** conta como concluído (`COMMITTED_COUNTS_AS_CONFIRMED = false`).
- **Status de onboarding:** o valor calculado pelo portal pode **diferir** da coluna "Onboarding" do Power BI. Compare alguns colaboradores.
- **Barra lateral:** no modo de dados reais, o aviso muda para "Data from a Power BI export (local file)".
