import { renderLeafletMap } from '../maps/LeafletMap';
import { clearFlag, getCachedStories } from '../utils/db';
import StoryListPresenter from './StoryListPresenter';
import StoryListView from '../views/StoryListView';

export default class HomePresenter {
  constructor(view) {
    this.view = view;
  }

  async init() {
    this.view.render();

    this.view.setHandlers({
      onLogout: () => this.handleLogout(),
      onAddStory: () => (location.hash = 'add-story'),
      onToggleMenu: () => this.view.toggleMobileMenu(),
      onNavClick: (target) => this.view.setActiveNav(target),
    });

    await renderLeafletMap('map');

    const storyView = new StoryListView(this.view.getStoriesContainer());
    const storyPresenter = new StoryListPresenter(storyView);

    let success = false;

    try {
      await storyPresenter.init();
      success = true;
    } catch (err) {
      console.warn('❌ Gagal fetch dari API:', err.message);

      let cached = await getCachedStories();
      if (!Array.isArray(cached) || cached.length === 0) {
        cached = await getCachedStories('cachedStoriesWithLocation');
      }

      storyView.renderLayout();

      if (Array.isArray(cached) && cached.length > 0) {
        storyView.setHandlers({
          onDetailClick: storyPresenter.handleDetailClick.bind(storyPresenter),
          onMapClick: storyPresenter.handleMapClick.bind(storyPresenter),
        });

        storyPresenter.stories = cached;
        storyPresenter.filteredStories = cached;

        try {
          storyPresenter.renderPage(1);
        } catch (e) {
          console.error('❌ Gagal renderPage dari cache:', e.message);
        }

        this.view.showInfo('Mode Offline', 'Cerita ditampilkan dari cache lokal.');
      } else {
        console.error('🛑 Data cache tidak valid atau kosong:', cached);
        this.view.showOfflineFallback();
      }
    }

    if (success) {
      await clearFlag('notified');
    }

    if (!navigator.onLine) {
      this.view.showOfflineFallback();
    }
  }

  handleLogout() {
    this.view.showConfirmLogout(() => {
      localStorage.removeItem('token');
      location.hash = 'login';
    });
  }
}
