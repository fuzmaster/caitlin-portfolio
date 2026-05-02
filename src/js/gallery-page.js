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

const VIDEO_THUMBNAILS = {
  'assets/videos/Beverly holiday.mp4': 'assets/videos/Beverly holiday.mp4_snapshot_00.00.266.jpg',
  'assets/videos/Breathe Deeper2.mp4': 'assets/videos/Breathe Deeper2.mp4_snapshot_00.00.279.jpg',
  'assets/videos/Gift Card Sale.mp4': 'assets/videos/Gift Card Sale.mp4_snapshot_00.00.429.jpg',
  'assets/videos/Happy.mp4': 'assets/videos/Happy.mp4_snapshot_00.00.321.jpg',
  'assets/videos/Middleton Holiday.mp4': 'assets/videos/Middleton Holiday.mp4_snapshot_00.00.369.jpg',
  'assets/videos/Recharge.mp4': 'assets/videos/Recharge.mp4_snapshot_00.00.179.jpg',
  'assets/videos/Well be here when you get back.mp4': 'assets/videos/Well be here when you get back.jpg'
};

const toMediaType = (item) => item.type === 'video' ? 'video' : 'image';

const toAssetUrl = (filename) => encodeURI(`/${filename}`);

const toOptimizedBase = (filename) => {
  const cleanName = filename.replace(/^assets\//, '').replace(/\.[^.]+$/, '');
  return encodeURI(`/assets/optimized/${cleanName}`);
};

const buildCardMedia = (item) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'portfolio-card__media';

  if (toMediaType(item) === 'video') {
    const image = document.createElement('img');
    const candidates = [
      VIDEO_THUMBNAILS[item.filename],
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
  modal.innerHTML = `
    <button class="modal__close" type="button" aria-label="Close preview">&times;</button>
    <article class="modal__content" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div id="modal-media-wrap"></div>
      <div class="modal__body">
        <h2 id="modal-title"></h2>
        <p id="modal-description"></p>
      </div>
    </article>
  `;
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
  const modalMediaWrap = modal.querySelector('#modal-media-wrap');
  const modalTitle = modal.querySelector('#modal-title');
  const modalDescription = modal.querySelector('#modal-description');

  let activeFilter = 'All';

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    modalMediaWrap.innerHTML = '';
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
    if (event.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

  const openModal = (item) => {
    modalMediaWrap.innerHTML = '';

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

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
  };

  const categories = Array.from(new Set(galleryData.map((item) => item.category)));
  const orderedCategories = CATEGORY_ORDER.filter((name) => name === 'All' || categories.includes(name));

  const renderFilters = () => {
    filtersRoot.innerHTML = '';

    orderedCategories.forEach((category) => {
      const li = document.createElement('li');
      li.setAttribute('role', 'presentation');

      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('role', 'tab');
      button.dataset.filter = category;
      button.textContent = category;
      button.setAttribute('aria-selected', String(activeFilter === category));

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
    categoriesRoot.innerHTML = '';

    const displayCategories = activeFilter === 'All'
      ? orderedCategories.filter((name) => name !== 'All')
      : [activeFilter];

    displayCategories.forEach((category) => {
      const sectionItems = galleryData.filter((item) => item.category === category);

      const section = document.createElement('section');
      section.className = 'portfolio-section';
      section.setAttribute('aria-labelledby', `category-${category}`);

      const heading = document.createElement('h2');
      heading.id = `category-${category}`;
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
        body.innerHTML = `
          <p class="portfolio-card__title">${item.title}</p>
          <p class="portfolio-card__category">${item.category}</p>
        `;
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
