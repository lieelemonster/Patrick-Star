/* ============================================================
   派大星 · 个人网站脚本
   只有四件小事：深色模式、滚动动画、导航高亮、阅读进度条
   ============================================================ */

(function () {
  'use strict';

  /* ---------- 1. 深色 / 浅色模式 ---------- */

  var root = document.documentElement;
  var toggle = document.getElementById('themeToggle');
  var STORAGE_KEY = 'theme';

  function preferredTheme() {
    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* 隐私模式下会报错，忽略 */ }
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0e0e0f' : '#fbfaf8');
    if (toggle) {
      toggle.setAttribute(
        'aria-label',
        theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'
      );
    }
  }

  applyTheme(preferredTheme());

  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* 忽略 */ }
    });
  }

  // 用户没手动选过时，跟随系统切换
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (err) { /* 忽略 */ }
    if (!saved) applyTheme(e.matches ? 'dark' : 'light');
  });

  /* ---------- 2. 滚动出现动画 ---------- */

  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  if (!('IntersectionObserver' in window)) {
    // 老浏览器：直接全部显示
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    reveals.forEach(function (el, i) {
      // 同一屏内的元素错开一点点出现，看起来更从容
      el.style.transitionDelay = Math.min(i % 6, 5) * 55 + 'ms';
      revealObserver.observe(el);
    });
  }

  /* ---------- 3. 导航高亮 + 头部描边 ---------- */

  var header = document.getElementById('siteHeader');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a'));
  var sections = navLinks
    .map(function (link) { return document.querySelector(link.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle(
            'is-active',
            link.getAttribute('href') === '#' + entry.target.id
          );
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (section) { sectionObserver.observe(section); });
  }

  /* ---------- 4. 阅读进度条 ---------- */

  var progress = document.getElementById('progress');
  var ticking = false;

  function onScroll() {
    var scrolled = window.scrollY || document.documentElement.scrollTop;
    var total = document.documentElement.scrollHeight - window.innerHeight;

    if (progress) {
      progress.style.width = (total > 0 ? Math.min(scrolled / total, 1) * 100 : 0) + '%';
    }
    if (header) {
      header.classList.toggle('is-scrolled', scrolled > 8);
    }
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(onScroll);
  }, { passive: true });

  onScroll();

  /* ---------- 5. 唤起角色扮演机器人 ---------- */

  var labStart = document.getElementById('labStart');
  var labHint = document.getElementById('labHint');

  // Dify 的窗口是它自己渲染的，这里只是判断一下「现在是不是已经开着」
  function chatWindowIsOpen() {
    var win = document.getElementById('dify-chatbot-bubble-window');
    if (!win) return false;
    var cs = window.getComputedStyle(win);
    var rect = win.getBoundingClientRect();
    return cs.display !== 'none' && cs.visibility !== 'hidden' &&
           rect.width > 0 && rect.height > 0;
  }

  if (labStart) {
    labStart.addEventListener('click', function () {
      var bubble = document.getElementById('dify-chatbot-bubble-button');

      // 嵌入脚本是 defer 的，第一次点得早可能还没渲染出来
      if (!bubble) {
        if (labHint) labHint.textContent = '聊天窗口还在加载，稍等一下再点';
        return;
      }

      // 已经开着就别再点一次，不然就关掉了
      if (!chatWindowIsOpen()) bubble.click();
    });
  }

  /* ---------- 页脚年份 ---------- */

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
