export function initMobileNav() {
  const body = document.body;
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('primary-nav');

  if (!(toggle instanceof HTMLButtonElement) || !(nav instanceof HTMLElement)) {
    return;
  }

  const close = () => {
    body.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation menu');
  };

  const open = () => {
    body.classList.add('nav-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close navigation menu');
  };

  close();

  toggle.addEventListener('click', () => {
    if (body.classList.contains('nav-open')) {
      close();
      return;
    }
    open();
  });

  nav.addEventListener('click', (event) => {
    const target = event.target;
    if (target instanceof Element && target.closest('a')) {
      close();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && body.classList.contains('nav-open')) {
      close();
      toggle.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) {
      close();
    }
  });
}
