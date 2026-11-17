# Fluxos do Usuário | iFoome Delivery

Este documento descreve os dois fluxos principais do **iFoome Delivery**, estruturados para uso ágil em dispositivos móveis (smartphones), tanto para **Seu Raimundo** na cozinha quanto para os **clientes** que fazem pedidos.

---

## 1. Fluxo do Proprietário (Área Administrativa)

**Caminho macro:**
`Acessar o sistema → Visualizar painel → Administrar cardápio → Consultar pedidos → Atualizar status → Acompanhar resumo diário`

### Passo a passo detalhado

1. **Acessar o sistema**
   - O proprietário abre a aplicação pelo navegador do celular (ou computador) e acessa a área administrativa.
   - No topo do painel, visualiza imediatamente se a loja está **Aberta** ou **Fechada**, podendo alternar com um toque.

2. **Visualizar painel e resumo diário**
   - Logo na tela inicial administrativa, visualiza os indicadores do dia em cartões grandes e legíveis:
     - **Pedidos em andamento** (quantos precisam de atenção agora).
     - **Pedidos do dia** (total de pedidos válidos hoje).
     - **Total vendido hoje** (valor em R$).
   - Visualiza rapidamente os pedidos ativos logo abaixo para agir sem precisar navegar por vários menus.

3. **Administrar cardápio**
   - Acessa a aba/seção **Cardápio**.
   - Visualiza a lista de pratos organizados por categoria.
   - **Ações rápidas:**
     - **Pausar/Ativar prato:** toca no interruptor de disponibilidade para marcar rapidamente como `Indisponível` quando um prato acabar (ou reativar quando houver reposição).
     - **Adicionar novo prato:** preenche nome, categoria, preço, ingredientes, descrição (com opção complementar de gerar sugestão por IA no Prompt 3) e foto; salva e o item já aparece na área pública se marcado como disponível.
     - **Editar ou excluir prato:** atualiza informações/preço ou remove um item com confirmação simples.

4. **Consultar pedidos**
   - Acessa a fila de **Pedidos**, vendo os novos pedidos (`Recebido`) em destaque no topo.
   - Ao abrir/expandir um cartão de pedido, lê claramente:
     - Código e horário do pedido.
     - Nome e telefone do cliente.
     - Itens, quantidades e observações (ex.: *"sem feijão"*).
     - Modalidade (**Entrega** com endereço completo ou **Retirada no local**).
     - Forma de pagamento (e se precisa de troco).
     - Valor total.

5. **Atualizar status**
   - Com um toque no botão principal de ação do pedido, avança o status conforme a cozinha trabalha:
     - `Recebido` → **`Iniciar preparo`** (`Em preparo`)
     - `Em preparo` → **`Saiu para entrega`** *(ou **`Pronto para retirada`** se for retirada)*
     - `Saiu para entrega` → **`Concluir pedido`** (`Concluído`)
   - Se necessário, toca em **`Cancelar pedido`**, confirma a ação e o pedido sai da fila ativa e dos totais vendidos.

6. **Acompanhar resumo diário e histórico**
   - No final do expediente (ou a qualquer momento), consulta a seção de **Resumo / Histórico do Dia** para conferir quantas marmitas/pedidos foram vendidos, o valor total faturado e revisar pedidos concluídos ou cancelados.

---

## 2. Fluxo do Cliente (Área Pública)

**Caminho macro:**
`Acessar cardápio → Escolher produtos → Adicionar ao carrinho → Preencher informações → Finalizar pedido → Receber confirmação`

### Passo a passo detalhado

1. **Acessar cardápio**
   - O cliente abre o link público do estabelecimento no navegador do celular (por exemplo, enviado pelo WhatsApp).
   - **Não precisa fazer login nem criar cadastro.**
   - Visualiza o nome do restaurante, se está **Aberto** ou **Fechado**, e as categorias com os pratos **disponíveis** no momento (com foto, nome, descrição e preço).

2. **Escolher produtos e adicionar ao carrinho**
   - Navega pelas categorias e toca no prato desejado para ver detalhes (descrição/ingredientes) ou adicionar diretamente.
   - Seleciona a **quantidade** e, se desejar, adiciona uma **observação** (ex.: *"sem salada"*, *"capricha no molho"*).
   - Uma barra/botão fixo do **Carrinho** mostra continuamente a quantidade de itens e o subtotal atualizado.

3. **Revisar o carrinho**
   - O cliente abre o carrinho, confere os pratos, ajusta quantidades ou remove algum item se quiser, e visualiza o subtotal antes de avançar para os dados de entrega.

4. **Preencher informações do pedido**
   - Informa seus dados básicos:
     - **Nome** (obrigatório)
     - **Telefone / WhatsApp** (obrigatório)
   - Escolhe a **Modalidade**:
     - **Entrega:** preenche Rua/Logradouro, Número, Bairro e Complemento/Referência (opcional); o sistema soma automaticamente a taxa de entrega fixa configurada.
     - **Retirada no local:** não precisa preencher endereço; a taxa de entrega é R$ 0,00.
   - Escolhe a **Forma de pagamento** (`Pix`, `Dinheiro` ou `Cartão`). Se marcar `Dinheiro`, pode informar para quanto precisa de troco.
   - Confere o **Total Final** claramente exibido.

5. **Finalizar pedido**
   - Toca em **"Finalizar pedido"**.
   - O sistema valida se a loja está aberta, se todos os itens seguem disponíveis e se os campos obrigatórios estão preenchidos.
   - Caso falte algum dado ou um prato tenha acabado, o sistema exibe um aviso objetivo indicando o que ajustar sem apagar o restante preenchido.

6. **Receber confirmação**
   - O pedido é registrado com sucesso e o cliente visualiza a **tela de confirmação** contendo:
     - Número/código do pedido e status inicial (`Recebido`).
     - Resumo completo dos itens, modalidade (Entrega/Retirada), pagamento e valor total.
     - *(Opcional complementar)* Botão para abrir o WhatsApp com a mensagem do pedido já formatada para enviar ao restaurante, caso queira agilizar o contato.

---

## 3. Fluxos de Exceção Previstos

| Situação | Comportamento Esperado |
| :--- | :--- |
| **Loja fechada** | Cliente vê o cardápio em modo consulta com aviso claro de loja fechada e não consegue finalizar novos pedidos. |
| **Prato ficou indisponível durante a compra** | Na validação final, o sistema bloqueia o envio, avisa qual item esgotou e orienta removê-lo do carrinho. |
| **Campo obrigatório ausente** | Campos inválidos são destacados com mensagem clara em português brasileiro (ex.: *"Informe o número do endereço"*). |
| **Troco menor que o total** | Sistema alerta que o valor para troco deve ser maior ou igual ao total do pedido. |
| **Toque acidental em Cancelar / Excluir (Admin)** | Sistema solicita confirmação simples antes de cancelar um pedido ou excluir um prato. |
