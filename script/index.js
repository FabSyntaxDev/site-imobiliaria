import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

import { CONFIG } from '../base/config.js';
const SUPABASE_URL = CONFIG.SUPABASE_URL;
const SUPABASE_ANON_KEY = CONFIG.SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);




function selecionar(opcao) {
    // 1. Mapeia cada opção para uma URL específica baseada na sua estrutura de pastas
    const rotas = {
        'comprar': './AbaVenda/venda.html',
        'alugar':  './AbaAluguel/aluguel.html',
        'vender':  './vender.html' // Ajuste este se o arquivo vender.html estiver na raiz
    };

    const urlDestino = rotas[opcao];

    // 2. Log para debug (ajuda muito a ver se o clique funcionou)
    console.log("Opção selecionada:", opcao);
    console.log("Redirecionando para:", urlDestino);

    // 3. Executa o redirecionamento
    if (urlDestino) {
        window.location.href = urlDestino;
    } else {
        console.error("Erro: Rota não encontrada para a opção:", opcao);
    }
}

// Fim do topo


async function renderizarDestaquesAluguel() {
    // Busca os 3 últimos cadastrados (do mais novo para o mais antigo)
    const { data: imoveis, error } = await supabase
        .from('imoveis')
        .select('*')
        .eq('aluguel', true) 
        .order('data_criacao', { ascending: false }) // Ordena pela data de criação decrescente
        .limit(3); // Garante que venham apenas 3

    if (error) {
        console.error('Erro ao buscar imóveis:', error);
        return;
    }

    const container = document.getElementById('grid-aluguel');
    
    container.innerHTML = imoveis.map(imovel => {
        // Tratamento para evitar "null" na localização
        const bairro = imovel.bairro || "Consulte";
        const cidade = imovel.cidade || "Brasília";
        const uf = imovel.uf || "DF";

        return `
        <div class="card-imovel-tabakal">
            <div class="img-container">
                <img src="${imovel.fotos?.[0] || 'assets/placeholder.jpg'}" alt="Imóvel">
            </div>
            <div class="corpo-card">
                <h3 class="titulo-anuncio">${imovel.descricao?.substring(0, 50) || 'Sem descrição'}...</h3>
                <p class="valores-condo">
                    Cond. R$ ${imovel.valor_condominio || '0'} • IPTU R$ ${imovel.valor_iptu || '0'}
                </p>
                
                <p class="preco-principal">
                    R$ ${imovel.valor_aluguel ? imovel.valor_aluguel.toLocaleString('pt-BR') : 'Consulte'}
                    <span style="font-size: 12px; font-weight: normal;"> /mês</span>
                </p>

                <div class="badges-info">
                    <div class="badge-item">
                        <span class="badge-valor">${imovel.metragem || '0'} m²</span>
                        <span class="badge-label">Área</span>
                    </div>
                    <div class="badge-item">
                        <span class="badge-valor">${imovel.quartos || '0'}</span>
                        <span class="badge-label">Quartos</span>
                    </div>
                    <div class="badge-item">
                        <span class="badge-valor">${imovel.vagas || '0'}</span>
                        <span class="badge-label">Vagas</span>
                    </div>
                </div>

                <p class="localizacao-texto">
                    ${bairro}, ${cidade} - ${uf}
                </p>
                
                <button class="btn-mais-detalhes">Mais Detalhes</button>
            </div>
        </div>
        `;
    }).join('');
}

// Chama a função ao carregar a página
renderizarDestaquesAluguel();