document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const prefersReducedMotion = () => reducedMotionQuery.matches;
  const PAGE_TRANSITION_MS = 300;

  /* ── Page transitions ─────────────────────────────────────────────────── */
  const setupPageTransitions = () => {
    if (prefersReducedMotion()) {
      return;
    }

    body.classList.add('fade-in');
    window.setTimeout(() => {
      body.classList.remove('fade-in');
    }, PAGE_TRANSITION_MS + 220);

    document.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const link = target.closest('a[data-page-transition][href]');
      if (!(link instanceof HTMLAnchorElement)) {
        return;
      }

      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const href = link.getAttribute('href') || '';
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        link.target === '_blank' ||
        link.hasAttribute('download')
      ) {
        return;
      }

      let destination;
      try {
        destination = new URL(link.href, window.location.href);
      } catch {
        return;
      }

      const isSameOrigin = destination.origin === window.location.origin;
      const pageName = destination.pathname.split('/').pop() || '';
      const isHtmlPage = destination.pathname.endsWith('.html') || !pageName.includes('.');
      const isSamePage =
        destination.pathname === window.location.pathname &&
        destination.hash === window.location.hash;

      if (!isSameOrigin || !isHtmlPage || isSamePage) {
        return;
      }

      event.preventDefault();
      body.classList.remove('fade-in');
      body.classList.add('fade-out');

      window.setTimeout(() => {
        window.location.href = destination.href;
      }, PAGE_TRANSITION_MS);
    });
  };

  /* ── Mobile nav ───────────────────────────────────────────────────────── */
  const setupMobileNav = () => {
    const navToggle = document.querySelector('.nav-toggle');
    if (!(navToggle instanceof HTMLButtonElement)) {
      return;
    }

    const navId = navToggle.getAttribute('aria-controls');
    if (!navId) {
      return;
    }

    const nav = document.getElementById(navId);
    if (!(nav instanceof HTMLElement)) {
      return;
    }

    const focusableSelector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    const closeNav = () => {
      body.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open navigation menu');
    };

    const openNav = () => {
      body.classList.add('nav-open');
      navToggle.setAttribute('aria-expanded', 'true');
      navToggle.setAttribute('aria-label', 'Close navigation menu');

      const firstLink = nav.querySelector('a[href]');
      if (firstLink instanceof HTMLElement) {
        window.requestAnimationFrame(() => firstLink.focus());
      }
    };

    closeNav();

    navToggle.addEventListener('click', () => {
      if (body.classList.contains('nav-open')) {
        closeNav();
      } else {
        openNav();
      }
    });

    nav.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      if (target.closest('a')) {
        closeNav();
      }
    });

    document.addEventListener('click', (event) => {
      if (!body.classList.contains('nav-open')) {
        return;
      }
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      const clickedInsideHeader =
        target instanceof Element && target.closest('.site-header');
      if (!clickedInsideHeader) {
        closeNav();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Tab' && body.classList.contains('nav-open')) {
        const focusableElements = Array.from(nav.querySelectorAll(focusableSelector)).filter(
          (element) => element instanceof HTMLElement
        );

        if (focusableElements.length > 0) {
          const first = focusableElements[0];
          const last = focusableElements[focusableElements.length - 1];

          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
            return;
          }

          if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
            return;
          }
        }
      }

      if (event.key === 'Escape' && body.classList.contains('nav-open')) {
        closeNav();
        navToggle.focus();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 860 && body.classList.contains('nav-open')) {
        closeNav();
      }
    });
  };

  /* ── Home slideshow ───────────────────────────────────────────────────── */
  const setupHomeSlideshow = () => {
    const slideElements = Array.from(document.querySelectorAll('.slideshow .slide'));
    if (slideElements.length === 0) {
      return;
    }

    const slideshowRoot  = document.querySelector('.slideshow');
    const slideshowToggle = document.querySelector('.slideshow-toggle');
    const prevBtn        = document.querySelector('.slideshow-arrow--prev');
    const nextBtn        = document.querySelector('.slideshow-arrow--next');
    const dotsContainer  = document.querySelector('.slideshow-dots');

    const hasControl = slideshowToggle instanceof HTMLButtonElement;
    let isPaused = prefersReducedMotion();
    let isInteractionPaused = false;

    /* ── Dots ── */
    const dots = [];
    if (dotsContainer instanceof HTMLElement) {
      slideElements.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'slideshow-dot';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        dot.dataset.index = String(i);
        dotsContainer.appendChild(dot);
        dots.push(dot);
      });
    }

    /* ── Track current slide ── */
    let current = slideElements.findIndex((s) => s.classList.contains('active'));
    if (current < 0) {
      current = 0;
      slideElements[current].classList.add('active');
    }

    const syncDots = () => {
      dots.forEach((dot, i) => {
        const active = i === current;
        dot.classList.toggle('active', active);
        dot.setAttribute('aria-selected', String(active));
      });
    };

    syncDots();

    /* ── Go to slide ── */
    const goTo = (index) => {
      slideElements[current].classList.remove('active');
      current = (index + slideElements.length) % slideElements.length;
      slideElements[current].classList.add('active');
      syncDots();
    };

    const advanceSlide = () => goTo(current + 1);

    /* ── Arrow buttons ── */
    if (prevBtn instanceof HTMLButtonElement) {
      prevBtn.addEventListener('click', () => {
        goTo(current - 1);
        isPaused = true;
        if (hasControl) {
          slideshowToggle.textContent = 'Resume';
          slideshowToggle.setAttribute('aria-pressed', 'true');
          slideshowToggle.setAttribute('aria-label', 'Resume featured work slideshow');
        }
      });
    }

    if (nextBtn instanceof HTMLButtonElement) {
      nextBtn.addEventListener('click', () => {
        goTo(current + 1);
        isPaused = true;
        if (hasControl) {
          slideshowToggle.textContent = 'Resume';
          slideshowToggle.setAttribute('aria-pressed', 'true');
          slideshowToggle.setAttribute('aria-label', 'Resume featured work slideshow');
        }
      });
    }

    /* ── Dot clicks ── */
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        goTo(i);
        isPaused = true;
        if (hasControl) {
          slideshowToggle.textContent = 'Resume';
          slideshowToggle.setAttribute('aria-pressed', 'true');
          slideshowToggle.setAttribute('aria-label', 'Resume featured work slideshow');
        }
      });
    });

    /* ── Pause / resume toggle ── */
    if (hasControl) {
      if (isPaused) {
        slideshowToggle.textContent = 'Resume';
        slideshowToggle.setAttribute('aria-pressed', 'true');
        slideshowToggle.setAttribute('aria-label', 'Resume featured work slideshow');
      }

      slideshowToggle.addEventListener('click', () => {
        isPaused = !isPaused;
        slideshowToggle.textContent = isPaused ? 'Resume' : 'Pause';
        slideshowToggle.setAttribute('aria-pressed', String(isPaused));
        slideshowToggle.setAttribute(
          'aria-label',
          isPaused ? 'Resume featured work slideshow' : 'Pause featured work slideshow'
        );
      });

      reducedMotionQuery.addEventListener('change', (event) => {
        if (event.matches) {
          isPaused = true;
          slideshowToggle.textContent = 'Resume';
          slideshowToggle.setAttribute('aria-pressed', 'true');
          slideshowToggle.setAttribute('aria-label', 'Resume featured work slideshow');
        }
      });
    }

    /* ── Pause on hover / focus ── */
    if (slideshowRoot instanceof HTMLElement) {
      slideshowRoot.addEventListener('mouseenter', () => { isInteractionPaused = true; });
      slideshowRoot.addEventListener('mouseleave', () => { isInteractionPaused = false; });
      slideshowRoot.addEventListener('focusin',    () => { isInteractionPaused = true; });
      slideshowRoot.addEventListener('focusout',   () => { isInteractionPaused = false; });
    }

    /* ── Keyboard left/right when slideshow is focused ── */
    if (slideshowRoot instanceof HTMLElement) {
      slideshowRoot.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          goTo(current - 1);
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          goTo(current + 1);
        }
      });
    }

    /* ── Auto-rotation timer ── */
    if (slideElements.length > 1) {
      const rotationTimer = window.setInterval(() => {
        if (!document.hidden && !isPaused && !isInteractionPaused) {
          advanceSlide();
        }
      }, 5000);

      window.addEventListener('pagehide', () => {
        window.clearInterval(rotationTimer);
      });
    }
  };

  /* ── Reveal obfuscated contact links ─────────────────────────────────── */
  const revealObfuscatedContactLinks = () => {
    document.querySelectorAll('.reveal-contact').forEach((span) => {
      const type = span.dataset.type;
      let href = '';
      let label = '';

      if (type === 'email') {
        const address = span.dataset.user + '@' + span.dataset.domain;
        href = 'mailto:' + address;
        label = address;
      } else if (type === 'tel') {
        const number = span.dataset.n1 + span.dataset.n2 + span.dataset.n3;
        href = 'tel:+1' + number;
        label = '(' + span.dataset.n1 + ') ' + span.dataset.n2 + '-' + span.dataset.n3;
      }

      if (href) {
        const link = document.createElement('a');
        link.href = href;
        link.textContent = label;
        link.setAttribute(
          'aria-label',
          type === 'email' ? 'Send email to ' + label : 'Call ' + label
        );
        span.replaceWith(link);
      }
    });
  };

  setupPageTransitions();
  setupMobileNav();
  setupHomeSlideshow();
  revealObfuscatedContactLinks();
});
