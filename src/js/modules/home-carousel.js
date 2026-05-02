export function initHomeCarousel() {
  const root = document.querySelector('[data-carousel]');
  if (!(root instanceof HTMLElement)) {
    return;
  }

  const slides = Array.from(root.querySelectorAll('[data-slide]'));
  const prev = root.querySelector('[data-prev]');
  const next = root.querySelector('[data-next]');

  if (slides.length < 2) {
    return;
  }

  let index = 0;
  let timerId = null;
  let isVisible = true;

  const showSlide = (nextIndex) => {
    slides[index].classList.remove('is-active');
    index = (nextIndex + slides.length) % slides.length;
    slides[index].classList.add('is-active');
  };

  const stop = () => {
    if (timerId) {
      window.clearInterval(timerId);
      timerId = null;
    }
  };

  const start = () => {
    stop();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !isVisible) {
      return;
    }
    timerId = window.setInterval(() => showSlide(index + 1), 6000);
  };

  if (prev instanceof HTMLButtonElement) {
    prev.addEventListener('click', () => {
      showSlide(index - 1);
      start();
    });
  }

  if (next instanceof HTMLButtonElement) {
    next.addEventListener('click', () => {
      showSlide(index + 1);
      start();
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      isVisible = entry.isIntersecting;
      if (isVisible) {
        start();
      } else {
        stop();
      }
    });
  }, { threshold: 0.35 });

  observer.observe(root);

  window.addEventListener('pagehide', () => {
    stop();
    observer.disconnect();
  });

  start();
}
