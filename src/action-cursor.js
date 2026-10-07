import './action-cursor.css';

const ANNOTATION = '[data-action-cursor]';
const AREA = 'article[data-action-area][data-action-cursor]';
const INTERACTIVE = 'a, button, input, textarea, select, summary, label, [contenteditable]:not([contenteditable="false"]), [role="button"], [role="link"], [tabindex]:not([tabindex="-1"]), audio[controls], video[controls]';

export function setupActionCursor() {
  const eligible = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) and (forced-colors: none)');
  const badge = document.createElement('span');
  badge.className = 'action-cursor-badge';
  badge.setAttribute('aria-hidden', 'true');
  badge.hidden = true;
  document.body.append(badge);
  let active = null;
  let annotation = null;
  let frame = 0;
  let point = { x: 0, y: 0 };
  let press = null;
  let disposed = false;
  const removeListeners = [];

  const element = target => target instanceof Element ? target : target?.parentElement;
  const hasSelection = () => {
    const selection = window.getSelection();
    return Boolean(selection && !selection.isCollapsed && selection.toString());
  };
  const listen = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    removeListeners.push(() => target.removeEventListener(type, handler, options));
  };

  function reset() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    active?.removeAttribute('data-action-cursor-active');
    active = null;
    annotation = null;
    badge.hidden = true;
    badge.textContent = '';
  }

  function actionFor(target) {
    const node = element(target);
    const action = node?.closest(ANNOTATION);
    if (!action) return null;
    const interactive = node.closest(INTERACTIVE);
    // An unannotated secondary link/control never inherits the article action.
    if (action.matches(AREA) && interactive && action.contains(interactive)) return null;
    if (action.matches(AREA) && !action.querySelector('a[data-action-primary][href]')) return null;
    return action;
  }

  function paint() {
    frame = 0;
    if (!annotation || !active?.isConnected || !eligible.matches || disposed) {
      reset();
      return;
    }
    const label = annotation.getAttribute('data-action-cursor')?.trim()
      || annotation.textContent.replace(/\s+/g, ' ').trim();
    if (!label) {
      reset();
      return;
    }
    badge.textContent = label;
    badge.hidden = false;
    const margin = 8;
    const gap = 16;
    const width = badge.offsetWidth;
    const height = badge.offsetHeight;
    let x = point.x + gap;
    let y = point.y - height / 2;
    if (x + width > innerWidth - margin) x = point.x - width - gap;
    x = Math.max(margin, Math.min(x, innerWidth - width - margin));
    y = Math.max(margin, Math.min(y, innerHeight - height - margin));
    badge.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    active.setAttribute('data-action-cursor-active', '');
  }

  function move(event) {
    if (press && Math.hypot(event.clientX - press.x, event.clientY - press.y) > 5) press.dragged = true;
    if (!eligible.matches || event.pointerType !== 'mouse' || event.buttons || hasSelection()) {
      reset();
      return;
    }
    const action = actionFor(event.target);
    if (!action) {
      reset();
      return;
    }
    const node = element(event.target);
    if (active !== node) active?.removeAttribute('data-action-cursor-active');
    active = node;
    annotation = action;
    point = { x: event.clientX, y: event.clientY };
    if (!frame) frame = requestAnimationFrame(paint);
  }

  function leave(event) {
    const next = element(event.relatedTarget);
    if (!next || actionFor(next) !== annotation) reset();
  }

  function down(event) {
    reset();
    const node = element(event.target);
    const area = node?.closest(AREA);
    const control = node?.closest(INTERACTIVE);
    press = area && (!control || !area.contains(control))
      ? { area, x: event.clientX, y: event.clientY, dragged: false, selected: hasSelection() }
      : null;
  }

  function activateArea(event) {
    const node = element(event.target);
    const area = node?.closest(AREA);
    if (!area || event.defaultPrevented || event.detail === 0) return;
    const control = node.closest(INTERACTIVE);
    if (control && area.contains(control)) return;
    if (event.type === 'click' && event.button !== 0) return;
    if (event.type === 'auxclick' && event.button !== 1) return;
    if (hasSelection() || (press?.area === area && (press.dragged || press.selected))) return;
    const primary = [...area.querySelectorAll('a[data-action-primary][href]')]
      .find(link => link.closest(AREA) === area);
    if (!primary) return;
    // Delegate to the real anchor so its URL, target, download attribute and
    // existing handlers remain authoritative. Modifier keys travel with it.
    primary.dispatchEvent(new MouseEvent(event.type, {
      bubbles: true,
      cancelable: true,
      view: window,
      detail: event.detail,
      button: event.button,
      buttons: event.buttons,
      clientX: event.clientX,
      clientY: event.clientY,
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey
    }));
  }

  listen(document, 'pointermove', move, { passive: true });
  listen(document, 'pointerover', move, { passive: true });
  listen(document, 'pointerout', leave, { passive: true });
  listen(document, 'pointerdown', down, { passive: true });
  listen(document, 'pointerup', event => {
    if (press?.dragged) reset();
    else move(event);
  }, { passive: true });
  listen(document, 'pointercancel', () => { press = null; reset(); }, { passive: true });
  listen(document, 'click', activateArea);
  listen(document, 'auxclick', activateArea);
  listen(document, 'dragstart', () => { if (press) press.dragged = true; reset(); });
  listen(document, 'selectionchange', () => { if (hasSelection()) reset(); });
  listen(document, 'keydown', reset, true);
  listen(document, 'contextmenu', reset);
  listen(document, 'scroll', reset, { capture: true, passive: true });
  listen(window, 'blur', () => { press = null; reset(); });
  listen(window, 'resize', reset, { passive: true });
  listen(document, 'visibilitychange', () => { if (document.hidden) reset(); });
  listen(eligible, 'change', reset);

  // Dynamic labels (Desk/Wall or Pause/Resume) update while the pointer rests.
  const observer = new MutationObserver(records => {
    if (!annotation || !records.some(record => annotation.contains(record.target) || annotation === record.target)) return;
    if (!frame) frame = requestAnimationFrame(paint);
  });
  observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['data-action-cursor'] });

  return function cleanup() {
    disposed = true;
    reset();
    observer.disconnect();
    removeListeners.forEach(remove => remove());
    badge.remove();
  };
}

export const cleanupActionCursor = setupActionCursor();
