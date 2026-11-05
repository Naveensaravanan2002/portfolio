/* ═══════════════════════════════════════════════════════════════
   pipeline.js — LedgerLake stage animation (demo)
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const root = document.getElementById('pipeline');
  const stageWrap = document.getElementById('pipelineStages');
  const runBtn = document.getElementById('pipelineRun');
  const log = document.getElementById('pipelineLog');
  if (!root || !stageWrap || !runBtn || !log) return;

  const stages = Array.from(stageWrap.querySelectorAll('.stage'));
  const LINES = [
    'ingesting 1,184,220 rows > raw/ · parquet',
    'validation · 0 null ids · 12,408 duplicates dropped',
    'duckdb · 42 account summaries · 310k tx summaries',
    'neo4j · 28,140 edges prepared > fingraphai',
    'run complete · idempotent · 0 rows duplicated'
  ];
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  let running = false;

  runBtn.addEventListener('click', async () => {
    if (running) return;
    running = true;
    runBtn.disabled = true;
    root.setAttribute('data-running', 'true');
    const original = runBtn.innerHTML;
    runBtn.innerHTML = 'Running…';

    stages.forEach(s => s.classList.remove('is-done', 'is-active'));
    for (let i = 0; i < stages.length; i++) {
      stages[i].classList.add('is-active');
      log.textContent = LINES[i];
      await sleep(640);
      stages[i].classList.remove('is-active');
      stages[i].classList.add('is-done');
    }
    log.textContent = LINES[LINES.length - 1];
    runBtn.innerHTML = original;
    runBtn.disabled = false;
    root.removeAttribute('data-running');
    running = false;
  });
})();
