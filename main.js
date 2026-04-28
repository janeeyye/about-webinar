const CATEGORY_COLOR = {
  'Copilot': 'var(--copilot)',
  'Cloud & AI': 'var(--cloud-ai)',
  'Security': 'var(--security)',
};

const state = {
  events: [],
  selectedCategory: 'All',
  siteConfig: null,
};

const filterBarEl = document.getElementById('filterBar');
const resultsMetaEl = document.getElementById('resultsMeta');
const eventGridEl = document.getElementById('eventGrid');
const emptyStateEl = document.getElementById('emptyState');
const template = document.getElementById('eventCardTemplate');

const pageTitleEl = document.getElementById('pageTitle');
const pageSubtitleEl = document.getElementById('pageSubtitle');
const footerTextEl = document.getElementById('footerText');
const heroCtaEl = document.getElementById('heroCta');

async function loadJson(path, fallback = null) {
  try {
    const response = await fetch(path, { cache: 'no-store' });
    if (!response.ok) throw new Error(`${path} ${response.status}`);
    return await response.json();
  } catch (error) {
    return fallback;
  }
}

function normalizeTargetAudience(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}

function getAllCategories() {
  const categories = Array.from(new Set(state.events.map((event) => event.category).filter(Boolean)));
  return ['All', ...categories];
}

function getCategoryCount(category) {
  if (category === 'All') return state.events.length;
  return state.events.filter((event) => event.category === category).length;
}

function getFilteredEvents() {
  const events = [...state.events].sort((a, b) => {
    const left = `${a.date || ''} ${a.time || '00:00'}`;
    const right = `${b.date || ''} ${b.time || '00:00'}`;
    return left.localeCompare(right, 'ko');
  });

  if (state.selectedCategory === 'All') return events;
  return events.filter((event) => event.category === state.selectedCategory);
}

function formatDateTimeKST(date, time) {
  if (!date) return '-';
  const [year, month, day] = date.split('-').map(Number);
  const parsed = new Date(year, (month || 1) - 1, day || 1);
  const formattedDate = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    timeZone: 'Asia/Seoul',
  }).format(parsed);
  return time ? `${formattedDate} · ${time}` : formattedDate;
}

function buildDifficulty(level) {
  const normalized = String(level || '').trim().toLowerCase();
  const map = {
    1: 'Level 100',
    2: 'Level 200',
    3: 'Level 300',
    '100': 'Level 100',
    '200': 'Level 200',
    '300': 'Level 300',
    'level 100': 'Level 100',
    'level 200': 'Level 200',
    'level 300': 'Level 300',
  };

  return map[normalized] || map[Number(level)] || 'Level 100';
}

function renderFilters() {
  const categories = getAllCategories();
  filterBarEl.innerHTML = '';

  categories.forEach((category) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `filter-pill${state.selectedCategory === category ? ' active' : ''}`;
    button.textContent = category;

    if (state.selectedCategory === category) {
      button.style.background = category === 'All' ? 'var(--primary)' : (CATEGORY_COLOR[category] || 'var(--primary)');
    }

    const count = document.createElement('span');
    count.className = 'count';
    count.textContent = String(getCategoryCount(category));
    button.appendChild(count);

    button.addEventListener('click', () => {
      state.selectedCategory = category;
      render();
    });

    filterBarEl.appendChild(button);
  });
}

function createTag(tag) {
  const span = document.createElement('span');
  span.className = 'hashtag';
  span.textContent = tag.startsWith('#') ? tag : `#${tag}`;
  return span;
}

function renderCards(events) {
  eventGridEl.innerHTML = '';

  events.forEach((event) => {
    const fragment = template.content.cloneNode(true);
    const card = fragment.querySelector('.event-card');
    const topbar = fragment.querySelector('.card-topbar');
    const badge = fragment.querySelector('.category-badge');
    const difficulty = fragment.querySelector('.difficulty');
    const title = fragment.querySelector('.event-title');
    const hashtagRow = fragment.querySelector('.hashtag-row');
    const dateRow = fragment.querySelector('.date-row .detail-text');
    const desc = fragment.querySelector('.event-description');
    const audience = fragment.querySelector('.audience-row .detail-text');
    const link = fragment.querySelector('.register-link');

    topbar.style.background = CATEGORY_COLOR[event.category] || 'var(--primary)';
    badge.textContent = event.category || 'Webinar';
    difficulty.textContent = buildDifficulty(event.difficulty);
    title.textContent = event.title || '(Untitled)';
    dateRow.textContent = formatDateTimeKST(event.date, event.time);
    desc.textContent = event.description || '';
    const audienceList = normalizeTargetAudience(event.targetAudience);
    if (audienceList.length) {
      audience.textContent = audienceList.join(', ');
    } else {
      fragment.querySelector('.audience-row')?.remove();
    }
    link.href = event.registrationUrl || '#';

    const tags = String(event.hashtags || '').split(/\s+/).filter(Boolean);
    if (tags.length) {
      hashtagRow.classList.remove('hidden');
      tags.forEach((tag) => hashtagRow.appendChild(createTag(tag)));
    }

    if (!event.registrationUrl) {
      link.removeAttribute('href');
      link.setAttribute('aria-disabled', 'true');
      link.style.pointerEvents = 'none';
      link.style.opacity = '0.5';
    }

    eventGridEl.appendChild(fragment);
  });
}

function applySiteConfig() {
  const config = state.siteConfig || {};
  if (config.title) {
    document.title = config.title;
    pageTitleEl.textContent = config.title;
  }
  if (config.subtitle) pageSubtitleEl.textContent = config.subtitle;
  if (config.footerText) footerTextEl.textContent = config.footerText;
  if (config.heroCtaText) heroCtaEl.textContent = config.heroCtaText;
}

function render() {
  applySiteConfig();
  renderFilters();

  const filteredEvents = getFilteredEvents();
  resultsMetaEl.textContent = `${state.selectedCategory === 'All' ? '전체' : state.selectedCategory} 웨비나 ${filteredEvents.length}개`;

  if (filteredEvents.length === 0) {
    eventGridEl.innerHTML = '';
    emptyStateEl.classList.remove('hidden');
  } else {
    emptyStateEl.classList.add('hidden');
    renderCards(filteredEvents);
  }
}

async function init() {
  const [events, siteConfig] = await Promise.all([
    loadJson('./webinar-events.json', []),
    loadJson('./site-config.json', null),
  ]);

  state.events = Array.isArray(events) ? events : [];
  state.siteConfig = siteConfig;
  render();
}

init();
