/* ═══════════════════════════════════════════════════════════════
   graph.js — FinGraphAI interactive AML graph (demo)
   Deterministic sample network; the real app runs Cypher on Neo4j.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const svg = document.getElementById('graphSvg');
  const edgesGroup = document.getElementById('graphEdges');
  const nodesGroup = document.getElementById('graphNodes');
  if (!svg || !edgesGroup || !nodesGroup) return;

  const NODES = [
    { id: 'AC-1042', x: 62,  y: 66,  risk: 'low'  },
    { id: 'AC-2210', x: 168, y: 42,  risk: 'med'  },
    { id: 'AC-3387', x: 286, y: 62,  risk: 'high' },
    { id: 'AC-4102', x: 400, y: 44,  risk: 'low'  },
    { id: 'AC-5174', x: 470, y: 112, risk: 'med'  },
    { id: 'AC-6021', x: 392, y: 166, risk: 'high' },
    { id: 'AC-7345', x: 272, y: 196, risk: 'low'  },
    { id: 'AC-8110', x: 148, y: 152, risk: 'med'  },
    { id: 'AC-9284', x: 56,  y: 196, risk: 'low'  },
    { id: 'AC-1356', x: 108, y: 272, risk: 'high' },
    { id: 'AC-2420', x: 224, y: 292, risk: 'med'  },
    { id: 'AC-3591', x: 340, y: 288, risk: 'low'  },
    { id: 'AC-4778', x: 452, y: 240, risk: 'med'  },
    { id: 'AC-5063', x: 220, y: 122, risk: 'low'  }
  ];

  const EDGES = [
    ['AC-1042', 'AC-2210'], ['AC-1042', 'AC-5063'], ['AC-2210', 'AC-3387'],
    ['AC-2210', 'AC-5063'], ['AC-3387', 'AC-4102'], ['AC-3387', 'AC-5063'],
    ['AC-4102', 'AC-5174'], ['AC-5174', 'AC-6021'], ['AC-6021', 'AC-4778'],
    ['AC-7345', 'AC-5063'], ['AC-7345', 'AC-8110'], ['AC-8110', 'AC-2210'],
    ['AC-8110', 'AC-9284'], ['AC-9284', 'AC-1356'], ['AC-1356', 'AC-9284'],
    ['AC-1356', 'AC-2420'], ['AC-2420', 'AC-3591'], ['AC-3591', 'AC-4778'],
    ['AC-4778', 'AC-5174'], ['AC-5063', 'AC-8110'], ['AC-5063', 'AC-7345'],
    ['AC-2420', 'AC-5063'], ['AC-3591', 'AC-6021']
  ];

  const MODES = {
    cycle: {
      label: 'CYCLE',
      alerts: '2 alerts',
      desc: 'Funds leave AC-2210 and return through three intermediaries inside the same day. The traversal walks 3–6 hop paths back to the origin account.',
      nodes: ['AC-2210', 'AC-3387', 'AC-5063', 'AC-8110'],
      close: true
    },
    structuring: {
      label: 'STRUCTURING',
      alerts: '1 alert',
      desc: 'Three deposits just under the reporting threshold land in sequence across linked accounts — the classic structuring pattern.',
      nodes: ['AC-1356', 'AC-2420', 'AC-3591', 'AC-4778'],
      close: false
    },
    mule: {
      label: 'MULE_RING',
      alerts: '3 alerts',
      desc: 'Five recently opened accounts pass value around a ring, each hop draining most of the balance before the next transfer.',
      nodes: ['AC-1356', 'AC-2420', 'AC-3591', 'AC-4778', 'AC-5174'],
      close: true
    },
    rapid: {
      label: 'RAPID_MOVEMENT',
      alerts: '2 alerts',
      desc: 'Value crosses four accounts in minutes, then exits toward an external wallet — layering depth of four.',
      nodes: ['AC-1042', 'AC-2210', 'AC-5063', 'AC-8110', 'AC-9284'],
      close: false
    }
  };

  const PATTERN_LABEL = { cycle: 'CYCLE', structuring: 'STRUCTURING', mule: 'MULE', rapid: 'RAPID_MOVEMENT' };
  const nodeById = {};
  NODES.forEach((n, i) => { nodeById[n.id] = Object.assign({}, n, { score: riskScore(n.risk, i) }); });

  function riskScore(risk, index) {
    const base = risk === 'high' ? 76 : risk === 'med' ? 48 : 16;
    return Math.min(97, base + ((index * 7) % 17));
  }
  function edgeKey(a, b) { return [a, b].sort().join('|'); }
  function isSameEdge(line, a, b) {
    const k = line.getAttribute('data-key');
    return k === edgeKey(a, b);
  }

  /* ── build svg ─────────────────────────────────────────────── */
  EDGES.forEach(([a, b]) => {
    const na = nodeById[a], nb = nodeById[b];
    if (!na || !nb) return;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', na.x); line.setAttribute('y1', na.y);
    line.setAttribute('x2', nb.x); line.setAttribute('y2', nb.y);
    line.setAttribute('data-key', edgeKey(a, b));
    edgesGroup.appendChild(line);
  });

  NODES.forEach(n => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'node');
    g.setAttribute('data-id', n.id);
    g.setAttribute('data-risk', n.risk);
    g.setAttribute('transform', `translate(${n.x}, ${n.y})`);
    g.setAttribute('tabindex', '0');
    g.setAttribute('role', 'button');
    g.setAttribute('aria-label', `Account ${n.id}, ${n.risk} risk, score ${nodeById[n.id].score}`);

    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('r', '9.5');
    g.appendChild(c);

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('y', '21');
    label.textContent = n.id.replace('AC-', '');
    g.appendChild(label);

    nodesGroup.appendChild(g);

    g.addEventListener('click', () => inspect(n.id));
    g.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inspect(n.id); }
    });
  });

  const tabs = Array.from(document.querySelectorAll('[data-graph-mode]'));
  const readout = {
    name: document.getElementById('graphPatternName'),
    count: document.getElementById('graphAlertCount'),
    desc: document.getElementById('graphPatternDesc'),
    account: document.getElementById('graphAccountId'),
    risk: document.getElementById('graphRisk'),
    patterns: document.getElementById('graphPatterns')
  };
  const runBtn = document.getElementById('graphRun');
  let currentMode = 'cycle';
  let timers = [];
  let hasStarted = false;

  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  function reset() {
    clearTimers();
    Array.from(nodesGroup.children).forEach(g => g.classList.remove('is-hot', 'is-dim'));
    Array.from(edgesGroup.children).forEach(l => l.classList.remove('is-hot'));
  }

  function setReadout(mode, accountId) {
    const m = MODES[mode];
    const node = accountId ? nodeById[accountId] : nodeById[m.nodes[0]];
    if (!readout.name) return;
    readout.name.textContent = m.label;
    readout.count.textContent = m.alerts;
    readout.desc.textContent = m.desc;
    readout.account.textContent = node.id;
    readout.risk.textContent = `${node.score} · ${node.risk.toUpperCase()}`;
    readout.patterns.innerHTML = patternsFor(node.id)
      .map(p => `<li>${p}</li>`).join('');
  }

  function patternsFor(id) {
    const found = [];
    Object.keys(MODES).forEach(key => {
      if (MODES[key].nodes.includes(id)) found.push(PATTERN_LABEL[key]);
    });
    if (!found.length) found.push('NO_PATTERN');
    if (nodeById[id].risk === 'high' && !found.includes('THRESHOLD_BREACH')) found.push('THRESHOLD_BREACH');
    return found;
  }

  function highlight(mode) {
    const m = MODES[mode];
    const ids = m.nodes;
    Array.from(nodesGroup.children).forEach(g => {
      const id = g.getAttribute('data-id');
      g.classList.add('is-dim');
      if (ids.includes(id)) {
        timers.push(setTimeout(() => {
          g.classList.remove('is-dim');
          g.classList.add('is-hot');
        }, 90 * Math.max(0, ids.indexOf(id))));
      }
    });

    const pairs = [];
    for (let i = 0; i < ids.length - 1; i++) pairs.push([ids[i], ids[i + 1]]);
    if (m.close) pairs.push([ids[ids.length - 1], ids[0]]);

    Array.from(edgesGroup.children).forEach(line => {
      line.classList.remove('is-hot');
      const hit = pairs.some(([a, b]) => isSameEdge(line, a, b));
      if (hit) timers.push(setTimeout(() => line.classList.add('is-hot'), 260));
    });

    timers.push(setTimeout(() => setReadout(mode), 220));
  }

  function selectMode(mode) {
    currentMode = mode;
    tabs.forEach(t => {
      const active = t.getAttribute('data-graph-mode') === mode;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', String(active));
    });
    reset();
    if (!hasStarted) {
      hasStarted = true;
      Array.from(nodesGroup.children).forEach((g, i) => {
        g.style.opacity = '0';
        timers.push(setTimeout(() => { g.style.transition = 'opacity .5s ease'; g.style.opacity = '1'; }, 30 * i));
      });
    }
    highlight(mode);
  }

  function inspect(id) {
    reset();
    const node = nodeById[id];
    if (!node) return;
    Array.from(nodesGroup.children).forEach(g => {
      const same = g.getAttribute('data-id') === id;
      g.classList.toggle('is-hot', same);
      g.classList.toggle('is-dim', !same);
    });
    Array.from(edgesGroup.children).forEach(line => {
      const k = line.getAttribute('data-key');
      if (k.includes(id)) line.classList.add('is-hot');
    });
    if (readout.name) readout.name.textContent = 'ACCOUNT_INSPECT';
    if (readout.count) readout.count.textContent = `${patternsFor(id).length} signal${patternsFor(id).length > 1 ? 's' : ''}`;
    if (readout.desc) readout.desc.textContent = `Account ${id} scored ${node.score} from the patterns it triggers. In the app, opening an account shows its transaction trail and the exact Cypher paths behind the score.`;
    if (readout.account) readout.account.textContent = id;
    if (readout.risk) readout.risk.textContent = `${node.score} · ${node.risk.toUpperCase()}`;
    if (readout.patterns) readout.patterns.innerHTML = patternsFor(id).map(p => `<li>${p}</li>`).join('');
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => selectMode(tab.getAttribute('data-graph-mode')));
  });

  if (runBtn) {
    runBtn.addEventListener('click', () => {
      clearTimers();
      const nodes = Array.from(nodesGroup.children);
      nodes.forEach((g, i) => {
        timers.push(setTimeout(() => g.classList.add('is-hot'), i * 42));
      });
      timers.push(setTimeout(() => {
        nodes.forEach(g => g.classList.remove('is-hot'));
        selectMode(currentMode);
      }, nodes.length * 42 + 260));
    });
  }

  /* start when the card scrolls into view */
  const card = document.getElementById('fingraph-card');
  if ('IntersectionObserver' in window && card) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          selectMode(currentMode);
          io.disconnect();
        }
      });
    }, { threshold: 0.28 });
    io.observe(card);
  } else {
    selectMode(currentMode);
  }
})();
