import StoryModel from '../models/StoryModel';
import StoryDetailView from '../views/StoryDetailView';
import swal from 'sweetalert';

export default class StoryListPresenter {
  constructor(view) {
    this.view = view;
    this.currentPage = 1;
    this.stories = [];
    this.filteredStories = [];
  }

  async init() {
    this.view.renderLayout();

    this.view.setHandlers({
      onDetailClick: this.handleDetailClick.bind(this),
      onMapClick: this.handleMapClick.bind(this),
    });

    this.stories = await StoryModel.getStories();
    this.filteredStories = this.stories;

    this.renderPage(this.currentPage);
    this.view.bindSearchInput(this.handleSearch.bind(this));
  }

  renderPage(page) {
    const totalPages = Math.ceil(this.filteredStories.length / 10);
    this.currentPage = Math.min(Math.max(1, page), totalPages);
    this.view.renderStories(this.filteredStories, this.currentPage);
    this.view.renderPagination(this.currentPage, totalPages, this.renderPage.bind(this));
  }

  handleSearch(keyword) {
    this.filteredStories = this.stories.filter(
      (story) =>
        story.name.toLowerCase().includes(keyword) ||
        story.description.toLowerCase().includes(keyword)
    );
    this.renderPage(1);
  }

  async handleDetailClick(storyId) {
    const story = await StoryModel.getStoryById(storyId);
    const detailView = new StoryDetailView();
    detailView.show(story);
  }

  handleMapClick({ lat, lon, name }) {
    if (isNaN(lat) || isNaN(lon)) {
      swal('Lokasi Tidak Ditemukan', `Cerita dari ${name} tidak memiliki titik lokasi.`, 'warning');
      return;
    }

    const mapSection = document.getElementById('map-section');
    window.scrollTo({ top: mapSection.offsetTop - 200, behavior: 'smooth' });
    window.dispatchEvent(new CustomEvent('focusMarker', { detail: { lat, lon } }));
  }
}
