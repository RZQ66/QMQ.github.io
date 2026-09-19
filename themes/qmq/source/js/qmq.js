(function () {
  const config = window.QMQ_CONFIG || {};
  const root = config.root || '/';
  const asset = (path) => {
    if (!path) return '';
    if (/^(https?:)?\/\//.test(path)) return path;
    const normalizedRoot = `/${root.replace(/^\/+|\/+$/g, '')}/`.replace(/^\/\/$/, '/');
    const normalizedPath = String(path);
    if (normalizedPath.startsWith(normalizedRoot)) return normalizedPath;
    if (normalizedRoot !== '/' && normalizedPath.startsWith(normalizedRoot.slice(1))) {
      return `/${normalizedPath}`;
    }
    return normalizedRoot + normalizedPath.replace(/^\/+/, '');
  };

  const header = document.querySelector('[data-header]');
  const refreshHeader = () => {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 28);
  };
  refreshHeader();
  window.addEventListener('scroll', refreshHeader, { passive: true });

  document.querySelectorAll('[data-stagger]').forEach((node, groupIndex) => {
    const text = node.textContent;
    node.textContent = '';
    [...text].forEach((char, index) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = char === ' ' ? '\u00a0' : char;
      span.style.animationDelay = `${760 + groupIndex * 420 + index * (config.animationDelay || 58)}ms`;
      node.appendChild(span);
    });
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });
  document.querySelectorAll('.reveal').forEach((node) => revealObserver.observe(node));

  document.querySelectorAll('.article-content img').forEach((image) => {
    if (!image.hasAttribute('loading')) image.loading = 'lazy';
    image.decoding = 'async';
  });

  const menuButton = document.querySelector('[data-menu-button]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  const menuBackdrop = document.querySelector('.side-menu-backdrop');
  const setMenu = (open) => {
    if (!menuButton || !mobileMenu) return;
    mobileMenu.classList.toggle('is-open', open);
    if (menuBackdrop) menuBackdrop.classList.toggle('is-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    mobileMenu.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('menu-open', open);
  };
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
      setMenu(!mobileMenu.classList.contains('is-open'));
    });
    document.querySelectorAll('[data-menu-close]').forEach((node) => {
      node.addEventListener('click', () => setMenu(false));
    });
  }

  const applyTheme = (mode) => {
    document.documentElement.dataset.theme = mode;
    try {
      localStorage.setItem('qmq-theme', mode);
    } catch (_) {
      // The visual switch still works when storage is unavailable.
    }
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.content = mode === 'dark' ? '#111315' : '#f7f3ec';
    const themeSwitch = document.querySelector('[data-pull-switch]');
    if (themeSwitch) themeSwitch.setAttribute('aria-label', mode === 'dark' ? '切换到白天模式' : '切换到夜间模式');
    const pool = config.heroImages || [];
    if (pool.length) {
      const current = document.documentElement.dataset.heroIndex || '0';
      const picked = pool[Number(current)] || pool[0];
      const image = mode === 'dark' && picked.night ? picked.night : picked.day;
      if (image) document.documentElement.style.setProperty('--hero-image', `url("${asset(image)}")`);
    }
  };

  const pool = config.heroImages || [];
  if (pool.length) {
    const initialIndex = Number(document.documentElement.dataset.heroIndex);
    const index = Number.isInteger(initialIndex) && initialIndex >= 0 && initialIndex < pool.length
      ? initialIndex
      : Math.floor(Math.random() * pool.length);
    document.documentElement.dataset.heroIndex = String(index);
    const mode = document.documentElement.dataset.theme || 'light';
    const picked = pool[index] || pool[0];
    const image = mode === 'dark' && picked.night ? picked.night : picked.day;
    const img = new Image();
    img.src = asset(image);
    img.onload = () => document.documentElement.style.setProperty('--hero-image', `url("${img.src}")`);
  }

  const pull = document.querySelector('[data-pull-switch]');
  if (pull) {
    const mode = document.documentElement.dataset.theme || 'light';
    pull.setAttribute('aria-label', mode === 'dark' ? '切换到白天模式' : '切换到夜间模式');
  }
  let startY = 0;
  let armed = false;
  let dragged = false;
  let suppressClick = false;
  const clickSound = () => {
    if (!config.sound || !window.AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 520;
    gain.gain.value = 0.018;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.035);
  };
  const toggleLight = () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    clickSound();
  };
  if (pull) {
    pull.addEventListener('click', () => {
      if (suppressClick) {
        suppressClick = false;
        return;
      }
      toggleLight();
    });
    pull.addEventListener('pointerdown', (event) => {
      startY = event.clientY;
      armed = true;
      dragged = false;
      pull.setPointerCapture(event.pointerId);
      pull.classList.add('is-pulling');
    });
    pull.addEventListener('pointermove', (event) => {
      if (!armed) return;
      const distance = Math.max(0, Math.min(46, event.clientY - startY));
      if (distance > 4) dragged = true;
      pull.style.transform = `translateY(${distance}px)`;
    });
    pull.addEventListener('pointerup', (event) => {
      if (!armed) return;
      armed = false;
      const distance = event.clientY - startY;
      pull.classList.remove('is-pulling');
      pull.style.transform = '';
      pull.classList.add('is-swinging');
      setTimeout(() => pull.classList.remove('is-swinging'), 600);
      if (dragged) suppressClick = true;
      if (distance > 24) toggleLight();
    });
    pull.addEventListener('pointercancel', () => {
      armed = false;
      pull.classList.remove('is-pulling');
      pull.style.transform = '';
    });
  }

  const overlay = document.querySelector('[data-search-overlay]');
  const input = document.querySelector('[data-search-input]');
  const results = document.querySelector('[data-search-results]');
  let searchData = null;
  let loading = null;

  const strip = (html) => {
    const box = document.createElement('div');
    box.innerHTML = html || '';
    return box.textContent || box.innerText || '';
  };
  const escapeHtml = (text) => String(text || '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
  const escapeReg = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const highlight = (text, query) => {
    if (!query) return text;
    return text.replace(new RegExp(escapeReg(query), 'ig'), (match) => `<mark>${match}</mark>`);
  };
  const loadSearch = () => {
    if (searchData) return Promise.resolve(searchData);
    if (!loading) {
      loading = fetch(asset('/search.json'))
        .then((res) => res.json())
        .then((data) => {
          searchData = data;
          return data;
        })
        .catch(() => []);
    }
    return loading;
  };
  const runSearch = async () => {
    const query = (input.value || '').trim().toLowerCase();
    if (!query) {
      results.innerHTML = '<p class="search-empty">输入关键词后开始搜索。</p>';
      return;
    }
    const data = await loadSearch();
    const found = data
      .map((item) => {
        const text = strip(`${item.title || ''} ${item.content || ''} ${(item.tags || []).join(' ')} ${(item.categories || []).join(' ')}`);
        const haystack = text.toLowerCase();
        const index = haystack.indexOf(query);
        return { item, text, index, score: index === -1 ? 999999 : index };
      })
      .filter((row) => row.index !== -1)
      .sort((a, b) => a.score - b.score)
      .slice(0, 8);
    if (!found.length) {
      results.innerHTML = '<p class="search-empty">没有找到相关内容。</p>';
      return;
    }
    results.innerHTML = found.map(({ item, text, index }) => {
      const start = Math.max(0, index - 42);
      const excerpt = text.slice(start, start + 130);
      const itemUrl = item.path || item.url || '';
      const urlDate = itemUrl.match(/\/(\d{4})\/(\d{2})\/(\d{2})\//);
      const displayDate = item.date || (urlDate ? `${urlDate[1]}.${urlDate[2]}.${urlDate[3]}` : '');
      const meta = [displayDate, ...(item.categories || []), ...(item.tags || [])].filter(Boolean).join(' · ');
      return `<a class="search-result" href="${asset(itemUrl)}">
        <strong>${highlight(escapeHtml(item.title || '未命名文章'), query)}</strong>
        <p>${highlight(escapeHtml(excerpt), query)}...</p>
        <p>${escapeHtml(meta)}</p>
      </a>`;
    }).join('');
  };
  const openSearch = () => {
    if (!overlay || !input) return;
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    loadSearch();
    setTimeout(() => input.focus(), 40);
    runSearch();
  };
  const closeSearch = () => {
    if (!overlay) return;
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };
  document.querySelectorAll('[data-search-open]').forEach((node) => node.addEventListener('click', openSearch));
  document.querySelectorAll('[data-search-close]').forEach((node) => node.addEventListener('click', closeSearch));
  if (input) input.addEventListener('input', runSearch);
  window.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      openSearch();
    }
    if (event.key === 'Escape') {
      closeSearch();
      setMenu(false);
    }
  });
})();
