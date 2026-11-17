# Regras de Negócio | iFoome Delivery

Este documento define as regras operacionais do **iFoome Delivery**, pensadas para a rotina de uma pequena marmitaria operada pelo celular, garantindo previsibilidade, integridade financeira e simplicidade.

---

## RN-01 — Disponibilidade de Produtos no Cardápio

1. **Produto marcado como Indisponível:**
   - Deixa de ser exibido imediatamente no cardápio público para novos clientes.
   - Continua visível no painel administrativo do proprietário (com indicação visual clara de "Indisponível") para que possa ser reativado com um toque quando houver reposição.
2. **Produto indisponibilizado enquanto já estava no carrinho de um cliente:**
   - Ao tentar finalizar o pedido, o sistema valida a disponibilidade atual de todos os itens.
   - Caso algum item tenha ficado indisponível, a finalização é bloqueada e uma mensagem clara informa qual item acabou, permitindo ao cliente removê-lo ou substituí-lo antes de concluir.
3. **Pedidos já realizados anteriormente:**
   - Alterar o preço, editar ingredientes, pausar ou excluir um produto do cardápio **nunca altera** pedidos que já foram finalizados. Cada pedido preserva uma cópia fixa (*snapshot*) do nome e preço do item no momento da compra.

---

## RN-02 — Horário e Status de Funcionamento (Loja Aberta / Fechada)

1. **Controle pelo proprietário:**
   - O proprietário controla manualmente o estado do estabelecimento por meio de uma chave simples: **Aberta** ou **Fechada** *(padrão inicial: Aberta)*.
2. **Quando a loja está Fechada:**
   - O cliente ainda pode acessar a página pública e consultar o cardápio (para conhecer pratos e preços), mas um aviso destacado informa: *"Estamos fechados no momento. Não estamos aceitando pedidos agora."*
   - Os botões de adicionar ao carrinho / finalizar pedido ficam bloqueados (ou a finalização é impedida com aviso claro), evitando que pedidos entrem fora do expediente sem que Seu Raimundo veja.
3. **Pedidos já em andamento ao fechar a loja:**
   - Fechar a loja impede apenas **novos pedidos**. Pedidos que já entraram continuam aparecendo normalmente no painel para serem preparados, entregues e concluídos.

---

## RN-03 — Modalidades de Atendimento (Entrega vs. Retirada) e Taxa de Entrega

1. **Entrega (Delivery):**
   - Aplica-se uma **taxa de entrega fixa padrão**, configurável pelo proprietário nas configurações do estabelecimento *(padrão inicial sugerido: **R$ 5,00**; pode ser definida como R$ 0,00 caso o restaurante ofereça entrega grátis)*.
   - **Endereço obrigatório:** O cliente deve informar no mínimo **Rua/Logradouro**, **Número** e **Bairro** (com campo opcional para complemento/ponto de referência). Sem esses dados, o pedido não pode ser finalizado.
2. **Retirada no estabelecimento:**
   - A taxa de entrega é automaticamente **R$ 0,00** (isenta).
   - Os campos de endereço não são exigidos (ficam ocultos ou desabilitados para simplificar o formulário).
   - No painel do proprietário e na confirmação do cliente, o pedido exibe o selo claro **"Retirada no local"**.
   - Quando o prato estiver pronto, o proprietário pode avançar o pedido normalmente (exibindo `"Pronto para retirada"` no lugar ou como variação visual de `"Saiu para entrega"`, mantendo o fluxo linear de status até `"Concluído"`).

---

## RN-04 — Validação de Pedido e Prevenção de Erros

Um pedido **somente** pode ser finalizado quando atender simultaneamente a todas as condições abaixo:

1. A loja estiver com status **Aberta**.
2. O carrinho contiver **pelo menos 1 item** com quantidade maior ou igual a 1.
3. Todos os itens do carrinho continuarem **disponíveis** e com preço válido no cardápio.
4. O cliente informar **Nome** (não vazio) e **Telefone/WhatsApp** (mínimo de dígitos válidos, ex.: 10 ou 11 dígitos com DDD).
5. Uma **Forma de pagamento** válida estiver selecionada (`Pix`, `Dinheiro` ou `Cartão`).
   - Se a forma for `Dinheiro` e o cliente informar troco, o valor informado para troco não pode ser menor que o total do pedido.
6. Se a modalidade for `Entrega`, o **endereço completo mínimo** (rua, número e bairro) estiver preenchido.
7. O cálculo do **subtotal**, **taxa de entrega** e **total final** for validado com base nos preços vigentes no cadastro de produtos e configuração da loja no instante da confirmação.

---

## RN-05 — Ciclo de Vida e Status dos Pedidos

Os pedidos seguem um fluxo simples, pensado para ser operado com uma mão na cozinha:

1. **`Recebido`**: Estado inicial automático assim que o cliente finaliza o pedido.
2. **`Em preparo`**: Seu Raimundo confirma que o pedido entrou na produção da cozinha.
3. **`Saiu para entrega`**: O pedido já está pronto e saiu com o entregador *(para pedidos de Retirada no local, exibe a indicação equivalente **"Pronto para retirada"**)*.
4. **`Concluído`**: O pedido foi entregue ou retirado pelo cliente; sai da fila ativa de produção e permanece no histórico do dia.
5. **`Cancelado`**: O pedido foi cancelado pelo proprietário (ex.: cliente desistiu, pedido duplicado ou falta de ingrediente após o recebimento).

**Regras de transição:**
- Um pedido `Cancelado` ou `Concluído` não deve voltar acidentalmente para produção no fluxo padrão, evitando confusão na cozinha.
- A ação de **Cancelar pedido** exige uma confirmação rápida (*"Tem certeza que deseja cancelar este pedido?"*) para evitar toques acidentais em tela pequena.

---

## RN-06 — Momento da Venda e Cálculo do Resumo Diário

1. **Quando um pedido é considerado uma venda?**
   - Na rotina de uma marmitaria sem pagamento online integrado, o pedido é contabilizado como venda válida **a partir do momento em que é registrado/recebido no sistema (`Recebido`) e enquanto não for `Cancelado`**.
   - Ou seja: pedidos nos status `Recebido`, `Em preparo`, `Saiu para entrega` e `Concluído` compõem os indicadores de vendas do dia.
2. **Como são tratados pedidos cancelados?**
   - Pedidos com status **`Cancelado`** são **excluídos** imediatamente da soma de **"Total vendido no dia"** e da contagem de **"Pedidos válidos do dia"** e **"Pedidos em andamento"**.
   - Eles permanecem listados no histórico simples com a etiqueta visual **`Cancelado`**, para rastreabilidade e transparência.
3. **Definição de "Dia" no Resumo Diário:**
   - Considera os pedidos realizados na **data local atual** (de `00:00` às `23:59` do dia corrente do estabelecimento).
4. **Indicadores do Resumo Diário:**
   - **Pedidos do dia:** Contagem de pedidos válidos feitos hoje (exclui `Cancelado`).
   - **Total vendido no dia:** Soma do campo `total` (itens + taxa de entrega) dos pedidos válidos de hoje (exclui `Cancelado`).
   - **Em andamento:** Contagem de pedidos atualmente nos status `Recebido`, `Em preparo` ou `Saiu para entrega`.
   - **Ticket médio (opcional leve):** `Total vendido no dia / Pedidos do dia` (exibe `R$ 0,00` quando não houver pedidos).

---

## RN-07 — Padrões Iniciais de Configuração

Caso o proprietário ainda não tenha personalizado o estabelecimento no primeiro acesso, o sistema inicia com os seguintes padrões seguros e editáveis:

| Configuração | Valor Padrão Inicial | Editável pelo Proprietário? |
| :--- | :--- | :--- |
| Nome do estabelecimento | `"Marmitaria do Seu Raimundo"` (ou `"iFoome Marmitaria"`) | Sim |
| Status da loja | `Aberta` | Sim (1 toque) |
| Telefone / WhatsApp | Vazio ou número de contato configurado na loja | Sim |
| Taxa de entrega fixa | `R$ 5,00` | Sim (aceita `R$ 0,00`) |
| Categorias iniciais | `Marmitas`, `Pratos do Dia`, `Acompanhamentos`, `Bebidas`, `Sobremesas` | Sim (seleção no cadastro) |
| Formas de pagamento | `Pix`, `Dinheiro`, `Cartão` | Definido no sistema (simples) |
