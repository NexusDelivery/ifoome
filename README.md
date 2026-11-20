# iFoome Delivery

**iFoome Delivery** é uma aplicação web responsiva voltada para pequenos restaurantes, marmitarias e estabelecimentos de alimentação que atualmente recebem pedidos principalmente pelo WhatsApp, sem possuir um cardápio digital ou um sistema organizado para administrar suas vendas.

Este projeto faz parte de um desafio prático promovido pela **Kodie Academy** para o desenvolvimento de um MVP funcional com auxílio de inteligência artificial, conduzido de forma colaborativa e sequencial entre diferentes papéis de tecnologia (Product Owner, UX/UI Designer, AI Builder, Tech Lead e QA/Privacidade).

---

## 1. Problema que pretendemos resolver

Pequenos restaurantes enfrentam dificuldades diárias para organizar pedidos recebidos por mensagens de texto e áudio. Na prática, isso gera:

- Pedidos esquecidos, duplicados ou registrados com informações incorretas.
- Dificuldade para acompanhar o andamento de cada pedido (o que está na fila, em preparo ou já saiu para entrega).
- Falta de organização e atualização rápida do cardápio do dia.
- Dificuldade para calcular com precisão a quantidade de pedidos e o total vendido no dia.
- Forte dependência de anotações manuais em papel ou blocos de notas.

O **iFoome Delivery** simplifica essa rotina ao oferecer uma ferramenta digital acessível, intuitiva e focada no essencial.

---

## 2. Persona principal

**Seu Raimundo** é proprietário de uma pequena marmitaria que vende aproximadamente **60 marmitas por dia**. Atualmente, ele recebe pedidos pelo WhatsApp, anota as informações manualmente e administra sozinho a produção e o despacho das entregas.

Ele não possui familiaridade com sistemas administrativos complexos e precisa de uma solução que possa operar diretamente pelo celular, inclusive nos horários de pico da cozinha.

> **Pergunta central de produto:**
> *"Seu Raimundo consegue utilizar o sistema sozinho no celular, com a cozinha cheia?"*

Todas as decisões de fluxo, interface e arquitetura devem responder positivamente a essa pergunta.

---

## 3. Objetivo da aplicação

Desenvolver uma aplicação web responsiva (*mobile-first*) que permita ao proprietário administrar seu cardápio, receber pedidos de clientes de forma estruturada, acompanhar o andamento das entregas e consultar um resumo diário das vendas, sem complexidade operacional ou necessidade de infraestrutura onerosa.

---

## 4. Áreas do sistema

O sistema será dividido em duas áreas principais e complementares:

### Área Administrativa (Proprietário)
Utilizada pelo dono do estabelecimento (como o Seu Raimundo), diretamente pelo celular ou computador, para:
- Cadastrar, editar, ativar/pausar e remover pratos do cardápio digital.
- Visualizar pedidos recebidos em tempo real ou de forma organizada por fila/status.
- Atualizar rapidamente o status de cada pedido com poucos toques.
- Consultar o resumo diário de vendas (quantidade de pedidos e faturamento do dia).
- Configurar informações básicas do estabelecimento (nome, funcionamento, telefone/WhatsApp de contato, taxa de entrega ou retirada, conforme escopo do MVP).

### Área Pública (Clientes)
Utilizada pelos clientes finais para:
- Consultar o cardápio digital atualizado diretamente pelo navegador (sem precisar baixar aplicativo ou criar conta/login).
- Selecionar pratos, quantidades e observações simples.
- Informar dados básicos de entrega/retirada e finalizar o pedido de forma rápida e clara.
- Utilizar o WhatsApp como canal complementar para encaminhamento ou confirmação de comunicação, quando aplicável.

---

## 5. Funcionalidades previstas para o MVP

O MVP prioriza simplicidade, usabilidade no celular e confiabilidade nas operações principais:

1. **Cardápio digital editável pelo proprietário**
   - Cadastro e gerenciamento de itens (nome, descrição, preço, categoria/disponibilidade).
2. **Página pública para realização de pedidos**
   - Visualização clara dos pratos disponíveis e envio do pedido sem exigência de cadastro do cliente.
3. **Painel administrativo de pedidos**
   - Acompanhamento organizado e atualização ágil do status de cada pedido.
   - **Status obrigatórios:**
     - `Recebido`
     - `Em preparo`
     - `Saiu para entrega`
   - **Status complementares opcionais** (desde que não prejudiquem a simplicidade): confirmação, conclusão (`Concluído`) ou cancelamento (`Cancelado`).
4. **Resumo diário de vendas**
   - Exibição objetiva da quantidade de pedidos do dia e do valor total vendido.

---

## 6. Funcionalidade opcional de Inteligência Artificial

De forma complementar e não bloqueante para o funcionamento central do sistema, o iFoome Delivery poderá oferecer um **assistente de IA para criação de descrições comerciais de pratos**:

- O proprietário informa apenas o **nome do prato** e os **ingredientes principais**.
- A IA sugere uma descrição atrativa e comercial em português brasileiro.
- O proprietário pode revisar, editar ou ajustar o texto livremente antes de publicar no cardápio.
- Caso a funcionalidade de IA esteja indisponível, o cadastro e a edição manual dos pratos continuam funcionando normalmente.

---

## 7. Diretrizes gerais de produto e engenharia

- **Simplicidade, beleza e funcionalidade:** foco absoluto no uso prático durante o expediente.
- **Experiência mobile-first:** telas pensadas prioritariamente para uso confortável com uma mão no celular.
- **Idioma:** todos os textos da interface em **português brasileiro**.
- **Foco no essencial:** evitar excesso de informações, telas burocráticas ou recursos desnecessários.
- **Identidade visual consistente:** coerência de cores, tipografia e componentes em todas as telas.
- **Acessibilidade e baixo custo:** priorizar soluções que não exijam contratação imediata de serviços pagos.
- **Preservação evolutiva:** manter o que já funciona entre as etapas, evoluindo o código gradualmente e sempre analisando o estado atual do projeto antes de alterar algo.

---

## 8. Limites do escopo

Para garantir a entrega de um MVP funcional e enxuto, **não** fazem parte do escopo inicial:

- Aplicativo mobile nativo (iOS/Android).
- Rastreamento de entregadores em tempo real via mapa/GPS.
- Integração com marketplaces ou plataformas externas de delivery.
- Pagamentos online integrados (gateway de cartão/Pix automatizado).
- Sistema completo de gestão financeira, estoque ou ERP.
- Programa de fidelidade ou cupons avançados.
- Integração oficial paga com a API do WhatsApp (WhatsApp Business API).

> **Observação:** O WhatsApp poderá ser utilizado apenas como canal complementar (ex.: links de encaminhamento/mensagem pronta) para comunicação e apoio ao fluxo de pedidos.

---

## 9. Etapas previstas para o desenvolvimento

O projeto será construído de maneira incremental ao longo de cinco etapas subsequentes, preservando todas as decisões documentadas neste arquivo:

| Etapa | Papel | Foco principal |
| :--- | :--- | :--- |
| **Prompt 1** | **Product Owner** | Definição de requisitos, regras de negócio, fluxos, histórias de usuário e critérios de aceite do MVP. |
| **Prompt 2** | **UX/UI Designer** | Identidade visual, arquitetura de informação, experiência mobile-first e prototipação/estrutura das telas. |
| **Prompt 3** | **AI Builder** | Implementação e integração do assistente de IA para geração de descrições comerciais de pratos. |
| **Prompt 4** | **Tech Lead** | Arquitetura técnica, persistência de dados, organização do código, integração ponta a ponta e estabilidade. |
| **Prompt 5** | **QA e Privacidade** | Revisão de qualidade, testes dos fluxos principais, tratamento de erros, segurança e boas práticas de privacidade/LGPD. |

---

## 10. Documentação de Produto (Etapa 1 — Product Owner)

As especificações detalhadas do MVP estão documentadas nos seguintes arquivos de referência:

- [`PRD.md`](./PRD.md) — Requisitos funcionais (Cardápio, Pedidos, Resumo Diário e IA complementar), requisitos não funcionais e matriz de priorização.
- [`Regras-de-Negocio.md`](./Regras-de-Negocio.md) — Regras de disponibilidade, loja aberta/fechada, taxa de entrega vs. retirada, validações de pedido, ciclo de status e cálculo de vendas.
- [`Fluxos-do-Usuario.md`](./Fluxos-do-Usuario.md) — Jornadas passo a passo do proprietário (Seu Raimundo) e do cliente, além dos fluxos de exceção.

### Definições padrão consolidadas para o MVP
- **Status dos pedidos:** `Recebido` → `Em preparo` → `Saiu para entrega` *(ou `Pronto para retirada` quando retirada no local)* → `Concluído` / `Cancelado`.
- **Categorias iniciais do cardápio:** `Marmitas`, `Pratos do Dia`, `Acompanhamentos`, `Bebidas`, `Sobremesas`.
- **Formas de pagamento aceitas:** `Pix`, `Dinheiro` (com campo opcional de troco) e `Cartão (Débito/Crédito)` no ato da entrega/retirada.
- **Entrega e retirada:** Entrega com taxa fixa configurável (padrão inicial: `R$ 5,00`) e endereço obrigatório; Retirada no local gratuita (`R$ 0,00`) sem exigência de endereço.

---

## 11. Identidade Visual e UX/UI (Etapa 2 — UX/UI Designer)

### Identidade de Marca e Paleta
- **Marca:** **iFoome Delivery** com símbolo próprio (*cloche* estilizado) e destaque tipográfico para **iFoome**.
- **Paleta oficial:**
  - Laranja Energia: `#F47B35` (ações de adição, destaques positivos e ícones de apoio)
  - Vermelho Apetite: `#D94B3D` (botões primários de conversão, marca e alertas ativos)
  - Creme Acolhedor: `#FFF8EF` (fundo principal leve para leitura confortável)
  - Marrom Escuro: `#382B25` (tipografia principal de alto contraste e cabeçalhos)
- **Tipografia:** `Bricolage Grotesque` para títulos e marca + `Plus Jakarta Sans` para textos e formulários, com algarismos tabulares (`tabular-nums`) em todos os preços, códigos e indicadores.

### Arquitetura de Navegação e Responsividade
- **Área Pública (Cliente):** cabeçalho enxuto, banner do estabelecimento, filtros por categoria e busca, grade de pratos disponíveis, modal de detalhes/observações, sacola lateral/sheet, tela dedicada de finalização e tela de confirmação com link complementar para WhatsApp.
- **Área Administrativa (Seu Raimundo):** menu lateral fixo em telas grandes (`lg+`) e barra de abas inferior ergonômica no celular (zona natural do polegar, alvos de toque mínimos de `44px`), contemplando **Visão Geral**, **Pedidos**, **Cardápio** e **Configurações**.
- **Acessibilidade:** todos os status combinam ícone e texto explícito (nunca dependem apenas da cor), além de confirmações antes de ações destrutivas (cancelar pedido ou excluir prato).

---

## 12. Implementação Funcional e Assistente de IA (Etapa 3 — AI Builder)

### Funcionalidades Integradas em Operação
- **Cardápio Digital & Gestão de Produtos:** cadastro, edição, upload local/link de fotografia, categorias, validações de nome/preço, alternância de disponibilidade em 1 toque e reflexão imediata na vitrine pública.
- **Fluxo Público de Compra:** exibição exclusiva de pratos disponíveis, modal de detalhes com observações por item, sacola sincronizada em tempo real com preços e disponibilidade vigentes, checkout completo (Entrega com endereço obrigatório vs. Retirada gratuita; Pix, Dinheiro com troco validado e Cartão) e confirmação com código próprio.
- **Painel de Pedidos & Transições Seguras:** acompanhamento detalhado dos pedidos, atualização de status (`Recebido` → `Em preparo` → `Saiu para entrega` / `Pronto para retirada` → `Concluído`, além de `Cancelado`) com bloqueio de transições incoerentes.
- **Dashboard em Tempo Real:** indicadores calculados dinamicamente a partir dos pedidos registrados (*Pedidos recebidos no dia*, *Total vendido no dia* sem somar cancelados, *Aguardando atendimento*, *Pedidos em preparo*, *Enviados para entrega* e *Pedidos recentes*).
- **WhatsApp Complementar:** configuração do número comercial do restaurante nas Configurações e geração de link pronto (`wa.me`) + opção de copiar resumo do pedido na confirmação, com envio iniciado exclusivamente pelo usuário.
- **Assistente de IA para Descrições (`server.ts`):** rota server-side `POST /api/ai/describe-dish` usando `@google/genai` (`gemini-4-hydrogen`) para sugerir descrições comerciais editáveis a partir do nome e ingredientes, sem expor chave de API no navegador e com tratamento explícito de indisponibilidade/erros.

### Recursos Dependentes de Integração Externa / Próximas Etapas
- **Persistência em Nuvem / Banco de Dados:** os dados de cardápio, pedidos e configurações estão centralizados na camada `src/services/dataStore.ts` utilizando armazenamento local do navegador (`localStorage`) como ponte temporária até a integração definitiva na etapa de **Tech Lead**.
- **Chave da API de IA (`GEMINI_API_KEY`):** a geração de descrições por IA depende da variável `GEMINI_API_KEY` configurada no ambiente do servidor; caso ausente, o cadastro e a edição manual dos pratos continuam operando normalmente.

---

*Este documento serve como referência central de contexto para todas as etapas do desenvolvimento do **iFoome Delivery** e deverá ser atualizado conforme novas decisões forem consolidadas, preservando os princípios estabelecidos desde a concepção.*



