// Local-only interaction fixtures; never imported by a production entrypoint.
const controls = document.createElement('aside');
controls.setAttribute('aria-label', 'Local cursor verification');
controls.style.cssText = 'position:fixed;bottom:8px;left:8px;z-index:2000;display:flex;flex-wrap:wrap;gap:4px;max-width:calc(100vw - 16px);background:#e9edf0;color:#291e1c;padding:8px;border:1px solid #291e1c;font:12px Arial';
const targets = {
  Certificate: '#room-credentials li:first-child a',
  Project: '#room-crowd',
  Repository: '#room-crowd a:last-child',
  Résumé: '.room-identity a',
  Email: '.room-email',
  GitHub: '.room-contact-links a:nth-child(2)',
  LinkedIn: '.room-contact-links a:nth-child(3)',
  Boundary: '#room-credentials li:first-child a'
};
let lastTarget;
function pointAt(target, boundary = false) {
  lastTarget = target;
  target.scrollIntoView({ block: 'center', behavior: 'instant' });
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const rect = target.getBoundingClientRect();
    target.dispatchEvent(new PointerEvent('pointermove', {
      bubbles: true, pointerType: 'mouse', isPrimary: true, buttons: 0,
      clientX: boundary ? rect.right - 2 : rect.left + rect.width * .6,
      clientY: Math.max(80, Math.min(innerHeight - 60, rect.top + rect.height / 2))
    }));
  }));
}
for (const [label, selector] of Object.entries(targets)) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = `Inspect ${label}`;
  button.style.cssText = 'font:inherit;padding:6px;border:1px solid #291e1c;cursor:pointer';
  button.addEventListener('click', () => {
    const target = document.querySelector(selector);
    pointAt(target, label === 'Boundary');
  });
  controls.append(button);
}
document.body.append(controls);
const hide = document.createElement('button');
hide.type = 'button';
hide.textContent = 'Hide verification controls';
hide.addEventListener('click', () => {
  controls.remove();
  if (lastTarget) pointAt(lastTarget);
});
controls.append(hide);
