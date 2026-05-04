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

    const { data: imoveis, error } = await supabase
        .from('imoveis')
        .select('*')
        .eq('aluguel', true)
        .eq('status', true)
        .order('data_criacao', { ascending: false }) 
        .limit(3); 

    if (error) {
        console.error('Erro:', error.message);
        return;
    }


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
                <h3 class="titulo-anuncio" style="text-align: justify; text-transform: lowercase;">${imovel.descricao?.substring(0, 73) || 'Sem título'}...</h3>
                <p class="valores-condo"><strong>${imovel.tipo || 'Tipo não informado'}</strong> • Cond. R$ ${imovel.valor_condominio || '0'} • IPTU R$ ${imovel.valor_iptu || '0'}</p>
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

// fim de locação

async function renderizarDestaquesVenda() {

    const { data: imoveis, error } = await supabase
        .from('imoveis')
        .select('*')
        .eq('aluguel', false) // Diferença solicitada: apenas vendas
        .eq('status', true)
        .order('data_criacao', { ascending: false }) 
        .limit(3); 

    if (error) {
        console.error('Erro retornado pelo Supabase (Venda):', error.message);
        return;
    }

    const container = document.getElementById('grid-venda'); // ID diferente para a seção de venda
    
    if (!container) {
        console.error("ERRO: O elemento #grid-venda não foi encontrado no HTML!");
        return;
    }

    if (imoveis.length === 0) {
        container.innerHTML = "<p>Nenhum imóvel à venda encontrado.</p>";
        return;
    }

    container.innerHTML = imoveis.map(imovel => `
        <div class="card-imovel-tabakal">
            <div class="img-container">
                <img src="${imovel.fotos?.[0] || 'assets/placeholder.jpg'}" alt="Imóvel">
            </div>
            <div class="corpo-card">
                <h3 class="titulo-anuncio" style="text-align: justify; text-transform: lowercase;">${imovel.descricao?.substring(0, 73) || 'Sem título'}...</h3>
                <p class="valores-condo"><strong>${imovel.tipo || 'Tipo não informado'}</strong> • Cond. R$ ${imovel.valor_condominio || '0'} • IPTU R$ ${imovel.valor_iptu || '0'}</p>
                
                <p class="preco-principal">R$ ${imovel.valor_aluguel?.toLocaleString('pt-BR')}</p>
                
                <div class="badges-info">
                    <div class="badge-item"><span class="badge-valor">${imovel.metragem}m²</span><span class="badge-label">Área</span></div>
                    <div class="badge-item"><span class="badge-valor">${imovel.quartos}</span><span class="badge-label">Quartos</span></div>
                    <div class="badge-item"><span class="badge-valor">${imovel.vagas}</span><span class="badge-label">Vagas</span></div>
                </div>
                <p class="localizacao-texto">${imovel.bairro || 'Consulte'}, ${imovel.cidade || 'Brasília'}</p>
                
                <a href="./AbaVenda/detalhes.html?id=${imovel.id}">
                    <button class="btn-mais-detalhes">Mais Detalhes</button>
                </a>
            </div>
        </div>
    `).join('');
}

//fim de venda

document.addEventListener('DOMContentLoaded', () => {
    const stars = document.querySelectorAll('#starMural .star-gold');
    const scoreElement = document.getElementById('scoreValue');
    const targetScore = 4.9;

    const activateMuralAnimation = () => {
        // 1. Animação da nota numérica crescendo
        let currentScore = 0;
        const scoreInterval = setInterval(() => {
            currentScore += 0.1;
            if (currentScore >= targetScore) {
                scoreElement.innerText = targetScore.toFixed(1);
                clearInterval(scoreInterval);
            } else {
                scoreElement.innerText = currentScore.toFixed(1);
            }
        }, 30);

        // 2. Animação das estrelas gigantes em sequência (Pulse)
        stars.forEach((star, index) => {
            setTimeout(() => {
                star.classList.add('animate');
            }, index * 150); // 150ms de atraso entre cada estrela
        });
    };

    // Observer para disparar apenas quando o usuário rolar até a seção
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            activateMuralAnimation();
            observer.disconnect(); // Executa apenas uma vez
        }
    }, { threshold: 0.3 }); // Dispara quando 30% da seção estiver visível

    observer.observe(document.querySelector('.tabakal-mural'));
});





// Chama a função ao carregar a página
renderizarDestaquesAluguel();
renderizarDestaquesVenda();