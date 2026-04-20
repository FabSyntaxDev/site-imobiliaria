import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

import { CONFIG } from '../base/config.js';
const SUPABASE_URL = CONFIG.SUPABASE_URL;
const SUPABASE_ANON_KEY = CONFIG.SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);




function selecionar(opcao) {
    const rotas = {
        'comprar': './AbaVenda/venda.html',
        'alugar':  './AbaAluguel/aluguel.html',
        'vender':  './vender.html'
    };
    const urlDestino = rotas[opcao];
    if (urlDestino) {
        window.location.href = urlDestino;
    }
}

// ADICIONE ESTA LINHA AQUI:
window.selecionar = selecionar;

// Fim do topo


async function renderizarDestaquesAluguel() {
    console.log("Iniciando busca no Supabase...");

    const { data: imoveis, error } = await supabase
        .from('imoveis')
        .select('*')
        .eq('aluguel', true) 
        .order('data_criacao', { ascending: false }) 
        .limit(3); 

    if (error) {
        console.error('Erro retornado pelo Supabase:', error.message);
        return;
    }

    console.log("Imóveis encontrados:", imoveis);

    const container = document.getElementById('grid-aluguel');
    
    if (!container) {
        console.error("ERRO: O elemento #grid-aluguel não foi encontrado no HTML!");
        return;
    }

    if (imoveis.length === 0) {
        container.innerHTML = "<p>Nenhum imóvel de aluguel encontrado.</p>";
        return;
    }

    container.innerHTML = imoveis.map(imovel => `
        <div class="card-imovel-tabakal">
            <div class="img-container">
                <img src="${imovel.fotos?.[0] || 'assets/placeholder.jpg'}" alt="Imóvel">
            </div>
            <div class="corpo-card">
                <h3 class="titulo-anuncio">${imovel.descricao?.substring(0, 50) || 'Sem título'}...</h3>
                <p class="valores-condo">Cond. R$ ${imovel.valor_condominio || '0'} • IPTU R$ ${imovel.valor_iptu || '0'}</p>
                <p class="preco-principal">R$ ${imovel.valor_aluguel?.toLocaleString('pt-BR')} <span style="font-size:12px">/mês</span></p>
                <div class="badges-info">
                    <div class="badge-item"><span class="badge-valor">${imovel.metragem}m²</span><span class="badge-label">Área</span></div>
                    <div class="badge-item"><span class="badge-valor">${imovel.quartos}</span><span class="badge-label">Quartos</span></div>
                    <div class="badge-item"><span class="badge-valor">${imovel.vagas}</span><span class="badge-label">Vagas</span></div>
                </div>
                <p class="localizacao-texto">${imovel.bairro || 'Consulte'}, ${imovel.cidade || 'Brasília'}</p>
                <a href="./AbaAluguel/detalhes.html?id=${imovel.id}">
                    <button class="btn-mais-detalhes">Mais Detalhes</button>
                </a>
            </div>
        </div>
    `).join('');
}

// Chama a função ao carregar a página
renderizarDestaquesAluguel();