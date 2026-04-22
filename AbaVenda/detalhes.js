import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

import { CONFIG } from '../base/config.js';
const SUPABASE_URL = CONFIG.SUPABASE_URL;
const SUPABASE_ANON_KEY = CONFIG.SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const detailContent = document.getElementById('detailContent');
const params = new URLSearchParams(window.location.search);
const propertyId = params.get('id');

if (!propertyId) {
  showError('ID do imóvel não foi informado.');
} else {
  fetchProperty(propertyId);
}

async function fetchProperty(id) {
  detailContent.innerHTML = '<div class="detail-loading">Carregando imóvel...</div>';

  const { data, error } = await supabase
    .from('imoveis')
    .select('*')
    .eq('id', parseInt(id, 10))
    .single();

  if (error || !data) {
    const message = (error && error.message) || 'Imóvel não encontrado.';
    showError(`Erro: ${escapeHtml(message)}. Verifique sua chave Supabase.`);
    return;
  }

  renderProperty(data);
}

// ... (mantenha as importações e fetchProperty iguais)

function renderProperty(item) {
  const photoUrls = normalizePhotoField(item.fotos);
  const mainPhoto = photoUrls.length ? photoUrls[0] : getDefaultImage();
  
  // Melhoria na lógica de localização para não repetir "Endereço do imóvel"
  const logradouro = item.endereco || 'Endereço não informado';
  const cidadeEstado = [item.bairro, item.cidade, item.uf].filter(Boolean).join(' - ');

  const valorAluguel = item.valor_aluguel ? `R$ ${item.valor_aluguel.toLocaleString('pt-BR')}` : 'Sob consulta';
  const valorTotal = (Number(item.valor_aluguel || 0) + Number(item.valor_condominio || 0) + Number(item.valor_iptu || 0)).toLocaleString('pt-BR');

  detailContent.innerHTML = `
    <div class="detail-gallery">
      <div class="gallery-main">
        <img id="detailMainPhoto" src="${escapeHtml(mainPhoto)}" alt="Imóvel" />
      </div>
      ${photoUrls.length > 1 ? `
        <div class="gallery-controls">
          <button id="prevPhoto" aria-label="Anterior">←</button>
          <button id="nextPhoto" aria-label="Próximo">→</button>
        </div>
      ` : ''}
    </div>

    <div class="detail-top">
      <div class="detail-main-info">
        <section class="summary-box">
          <h1 style="margin:0 0 0.5rem 0; font-size: 1.6rem; color: var(--text);">${escapeHtml(logradouro)}</h1>
          <p style="color: var(--text-light); margin:0;">${escapeHtml(cidadeEstado)}</p>
        </section>

        <div class="feature-list">
          <div class="feature-card"><span>Área</span><strong>${item.metragem || '--'} m²</strong></div>
          <div class="feature-card"><span>Quartos</span><strong>${item.quartos || '0'}</strong></div>
          <div class="feature-card"><span>Banheiros</span><strong>${item.banheiros || '0'}</strong></div>
          <div class="feature-card"><span>Vagas</span><strong>${item.vagas || '0'}</strong></div>
        </div>

        <section class="summary-box">
          <h2 style="font-size: 1.1rem; margin-bottom: 1rem; color: var(--text);">Sobre este imóvel</h2>
          <p style="white-space: pre-line; color: var(--text-light); line-height: 1.6;">${escapeHtml(item.descricao || 'Sem descrição disponível.')}</p>
        </section>
      </div>

      <aside class="detail-sidebar">
        <div class="summary-box sticky-sidebar">
          <span style="font-weight: 600; color: var(--text-light); font-size: 0.9rem;">Preço</span>
          <span class="price-tag">${valorAluguel}</span>

          <div><br></div>
          
          <div class="price-details">
            <div class="price-row">
              <span>Condomínio</span> <span>R$ ${Number(item.valor_condominio || 0).toLocaleString('pt-BR')}</span>
            </div>
            <div class="price-row">
              <span>IPTU</span> <span>R$ ${Number(item.valor_iptu || 0).toLocaleString('pt-BR')}</span>
            </div>
          </div>

          <div><br></div>

          <div class="total-price-container">
            <div class="total-row">
              <span></span> <span></span>
            </div>
          </div>

          

          <a href="https://wa.me/SEUNUMERO" target="_blank" class="btn-contact">
            Agendar Visita
          </a>
        </div>

        
      </aside>
    </div>
  `;

  initializeGallery(photoUrls);
}

function initializeGallery(photoUrls) {
  const mainPhoto = document.getElementById('detailMainPhoto');
  if (!mainPhoto || photoUrls.length <= 1) {
    return;
  }

  let currentIndex = 0;
  const prevButton = document.getElementById('prevPhoto');
  const nextButton = document.getElementById('nextPhoto');
  const thumbButtons = Array.from(document.querySelectorAll('.gallery-thumb'));

  function updateGallery(index) {
    currentIndex = (index + photoUrls.length) % photoUrls.length;
    mainPhoto.src = photoUrls[currentIndex];
    thumbButtons.forEach((button) => {
      button.classList.toggle('active', Number(button.dataset.index) === currentIndex);
    });
  }

  prevButton.addEventListener('click', () => updateGallery(currentIndex - 1));
  nextButton.addEventListener('click', () => updateGallery(currentIndex + 1));
  thumbButtons.forEach((button) => {
    button.addEventListener('click', () => updateGallery(Number(button.dataset.index)));
  });

  updateGallery(0);
}

function normalizePhotoField(raw) {
  if (!raw) {
    return [];
  }
  if (Array.isArray(raw)) {
    return raw.filter(Boolean);
  }
  if (typeof raw === 'string') {
    const urls = extractUrls(raw);
    if (urls.length) {
      return urls;
    }
    return parseRawPhotoString(raw);
  }
  return [];
}

function extractUrls(raw) {
  const urlRegex = /https?:\/\/[\w\-./?=&%#]+/g;
  return raw.match(urlRegex) || [];
}

function parseRawPhotoString(raw) {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(Boolean);
    }
    return [parsed];
  } catch (error) {
    try {
      const normalized = raw.replace(/'/g, '"');
      const parsed = JSON.parse(normalized);
      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean);
      }
      return [parsed];
    } catch (_error) {
      return [raw];
    }
  }
}

function getDefaultImage() {
  return 'https://images.unsplash.com/photo-1560185127-6db2ff084534?auto=format&fit=crop&w=900&q=80';
}

function showError(message) {
  detailContent.innerHTML = `<div class="detail-error">${escapeHtml(message)}</div>`;
}

function escapeHtml(value) {
  const text = String(value);
  return text.replace(/[&<>\"]+/g, (match) => {
    const escape = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;'
    };
    return escape[match];
  });
}
