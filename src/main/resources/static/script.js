const API_BASE_URL = '/produtos';

// Elementos da página
const produtoForm = document.getElementById('produtoForm');
const produtosList = document.getElementById('produtosList');
const loading = document.getElementById('loading');
const searchInput = document.getElementById('searchInput');
const btnCancelar = document.getElementById('btnCancelar');
const formTitle = document.getElementById('form-title');
const confirmModal = document.getElementById('confirmModal');
const confirmMessage = document.getElementById('confirmMessage');
const confirmYes = document.getElementById('confirmYes');
const confirmNo = document.getElementById('confirmNo');

let produtoParaExcluir = null;
let editando = false;
let produtosExibidos = [];
let timeoutBusca;

// Inicialização da interface
produtoForm.addEventListener('submit', salvarProduto);
btnCancelar.addEventListener('click', cancelarEdicao);
confirmYes.addEventListener('click', confirmarExclusao);
confirmNo.addEventListener('click', fecharModal);
document.getElementById('btnBuscar').addEventListener('click', buscarProdutos);
confirmModal.addEventListener('click', (evento) => {
    if (evento.target === confirmModal) fecharModal();
});
searchInput.addEventListener('input', () => {
    clearTimeout(timeoutBusca);
    timeoutBusca = setTimeout(buscarProdutos, 500);
});

// Eventos dos botões dos cards, sem inserir nomes dos produtos em código HTML
produtosList.addEventListener('click', (evento) => {
    const botao = evento.target.closest('button[data-action]');
    if (!botao) return;

    const card = botao.closest('.produto-card');
    const id = Number(card.dataset.id);
    const produto = produtosExibidos.find((item) => Number(item.id) === id);
    if (!produto) return;

    if (botao.dataset.action === 'editar') editarProduto(id);
    if (botao.dataset.action === 'excluir') solicitarExclusao(id, produto.nome);
});

carregarProdutos();

// Requisições à API
async function carregarProdutos() {
    try {
        mostrarLoading(true);
        const response = await fetch(API_BASE_URL);
        if (!response.ok) throw new Error('Erro ao carregar produtos');

        const produtos = await response.json();
        exibirProdutos(produtos);
    } catch (error) {
        console.error('Erro:', error);
        produtosExibidos = [];
        produtosList.innerHTML = `
            <div class="empty-state">
                <h3>❌ Erro ao carregar produtos</h3>
                <p>Verifique se o backend está rodando e se a URL da API está configurada corretamente.</p>
            </div>`;
    } finally {
        mostrarLoading(false);
    }
}

async function salvarProduto(evento) {
    evento.preventDefault();
    const produtoId = document.getElementById('produtoId').value;
    const nome = document.getElementById('nome').value.trim();
    const preco = Number(document.getElementById('preco').value);
    if (!nome || !Number.isFinite(preco) || preco < 0) {
        alert('Informe um nome e um preço válido.');
        return;
    }

    const estavaEditando = editando;
    const url = estavaEditando ? `${API_BASE_URL}/${produtoId}` : API_BASE_URL;

    try {
        const response = await fetch(url, {
            method: estavaEditando ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, preco })
        });
        if (!response.ok) throw new Error(`Erro HTTP ${response.status} ao salvar produto`);

        limparFormulario();
        await carregarProdutos();
        alert(`Produto ${estavaEditando ? 'atualizado' : 'cadastrado'} com sucesso!`);
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao salvar produto. Verifique o console para mais detalhes.');
    }
}

async function excluirProduto(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error(`Erro HTTP ${response.status} ao excluir produto`);

        await carregarProdutos();
        alert('Produto excluído com sucesso!');
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao excluir produto. Verifique o console para mais detalhes.');
    }
}

async function buscarProdutos() {
    const termo = searchInput.value.trim().toLocaleLowerCase('pt-BR');
    try {
        mostrarLoading(true);
        const response = await fetch(API_BASE_URL);
        if (!response.ok) throw new Error('Erro ao buscar produtos');

        const produtos = await response.json();
        const filtrados = produtos.filter((produto) =>
            String(produto.nome).toLocaleLowerCase('pt-BR').includes(termo)
        );
        exibirProdutos(filtrados);
    } catch (error) {
        console.error('Erro:', error);
        produtosList.innerHTML = '<div class="empty-state"><h3>Erro ao buscar produtos</h3></div>';
    } finally {
        mostrarLoading(false);
    }
}

// Funções da interface
function escaparHTML(valor) {
    return String(valor).replace(/[&<>"']/g, (caractere) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[caractere]);
}

function exibirProdutos(produtos) {
    produtosExibidos = produtos;
    if (produtos.length === 0) {
        produtosList.innerHTML = `
            <div class="empty-state">
                <h3>📭 Nenhum produto encontrado</h3>
                <p>${searchInput.value ? 'Tente buscar com outros termos' : 'Cadastre o primeiro produto usando o formulário acima'}</p>
            </div>`;
        return;
    }

    produtosList.innerHTML = produtos.map((produto) => `
        <div class="produto-card" data-id="${Number(produto.id)}">
            <div class="produto-info">
                <h3>${escaparHTML(produto.nome)}</h3>
                <p class="preco">R$ ${Number(produto.preco).toFixed(2)}</p>
                <small>ID: ${Number(produto.id)}</small>
            </div>
            <div class="produto-actions">
                <button type="button" class="btn-edit" data-action="editar">✏️ Editar</button>
                <button type="button" class="btn-delete" data-action="excluir">🗑️ Excluir</button>
            </div>
        </div>
    `).join('');
}

async function editarProduto(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        if (!response.ok) throw new Error('Erro ao carregar produto');
        const produto = await response.json();

        document.getElementById('produtoId').value = produto.id;
        document.getElementById('nome').value = produto.nome;
        document.getElementById('preco').value = produto.preco;
        formTitle.textContent = 'Editar Produto';
        document.getElementById('btnSalvar').textContent = 'Atualizar Produto';
        btnCancelar.style.display = 'inline-block';
        editando = true;
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao carregar produto para edição');
    }
}

function cancelarEdicao() {
    limparFormulario();
}

function limparFormulario() {
    produtoForm.reset();
    document.getElementById('produtoId').value = '';
    formTitle.textContent = 'Cadastrar Novo Produto';
    document.getElementById('btnSalvar').textContent = 'Cadastrar Produto';
    btnCancelar.style.display = 'none';
    editando = false;
}

function solicitarExclusao(id, nome) {
    produtoParaExcluir = id;
    confirmMessage.textContent = `Tem certeza que deseja excluir o produto "${nome}"?`;
    confirmModal.style.display = 'block';
}

function confirmarExclusao() {
    if (produtoParaExcluir !== null) excluirProduto(produtoParaExcluir);
    fecharModal();
}

function fecharModal() {
    confirmModal.style.display = 'none';
    produtoParaExcluir = null;
}

function mostrarLoading(mostrar) {
    loading.style.display = mostrar ? 'block' : 'none';
}
