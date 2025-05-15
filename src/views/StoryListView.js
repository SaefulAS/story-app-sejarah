import Swal from 'sweetalert2';

export default class StoryListView {
  constructor(container) {
    this.container = container;
    this.currentPage = 1;
  }

  setHandlers({ onDetailClick, onMapClick }) {
    this.onDetailClick = onDetailClick;
    this.onMapClick = onMapClick;
  }

  renderLayout() {
    if (this.wrapper) return;

    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('story-list-wrapper');

    const heading = document.createElement('h3');
    heading.className = 'stories-heading';
    heading.textContent = 'Semua Sejarah';
    this.wrapper.appendChild(heading);

    this.searchWrapper = document.createElement('div');
    this.searchWrapper.classList.add('story-search-wrapper');

    this.searchInput = document.createElement('input');
    this.searchInput.type = 'text';
    this.searchInput.placeholder = 'Cari cerita...';
    this.searchInput.classList.add('story-search-input');

    this.searchIcon = document.createElement('span');
    this.searchIcon.classList.add('search-icon');
    this.searchIcon.innerHTML = '🔍';

    this.searchWrapper.appendChild(this.searchIcon);
    this.searchWrapper.appendChild(this.searchInput);

    this.grid = document.createElement('div');
    this.grid.classList.add('stories-grid', 'scroll-animate-story');

    this.pagination = document.createElement('div');
    this.pagination.className = 'pagination-controls';

    this.wrapper.appendChild(this.searchWrapper);
    this.wrapper.appendChild(this.grid);
    this.wrapper.appendChild(this.pagination);
    this.container.appendChild(this.wrapper);
  }

  bindSearchInput(handler) {
    this.searchInput.addEventListener('input', () => {
      const keyword = this.searchInput.value.toLowerCase();
      handler(keyword);
    });
  }

  renderStories(stories, page = 1) {
    this.currentPage = page;
    this.grid.classList.add('fade');

    setTimeout(() => {
      this.grid.innerHTML = '';

      if (stories.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.textContent = 'Data tidak ditemukan.';
        emptyMessage.style.textAlign = 'center';
        emptyMessage.style.fontSize = '16px';
        emptyMessage.style.color = '#777';
        emptyMessage.style.gridColumn = '1 / -1';
        this.grid.appendChild(emptyMessage);
        this.pagination.innerHTML = '';
        this.grid.classList.remove('fade');
        return;
      }

      const start = (page - 1) * 10;
      const end = start + 10;

      stories.slice(start, end).forEach((story) => {
        const card = document.createElement('div');
        card.classList.add('story-card');

        const shortDescription =
          story.description.split(' ').length > 20
            ? story.description.split(' ').slice(0, 20).join(' ') + '...'
            : story.description;

        const createdAt = new Date(story.createdAt).toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: bold;">
            <div>Pembuat: ${story.name}</div>
            <div>${createdAt}</div>
          </div>
          <div class="story-image-wrapper">
            <img src="${story.photoUrl}" alt="Image for story titled '${story.name}'" />
          </div>
          <p>${shortDescription}</p>
          <div class="story-card-buttons">
            <button class="btn-detail" data-id="${story.id}">Detail</button>
            <button class="btn-map" data-lat="${story.lat}" data-lon="${story.lon}">Lihat Titik Peta</button>
          </div>
        `;

        this.grid.appendChild(card);
      });

      this.grid.classList.remove('fade');
      this.bindDetailButtonClick(this.onDetailClick);
      this.bindMapButtonClick(this.onMapClick);
    }, 150);
  }

  bindDetailButtonClick(handler) {
    this.grid.querySelectorAll('.btn-detail').forEach((btn) => {
      btn.addEventListener('click', () => handler(btn.dataset.id));
    });
  }

  bindMapButtonClick(handler) {
    this.grid.querySelectorAll('.btn-map').forEach((btn) => {
      btn.addEventListener('click', () => {
        const lat = parseFloat(btn.dataset.lat);
        const lon = parseFloat(btn.dataset.lon);
        const name = btn
          .closest('.story-card')
          ?.querySelector('div div')
          ?.textContent?.replace('Pembuat: ', '');
        handler({ lat, lon, name });
      });
    });
  }

  renderPagination(currentPage, totalPages, onPageChange) {
    this.pagination.innerHTML = '';

    const maxPageButtons = 5;
    const half = Math.floor(maxPageButtons / 2);
    let startPage = Math.max(1, currentPage - half);
    let endPage = Math.min(totalPages, currentPage + half);

    if (endPage - startPage + 1 < maxPageButtons) {
      if (startPage === 1) endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
      else if (endPage === totalPages) startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    const createButton = (text, disabled, onClick, isActive = false) => {
      const btn = document.createElement('button');
      btn.textContent = text;
      if (disabled) btn.disabled = true;
      if (isActive) btn.classList.add('active');
      btn.addEventListener('click', onClick);
      return btn;
    };

    this.pagination.appendChild(
      createButton('←', currentPage === 1, () => onPageChange(currentPage - 1))
    );

    for (let i = startPage; i <= endPage; i++) {
      this.pagination.appendChild(createButton(i, false, () => onPageChange(i), i === currentPage));
    }

    this.pagination.appendChild(
      createButton('→', currentPage === totalPages, () => onPageChange(currentPage + 1))
    );
  }
  showWarning(title, message) {
    Swal.fire({ icon: 'warning', title, text: message });
  }
}
