# PRD — Documento de Requisitos do Produto | iFoome Delivery

## 1. Visão Geral do Produto

O **iFoome Delivery** é uma aplicação web responsiva (*mobile-first*) criada para pequenos restaurantes e marmitarias que hoje recebem pedidos pelo WhatsApp de forma desorganizada.

**Persona principal:** **Seu Raimundo**, dono de uma marmitaria que vende cerca de 60 marmitas por dia e opera sozinho na cozinha e nas entregas pelo celular.

**Critério norteador de todas as decisões:**
> *"Seu Raimundo consegue utilizar o sistema sozinho no celular, com a cozinha cheia?"*

---

## 2. Objetivos do Produto

1. Substituir anotações manuais por um cardápio digital claro e um fluxo estruturado de pedidos.
2. Permitir que clientes façam pedidos rapidamente pelo navegador, sem precisar criar conta ou baixar aplicativo.
3. Oferecer ao proprietário um painel simples para acompanhar pedidos, atualizar status com poucos toques e visualizar o resumo diário de vendas.
4. Garantir confiabilidade nos valores e informações dos pedidos, evitando erros de digitação, esquecimentos e somas incorretas.

---

## 3. Escopo e Definições Padrão do MVP

Para viabilizar a rotina do Seu Raimundo sem complexidade, adotam-se as seguintes definições padrão iniciais (configuráveis posteriormente pelo proprietário):

- **Categorias iniciais do cardápio:** `Marmitas`, `Pratos do Dia`, `Acompanhamentos`, `Bebidas`, `Sobremesas`.
- **Status dos pedidos:**
  - `Recebido` *(obrigatório)*
  - `Em preparo` *(obrigatório)*
  - `Saiu para entrega` *(obrigatório — exibido com indicação contextual "Pronto para retirada" quando o pedido for de retirada no balcão)*
  - `Concluído` *(complementar para encerrar o ciclo e limpar a fila ativa)*
  - `Cancelado` *(complementar para descartar pedidos inválidos/desistências do faturamento)*
- **Modalidades de atendimento:** `Entrega` (taxa fixa configurável; padrão inicial **R$ 5,00**) e `Retirada no local` (taxa **R$ 0,00**).
- **Formas de pagamento aceitas (presenciais na entrega/retirada):** `Pix`, `Dinheiro` (com campo opcional de troco) e `Cartão (Débito/Crédito)`.
- **Estado da loja:** Controle simples `Aberta` / `Fechada` (padrão inicial: `Aberta`).

---

## 4. Requisitos Funcionais (RF)

### Grupo A — Cardápio Digital

| ID | Requisito | Perfil | Descrição e Critérios |
| :--- | :--- | :--- | :--- |
| **RF-A01** | Visualizar produtos cadastrados | Proprietário | Listar todos os pratos cadastrados no painel administrativo, mostrando foto, nome, categoria, preço e status de disponibilidade (`Disponível` / `Indisponível`). |
| **RF-A02** | Adicionar novos pratos | Proprietário | Permitir cadastrar um prato informando: **nome** (obrigatório), **preço** (obrigatório, > 0), **categoria** (obrigatória), **ingredientes** (opcional/recomendado), **descrição** (opcional) e **fotografia** (opcional, com imagem padrão de apoio se não informada). |
| **RF-A03** | Editar informações dos pratos | Proprietário | Permitir alterar qualquer campo de um produto existente (nome, descrição, ingredientes, preço, categoria, foto e disponibilidade) sem afetar pedidos já finalizados anteriormente. |
| **RF-A04** | Excluir produtos | Proprietário | Permitir remover um produto do cardápio mediante confirmação simples para evitar exclusão acidental no celular. |
| **RF-A05** | Organizar por categorias | Proprietário / Cliente | Agrupar os itens por categoria tanto na administração quanto na vitrine pública para facilitar a navegação rápida. |
| **RF-A06** | Alternar disponibilidade rapidamente | Proprietário | Permitir marcar um item como `Disponível` ou `Indisponível` com apenas um toque direto na listagem do cardápio (ideal para quando acaba um prato no meio do almoço). |
| **RF-A07** | Exibição pública filtrada | Cliente | Exibir na página pública **somente os produtos marcados como disponíveis**. Itens indisponíveis não devem aparecer para compra. |

### Grupo B — Pedidos

| ID | Requisito | Perfil | Descrição e Critérios |
| :--- | :--- | :--- | :--- |
| **RF-B01** | Acesso sem cadastro | Cliente | Permitir que qualquer cliente acesse o cardápio público e realize pedidos sem login, senha ou criação de conta. |
| **RF-B02** | Seleção de produtos e quantidades | Cliente | Permitir adicionar itens ao carrinho, aumentar/diminuir quantidades e remover itens facilmente. |
| **RF-B03** | Observações no pedido | Cliente | Permitir inserir observações livres (por item ou no pedido geral, ex.: *"sem cebola"*, *"pouco arroz"*). |
| **RF-B04** | Carrinho e cálculo de total | Cliente | Exibir resumo claro dos itens selecionados, quantidades, subtotal, taxa de entrega (quando aplicável) e **valor total** calculado automaticamente. |
| **RF-B05** | Dados do cliente | Cliente | Exigir preenchimento de **nome** e **telefone/WhatsApp** válidos antes de finalizar o pedido. |
| **RF-B06** | Modalidade de atendimento e endereço | Cliente | Permitir escolher entre **Entrega** ou **Retirada no estabelecimento**. Quando escolher **Entrega**, exigir preenchimento do **endereço** (rua/logradouro, número e bairro; complemento/referência opcionais). Quando escolher **Retirada**, ocultar/dispensar endereço e aplicar taxa R$ 0,00. |
| **RF-B07** | Forma de pagamento | Cliente | Exigir seleção de uma forma de pagamento (`Pix`, `Dinheiro` ou `Cartão`). Se escolher `Dinheiro`, disponibilizar campo opcional *"Troco para quanto?"*. |
| **RF-B08** | Finalização e confirmação do pedido | Cliente | Validar todos os dados obrigatórios, registrar o pedido com número identificador único, timestamp e *snapshot* dos preços, exibindo tela de confirmação com resumo completo (e botão opcional para enviar resumo via WhatsApp). |
| **RF-B09** | Painel de acompanhamento de pedidos | Proprietário | Exibir os pedidos ordenados do mais recente ao mais antigo (ou agrupados por status), mostrando código, horário, nome/telefone do cliente, itens, observações, tipo (entrega/retirada), endereço, forma de pagamento, total e status atual. |
| **RF-B10** | Atualização ágil de status | Proprietário | Permitir avançar ou alterar o status do pedido (`Recebido` → `Em preparo` → `Saiu para entrega` → `Concluído`, além de `Cancelado`) com botões grandes e fáceis de tocar no celular. |

**Garantias de integridade dos pedidos (prevenção de erros):**
- Bloqueio de envio com carrinho vazio ou com loja fechada.
- Bloqueio de finalização se algum item do carrinho tiver sido marcado como indisponível durante a navegação.
- Validação obrigatória dos campos conforme modalidade escolhida (ex.: endereço obrigatório apenas para Entrega).
- Preços dos itens e taxa de entrega recalculados pela tabela oficial vigente no momento do fechamento (nunca confiando em valores alterados manualmente pelo navegador), gravando uma cópia fixa (*snapshot*) dos valores dentro do pedido.

### Grupo C — Resumo Diário

| ID | Requisito | Perfil | Descrição e Critérios |
| :--- | :--- | :--- | :--- |
| **RF-C01** | Quantidade de pedidos recebidos no dia | Proprietário | Exibir o total de pedidos válidos recebidos na data atual (excluindo cancelados da contagem de vendas, com indicação opcional separada se cancelados). |
| **RF-C02** | Total vendido no dia | Proprietário | Somar o valor total (`total`) exclusivamente dos pedidos válidos do dia atual (status `Recebido`, `Em preparo`, `Saiu para entrega` e `Concluído`). **Pedidos `Cancelado` nunca são somados.** |
| **RF-C03** | Pedidos em andamento | Proprietário | Exibir quantos pedidos estão ativos no momento (`Recebido`, `Em preparo` e `Saiu para entrega`) para Seu Raimundo saber imediatamente a carga da cozinha e entregas. |
| **RF-C04** | Histórico simples de pedidos | Proprietário | Listar os pedidos do dia (e filtro simples para visualizar concluídos/cancelados), exibindo horário, cliente, modalidade, valor e status final. |

### Grupo D — Configurações Básicas e IA Complementar

| ID | Requisito | Perfil | Descrição e Critérios |
| :--- | :--- | :--- | :--- |
| **RF-D01** | Configuração essencial da loja | Proprietário | Permitir definir nome do estabelecimento, telefone/WhatsApp de contato, taxa de entrega padrão (R$) e alternar rapidamente entre **Loja Aberta** e **Loja Fechada**. |
| **RF-D02** | Assistente de IA para descrição de pratos *(Complementar)* | Proprietário | Ao cadastrar ou editar um prato, permitir clicar em *"Gerar descrição com IA"* usando o nome e os ingredientes informados. A sugestão é exibida no campo de descrição para revisão/edição antes de salvar. Se falhar ou estiver indisponível, o fluxo manual continua funcionando normalmente. |

---

## 5. Requisitos Não Funcionais (RNF)

- **RNF-01 (Mobile-First):** Todas as telas devem funcionar com conforto em smartphones (larguras a partir de 360px), com botões amplos (mínimo 44px de altura) e textos legíveis.
- **RNF-02 (Idioma):** 100% da interface, mensagens de validação e status em **português brasileiro**.
- **RNF-03 (Baixo Atrito):** Cliente finaliza pedidos em poucos passos, sem cadastro prévio. Proprietário acessa as ações críticas (mudar status, pausar prato, abrir/fechar loja) em no máximo 1 ou 2 toques.
- **RNF-04 (Persistência Confiável):** Pedidos, cardápio e configurações não podem se perder ao atualizar a página.
- **RNF-05 (Simplicidade e Custo Zero Inicial):** Sem dependência de serviços pagos obrigatórios para operação básica.

---

## 6. Priorização das Funcionalidades

### 1. Essenciais para o MVP (Núcleo Obrigatório)
- Cardápio digital editável pelo proprietário (CRUD de pratos, categorias, foto, ingredientes, preço e disponibilidade).
- Página pública de cardápio e carrinho sem cadastro (apenas itens disponíveis, observações, entrega/retirada, pagamento, validações e confirmação).
- Painel administrativo de pedidos com atualização de status (`Recebido`, `Em preparo`, `Saiu para entrega`, `Concluído`, `Cancelado`).
- Resumo diário de vendas (pedidos do dia, total vendido válido, pedidos em andamento e histórico simples).
- Controle básico de `Loja Aberta / Fechada` e `Taxa de entrega fixa configurável`.

### 2. Importantes, mas complementares / evolutivas (após núcleo do MVP)
- **Assistente de IA para geração de descrições comerciais de pratos** *(etapa dedicada: Prompt 3 — AI Builder)*.
- Botão complementar para encaminhar resumo do pedido via link do WhatsApp após confirmação.
- Indicador adicional leve no painel (ex.: ticket médio do dia e filtro rápido por status no histórico).
- Alerta visual/destaque para novos pedidos recém-chegados no painel.

### 3. Futuras (Fora do escopo inicial)
- Aplicativo mobile nativo (iOS/Android).
- Pagamentos online integrados (Pix automático / cartão via gateway).
- Rastreamento de entregador em tempo real por GPS/mapa.
- Integração oficial com API do WhatsApp Business.
- Integração com marketplaces externos (iFood, Rappi, etc.).
- Controle completo de estoque, fluxo de caixa/ERP ou programa de fidelidade/cupons.
