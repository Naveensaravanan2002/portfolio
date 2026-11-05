/* ═══════════════════════════════════════════════════════════════
   dossiers.js — case-study content for the project modals
   Edit the copy here; the modal markup is generated from this object.
   ═══════════════════════════════════════════════════════════════ */
window.DOSSIERS = {
  fingraph: {
    kicker: ['Case study', 'Graph analytics', 'Hack2Future · top 100 finalist'],
    title: 'FinGraph<em>AI</em>',
    tagline: 'An AML detection console that models money movement as a property graph — then explains why an account is suspicious.',
    meta: [
      { label: 'Role', value: 'Full-stack + graph modelling' },
      { label: 'Timeline', value: '2026 — ongoing' },
      { label: 'Stack', value: 'Java · Spring Boot · Neo4j · Cypher · React' },
      { label: 'Origin', value: 'Hack2Future finalist' }
    ],
    blocks: [
      { h: 'The problem', p: 'Rule-based checks look at one transaction at a time. Laundering doesn\u2019t work that way: money loops, splits, rests briefly and moves on. The signal is in the shape of the network, not in any single row.' },
      { h: 'What I built', list: [
        'Modelled curated account and transaction data as a property graph in Neo4j, with accounts, transfers and their relationships as first-class nodes and edges.',
        'Wrote Cypher traversals for cycle detection, rapid fund movement, layering, structuring and mule-account behaviour — each triggered pattern contributes to an account\u2019s risk score.',
        'Exposed risk, alerts and transaction relationships through Spring Boot REST APIs, consumed by a React analyst console.',
        'Built an alert lifecycle (open, escalated, resolved) with maker–checker separation, so an analyst cannot approve their own recommendation.',
        'Added an AI explanation service that writes a plain-English risk summary — and degrades to deterministic local explanations when no LLM endpoint is configured.'
      ] },
      { h: 'Engineering decisions', decisions: [
        { b: 'Graph first', s: 'When the question is “who is connected to whom”, a traversal is cheaper to reason about than a dozen joins.' },
        { b: 'Deterministic demo data', s: 'A seeded generator produces the same network on every run, so demos and tests are reproducible.' },
        { b: 'Degrade, never fail', s: 'Missing LLM credentials shouldn\u2019t break the console — the explanation layer falls back to templates.' },
        { b: 'Maker–checker', s: 'Analyst and admin decisions are separated in the service layer, not just hidden in the UI.' }
      ] },
      { h: 'What I\u2019d do next', p: 'Add graph algorithms beyond hand-written traversals (community detection, centrality), streaming ingestion so alerts fire on live transfers, and a proper label-review loop to measure false positives.' }
    ],
    links: [
      { label: 'Source on GitHub', href: 'https://github.com/Naveensaravanan2002/FinGraph-AI', external: true },
      { label: 'LedgerLake — the data behind it', dossier: 'ledgerlake' }
    ]
  },

  ledgerlake: {
    kicker: ['Case study', 'Data platform'],
    title: 'Ledger<em>Lake</em>',
    tagline: 'A batch pipeline that takes raw AML transaction data and hands FinGraphAI an analytics-ready graph.',
    meta: [
      { label: 'Role', value: 'Data engineering (solo)' },
      { label: 'Timeline', value: '2026' },
      { label: 'Stack', value: 'Python · SQL · DuckDB · Parquet · Neo4j' },
      { label: 'Dataset', value: 'IBM AML synthetic transactions' }
    ],
    blocks: [
      { h: 'The problem', p: 'Analysts can\u2019t query a million-row CSV and a graph database at the same time. The pipeline had to make raw data trustworthy before it deserved to become a graph.' },
      { h: 'What I built', list: [
        'Ingested the IBM AML synthetic transaction dataset and landed it through raw, cleaned and analytics-ready layers, persisted as Parquet.',
        'Implemented validation and transformation stages in Python and SQL: null and type checks, duplicate handling, amount and date normalisation.',
        'Used DuckDB to produce account- and transaction-level summaries for downstream analysis.',
        'Added structured logging, data-quality checks and rerunnable processing, so a failed or repeated run converges to the same stored state.',
        'Prepared relationship data for Neo4j loading — the edges FinGraphAI traverses to find rings and cycles.'
      ] },
      { h: 'Engineering decisions', decisions: [
        { b: 'Idempotent by default', s: 'Every stage can be re-run without duplicating rows; the same input always lands the same state.' },
        { b: 'Parquet between layers', s: 'Columnar files keep scans fast and make the schema explicit between stages.' },
        { b: 'Quality gates before serving', s: 'Bad rows are quarantined and logged instead of silently joining the analytics layer.' }
      ] },
      { h: 'What I\u2019d do next', p: 'Orchestrate the stages with a scheduler (Airflow or Dagster), add dbt-style tests to the warehouse layer, and push incremental loads instead of full re-runs.' }
    ],
    links: [
      { label: 'Ask for a walkthrough', href: 'mailto:naveensaravanan2002@gmail.com?subject=LedgerLake%20walkthrough', external: false },
      { label: 'FinGraphAI — what consumes it', dossier: 'fingraph' }
    ]
  },

  ranger: {
    kicker: ['Case study', 'Product engineering'],
    title: '<em>Ranger</em>',
    tagline: 'Receipt emails in, honest spending numbers out — parsed, deduplicated and scoped to the right user.',
    meta: [
      { label: 'Role', value: 'Full-stack (solo)' },
      { label: 'Timeline', value: '2025 — 2026' },
      { label: 'Stack', value: 'Java 21 · Spring Boot · React · PostgreSQL' },
      { label: 'Auth', value: 'Firebase Auth · Gmail API' }
    ],
    blocks: [
      { h: 'The problem', p: 'Receipts arrive as HTML email, not clean JSON. And the same email arrives again every time you re-sync a mailbox — so naive imports duplicate everything you own.' },
      { h: 'What I built', list: [
        'Built a Gmail API integration behind Firebase Authentication that verifies the authorised mailbox matches the signed-in account, scoping every record to its owning user.',
        'Parsed HTML receipt emails with Jsoup into line items, fees and totals, then visualised spending by category in a React dashboard.',
        'Designed rule-based parsing with per-message ID tracking so imports are idempotent — re-syncing a mailbox never duplicates a receipt.',
        'Kept money arithmetic exact using BigDecimal in Java and NUMERIC(12,2) in PostgreSQL.'
      ] },
      { h: 'Engineering decisions', decisions: [
        { b: 'Trust the identity, not the client', s: 'The mailbox check happens server-side; the UI cannot request someone else\u2019s receipts.' },
        { b: 'Idempotent ingestion', s: 'Message IDs are the unit of deduplication, so retries are safe by construction.' },
        { b: 'Exact money', s: 'Floating point never touches currency values, end to end.' }
      ] },
      { h: 'What I\u2019d do next', p: 'Replace rule-based parsing with a small classifier for vendor-specific layouts, and add recurring-expense detection so the dashboard can show subscriptions rather than just categories.' }
    ],
    links: [
      { label: 'Email me for a demo', href: 'mailto:naveensaravanan2002@gmail.com?subject=Ranger%20demo', external: false }
    ]
  },

  driveu: {
    kicker: ['Case study', 'Booking platform'],
    title: 'Drive<em>U</em>',
    tagline: 'Book a driver the way you book a cab — with payments, roles, and an admin side that can actually approve things.',
    meta: [
      { label: 'Role', value: 'Full-stack (team)' },
      { label: 'Timeline', value: '2025' },
      { label: 'Stack', value: 'Java · Spring Boot · Angular · Razorpay' },
      { label: 'Security', value: 'Spring Security · three-tier RBAC' }
    ],
    blocks: [
      { h: 'The problem', p: 'Three kinds of people use a booking product — users, admins and super admins — and each should only ever see their slice of it.' },
      { h: 'What I built', list: [
        'Co-built a full-stack driver booking platform covering map-based driver discovery, slot selection, booking and payment.',
        'Integrated a Razorpay payment gateway flow and an AI-powered in-app chatbot.',
        'Implemented role-based access control with Spring Security across User, Admin and Super Admin tiers, gating booking approval and admin dashboards.'
      ] },
      { h: 'Engineering decisions', decisions: [
        { b: 'Roles in the service layer', s: 'Access checks sit beside the business logic, not only in route guards.' },
        { b: 'Payment as a flow', s: 'Order creation, verification and booking state are handled explicitly, so a dropped callback doesn\u2019t corrupt a booking.' }
      ] },
      { h: 'What I\u2019d do next', p: 'Add live driver tracking over WebSockets and a proper audit trail for every admin action.' }
    ],
    links: [
      { label: 'Ask for a walkthrough', href: 'mailto:naveensaravanan2002@gmail.com?subject=DriveU%20walkthrough', external: false }
    ]
  },

  brickbreaker: {
    kicker: ['Arcade', 'First program, rebuilt'],
    title: 'Brick<em>Breaker</em>',
    tagline: 'A Java Swing game I wrote to learn programming — rebuilt in canvas so it can live inside this page.',
    meta: [
      { label: 'Origin', value: 'Java Swing · AWT (2019)' },
      { label: 'Rebuild', value: 'Vanilla JS · Canvas 2D' },
      { label: 'Dependencies', value: 'None — no engine, no libraries' },
      { label: 'Size', value: '~250 lines, one file' }
    ],
    blocks: [
      { h: 'The problem', p: 'I learned to code by making a ball bounce. Rebuilding it years later is a decent test of what changed — and of how much of the fun is still in the physics.' },
      { h: 'What I built', list: [
        'Rebuilt the original 3 × 7 brick wall with paddle control, angle-based bouncing, lives, scoring and win/lose states.',
        'Added particle bursts on brick breaks, pause support, and keyboard, mouse and touch controls.',
        'Kept the whole game in a single dependency-free file so it can live inside this portfolio.'
      ] },
      { h: 'Engineering decisions', decisions: [
        { b: 'Frame-rate independent', s: 'Movement is scaled by delta time, so it plays the same on 60 Hz and 144 Hz screens.' },
        { b: 'Pause when unseen', s: 'The loop stops when the card scrolls out of view or the tab is hidden — no wasted battery.' }
      ] }
    ],
    links: [
      { label: 'Original Java source', href: 'https://github.com/Naveensaravanan2002/BrickBreakerGame', external: true }
    ]
  }
};
