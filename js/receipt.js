/* ═══════════════════════════════════════════════════════════════
   receipt.js — Ranger receipt parsing demo
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const runBtn = document.getElementById('receiptRun');
  const list = document.getElementById('receiptItems');
  const totalEl = document.getElementById('receiptTotal');
  const stateEl = document.getElementById('receiptMailState');
  const donut = document.getElementById('receiptDonut');
  const legend = document.getElementById('receiptLegend');
  const dupes = document.getElementById('receiptDupes');
  if (!runBtn || !list || !totalEl || !stateEl || !donut) return;

  const ITEMS = [
    { label: 'Uber · Airport ride', amount: 412.00, cat: 'travel' },
    { label: 'Swiggy · Lunch', amount: 268.50, cat: 'food' },
    { label: 'Zomato · Dinner', amount: 386.00, cat: 'food' },
    { label: 'Convenience fee', amount: 12.00, cat: 'fees' }
  ];
  const COLORS = { travel: '#0B3B2E', food: '#DFA32B', fees: '#E4582B' };
  const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  let runs = 0;
  let busy = false;

  function renderDonut() {
    const totals = { travel: 0, food: 0, fees: 0 };
    ITEMS.forEach(i => { totals[i.cat] += i.amount; });
    const sum = Object.values(totals).reduce((a, b) => a + b, 0);
    let cursor = 0;
    const stops = Object.keys(totals).map(key => {
      const from = cursor;
      cursor += (totals[key] / sum) * 100;
      return `${COLORS[key]} ${from.toFixed(1)}% ${cursor.toFixed(1)}%`;
    });
    donut.style.background = `conic-gradient(${stops.join(', ')})`;
    if (legend) {
      Array.from(legend.querySelectorAll('li')).forEach(li => {
        const key = li.textContent.trim().split(' ')[0].toLowerCase();
        const span = li.querySelector('span');
        if (span && totals[key] !== undefined) span.textContent = inr.format(totals[key]);
      });
    }
  }

  renderDonut();

  async function sync() {
    if (busy) return;
    busy = true;
    runs += 1;
    runBtn.disabled = true;
    const original = runBtn.innerHTML;
    runBtn.innerHTML = 'Parsing…';
    list.innerHTML = '';
    stateEl.textContent = 'parsing…';
    totalEl.textContent = '—';

    await sleep(420);
    stateEl.textContent = 'parsed';

    let total = 0;
    for (const item of ITEMS) {
      const li = document.createElement('li');
      const label = document.createElement('span');
      label.textContent = item.label;
      const amount = document.createElement('span');
      amount.textContent = inr.format(item.amount);
      li.append(label, amount);
      list.appendChild(li);
      total += item.amount;
      await sleep(170);
    }

    totalEl.textContent = inr.format(total);
    renderDonut();

    if (dupes) {
      dupes.textContent = runs === 1
        ? 'idempotent · 0 duplicates on re-sync'
        : `re-sync #${runs - 1} · 0 new · ${ITEMS.length} skipped`;
    }

    runBtn.innerHTML = original;
    runBtn.disabled = false;
    busy = false;
  }

  runBtn.addEventListener('click', sync);
})();
