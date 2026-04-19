import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

import { CONFIG } from '../base/config.js';
const SUPABASE_URL = CONFIG.SUPABASE_URL;
const SUPABASE_ANON_KEY = CONFIG.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const listingsContainer = document.getElementById('listings');
const searchInput = document.getElementById('searchInput');
let allListings = [];

searchInput.addEventListener('input', () => {
  const filter = searchInput.value.toLowerCase().trim();
  const filtered = allListings.filter((item) => {
    return (
      String(item.endereco || '').toLowerCase().includes(filter) ||
      String(item.uf || '').toLowerCase().includes(filter) ||
      String(item.descricao || '').toLowerCase().includes(filter) ||
      String(item.quartos || '').toLowerCase().includes(filter) ||
      String(item.banheiros || '').toLowerCase().includes(filter)
    );
  });
  renderListings(filtered);
});

async function fetchListings() {
  listingsContainer.innerHTML = '<div class="loading">Carregando anúncios...</div>';

  const { data, error } = await supabase
    .from('imoveis')
    .select('*')
    .eq('aluguel', true)
    .order('data_criacao', { ascending: false });

  if (error) {
    listingsContainer.innerHTML = `<div class="error-message">Erro ao carregar anúncios: ${error.message}</div>`;
    return;
  }

  allListings = data || [];
  renderListings(allListings);
}

function renderListings(listings) {
  if (!listings.length) {
    listingsContainer.innerHTML = '<div class="empty-message">Nenhum imóvel encontrado.</div>';
    return;
  }

  listingsContainer.innerHTML = listings
    .map((item) => {
      const valorAluguel = item.valor_aluguel != null ? `R$ ${item.valor_aluguel.toFixed(2)}` : 'Valor indisponível';
      const condominio = item.valor_condominio != null ? `Cond. R$ ${item.valor_condominio.toFixed(2)}` : 'Cond. não informado';
      const iptu = item.valor_iptu != null ? `IPTU R$ ${item.valor_iptu.toFixed(2)}` : 'IPTU não informado';
      const endereco = item.endereco ? escapeHtml(item.endereco) : 'Endereço não informado';
      const location = [item.bairro, item.cidade, item.uf].filter(Boolean).join(', ') || 'Localização não informada';
      const descricao = item.descricao ? truncateText(escapeHtml(item.descricao), 120) : 'Aluguel de imóvel';
      const photoUrl = getPhotoUrl(item.fotos);

      return `
        <article class="card">
          <div class="card-media">
            <img src="${escapeHtml(photoUrl)}" alt="Foto do imóvel" />
          </div>
          <div class="card-content">
            <div class="card-price-row">
              <div>
                <p class="card-title">${descricao}</p>
                <p class="card-meta">${escapeHtml(condominio)} • ${escapeHtml(iptu)}</p>
              </div>
            </div>

            <div class="card-price">
              <strong>${valorAluguel}</strong>
              <small>/mês</small>
            </div>

            <div class="card-features">
              <div class="feature"><strong>${item.metragem != null ? `${item.metragem} m²` : 'N/A'}</strong>Área</div>
              <div class="feature"><strong>${item.quartos ?? 'N/A'}</strong>Quartos</div>
              <div class="feature"><strong>${item.vagas ?? 'N/A'}</strong>Vagas</div>
            </div>

            <div class="card-location">
              <p class="location-title">${escapeHtml(location)}</p>
              <p class="location-subtitle">${endereco}</p>
            </div>

            <a class="details-button" href="detalhes.html?id=${encodeURIComponent(item.id)}">Mais Detalhes</a>
          </div>
        </article>
      `;
    })
    .join('');
}

function getPhotoUrl(raw) {
  const defaultUrl = 'https://images.unsplash.com/photo-1560185127-6db2ff084534?auto=format&fit=crop&w=900&q=80';
  if (!raw) {
    return defaultUrl;
  }

  const values = normalizePhotoField(raw);
  const firstValue = values.find((value) => value != null);
  if (!firstValue) {
    return defaultUrl;
  }

  if (typeof firstValue === 'string') {
    const extracted = extractFirstHttpUrl(firstValue);
    if (extracted) {
      return extracted;
    }
    return getStorageUrl(firstValue, defaultUrl);
  }

  if (typeof firstValue === 'object') {
    if (firstValue.url) {
      return firstValue.url;
    }
    if (firstValue.path) {
      return getStorageUrl(firstValue.path, defaultUrl);
    }
  }

  return defaultUrl;
}

function normalizePhotoField(raw) {
  if (Array.isArray(raw)) {
    return raw;
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

function extractFirstHttpUrl(raw) {
  const urls = extractUrls(raw);
  return urls.length ? urls[0] : null;
}

function parseRawPhotoString(raw) {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [parsed];
  } catch (error) {
    try {
      const normalized = raw.replace(/'/g, '"');
      const parsed = JSON.parse(normalized);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [parsed];
    } catch (_error) {
      return [raw];
    }
  }
}

function getStorageUrl(path, fallback) {
  if (!path) {
    return fallback;
  }

  const normalizedPath = path.replace(/^\/?imovel-fotos\//, '');
  const { data } = supabase.storage.from('imovel-fotos').getPublicUrl(normalizedPath);
  return data?.publicUrl || fallback;
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength).trimEnd() + '...';
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

fetchListings();
