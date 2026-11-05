/* ═══════════════════════════════════════════════════════════════
   booking.js — DriveU booking + role demo
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const root = document.getElementById('booking');
  if (!root) return;

  const grid = document.getElementById('mapGrid');
  const driver = document.getElementById('mapDriver');
  const roles = Array.from(root.querySelectorAll('[data-role]'));
  const slots = Array.from(root.querySelectorAll('#bookingSlots button'));
  const pay = document.getElementById('bookingPay');
  const status = document.getElementById('bookingStatus');
  const driverName = document.getElementById('driverName');

  /* map grid */
  if (grid) {
    const NS = 'http://www.w3.org/2000/svg';
    for (let x = 20; x < 320; x += 30) {
      const l = document.createElementNS(NS, 'line');
      l.setAttribute('x1', x); l.setAttribute('y1', 0);
      l.setAttribute('x2', x); l.setAttribute('y2', 180);
      grid.appendChild(l);
    }
    for (let y = 18; y < 180; y += 30) {
      const l = document.createElementNS(NS, 'line');
      l.setAttribute('x1', 0); l.setAttribute('y1', y);
      l.setAttribute('x2', 320); l.setAttribute('y2', y);
      grid.appendChild(l);
    }
  }

  const ROLE_COPY = {
    user: { status: 'role: user · can book', label: 'Pay ₹248' },
    admin: { status: 'role: admin · approve bookings', label: 'Approve booking' },
    super: { status: 'role: super admin · full access', label: 'Admin console' }
  };
  const DRIVERS = ['Arun K · 4.9★', 'Priya M · 4.8★', 'Vikram R · 4.7★'];
  let role = 'user';

  roles.forEach(btn => {
    btn.addEventListener('click', () => {
      role = btn.getAttribute('data-role');
      roles.forEach(b => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', String(active));
      });
      if (status) status.textContent = ROLE_COPY[role].status;
      if (pay) pay.textContent = ROLE_COPY[role].label;
    });
  });

  slots.forEach((slot, i) => {
    slot.addEventListener('click', () => {
      if (slot.disabled) return;
      slots.forEach(s => s.classList.toggle('is-active', s === slot));
      if (driverName) driverName.textContent = DRIVERS[i % DRIVERS.length];
      if (status) status.textContent = `slot ${slot.textContent} held · ${ROLE_COPY[role].status.split('·')[0].trim()}`;
    });
  });

  if (pay) {
    pay.addEventListener('click', () => {
      if (role === 'user') {
        if (status) status.textContent = 'payment captured · driver assigned · booking confirmed';
        if (driver) {
          driver.style.transform = 'translate(168px, 92px)';
          setTimeout(() => { driver.style.transform = 'translate(286px, 40px)'; }, 700);
        }
        window.dispatchEvent(new CustomEvent('portfolio:toast', { detail: 'Booking confirmed · ₹248 captured' }));
        pay.textContent = 'Booked';
        setTimeout(() => { pay.textContent = ROLE_COPY.user.label; }, 2400);
      } else if (role === 'admin') {
        if (status) status.textContent = 'booking #2841 approved · audit entry written';
        window.dispatchEvent(new CustomEvent('portfolio:toast', { detail: 'Approved — audit trail written' }));
      } else {
        if (status) status.textContent = 'admin console · 3 pending approvals · 2 roles editable';
        window.dispatchEvent(new CustomEvent('portfolio:toast', { detail: 'Super admin scope — full access' }));
      }
    });
  }
})();
