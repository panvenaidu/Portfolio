import './vendor/scrollcraft.js';

const root = document.documentElement;
const main = document.querySelector('#room-main');
const header = document.querySelector('#room-header');
const directory = document.querySelector('#room-directory');
const viewButton = document.querySelector('#room-view-toggle');
const motionButton = document.querySelector('#room-motion-toggle');
const description = document.querySelector('#room-view-description');
const status = document.querySelector('#room-view-status');
const systems = document.querySelector('#room-systems');
const stage = systems.querySelector('[data-sc-stage]');
const rail = systems.querySelector('[data-sc-pan]');
const objects = [...document.querySelectorAll('[data-room-object]')];
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const phone = matchMedia('(max-width: 860px)');
let desk = false;
let paused = false;
let current = objects[0];
let updating = false;
let queued = false;
let pan = false;

// The supplied engine is mounted once. The adapter changes the same real DOM
// between a earned horizontal gallery and ordinary native document flow.
const engine = window.ScrollCraft.mount(main);
const gallery = engine.acts.find(act => act.el === systems);
gallery.stage = stage;

const headerHeight = () => header.getBoundingClientRect().height;
const objectTitle = object => object.querySelector('h2,h3')?.innerText.replace(/\s+/g, ' ').trim();

function visibleObject() {
  const focused = document.activeElement?.closest('[data-room-object]');
  const readingTop = headerHeight() + 24;
  const candidates = objects.filter(object => {
    const rect = object.getBoundingClientRect();
    return rect.bottom > headerHeight() && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
  });
  if (!candidates.length) return null;
  if (focused && candidates.includes(focused)) return focused;
  return candidates.reduce((best, object) => {
    const score = element => {
      const rect = element.getBoundingClientRect();
      if (pan && systems.contains(element)) return Math.abs(rect.left + rect.width / 2 - innerWidth / 2);
      return Math.abs(rect.top - readingTop);
    };
    return score(object) < score(best) ? object : best;
  });
}

function panPosition(object) {
  const overflow = Math.max(rail.scrollWidth - innerWidth, 0);
  const offset = object.offsetLeft - parseFloat(getComputedStyle(rail).paddingLeft || 0);
  const progress = overflow ? Math.min(1, Math.max(0, offset / overflow)) : 0;
  return gallery.top + progress * Math.max(gallery.height - innerHeight, 1);
}

function placeObject(object, { focus = false, offset = null } = {}) {
  if (!object) return;
  updating = true;
  const target = pan && systems.contains(object)
    ? panPosition(object)
    : scrollY + object.getBoundingClientRect().top - (offset ?? headerHeight() + 24);
  scrollTo({ top: Math.max(0, target), behavior: 'instant' });
  stage.scrollLeft = 0;
  engine.read();
  if (focus) object.focus({ preventScroll: true });
  current = object;
  updating = false;
}

function layout({ preserve = false } = {}) {
  const anchor = preserve ? visibleObject() : null;
  const oldOffset = anchor?.getBoundingClientRect().top;
  pan = !desk && !paused && !reduced.matches && !phone.matches && innerHeight >= 680;
  root.classList.toggle('room-desk', desk);
  root.classList.toggle('room-pan', pan);
  root.classList.toggle('room-flow', !pan);
  root.classList.toggle('room-motion-off', paused || reduced.matches || desk);
  gallery.pinned = pan;
  gallery.device = pan ? 'pan' : 'flow';
  systems.dataset.scAct = gallery.device;
  systems.classList.toggle('sc-act--pinned', pan);
  if (!pan) {
    systems.style.removeProperty('height');
    rail.style.removeProperty('transform');
  } else {
    const overflow = Math.max(rail.scrollWidth - innerWidth, 0);
    gallery.span = 1 + Math.max(1.7, overflow / innerHeight * .85);
  }
  engine.layout();
  engine.read();
  viewButton.textContent = desk ? 'Wall view' : 'Desk view';
  viewButton.setAttribute('aria-pressed', String(desk));
  viewButton.setAttribute('aria-label', desk ? 'Switch all projects to Wall view' : 'Switch all projects to compact Desk view');
  motionButton.textContent = paused ? 'Resume motion' : 'Pause motion';
  motionButton.setAttribute('aria-pressed', String(paused));
  motionButton.setAttribute('aria-label', paused ? 'Resume restrained scroll motion' : 'Pause scroll motion and read in native flow');
  motionButton.hidden = reduced.matches;
  description.textContent = desk
    ? 'Desk view. All seven projects remain in their original reading order.'
    : pan ? 'Exhibition scale. Use Desk view for compact reading.' : 'Wall view. Projects follow in native reading order.';
  if (anchor) placeObject(anchor, { offset: oldOffset > headerHeight() ? oldOffset : null });
  updateHeader();
}

function updateHeader() {
  const opening = document.querySelector('#room-home').getBoundingClientRect();
  header.classList.toggle('room-header-paper', opening.bottom <= headerHeight() + 12);
}

function updateCurrent() {
  queued = false;
  if (updating) return;
  const object = visibleObject();
  if (object) current = object;
  document.querySelectorAll('a[href^="#room-"]').forEach(link => {
    const selected = link.getAttribute('href') === `#${current.id}`;
    if (selected) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  updateHeader();
}

viewButton.addEventListener('click', () => {
  const anchor = visibleObject();
  desk = !desk;
  layout();
  if (anchor) placeObject(anchor);
  status.textContent = `${desk ? 'Desk' : 'Wall'} view. ${anchor ? `${objectTitle(anchor)} remains your current object.` : 'All seven projects are available below.'}`;
});
motionButton.addEventListener('click', () => {
  paused = !paused;
  layout({ preserve: true });
  status.textContent = paused ? 'Motion paused. Projects use native reading flow.' : 'Scroll motion resumed.';
});

// Direct directory links also address objects currently outside the pan window.
main.addEventListener('click', handleObjectLink);
directory.addEventListener('click', handleObjectLink);
function handleObjectLink(event) {
  const link = event.target.closest('a[href^="#room-"]');
  if (!link) return;
  const object = document.getElementById(link.hash.slice(1));
  if (!object?.matches('[data-room-object]')) return;
  event.preventDefault();
  directory.open = false;
  placeObject(object, { focus: true });
  history.replaceState(null, '', link.hash);
  updateCurrent();
}

// Native tab order remains intact. Bringing a focused object into the gallery
// window prevents keyboard users landing on a link outside the clipped rail.
main.addEventListener('focusin', event => {
  const object = event.target.closest('[data-room-object]');
  if (!object) return;
  current = object;
  if (pan && systems.contains(object)) {
    const rect = object.getBoundingClientRect();
    if (rect.left < -4 || rect.right > innerWidth + 4) placeObject(object);
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && directory.open) {
    directory.open = false;
    directory.querySelector('summary').focus();
  }
});
document.addEventListener('click', event => {
  if (directory.open && !directory.contains(event.target)) directory.open = false;
});

addEventListener('scroll', () => {
  if (!queued) {
    queued = true;
    requestAnimationFrame(updateCurrent);
  }
}, { passive: true });
let resizeTimer;
addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => layout({ preserve: true }), 120);
}, { passive: true });
reduced.addEventListener('change', () => layout({ preserve: true }));
phone.addEventListener('change', () => layout({ preserve: true }));
header.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { directory.open = false; }));
root.classList.add('room-ready');
viewButton.hidden = false;
layout();
if (document.fonts?.ready) document.fonts.ready.then(() => layout({ preserve: true }));
main.querySelectorAll('img').forEach(image => {
  if (!image.complete) image.addEventListener('load', () => layout({ preserve: true }), { once: true });
});
const initialObject = document.getElementById(location.hash.slice(1));
if (initialObject?.matches('[data-room-object]')) requestAnimationFrame(() => placeObject(initialObject));
