# Relatório de QA e Privacidade — Testes.md

Este documento registra a etapa final de **Qualidade (QA), Segurança e Privacidade** do MVP **Nexus Delivery (iFoome Delivery)** para apresentação na **Kodie Academy**.

> **Critério de honestidade:** apenas cenários efetivamente executados e verificados nesta etapa são marcados como **Aprovado**. Fluxos que dependem de autenticação interativa Google/Firebase Auth em navegador real ou de publicação no Console do Firebase estão explicitamente sinalizados como **Verificado por análise de código/regras — pendente validação interativa autenticada** ou **Pendente configuração externa**.

---

## 1. Resumo da Metodologia Executada

Durante esta etapa foram realizadas as seguintes verificações reais no projeto:

1. **Verificação de compilação e tipagem (`npm run build` e `npm run lint` / `tsc --noEmit`)**, incluindo simulação de publicação em subcaminho do GitHub Pages (`VITE_BASE_PATH=/ifoome/ npm run build`).
2. **Validação estática das regras do Firestore (`npx eslint firestore.rules`)** com `@firebase/eslint-plugin-security-rules`.
3. **Auditoria de dependências (`bun audit`)** e varredura de vazamento de segredos no código-fonte (`src/`) e no bundle compilado (`dist/`).
4. **Testes automatizados de regras de negócio (`npx tsx`)** cobrindo cálculo do resumo diário, exclusão de pedidos cancelados e de datas anteriores, máquina de estados dos pedidos, rótulos de entrega vs. retirada e formatação de WhatsApp.
5. **Testes reais de endpoints HTTP no servidor (`http://localhost:3000`)**: rotas públicas (`/` e `/Privacidade.html`), saúde da API (`/api/health`) e rota de IA (`/api/ai/describe-dish`) com carga válida, vazia e acima do limite.
6. **Revisão linha a linha de UI, responsividade, acessibilidade, privacidade e regras de segurança** em todos os componentes públicos, administrativos e serviços Firebase.

---

## 2. Cenários Testados e Resultados

### 2.1 Fluxo do Cliente (Área Pública)

| ID | Cenário Testado | Método | Resultado | Observações |
| :--- | :--- | :--- | :--- | :--- |
| **CLI-01** | Carregamento da vitrine pública (`/`) e página de privacidade (`/Privacidade.html`) | HTTP real (`curl`) + build Vite | **Aprovado** | Ambas as rotas responderam `HTTP 200` localmente e foram geradas em `dist/index.html` e `dist/Privacidade.html` (incluindo `VITE_BASE_PATH=/ifoome/`). |
| **CLI-02** | Exibição exclusiva de produtos disponíveis no cardápio público | Revisão `PublicMenuPage.tsx` + `dataStore.ts` + `firestore.rules` | **Aprovado** | Consulta usa `where('available', '==', true)` combinada à regra `products` que exige `available == true` para leitura pública. |
| **CLI-03** | Seleção de pratos, alteração de quantidades, observações e remoção da sacola | Revisão `PublicMenuPage.tsx` | **Aprovado** | Adição direta e via modal de detalhes com observação por item (`maxLength=300`), limites `1..99` por item e até `50` linhas, além de remoção instantânea. |
| **CLI-04** | Cálculo automático de subtotal, taxa de entrega vs. retirada grátis e total | Revisão `PublicMenuPage.tsx`, `CheckoutView.tsx` e `dataStore.ts` | **Aprovado** | `Entrega` soma `store.deliveryFee`; `Retirada` zera a taxa (`0`) e omite o campo `address`. |
| **CLI-05** | Preenchimento de dados pessoais, persistência local e limpeza manual | Revisão `CheckoutView.tsx` + `customerStorage.ts` | **Aprovado** | Nome, telefone, endereço e preferências salvos localmente (`localStorage`) com botão *“Limpar dados salvos”*; dados sensíveis de pagamento/senhas não são armazenados. |
| **CLI-06** | Validações no checkout (nome, telefone DDD, endereço na entrega, troco >= total) | Revisão `CheckoutView.tsx` + `dataStore.ts` | **Aprovado** | Ajustado na etapa de QA para validar mínimo de 2 caracteres em Rua/Bairro, limite máximo de troco (`R$ 100.000,00`) e limites de caracteres compatíveis com o Firestore. |
| **CLI-07** | Persistência do pedido no Firestore, tela de confirmação e encaminhamento no WhatsApp | Revisão `dataStore.ts`, `OrderConfirmationView.tsx` + `tsx` | **Verificado em código — pendente teste ponta a ponta autenticado em produção** | A criação pública usa `setDoc` respeitando `isValidOrderCreate` e gera link `wa.me` formatado; requer validação visual no navegador com a loja aberta no Firebase. |

### 2.2 Fluxo do Proprietário (`Seu Raimundo`)

| ID | Cenário Testado | Método | Resultado | Observações |
| :--- | :--- | :--- | :--- | :--- |
| **ADM-01** | Proteção da área administrativa com Firebase Auth + senha administrativa | Revisão `App.tsx`, `AdminLoginView.tsx`, `authService.ts`, `firestore.rules` | **Aprovado (estático)** | Painel e assinaturas administrativas (`orders`, todos os `products`) só são montados após `authUser` e `adminUnlocked === true`. Fluxo interativo Google Sign-In requer execução manual com conta autorizada no navegador. |
| **ADM-02** | Visualização do Dashboard e Resumo Diário | Revisão `AdminDashboard.tsx` + teste `tsx` | **Aprovado** | `calculateDailySummary` filtra corretamente apenas o dia local atual, contabiliza fila ativa e soma o faturamento excluindo `Cancelado`. |
| **ADM-03** | Cadastro, edição, troca de disponibilidade e exclusão de pratos | Revisão `AdminMenu.tsx` + `dataStore.ts` + `storageService.ts` | **Verificado em código — pendente teste interativo autenticado** | Validações de nome (`2..120`), preço (`0,01..10.000`), descrição (`<=500`), URL segura e limpeza de imagem antiga no Storage foram verificadas no código. |
| **ADM-04** | Consulta de pedidos recebidos, detalhes, alteração de status e WhatsApp ao cliente | Revisão `AdminOrders.tsx`, `WhatsAppStatusModal.tsx` + teste `tsx` | **Aprovado (lógica) / Pendente E2E autenticado** | `canTransitionOrderStatus` impede saltos ou reabertura de pedidos finalizados; mensagens de status testadas via `tsx`; escrita real depende de sessão admin autenticada. |
| **ADM-05** | Notificações em tempo real (visual + alerta sonoro) e configurações da loja | Revisão `App.tsx`, `notifications.ts`, `AdminSettings.tsx` | **Aprovado (estático)** | Som via Web Audio API com controle de silenciar/ativar e notificação nativa ao clicar para focar o pedido; persistência em `restaurants/default`. |

### 2.3 Regras de Negócio (`Regras-de-Negocio.md`)

| Regra | Cenário Testado | Método | Resultado |
| :--- | :--- | :--- | :--- |
| **RN-01 / RN-03** | Produto sem nome, nome curto (<2), preço negativo/zero ou acima de R$ 10.000 | Revisão `AdminMenu.tsx` + `firestore.rules` | **Aprovado** |
| **RN-02** | Bloqueio de pedidos quando loja está fechada (`isOpen === false`) | Revisão `PublicMenuPage.tsx`, `CheckoutView.tsx`, `dataStore.ts`, `firestore.rules` (`getAfter`) | **Aprovado** |
| **RN-03** | Pedido sem itens ou contendo item pausado/indisponível durante o uso | Revisão `PublicMenuPage.tsx` (`syncedCart`), `CheckoutView.tsx` (`enrichedCart`) e `dataStore.createOrder` | **Aprovado** |
| **RN-04** | Entrega exige endereço completo; retirada zera taxa e não envia endereço | Revisão `CheckoutView.tsx`, `dataStore.ts`, `firestore.rules` | **Aprovado** |
| **RN-05** | Transições válidas de status e bloqueio de alteração após `Concluído` / `Cancelado` | Teste unitário `tsx` + `firestore.rules` | **Aprovado** |
| **RN-06** | Resumo diário ignora pedidos `Cancelado` e pedidos de datas diferentes | Teste unitário `tsx` (`calculateDailySummary`) | **Aprovado** |

### 2.4 Segurança e Privacidade (LGPD)

| ID | Verificação | Método | Resultado | Observações |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | Regras do Firestore válidas e seguras | `npx eslint firestore.rules` | **Aprovado** | Sem alertas de segurança. Leitura pública bloqueada em `orders`, `admins`, `adminSecurity`. |
| **SEC-02** | Ausência de chaves privadas no código cliente e bundle final | `grep` em `src/` e `dist/` | **Aprovado** | `GEMINI_API_KEY` usada exclusivamente em `server.ts`. |
| **SEC-03** | Sanitização de URLs de imagens/logos contra esquemas inseguros | Revisão `assetResolver.ts`, `AdminMenu.tsx`, `AdminSettings.tsx` | **Aprovado** | Bloqueio explícito a `javascript:`, `vbscript:`, `file:` e `data:` não-imagem. |
| **SEC-04** | Sanitização de logs e mensagens de erro sem exposição de dados pessoais | Revisão `firebase.ts`, `ErrorBoundary.tsx`, `server.ts` | **Aprovado** | Removido e-mail/UID de logs de erro no Firestore; erros da UI exibem mensagens amigáveis em português. |
| **SEC-05** | Política de privacidade clara e acessível para o cliente | Criação de `Privacidade.html` + link no rodapé e checkout | **Aprovado** | Explica dados coletados, finalidade, acesso restrito, proteções e pontos de atenção. |
| **SEC-06** | Auditoria de dependências | `bun audit` | **Aprovado com ressalva** | 2 alertas transitivos em `@grpc/grpc-js` (subdependência Node de `firebase`); não afetam o cliente web no navegador. |

### 2.5 Inteligência Artificial (`POST /api/ai/describe-dish`)

| ID | Cenário Testado | Método | Resultado | Resposta Observada |
| :--- | :--- | :--- | :--- | :--- |
| **IA-01** | Geração de descrição coerente com prato e ingredientes informados | Requisição HTTP real em `localhost:3000` | **Aprovado** | Retornou `HTTP 200` com descrição curta em PT-BR destacando apenas bife acebolado, arroz, feijão, batata frita e salada. |
| **IA-02** | Edição humana antes da publicação | Revisão `AdminMenu.tsx` | **Aprovado** | Texto é inserido no campo editável `#dish-description` com aviso para revisar/editar antes de salvar. |
| **IA-03** | Validação de campos vazios e textos acima do limite | Requisição HTTP real (`node fetch`) | **Aprovado** | Retornou `HTTP 400` com mensagens claras em português tanto para campos vazios quanto para nome acima de 120 caracteres. |
| **IA-04** | Fallback seguro sem chave de API ou em hospedagem estática (GitHub Pages) | Revisão `server.ts` + `aiService.ts` | **Aprovado** | Retorna orientação amigável para preencher manualmente sem impedir cadastro, edição ou pedidos. |

### 2.6 Interface, Responsividade e Acessibilidade

| ID | Verificação | Método | Resultado | Observações |
| :--- | :--- | :--- | :--- | :--- |
| **UI-01** | Navegação e alvos de toque mínimos (`>= 40px/44px`), contraste escuro/laranja e rótulos | Revisão de componentes (`PublicMenuPage`, `CheckoutView`, `AdminLayout`, `AdminOrders`, `AdminMenu`, `AdminSettings`) | **Aprovado (revisão de código)** | Botões principais com `min-h-[44px]`/`min-h-[48px]`, `aria-label` em ações iconográficas, `tabular-nums` em valores financeiros e barra inferior móvel sem sobrepor o rodapé (`pb-24`). |
| **UI-02** | Inspeção visual em dispositivo móvel real / emulador Chromium | — | **Não executado automatizado** | Chromium/Playwright não estão instalados no ambiente atual; recomenda-se conferência rápida no DevTools mobile (`360px` e `390px`) durante o ensaio do Pitch Day. |

---

## 3. Problemas Identificados e Correções Realizadas

1. **`Privacidade.html` ausente e sem vínculo na interface** *(Alto — Privacidade/Entrega)*
   - **Problema:** Não havia página `Privacidade.html`, nem link no rodapé ou aviso de privacidade no checkout.
   - **Correção:** Criada a página responsiva `Privacidade.html`, configurada como entrada no `vite.config.ts` (garantindo emissão em `dist/Privacidade.html` inclusive com `VITE_BASE_PATH` do GitHub Pages), adicionado link no rodapé de `PublicMenuPage.tsx` e bloco informativo de privacidade em `CheckoutView.tsx`.
2. **Desalinhamento de limites entre formulários/carrinho e `firestore.rules`** *(Médio — Regra de Negócio/Estabilidade)*
   - **Problema:** O cliente conseguia digitar endereços de 1 caractere, valores de troco acima de `R$ 100.000`, quantidades acima de `99`, mais de `50` itens no carrinho ou preços/taxas acima do limite do Firestore, o que causaria rejeição genérica no banco.
   - **Correção:** Sincronizados `maxLength`, limites numéricos e validações amigáveis em `PublicMenuPage.tsx`, `CheckoutView.tsx`, `AdminMenu.tsx`, `AdminSettings.tsx` e `dataStore.ts` (`createOrder`).
3. **Logs de erro do Firestore continham e-mail e UID do usuário** *(Médio — Privacidade)*
   - **Problema:** `handleFirestoreError` em `src/firebase.ts` incluía `email`, `userId` e `providerInfo` no `console.error` e na exceção lançada.
   - **Correção:** Sanitizado `handleFirestoreError` para registrar apenas código/mensagem do erro, operação, caminho e indicador booleano `signedIn`.
4. **Aceitação de esquemas de URI potencialmente inseguros em imagens/logos** *(Médio — Segurança)*
   - **Problema:** `resolveBundledAssetUrl` (`src/utils/assetResolver.ts`) e os formulários de produto/loja não bloqueavam explicitamente `javascript:`, `vbscript:` ou `data:text/html`.
   - **Correção:** Adicionado bloqueio de esquemas inseguros em `assetResolver.ts`, `AdminMenu.tsx` e `AdminSettings.tsx`.
5. **Validação de tamanho na rota de IA e rejeições silenciosas no painel** *(Baixo — Segurança/Estabilidade)*
   - **Problema:** `POST /api/ai/describe-dish` aceitava payloads JSON de até `1mb` sem checar comprimento dos textos, e ações administrativas em `App.tsx` não exibiam alerta visual se o Firestore falhasse.
   - **Correção:** Reduzido limite JSON para `16kb`, adicionado limite de caracteres no endpoint (`server.ts`), ocultado código HTTP interno no erro `500` e adicionado alerta visual descartável no painel administrativo (`src/App.tsx`).

---

## 4. Problemas / Limitações Remanescentes e Configurações Externas Pendentes

1. **Publicação de regras e domínios no Console do Firebase *(Configuração externa pendente)*:**
   - Garantir que `firestore.rules` e `storage.rules` estejam publicadas no projeto `i-foome-delivery`, que o **Firebase Storage** esteja ativado e que o domínio do **GitHub Pages** esteja cadastrado em **Authentication → Settings → Authorized domains**.
2. **Alteração da senha administrativa provisória *(Ação operacional do proprietário)*:**
   - Antes de divulgar o link ao público real, acessar **Área do estabelecimento → Configurações** e definir uma senha administrativa forte e definitiva.
3. **Limitação estrutural de `storage.rules` e múltiplos itens no Firestore *(Limitação conhecida documentada)*:**
   - `storage.rules` exige autenticação (`request.auth != null`), sem verificar papel de administrador via Firestore (limitação para bancos nomeados); recomenda-se manter o cadastro de contas restrito aos responsáveis pelo restaurante.
   - `firestore.rules` valida estruturalmente o primeiro item da lista `items[0]` pela ausência de laços na linguagem de regras; todos os demais itens são validados no cliente (`dataStore.ts`) antes da gravação.
4. **Assistente de IA no GitHub Pages *(Limitação de hospedagem estática)*:**
   - No GitHub Pages (somente estático), o botão de IA informa amigavelmente a indisponibilidade sem afetar nenhum fluxo de cardápio ou pedidos; com servidor Node.js (`localhost` ou hospedagem full-stack) e `GEMINI_API_KEY` configurada, o recurso opera normalmente.
5. **Dependência transitiva `@grpc/grpc-js` no `bun audit` *(Baixo impacto em SPA navegador)*:**
   - Subdependência do pacote `firebase` usada apenas em ambientes Node gRPC, sem execução direta no navegador do cliente.
