document.addEventListener('DOMContentLoaded', () => {
  const galleryItems = Array.isArray(window.galleryData) ? window.galleryData : [];
  const sectionsContainer = document.getElementById('gallery-sections');
  if (!(sectionsContainer instanceof HTMLElement) || galleryItems.length === 0) {
    return;
  }

  const CATEGORY_ORDER = [
    'Promotional & Sales',
    'Holiday & Seasonal',
    'Booking & Availability',
    'Client Education',
    'Community & Social Proof',
    'Video Reels'
  ];

  const CATEGORY_DESCRIPTIONS = {
    'Promotional & Sales': 'Campaign creative focused on offer clarity, urgency, and conversion support.',
    'Holiday & Seasonal': 'Seasonal brand and offer content timed to key calendar moments.',
    'Booking & Availability': 'Scheduling communication assets designed to fill and balance provider calendars.',
    'Client Education': 'Service and product education posts that reduce common front-desk questions.',
    'Community & Social Proof': 'Reputation and trust-building content highlighting team and client voice.',
    'Video Reels': 'Short-form video creative used for awareness, engagement, and promotional reach.'
  };

  const VIDEO_THUMBNAIL_MAP = {
    'assets/videos/Beverly holiday.mp4': 'assets/videos/Beverly holiday.mp4_snapshot_00.00.266.jpg',
    'assets/videos/Breathe Deeper2.mp4': 'assets/videos/Breathe Deeper2.mp4_snapshot_00.00.279.jpg',
    'assets/videos/Gift Card Sale.mp4': 'assets/videos/Gift Card Sale.mp4_snapshot_00.00.429.jpg',
    'assets/videos/Happy.mp4': 'assets/videos/Happy.mp4_snapshot_00.00.321.jpg',
    'assets/videos/Middleton Holiday.mp4': 'assets/videos/Middleton Holiday.mp4_snapshot_00.00.369.jpg',
    'assets/videos/Recharge.mp4': 'assets/videos/Recharge.mp4_snapshot_00.00.179.jpg',
    'assets/videos/Well be here when you get back.mp4': 'assets/videos/Well be here when you get back.mp4_snapshot_00.00.268.jpg'
  };

  /*
   * Square 800x800 placeholder — matches the 1:1 card aspect ratio.
   * The play icon is centered at 400,400 so it sits correctly in the
   * square frame when a video thumbnail file is missing.
   */
  const VIDEO_THUMBNAIL_PLACEHOLDER =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='800' viewBox='0 0 800 800'%3E%3Crect width='100%25' height='100%25' fill='%235b3a7d'/%3E%3Ccircle cx='400' cy='400' r='84' fill='rgba(0,0,0,.45)'/%3E%3Cpolygon points='372,348 472,400 372,452' fill='%23f2958e'/%3E%3C/svg%3E";

  const toMediaType = (item) => (item.type === 'video' ? 'video' : 'image');

  const getVideoThumbnailCandidates = (filename) => {
    const candidates = [];
    const mapped = VIDEO_THUMBNAIL_MAP[filename];
    if (mapped) {
      candidates.push(mapped);
    }
    const jpegGuess = filename.replace(/\.mp4$/i, '.jpg');
    const pngGuess  = filename.replace(/\.mp4$/i, '.png');
    if (!candidates.includes(jpegGuess)) candidates.push(jpegGuess);
    if (!candidates.includes(pngGuess))  candidates.push(pngGuess);
    candidates.push(VIDEO_THUMBNAIL_PLACEHOLDER);
    return candidates;
  };

  const getThumbnailSources = (item) => {
    if (toMediaType(item) === 'video') {
      return getVideoThumbnailCandidates(item.filename);
    }
    return [item.filename];
  };

  const groupByCategory = (items) => {
    const grouped = new Map();
    items.forEach((item, index) => {
      const category = item.category || 'Other';
      const groupEntry = grouped.get(category) || [];
      groupEntry.push({ item, index });
      grouped.set(category, groupEntry);
    });
    return grouped;
  };

  const getOrderedCategories = (groupedMap) => {
    const known   = CATEGORY_ORDER.filter((c) => groupedMap.has(c));
    const unknown = Array.from(groupedMap.keys())
      .filter((c) => !CATEGORY_ORDER.includes(c))
      .sort((a, b) => a.localeCompare(b));
    return known.concat(unknown);
  };

  const createThumbnailImage = (entry) => {
    const image = document.createElement('img');
    image.alt      = entry.item.title;
    image.loading  = 'lazy';
    image.decoding = 'async';

    const sources = getThumbnailSources(entry.item);
    let sourceIndex = 0;

    const setSource = (index) => { image.src = sources[index]; };

    image.addEventListener('error', () => {
      sourceIndex += 1;
      if (sourceIndex < sources.length) {
        setSource(sourceIndex);
      }
    });

    setSource(sourceIndex);
    return image;
  };

  const createGalleryButton = (entry) => {
    const item      = entry.item;
    const mediaType = toMediaType(item);

    const button = document.createElement('button');
    button.type      = 'button';
    button.className = `gallery-item${mediaType === 'video' ? ' video-item' : ''}`;
    button.dataset.index = String(entry.index);
    button.setAttribute('aria-label', `Open ${item.title}`);

    const imageWrap = document.createElement('div');
    imageWrap.className = 'img-wrap';
    imageWrap.appendChild(createThumbnailImage(entry));

    const title = document.createElement('div');
    title.className   = 'item-title';
    title.textContent = item.title;

    button.appendChild(imageWrap);
    button.appendChild(title);
    return button;
  };

  const toSectionId = (categoryName) =>
    `category-${categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;

  const createQuickJumpNav = (categoryOrder, grouped) => {
    const nav = document.createElement('nav');
    nav.className = 'category-jump-nav';
    nav.setAttribute('aria-label', 'Portfolio category quick navigation');

    const list = document.createElement('ul');
    categoryOrder.forEach((categoryName) => {
      const itemCount = (grouped.get(categoryName) || []).length;
      const listItem  = document.createElement('li');
      const link      = document.createElement('a');
      link.href        = `#${toSectionId(categoryName)}`;
      link.textContent = `${categoryName} (${itemCount})`;
      listItem.appendChild(link);
      list.appendChild(listItem);
    });

    nav.appendChild(list);
    return nav;
  };

  const createGallerySection = (categoryName, entries) => {
    const section = document.createElement('section');
    section.className = `gallery-section${categoryName === 'Video Reels' ? ' video-section' : ''}`;
    section.id        = toSectionId(categoryName);

    const heading = document.createElement('h3');
    heading.textContent = categoryName;

    const summary = document.createElement('div');
    summary.className = 'gallery-section-summary';

    const description = document.createElement('p');
    description.textContent = CATEGORY_DESCRIPTIONS[categoryName] || 'Portfolio work grouped by category.';

    const count = document.createElement('p');
    count.className   = 'gallery-count';
    count.textContent = `${entries.length} item${entries.length === 1 ? '' : 's'}`;

    summary.appendChild(description);
    summary.appendChild(count);

    const grid = document.createElement('div');
    grid.className = 'gallery-grid';

    entries.forEach((entry) => {
      /*
       * No featured-item class applied — all cards are equal weight
       * and use the same 1:1 aspect ratio defined in CSS.
       */
      grid.appendChild(createGalleryButton(entry));
    });

    section.appendChild(heading);
    section.appendChild(summary);
    section.appendChild(grid);
    return section;
  };

  const renderGallery = () => {
    const grouped       = groupByCategory(galleryItems);
    const categoryOrder = getOrderedCategories(grouped);

    const fragment = document.createDocumentFragment();
    fragment.appendChild(createQuickJumpNav(categoryOrder, grouped));
    categoryOrder.forEach((categoryName) => {
      const entries = grouped.get(categoryName) || [];
      fragment.appendChild(createGallerySection(categoryName, entries));
    });

    sectionsContainer.innerHTML = '';
    sectionsContainer.appendChild(fragment);
  };

  const createLightboxElements = () => {
    const overlay = document.createElement('div');
    overlay.id = 'lightbox';
    overlay.setAttribute('role',            'dialog');
    overlay.setAttribute('aria-modal',       'true');
    overlay.setAttribute('aria-hidden',      'true');
    overlay.setAttribute('aria-labelledby',  'lightbox-title');
    overlay.setAttribute('aria-describedby', 'lightbox-description');

    overlay.innerHTML = [
      '<div class="lightbox-content">',
      '  <button class="close-btn" type="button" aria-label="Close preview">&times;</button>',
      '  <img src="" alt="" hidden />',
      '  <div class="caption">',
      '    <h2 id="lightbox-title"></h2>',
      '    <div class="tools-container" hidden></div>',
      '    <p id="lightbox-impact" class="business-impact" hidden></p>',
      '    <p id="lightbox-description"></p>',
      '  </div>',
      '</div>'
    ].join('');

    document.body.appendChild(overlay);

    const closeButton    = overlay.querySelector('.close-btn');
    const content        = overlay.querySelector('.lightbox-content');
    const modalImage     = overlay.querySelector('img');
    const title          = overlay.querySelector('#lightbox-title');
    const toolsContainer = overlay.querySelector('.tools-container');
    const impact         = overlay.querySelector('#lightbox-impact');
    const description    = overlay.querySelector('#lightbox-description');

    if (
      !(closeButton    instanceof HTMLButtonElement) ||
      !(content        instanceof HTMLElement)       ||
      !(modalImage     instanceof HTMLImageElement)  ||
      !(title          instanceof HTMLElement)       ||
      !(toolsContainer instanceof HTMLElement)       ||
      !(impact         instanceof HTMLElement)       ||
      !(description    instanceof HTMLElement)
    ) {
      throw new Error('Unable to initialize lightbox elements.');
    }

    return {
      overlay, closeButton, content, modalImage,
      title, toolsContainer, impact, description,
      activeVideo: null,
      lastTrigger: null,
      inertTargets: Array.from(document.querySelectorAll('header, main, footer'))
    };
  };

  const lightbox = createLightboxElements();

  const clearMedia = () => {
    if (lightbox.activeVideo instanceof HTMLVideoElement) {
      lightbox.activeVideo.pause();
      lightbox.activeVideo.removeAttribute('src');
      lightbox.activeVideo.load();
      lightbox.activeVideo.remove();
      lightbox.activeVideo = null;
    }
    lightbox.modalImage.hidden = true;
    lightbox.modalImage.src    = '';
    lightbox.modalImage.alt    = '';
  };

  const setBackgroundInteractivity = (isDisabled) => {
    lightbox.inertTargets.forEach((element) => {
      if (!(element instanceof HTMLElement)) return;
      if (isDisabled) {
        element.setAttribute('inert', '');
        element.setAttribute('aria-hidden', 'true');
      } else {
        element.removeAttribute('inert');
        element.removeAttribute('aria-hidden');
      }
    });
  };

  const focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  const trapFocus = (event) => {
    if (!lightbox.overlay.classList.contains('active') || event.key !== 'Tab') return;

    const focusableElements = Array.from(lightbox.overlay.querySelectorAll(focusableSelector))
      .filter((el) => el instanceof HTMLElement && !el.hasAttribute('hidden'));

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement  = focusableElements[focusableElements.length - 1];
    const activeEl     = document.activeElement;

    if (event.shiftKey && activeEl === firstElement) {
      event.preventDefault();
      if (lastElement instanceof HTMLElement) lastElement.focus();
      return;
    }
    if (!event.shiftKey && activeEl === lastElement) {
      event.preventDefault();
      if (firstElement instanceof HTMLElement) firstElement.focus();
    }
  };

  const populateCaption = (item) => {
    lightbox.title.textContent = item.title || 'Portfolio item';

    if (Array.isArray(item.toolsUsed) && item.toolsUsed.length > 0) {
      lightbox.toolsContainer.hidden = false;
      lightbox.toolsContainer.innerHTML = '';
      item.toolsUsed.forEach((toolName) => {
        const badge = document.createElement('span');
        badge.className   = 'tool-badge';
        badge.textContent = toolName;
        lightbox.toolsContainer.appendChild(badge);
      });
    } else {
      lightbox.toolsContainer.hidden    = true;
      lightbox.toolsContainer.innerHTML = '';
    }

    if (item.businessImpact) {
      lightbox.impact.hidden    = false;
      lightbox.impact.innerHTML = `<strong>Impact:</strong> ${item.businessImpact}`;
    } else {
      lightbox.impact.hidden      = true;
      lightbox.impact.textContent = '';
    }

    lightbox.description.textContent = item.description || '';
  };

  const openModal = (index, triggerElement) => {
    const item = galleryItems[index];
    if (!item) return;

    lightbox.lastTrigger = triggerElement instanceof HTMLElement ? triggerElement : null;

    clearMedia();
    populateCaption(item);

    if (toMediaType(item) === 'video') {
      const video = document.createElement('video');
      video.className  = 'modal-video';
      video.controls   = true;
      video.playsInline = true;
      video.preload    = 'metadata';
      video.src        = item.filename;
      video.setAttribute('aria-label', item.title);
      lightbox.content.insertBefore(video, lightbox.content.querySelector('.caption'));
      lightbox.activeVideo = video;
    } else {
      lightbox.modalImage.hidden = false;
      lightbox.modalImage.src    = item.filename;
      lightbox.modalImage.alt    = item.title;
    }

    lightbox.overlay.classList.add('active');
    lightbox.overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    setBackgroundInteractivity(true);

    lightbox.closeButton.setAttribute('aria-label', `Close preview of ${item.title}`);
    lightbox.closeButton.focus();
  };

  const closeModal = () => {
    if (!lightbox.overlay.classList.contains('active')) return;

    lightbox.overlay.classList.remove('active');
    lightbox.overlay.setAttribute('aria-hidden', 'true');

    document.body.classList.remove('lightbox-open');
    setBackgroundInteractivity(false);

    clearMedia();

    if (lightbox.lastTrigger instanceof HTMLElement) {
      lightbox.lastTrigger.focus();
    }
    lightbox.lastTrigger = null;
  };

  sectionsContainer.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const button = target.closest('.gallery-item');
    if (!(button instanceof HTMLButtonElement)) return;

    const parsedIndex = Number.parseInt(button.dataset.index || '', 10);
    if (Number.isNaN(parsedIndex)) return;

    openModal(parsedIndex, button);
  });

  lightbox.overlay.addEventListener('click', (event) => {
    if (event.target === lightbox.overlay) closeModal();
  });

  lightbox.closeButton.addEventListener('click', () => closeModal());

  document.addEventListener('keydown', (event) => {
    if (!lightbox.overlay.classList.contains('active')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal();
      return;
    }
    trapFocus(event);
  });

  renderGallery();
});
