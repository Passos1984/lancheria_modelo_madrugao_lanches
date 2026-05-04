// ==========================================
// DADOS E CONFIGURAÇÕES GLOBAIS
// ==========================================

// Caixas de memória
let carrinho = [];
let valorTotal = 0;

// CONTROLE DE DISPONIBILIDADE
let cachorrosQuentesDisponiveis = true;   // false = indisponível, true = disponível

const produtosIndisponiveis = [];

// ==========================================
// INICIALIZAÇÃO DA PÁGINA
// ==========================================

function inicializarDisponibilidade() {
    produtosIndisponiveis.forEach(nome => {
        let botoes = document.querySelectorAll('.btn-adicionar');
        botoes.forEach(botao => {
            let produtoBtn = botao.getAttribute('data-produto') || botao.innerText;
            if (produtoBtn.includes(nome) ||
                botao.getAttribute('onclick')?.includes(nome)) {
                marcarProdutoIndisponivel(botao);
            }
        });
    });

    // Desabilita visualmente o botão do Cachorro-Quente se estiver indisponível
    let botaoCQ = document.querySelector('button[onclick="abrirModalCachorro()"]');
    if (botaoCQ && !cachorrosQuentesDisponiveis) {
        botaoCQ.disabled = true;
        botaoCQ.classList.add('btn-indisponivel');
        botaoCQ.innerText = 'Indisponível';
        let card = botaoCQ.closest('.card-produto');
        if (card) card.classList.add('indisponivel');
    }
}

window.onload = inicializarDisponibilidade;

// ==========================================
// AUXILIARES DE DISPONIBILIDADE VISUAL
// ==========================================

function marcarProdutoIndisponivel(botaoElemento) {
    if (!botaoElemento) return;
    let card = botaoElemento.closest('.card-produto');
    if (!card) return;
    card.classList.add('indisponivel');
    botaoElemento.disabled = true;
    botaoElemento.classList.add('btn-indisponivel');
    botaoElemento.innerText = 'Indisponível';
}

function marcarProdutoDisponivel(botaoElemento, textoOriginal) {
    if (!botaoElemento) return;
    let card = botaoElemento.closest('.card-produto');
    if (!card) return;
    card.classList.remove('indisponivel');
    botaoElemento.disabled = false;
    botaoElemento.classList.remove('btn-indisponivel');
    botaoElemento.innerText = textoOriginal || '+ Adicionar';
}

// ==========================================
// PRODUTOS DIRETO PRO CARRINHO (Salgados, Torradas)
// ==========================================

function adicionarDireto(nomeProduto, precoProduto) {
    carrinho.push({ nome: nomeProduto, preco: precoProduto });
    valorTotal += precoProduto;
    atualizarBotaoCarrinho();
    alert(nomeProduto + " adicionado ao carrinho!");
}

// ==========================================
// MODAL DE PORÇÕES (Fritas e Adicionais)
// ==========================================

let produtoSendoMontadoNome = "";
let produtoSendoMontadoPreco = 0;

function adicionarAoCarrinho(nomeProduto, precoProduto) {
    produtoSendoMontadoNome = nomeProduto;
    produtoSendoMontadoPreco = precoProduto;
    document.getElementById("modal-titulo").innerText = "Montando: " + nomeProduto;
    document.getElementById("modal-preco-base").innerText = "Escolha o tamanho";
    document.getElementById("modal-complementos").classList.remove("oculta");
}

function fecharModal() {
    document.getElementById("modal-complementos").classList.add("oculta");
}

function confirmarAcai() {
    let tamanhoSelecionado = document.querySelector('input[name="tamanho"]:checked');
    if (!tamanhoSelecionado) {
        alert("Por favor, escolha um tamanho da porção!");
        return;
    }

    let nomesDosComplementos = [];
    let valorDosComplementos = 0;
    let precoTamanho = parseFloat(tamanhoSelecionado.dataset.preco);
    let limiteGratis = parseInt(tamanhoSelecionado.dataset.max);
    let nomeTamanho = tamanhoSelecionado.value;

    let gratisMarcados = document.querySelectorAll('.add-gratis:checked');
    let countGratis = 0;
    gratisMarcados.forEach(function (item) {
        if (countGratis < limiteGratis || limiteGratis === 0) {
            nomesDosComplementos.push(item.value);
        } else {
            nomesDosComplementos.push(item.value + " (+R$3,00)");
            valorDosComplementos += 3.00;
        }
        countGratis++;
    });

    let pagosMarcados = document.querySelectorAll('.add-pago:checked');
    pagosMarcados.forEach(function (item) {
        nomesDosComplementos.push(item.value);
        valorDosComplementos += parseFloat(item.dataset.preco);
    });

    let precoFinalDoItem = precoTamanho + valorDosComplementos;
    let nomeFinalParaCarrinho = "Porção " + nomeTamanho;

    if (nomesDosComplementos.length > 0) {
        nomeFinalParaCarrinho += " (Com: " + nomesDosComplementos.join(", ") + ")";
    }

    carrinho.push({ nome: nomeFinalParaCarrinho, preco: precoFinalDoItem });
    valorTotal += precoFinalDoItem;
    atualizarBotaoCarrinho();

    let todosCheckboxes = document.querySelectorAll('input[type="checkbox"]');
    todosCheckboxes.forEach(box => box.checked = false);

    fecharModal();
}

// ==========================================
// MODAL DO XIS (Remover ingredientes)
// ==========================================

let itemMontagemNome = "";
let itemMontagemPreco = 0;

function abrirModalLanche(nome, preco, tipo) {
    itemMontagemNome = nome;
    itemMontagemPreco = preco;

    document.getElementById("titulo-modal-xis").innerText = "Personalizar " + nome;
    document.getElementById("preco-modal-xis").innerText = "R$ " + preco.toFixed(2).replace(".", ",");
    document.getElementById("modal-xis").classList.remove("oculta");
}

function fecharModalXis() {
    document.getElementById("modal-xis").classList.add("oculta");
    document.querySelectorAll('.tirar-ingrediente').forEach(box => box.checked = false);
}

function confirmarXis() {
    let observacoes = [];
    let checkboxes = document.querySelectorAll('.tirar-ingrediente:checked');

    checkboxes.forEach(function (box) {
        observacoes.push(box.value);
    });

    let nomeFinal = itemMontagemNome;
    if (observacoes.length > 0) {
        nomeFinal += " (" + observacoes.join(", ") + ")";
    }

    carrinho.push({ nome: nomeFinal, preco: itemMontagemPreco });
    valorTotal += itemMontagemPreco;

    atualizarBotaoCarrinho();
    fecharModalXis();
}

// ==========================================
// MODAL DO CACHORRO-QUENTE
// ==========================================

function abrirModalCachorro() {
    if (!cachorrosQuentesDisponiveis) {
        alert("Desculpe, os cachorros-quentes estão indisponíveis no momento.");
        return;
    }
    document.getElementById("modal-cachorro").classList.remove("oculta");
}

function fecharModalCachorro() {
    document.getElementById("modal-cachorro").classList.add("oculta");
    document.querySelectorAll('input[name="tipo_cachorro"]').forEach(p => p.checked = false);
    document.querySelectorAll('.tirar-ingrediente-cachorro').forEach(box => box.checked = false);
}

function confirmarCachorro() {
    let selecionado = document.querySelector('input[name="tipo_cachorro"]:checked');
    if (!selecionado) {
        alert("Por favor, escolha uma opção de Cachorro-Quente!");
        return;
    }

    let nome = selecionado.value;
    let preco = parseFloat(selecionado.dataset.preco);

    let observacoes = [];
    let checkboxes = document.querySelectorAll('.tirar-ingrediente-cachorro:checked');
    checkboxes.forEach(box => observacoes.push(box.value));

    if (observacoes.length > 0) {
        nome += " (" + observacoes.join(", ") + ")";
    }

    carrinho.push({ nome: nome, preco: preco });
    valorTotal += preco;

    atualizarBotaoCarrinho();
    fecharModalCachorro();
}

// ==========================================
// MODAL DOS PASTÉIS
// ==========================================

function abrirModalPastel() {
    document.getElementById("modal-pastel").classList.remove("oculta");
}

function fecharModalPastel() {
    document.getElementById("modal-pastel").classList.add("oculta");
    document.querySelectorAll('input[name="pastel"]').forEach(p => p.checked = false);
    document.querySelectorAll('.tirar-ingrediente-pastel').forEach(box => box.checked = false);
}

function confirmarPastel() {
    let selecionado = document.querySelector('input[name="pastel"]:checked');
    if (!selecionado) {
        alert("Por favor, escolha um sabor de pastel!");
        return;
    }

    let nome = selecionado.value;
    let preco = parseFloat(selecionado.dataset.preco);

    let observacoes = [];
    let checkboxes = document.querySelectorAll('.tirar-ingrediente-pastel:checked');
    checkboxes.forEach(box => observacoes.push(box.value));

    if (observacoes.length > 0) {
        nome += " (" + observacoes.join(", ") + ")";
    }

    carrinho.push({ nome: nome, preco: preco });
    valorTotal += preco;

    atualizarBotaoCarrinho();
    fecharModalPastel();
}

// ==========================================
// MODAL DAS BEBIDAS
// ==========================================

function abrirModalBebidas() {
    document.getElementById("modal-bebidas").classList.remove("oculta");
}

function fecharModalBebidas() {
    document.getElementById("modal-bebidas").classList.add("oculta");
    let bebidas = document.querySelectorAll('input[name="bebida"]');
    bebidas.forEach(b => b.checked = false);
}

function confirmarBebida() {
    let bebidaSelecionada = document.querySelector('input[name="bebida"]:checked');
    if (!bebidaSelecionada) {
        alert("Por favor, escolha uma bebida!");
        return;
    }
    let nomeBebida = bebidaSelecionada.value;
    let precoBebida = parseFloat(bebidaSelecionada.dataset.preco);

    carrinho.push({ nome: nomeBebida, preco: precoBebida });
    valorTotal += precoBebida;

    atualizarBotaoCarrinho();
    fecharModalBebidas();
}

// ==========================================
// COMBO DA GALERA
// ==========================================

function abrirModalCombo() {
    document.getElementById("modal-combo").classList.remove("oculta");
}

function fecharModalCombo() {
    document.getElementById("modal-combo").classList.add("oculta");
}

function capturarCopoCombo(classeCopo, limiteGratis, nomeCopo) {
    let ingredientes = [];
    let valorExtra = 0;
    let countGratis = 0;

    let marcadosGratis = document.querySelectorAll(`.${classeCopo}.add-gratis:checked`);
    marcadosGratis.forEach(function (item) {
        if (countGratis < limiteGratis) {
            ingredientes.push(item.value);
        } else {
            ingredientes.push(item.value + " (+R$3,00)");
            valorExtra += 3.00;
        }
        countGratis++;
    });

    let marcadosPagos = document.querySelectorAll(`.${classeCopo}.add-pago:checked`);
    marcadosPagos.forEach(function (item) {
        ingredientes.push(item.value);
        valorExtra += parseFloat(item.dataset.preco);
    });

    let desc = ingredientes.length > 0 ? `${nomeCopo} (Tirar: ${ingredientes.join(', ')})` : `${nomeCopo} (Completo)`;
    return { desc: desc, valorExtra: valorExtra };
}

function confirmarCombo() {
    let copo1 = capturarCopoCombo('combo-copo1', 6, 'Xis 1');
    let copo2 = capturarCopoCombo('combo-copo2', 6, 'Xis 2');
    let copo3 = capturarCopoCombo('combo-copo3', 4, 'Cachorro-Quente 1');
    let copo4 = capturarCopoCombo('combo-copo4', 4, 'Cachorro-Quente 2');

    let precoFinal = 75.00 + copo1.valorExtra + copo2.valorExtra + copo3.valorExtra + copo4.valorExtra;
    let descricaoFinal = "Combo Galera\n  ↳ " + copo1.desc + "\n  ↳ " + copo2.desc + "\n  ↳ " + copo3.desc + "\n  ↳ " + copo4.desc;

    carrinho.push({ nome: descricaoFinal, preco: precoFinal });
    valorTotal += precoFinal;
    atualizarBotaoCarrinho();

    let todosCheckboxes = document.getElementById('modal-combo').querySelectorAll('input[type="checkbox"]');
    todosCheckboxes.forEach(box => box.checked = false);

    fecharModalCombo();
}

// ==========================================
// CARRINHO E FINALIZAÇÃO
// ==========================================

function atualizarBotaoCarrinho() {
    let botaoElemento = document.getElementById("btn-carrinho");
    let quantidade = carrinho.length;
    let totalFormatado = valorTotal.toFixed(2).replace(".", ",");
    botaoElemento.innerHTML = `🛒 Ver Carrinho (${quantidade}) - R$ ${totalFormatado}`;
}

function abrirModalCarrinho() {
    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }
    renderizarCarrinho();
    document.getElementById("modal-carrinho").classList.remove("oculta");
}

function fecharModalCarrinho() {
    document.getElementById("modal-carrinho").classList.add("oculta");
}

function renderizarCarrinho() {
    let lista = document.getElementById("lista-carrinho");
    let totalSpan = document.getElementById("total-carrinho");
    lista.innerHTML = "";

    carrinho.forEach(function (item, index) {
        let itemDiv = document.createElement("div");
        itemDiv.className = "item-carrinho";
        itemDiv.innerHTML = `
            <div class="info-item">
                <span class="nome-item">${item.nome}</span>
                <span class="preco-item">R$ ${item.preco.toFixed(2).replace(".", ",")}</span>
            </div>
            <button class="btn-remover" onclick="removerDoCarrinho(${index})">🗑️ Remover</button>
        `;
        lista.appendChild(itemDiv);
    });
    totalSpan.innerText = valorTotal.toFixed(2).replace(".", ",");
}

function removerDoCarrinho(index) {
    let itemRemovido = carrinho[index];
    valorTotal -= itemRemovido.preco;
    carrinho.splice(index, 1);
    atualizarBotaoCarrinho();
    renderizarCarrinho();
    if (carrinho.length === 0) {
        fecharModalCarrinho();
    }
}

function finalizarPedido() {
    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio! Adicione um lanche primeiro.");
        return;
    }

    let mensagem = "Olá! Gostaria de fazer o seguinte pedido no Madrugadão Lanches:\n\n";
    carrinho.forEach(function (item) {
        mensagem += "- " + item.nome + " (R$ " + item.preco.toFixed(2).replace(".", ",") + ")\n";
    });
    mensagem += "\n*Total do Pedido: R$ " + valorTotal.toFixed(2).replace(".", ",") + "*";

    let mensagemFormatada = encodeURIComponent(mensagem);

    let telefoneWhatsApp = atob("NTU1MTk4MTk2MjgxOQ==");
    let linkWhatsApp = `https://wa.me/${telefoneWhatsApp}?text=${mensagemFormatada}`;
    window.open(linkWhatsApp, "_blank");
}