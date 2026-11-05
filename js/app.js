/* ═══════════════════════════════════════════════════════════════
   app.js — navigation, reveal, cursor, palette, dossiers, misc
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  /* ── year + Hyderabad clock ─────────────────────────────────── */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const clockEls = [$('#clock'), $('#clockFoot')].filter(Boolean);
  const timeFmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });
  const tickClock = () => {
    const t = timeFmt.format(new Date());
    clockEls.forEach(el => { el.textContent = t; });
  };
  if (clockEls.length) { tickClock(); setInterval(tickClock, 1000); }

  /* ── toast ──────────────────────────────────────────────────── */
  let toastTimer;
  const toastEl = $('#toast');
  function toast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 2600);
  }

  window.addEventListener('portfolio:toast', e => toast(e.detail || 'Done'));

  /* ── nav: shrink, burger, active link ───────────────────────── */
  const nav = $('.nav');
  const onScrollNav = () => {
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 14);
  };
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  const burger = $('[data-menu-toggle]');
  const mobileMenu = $('#mobileMenu');
  function closeMenu() {
    if (!burger || !mobileMenu) return;
    burger.setAttribute('aria-expanded', 'false');
    mobileMenu.hidden = true;
  }
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      const open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      mobileMenu.hidden = open;
    });
    $$('a', mobileMenu).forEach(a => a.addEventListener('click', closeMenu));
    window.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  }

  const navLinks = $$('.nav__links a');
  const sections = navLinks
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const navObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = '#' + entry.target.id;
        navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === id));
      });
    }, { rootMargin: '-42% 0px -52% 0px', threshold: 0 });
    sections.forEach(s => navObserver.observe(s));
  }

  /* ── scroll reveal ──────────────────────────────────────────── */
  const revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-in'));
  }

  /* ── scroll progress ────────────────────────────────────────── */
  const progress = $('#progress');
  let progressRaf = null;
  function updateProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    if (progress) progress.style.width = (ratio * 100).toFixed(2) + '%';
    progressRaf = null;
  }
  window.addEventListener('scroll', () => {
    if (progressRaf === null) progressRaf = requestAnimationFrame(updateProgress);
  }, { passive: true });
  updateProgress();

  /* ── copy email ─────────────────────────────────────────────── */
  const EMAIL = 'naveensaravanan2002@gmail.com';
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(EMAIL);
      toast('Email copied — talk soon');
    } catch (err) {
      const ta = document.createElement('textarea');
      ta.value = EMAIL;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); toast('Email copied — talk soon'); }
      catch (e) { toast('Copy failed — ' + EMAIL); }
      ta.remove();
    }
  }
  $$('[data-copy-email]').forEach(btn => btn.addEventListener('click', copyEmail));

  /* ── custom cursor ──────────────────────────────────────────── */
  if (finePointer && !reduceMotion) {
    const dot = $('#cursorDot');
    const ring = $('#cursorRing');
    if (dot && ring) {
      let mx = window.innerWidth / 2, my = window.innerHeight / 2;
      let rx = mx, ry = my;
      let shown = false;
      window.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        dot.style.transform = `translate(${mx}px, ${my}px)`;
        if (!shown) {
          shown = true;
          rx = mx; ry = my;
          document.body.classList.add('cursor-on');
        }
      }, { passive: true });
      (function loop() {
        rx += (mx - rx) * 0.18;
        ry += (my - ry) * 0.18;
        ring.style.transform = `translate(${rx}px, ${ry}px)`;
        requestAnimationFrame(loop);
      })();

      const interactive = 'a, button, [data-cursor="link"], .tech, input, textarea, summary';
      document.addEventListener('mouseover', e => {
        const t = e.target;
        if (!(t instanceof Element)) return;
        ring.classList.toggle('is-link', !!t.closest(interactive));
        ring.classList.toggle('is-dark', !!t.closest('.feature, .experience, .footer'));
      });
      document.addEventListener('mouseleave', () => {
        dot.style.opacity = '0'; ring.style.opacity = '0';
      });
      document.addEventListener('mouseenter', () => {
        dot.style.opacity = ''; ring.style.opacity = '';
      });
    }
  }

  /* ── magnetic buttons ───────────────────────────────────────── */
  if (finePointer && !reduceMotion) {
    $$('.btn').forEach(btn => {
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        btn.style.transform = `translate(${(dx * 5).toFixed(2)}px, ${(dy * 4 - 2).toFixed(2)}px)`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });
  }

  /* ── dossier modal ──────────────────────────────────────────── */
  const dossierDialog = $('#dossier');
  const dossierContent = $('#dossierContent');
  let lastFocused = null;

  function buildDossier(key) {
    const data = window.DOSSIERS && window.DOSSIERS[key];
    if (!data || !dossierContent) return;

    const metaRows = data.meta.map(m =>
      `<div><dt>${m.label}</dt><dd>${m.value}</dd></div>`).join('');

    const blocks = data.blocks.map(block => {
      let body = '';
      if (block.p) body = `<p>${block.p}</p>`;
      if (block.list) body = `<ul class="dossier__list">${block.list.map(li => `<li>${li}</li>`).join('')}</ul>`;
      if (block.decisions) {
        body = `<div class="dossier__decisions">${block.decisions.map(d =>
          `<div class="dossier__decision"><b>${d.b}</b><span>${d.s}</span></div>`).join('')}</div>`;
      }
      return `<div class="dossier__block"><h4>${block.h}</h4>${body}</div>`;
    }).join('');

    const links = data.links.map(l => {
      if (l.dossier) {
        return `<button class="btn btn--sm btn--ghost" type="button" data-dossier="${l.dossier}">${l.label} ›</button>`;
      }
      return `<a class="btn btn--sm btn--ink" href="${l.href}"${l.external ? ' target="_blank" rel="noopener"' : ''}>${l.label} <svg class="i" aria-hidden="true"><use href="#i-arrow-ne"/></svg></a>`;
    }).join('');

    dossierContent.innerHTML = `
      <p class="dossier__kicker mono">${data.kicker.join(' · ')}</p>
      <h2 class="dossier__title" id="dossierTitle">${data.title}</h2>
      <p class="dossier__tagline">${data.tagline}</p>
      <dl class="dossier__meta">${metaRows}</dl>
      ${blocks}
      <div class="dossier__links">${links}</div>
    `;

    const panel = $('#dossierPanel');
    if (panel) panel.scrollTop = 0;
  }

  function openDossier(key) {
    if (!dossierDialog) return;
    buildDossier(key);
    if (!dossierDialog.open) {
      lastFocused = document.activeElement;
      dossierDialog.showModal();
      document.body.classList.add('no-scroll');
    }
    const closeBtn = $('[data-modal-close]', dossierDialog);
    if (closeBtn) closeBtn.focus({ preventScroll: true });
  }

  document.addEventListener('click', e => {
    const trigger = e.target instanceof Element ? e.target.closest('[data-dossier]') : null;
    if (trigger) {
      e.preventDefault();
      openDossier(trigger.getAttribute('data-dossier'));
    }
  });

  if (dossierDialog) {
    dossierDialog.addEventListener('click', e => {
      if (e.target === dossierDialog) dossierDialog.close();
    });
    $$('[data-modal-close]', dossierDialog).forEach(b =>
      b.addEventListener('click', () => dossierDialog.close()));
    dossierDialog.addEventListener('close', () => {
      document.body.classList.remove('no-scroll');
      if (lastFocused && lastFocused.focus) lastFocused.focus({ preventScroll: true });
    });
  }

  /* ── command palette ────────────────────────────────────────── */
  const palette = $('#palette');
  const paletteInput = $('#paletteInput');
  const paletteList = $('#paletteList');
  let paletteItems = [];
  let paletteIndex = 0;

  const projectNames = {
    fingraph: 'FinGraphAI — AML graph console',
    ledgerlake: 'LedgerLake — transaction data platform',
    ranger: 'Ranger — receipt spending analytics',
    driveu: 'DriveU — driver booking platform',
    brickbreaker: 'Brick Breaker — playable arcade'
  };

  function buildPaletteItems() {
    const items = [
      { group: 'Section', label: 'Work — five shipped projects', run: () => go('#work') },
      { group: 'Section', label: 'Skills — capability ledger', run: () => go('#skills') },
      { group: 'Section', label: 'Experience — LTIMindtree', run: () => go('#experience') },
      { group: 'Section', label: 'Credentials — certifications', run: () => go('#credentials') },
      { group: 'Section', label: 'About — the longer version', run: () => go('#about') },
      { group: 'Section', label: 'Contact — say hello', run: () => go('#contact') }
    ];
    Object.keys(projectNames).forEach(key => {
      items.push({ group: 'Case study', label: projectNames[key], run: () => openDossier(key) });
    });
    items.push(
      { group: 'Action', label: 'Copy email address', run: copyEmail },
      { group: 'Action', label: 'Download resume (PDF)', run: () => { window.open('assets/NaveenS-Resume.pdf', '_blank', 'noopener'); } },
      { group: 'Link', label: 'GitHub — Naveensaravanan2002', run: () => window.open('https://github.com/Naveensaravanan2002', '_blank', 'noopener') },
      { group: 'Link', label: 'LinkedIn — naveensaravanan2002', run: () => window.open('https://www.linkedin.com/in/naveensaravanan2002/', '_blank', 'noopener') },
      { group: 'Action', label: 'Back to top', run: () => go('#top') }
    );
    return items;
  }

  function go(hash) {
    if (palette && palette.open) palette.close();
    const target = document.querySelector(hash);
    if (!target) return;
    if (hash === '#top') window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    else target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  function renderPalette(query) {
    if (!paletteList) return;
    const q = query.trim().toLowerCase();
    const filtered = paletteItems.filter(item =>
      !q || (item.label + ' ' + item.group).toLowerCase().includes(q));
    paletteIndex = 0;
    if (!filtered.length) {
      paletteList.innerHTML = '<li class="palette__empty">Nothing here. Try “work”, “graph”, “email”…</li>';
      return;
    }
    paletteList.innerHTML = filtered.map((item, i) => `
      <li>
        <button type="button" class="palette__item${i === 0 ? ' is-active' : ''}" data-index="${i}" role="option" aria-selected="${i === 0}">
          <span class="mono">${item.group}</span>
          <b>${item.label}</b>
          <small>${item.hint || ''}</small>
        </button>
      </li>`).join('');
    palette._filtered = filtered;
  }

  function movePalette(delta) {
    const buttons = $$('.palette__item', paletteList);
    if (!buttons.length) return;
    paletteIndex = (paletteIndex + delta + buttons.length) % buttons.length;
    buttons.forEach((b, i) => {
      b.classList.toggle('is-active', i === paletteIndex);
      b.setAttribute('aria-selected', String(i === paletteIndex));
    });
    buttons[paletteIndex].scrollIntoView({ block: 'nearest' });
  }

  function runPalette(index) {
    const filtered = palette._filtered || [];
    const item = filtered[index];
    if (!item) return;
    if (palette && palette.open) palette.close();
    setTimeout(() => item.run(), 40);
  }

  if (palette && paletteInput && paletteList) {
    paletteItems = buildPaletteItems();

    const openPalette = () => {
      if (palette.open) return;
      lastFocused = document.activeElement;
      palette.showModal();
      document.body.classList.add('no-scroll');
      paletteInput.value = '';
      renderPalette('');
      requestAnimationFrame(() => paletteInput.focus());
    };

    $$('[data-palette-open]').forEach(b => b.addEventListener('click', openPalette));

    document.addEventListener('keydown', e => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      if ((isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        palette.open ? palette.close() : openPalette();
      }
      if (e.key === '/' && !palette.open && !/input|textarea/i.test(document.activeElement.tagName)) {
        e.preventDefault();
        openPalette();
      }
    });

    paletteInput.addEventListener('input', () => renderPalette(paletteInput.value));

    paletteInput.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); movePalette(1); }
      if (e.key === 'ArrowUp') { e.preventDefault(); movePalette(-1); }
      if (e.key === 'Enter') { e.preventDefault(); runPalette(paletteIndex); }
    });

    paletteList.addEventListener('click', e => {
      const btn = e.target.closest('.palette__item');
      if (!btn) return;
      runPalette(Number(btn.getAttribute('data-index')));
    });

    paletteList.addEventListener('mousemove', e => {
      const btn = e.target.closest('.palette__item');
      if (!btn) return;
      paletteIndex = Number(btn.getAttribute('data-index'));
      $$('.palette__item', paletteList).forEach((b, i) => b.classList.toggle('is-active', i === paletteIndex));
    });

    palette.addEventListener('click', e => {
      if (e.target === palette) palette.close();
    });

    palette.addEventListener('close', () => {
      document.body.classList.remove('no-scroll');
      if (lastFocused && lastFocused.focus) lastFocused.focus({ preventScroll: true });
    });
  }

  /* ── contact form → delivered by email ───────────────────────
     Hosted on Netlify? Then Netlify's own form handling does the mailing:
     same-origin, no third party, no activation step. Anywhere else the
     FormSubmit AJAX endpoint is used instead.
     ────────────────────────────────────────────────────────────── */
  const NETLIFY_FORM_NAME = 'contact';
  const FORM_ENDPOINT = 'https://formsubmit.co/ajax/naveensaravanan2002@gmail.com';
  const openedFromFile = window.location.protocol === 'file:';

  /* Netlify stamps every response with an x-nf-request-id header, so one
     same-origin HEAD is enough to tell which host we're on. Cached. */
  let netlifyHost = null;
  const hostedOnNetlify = async () => {
    if (netlifyHost !== null) return netlifyHost;
    try {
      const res = await fetch('assets/favicon.svg', { method: 'HEAD', cache: 'no-store' });
      netlifyHost = res.headers.has('x-nf-request-id');
    } catch (err) {
      netlifyHost = false;
    }
    return netlifyHost;
  };

  const form = $('#contactForm');
  if (form) {
    const submitBtn = $('#contactSubmit');
    const note = $('#formNote');
    const label = submitBtn ? submitBtn.querySelector('.contact__btn-label') : null;
    let sending = false;

    const setNote = (text, state) => {
      if (!note) return;
      note.textContent = text;
      note.classList.toggle('is-error', state === 'error');
      note.classList.toggle('is-ok', state === 'ok');
    };

    const mailtoFallback = (name, email, message) => {
      const subject = encodeURIComponent(`Portfolio note from ${name.trim() || 'a visitor'}`);
      const body = encodeURIComponent(`${message.trim()}\n\n— ${name.trim()}${email.trim() ? ' (' + email.trim() + ')' : ''}`);
      window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
    };

    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (sending) return;

      const name = ($('#name') || {}).value || '';
      const email = ($('#email') || {}).value || '';
      const message = ($('#message') || {}).value || '';

      if (!name.trim() || !email.trim() || !message.trim()) {
        setNote('One field is empty — name, email and a message, please.', 'error');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
        setNote('That email address does not look right.', 'error');
        return;
      }

      // A page opened by double-clicking index.html has no origin, so browsers
      // block the cross-origin post. Don't pretend to try — say so.
      if (openedFromFile) {
        setNote('This page is opened straight from disk, so the browser blocks the form. Open it from a web address (or the deployed site) — for now, opening your mail app.', 'error');
        mailtoFallback(name, email, message);
        return;
      }

      sending = true;
      if (submitBtn) submitBtn.disabled = true;
      if (label) label.textContent = 'Sending…';
      setNote('Sending your note…', '');

      try {
        if (await hostedOnNetlify()) {
          const body = new URLSearchParams({
            'form-name': NETLIFY_FORM_NAME,
            name: name.trim(),
            email: email.trim(),
            message: message.trim(),
            'bot-field': ''
          });
          const res = await fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString()
          });
          if (!res.ok) throw new Error(`Netlify form returned ${res.status}.`);
        } else {
          const res = await fetch(FORM_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
              name: name.trim(),
              email: email.trim(),
              message: message.trim(),
              _subject: `Portfolio note from ${name.trim()}`,
              _template: 'table',
              _captcha: 'false'
            })
          });

          let data = null;
          try { data = await res.json(); } catch (err) { /* non-JSON reply */ }

          const failed = !res.ok || (data && (data.success === false || data.success === 'false'));
          if (failed) {
            throw new Error((data && (data.message || data.error)) || `Request failed (${res.status}).`);
          }
        }

        form.reset();
        if (label) label.textContent = 'Sent';
        setNote('Sent. It lands in my inbox — I usually reply within a day.', 'ok');
        toast('Note sent — thank you');
        setTimeout(() => { if (label) label.textContent = 'Send the note'; }, 4000);
      } catch (err) {
        const reason = (err && err.message) ? err.message : '';
        const activation = /activat|confirm/i.test(reason);
        if (label) label.textContent = 'Send the note';
        setNote(
          activation
            ? 'Almost there — the form needs a one-time activation (check naveensaravanan2002@gmail.com). Meanwhile this opens your mail app.'
            : 'Could not send from the browser. Opening your mail app instead — or email me directly.',
          'error'
        );
        mailtoFallback(name, email, message);
      } finally {
        sending = false;
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  /* ── doodle parallax ───────────────────────────────────────── */
  const doodle = $('#doodle');
  if (doodle && finePointer && !reduceMotion) {
    let raf = null;
    const onMove = e => {
      const r = doodle.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        doodle.style.transform = `translate3d(${(dx * 9).toFixed(2)}px, ${(dy * 7).toFixed(2)}px, 0)`;
        raf = null;
      });
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    doodle.addEventListener('mouseleave', () => { doodle.style.transform = ''; });
  }

  /* ── smooth anchor fallback for older browsers ──────────────── */
  if (!('scrollBehavior' in document.documentElement.style)) {
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView();
      });
    });
  }
})();
