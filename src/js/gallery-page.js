import galleryData from './gallery-data.js';

const CATEGORY_ORDER = [
  'All',
  'Promotional & Sales',
  'Holiday & Seasonal',
  'Booking & Availability',
  'Client Education',
  'Community & Social Proof',
  'Video Reels'
];

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

const toMediaType = (item) => item.type === 'video' ? 'video' : 'image';

const toAssetUrl = (filename) => encodeURI(`/${filename}`);

const toDomId = (value) => value
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

const toOptimizedBase = (filename) => {
  const cleanName = filename.replace(/^assets\//, '').replace(/\.[^.]+$/, '');
  return encodeURI(`/assets/optimized/${cleanName}`);
};

const createTextElement = (tagName, className, text) => {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  element.textContent = text;
  return element;
};

const getFocusableElements = (root) => Array.from(root.querySelectorAll(FOCUSABLE_SELECTOR))
  .filter((element) => element instanceof HTMLElement && !element.hidden);

const setPageInert = (modal, isInert) => {
  Array.from(document.body.children).forEach((child) => {
    if (child === modal) {
      return;
    }

    if (isInert) {
      child.setAttribute('inert', '');
      child.setAttribute('aria-hidden', 'true');
    } else {
      child.removeAttribute('inert');
      child.removeAttribute('aria-hidden');
    }
  });
};

const buildCardMedia = (item) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'portfolio-card__media';

  if (toMediaType(item) === 'video') {
    const image = document.createElement('img');
    const candidates = [
      item.thumbnail,
      item.filename.replace('.mp4', '.jpg'),
      item.filename.replace('.mp4', '.png')
    ].filter(Boolean);

    let index = 0;
    image.src = toAssetUrl(candidates[index]);
    image.addEventListener('error', () => {
      index += 1;
      if (index < candidates.length) {
        image.src = toAssetUrl(candidates[index]);
      }
    });

    image.alt = item.alt;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.width = 1200;
    image.height = 1200;
    wrapper.appendChild(image);
    return wrapper;
  }

  const picture = document.createElement('picture');
  const sourceWebp = document.createElement('source');
  const base = toOptimizedBase(item.filename);
  sourceWebp.type = 'image/webp';
  sourceWebp.srcset = `${base}-640.webp 640w, ${base}-1280.webp 1280w`;
  sourceWebp.sizes = '(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 25vw';

  const image = document.createElement('img');
  image.src = toAssetUrl(item.filename);
  image.alt = item.alt;
  image.loading = 'lazy';
  image.decoding = 'async';
  image.width = 1200;
  image.height = 1200;

  picture.appendChild(sourceWebp);
  picture.appendChild(image);
  wrapper.appendChild(picture);
  return wrapper;
};

const createModal = () => {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.setAttribute('aria-hidden', 'true');

  const closeButton = document.createElement('button');
  closeButton.className = 'modal__close';
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', 'Close preview');
  closeButton.textContent = 'x';

  const content = document.createElement('article');
  content.className = 'modal__content';
  content.setAttribute('role', 'dialog');
  content.setAttribute('aria-modal', 'true');
  content.setAttribute('aria-labelledby', 'modal-title');
  content.tabIndex = -1;

  const mediaWrap = document.createElement('div');
  mediaWrap.id = 'modal-media-wrap';

  const body = document.createElement('div');
  body.className = 'modal__body';

  const title = document.createElement('h2');
  title.id = 'modal-title';

  const description = document.createElement('p');
  description.id = 'modal-description';

  const impact = document.createElement('p');
  impact.id = 'modal-impact';
  impact.className = 'modal__impact';

  const tools = document.createElement('p');
  tools.id = 'modal-tools';
  tools.className = 'modal__tools';

  body.appendChild(title);
  body.appendChild(description);
  body.appendChild(impact);
  body.appendChild(tools);
  content.appendChild(mediaWrap);
  content.appendChild(body);
  modal.appendChild(closeButton);
  modal.appendChild(content);
  document.body.appendChild(modal);
  return modal;
};

const renderGallery = () => {
  const filtersRoot = document.getElementById('portfolio-filters');
  const categoriesRoot = document.getElementById('portfolio-categories');

  if (!(filtersRoot instanceof HTMLElement) || !(categoriesRoot instanceof HTMLElement)) {
    return;
  }

  const modal = createModal();
  const closeModalButton = modal.querySelector('.modal__close');
  const modalContent = modal.querySelector('.modal__content');
  const modalMediaWrap = modal.querySelector('#modal-media-wrap');
  const modalTitle = modal.querySelector('#modal-title');
  const modalDescription = modal.querySelector('#modal-description');
  const modalImpact = modal.querySelector('#modal-impact');
  const modalTools = modal.querySelector('#modal-tools');

  let activeFilter = 'All';
  let lastFocusedElement = null;

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    setPageInert(modal, false);
    if (modalMediaWrap instanceof HTMLElement) {
      modalMediaWrap.replaceChildren();
    }
    if (lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus();
    }
    lastFocusedElement = null;
  };

  if (closeModalButton instanceof HTMLButtonElement) {
    closeModalButton.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (!modal.classList.contains('is-open')) {
      return;
    }

    if (event.key === 'Escape') {
      closeModal();
      return;
    }

    if (event.key === 'Tab') {
      const focusableElements = getFocusableElements(modal);
      if (focusableElements.length === 0) {
        event.preventDefault();
        if (modalContent instanceof HTMLElement) {
          modalContent.focus();
        }
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  });

  const openModal = (item) => {
    if (!(modalMediaWrap instanceof HTMLElement)) {
      return;
    }

    lastFocusedElement = document.activeElement;
    modalMediaWrap.replaceChildren();

    if (toMediaType(item) === 'video') {
      const video = document.createElement('video');
      video.className = 'modal__media';
      video.controls = true;
      video.playsInline = true;
      video.preload = 'metadata';
      video.src = toAssetUrl(item.filename);
      video.setAttribute('aria-label', item.alt);
      modalMediaWrap.appendChild(video);
    } else {
      const image = document.createElement('img');
      image.className = 'modal__media';
      image.src = toAssetUrl(item.filename);
      image.alt = item.alt;
      modalMediaWrap.appendChild(image);
    }

    if (modalTitle instanceof HTMLElement) {
      modalTitle.textContent = item.title;
    }
    if (modalDescription instanceof HTMLElement) {
      modalDescription.textContent = item.description;
    }
    if (modalImpact instanceof HTMLElement) {
      modalImpact.textContent = item.businessImpact ? `Business impact: ${item.businessImpact}` : '';
      modalImpact.hidden = !item.businessImpact;
    }
    if (modalTools instanceof HTMLElement) {
      modalTools.textContent = item.toolsUsed?.length ? `Tools: ${item.toolsUsed.join(', ')}` : '';
      modalTools.hidden = !item.toolsUsed?.length;
    }

    setPageInert(modal, true);
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    if (closeModalButton instanceof HTMLButtonElement) {
      closeModalButton.focus();
    } else if (modalContent instanceof HTMLElement) {
      modalContent.focus();
    }
  };

  const categories = Array.from(new Set(galleryData.map((item) => item.category)));
  const orderedCategories = CATEGORY_ORDER.filter((name) => name === 'All' || categories.includes(name));

  const renderFilters = () => {
    filtersRoot.replaceChildren();

    orderedCategories.forEach((category) => {
      const categoryId = toDomId(category);
      const li = document.createElement('li');
      li.setAttribute('role', 'presentation');

      const button = document.createElement('button');
      button.type = 'button';
      button.id = `filter-${categoryId}`;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-controls', 'portfolio-categories');
      button.dataset.filter = category;
      button.textContent = category;
      button.setAttribute('aria-selected', String(activeFilter === category));
      button.tabIndex = activeFilter === category ? 0 : -1;

      button.addEventListener('click', () => {
        activeFilter = category;
        renderFilters();
        renderSections();
      });

      li.appendChild(button);
      filtersRoot.appendChild(li);
    });
  };

  const renderSections = () => {
    categoriesRoot.replaceChildren();

    const displayCategories = activeFilter === 'All'
      ? orderedCategories.filter((name) => name !== 'All')
      : [activeFilter];

    displayCategories.forEach((category) => {
      const sectionItems = galleryData.filter((item) => item.category === category);

      const section = document.createElement('section');
      section.className = 'portfolio-section';
      section.setAttribute('aria-labelledby', `category-${toDomId(category)}`);

      const heading = document.createElement('h2');
      heading.id = `category-${toDomId(category)}`;
      heading.textContent = category;

      const list = document.createElement('ul');
      list.className = 'portfolio-section__list';

      sectionItems.forEach((item) => {
        const li = document.createElement('li');
        li.className = 'portfolio-card';

        const button = document.createElement('button');
        button.type = 'button';

        button.appendChild(buildCardMedia(item));

        const body = document.createElement('div');
        body.className = 'portfolio-card__body';
        body.appendChild(createTextElement('p', 'portfolio-card__title', item.title));
        body.appendChild(createTextElement('p', 'portfolio-card__category', item.category));
        button.appendChild(body);

        button.addEventListener('click', () => openModal(item));

        li.appendChild(button);
        list.appendChild(li);
      });

      section.appendChild(heading);
      section.appendChild(list);
      categoriesRoot.appendChild(section);
    });
  };

  renderFilters();
  renderSections();
};

document.addEventListener('DOMContentLoaded', renderGallery);
