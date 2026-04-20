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

function renderProperty(item) {
  const photoUrls = normalizePhotoField(item.fotos);
  const mainPhoto = photoUrls.length ? photoUrls[0] : getDefaultImage();
  const location = [item.endereco, item.uf].filter(Boolean).join(' - ');
  const valorAluguel = item.valor_aluguel != null ? `R$ ${item.valor_aluguel.toFixed(2)}` : 'Valor indisponível';
  const valorCondominio = item.valor_condominio != null ? `R$ ${item.valor_condominio.toFixed(2)}` : 'Não informado';
  const valorIptu = item.valor_iptu != null ? `R$ ${item.valor_iptu.toFixed(2)}` : 'Não informado';
  const valorTotal = item.valor_aluguel != null ? `R$ ${(Number(item.valor_aluguel || 0) + Number(item.valor_condominio || 0) + Number(item.valor_iptu || 0)).toFixed(2)}` : 'Não disponível';

  detailContent.innerHTML = `
    <div class="detail-top">
      <div class="detail-gallery">
        <div class="gallery-main">
          <img id="detailMainPhoto" src="${escapeHtml(mainPhoto)}" alt="Foto do imóvel" />
          ${photoUrls.length > 1 ? `
            <div class="gallery-controls">
              <button id="prevPhoto" aria-label="Foto anterior">←</button>
              <button id="nextPhoto" aria-label="Próxima foto">→</button>
            </div>
          ` : ''}
        </div>
        ${photoUrls.length > 1 ? `
          <div class="gallery-thumbs">
            ${photoUrls
              .map((url, index) => `
                <button class="gallery-thumb" type="button" data-index="${index}">
                  <img src="${escapeHtml(url)}" alt="Miniatura ${index + 1}" />
                </button>
              `)
              .join('')}
          </div>
        ` : ''}
      </div>

      <div class="property-summary">
        <div class="summary-box">
          <p>${escapeHtml(location)}</p>
        </div>

        <div class="summary-box summary-row">
          <div class="summary-item">
            <strong>Aluguel</strong>
            <span>${valorAluguel}/mês</span>
          </div>
          <div class="summary-item">
            <strong>Condomínio</strong>
            <span>${valorCondominio}</span>
          </div>
          <div class="summary-item">
            <strong>IPTU</strong>
            <span>${valorIptu}</span>
          </div>
          <div class="summary-item">
            <strong>Valor total previsto</strong>
            <span>${valorTotal}</span>
          </div>
        </div>

        <div class="summary-box">
          <div class="feature-list">
            <div class="feature-card"><strong>${item.metragem != null ? `${item.metragem} m²` : 'N/A'}</strong>Área</div>
            <div class="feature-card"><strong>${item.quartos ?? 'N/A'}</strong>Quartos</div>
            <div class="feature-card"><strong>${item.banheiros ?? 'N/A'}</strong>Banheiros</div>
            <div class="feature-card"><strong>${item.vagas ?? 'N/A'}</strong>Vagas</div>
          </div>
        </div>

        <div class="summary-box">
          <p class="detail-title">Contatos</p>
          <p>Entre em contato com o anunciante para agendar uma visita.</p>
          <a class="detail-link" href="mailto:contato@exemplo.com">contato@exemplo.com</a>
        </div>
      </div>
    </div>

    <div class="property-body">
      <div class="property-panel">
        <h2>Descrição completa</h2>
        <p>${escapeHtml(item.descricao || 'Sem descrição disponível.')}</p>
      </div>

      <div class="property-panel">
        <h2>Localização</h2>
        <p>${escapeHtml(location)}</p>
      </div>
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
