import { renderLeafletMap } from '../maps/LeafletMap';
import { clearFlag, getCachedStories } from '../utils/db';
import swal from 'sweetalert';
import StoryListPresenter from './StoryListPresenter';
import StoryListView from '../views/StoryListView';

export default class HomePresenter {
  constructor(view) {
    this.view = view;
  }

  async init() {
    this.view.render();
    this.setupUIHandlers();

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
          console.error("❌ Gagal renderPage dari cache:", e.message);
        }
    
        swal('Mode Offline', 'Cerita ditampilkan dari cache lokal.', 'info');
      } else {
        console.error('🛑 Data cache tidak valid atau kosong:', cached);
        this.showOfflineMessage();
      }
    }
    
    if (success) {
      await clearFlag('notified');
    }

    if (!navigator.onLine) {
      this.showOfflineMessage();
    }
  }

  showOfflineMessage() {
    const grid = document.querySelector('.stories-grid');
    if (grid) {
      grid.innerHTML = `
        <div class="offline-fallback" style="text-align:center; padding: 40px;">
          <h2 style="color: #9e6b34;">🚫 Kamu Sedang Offline</h2>
          <p style="color: #5d5343;">
            Maaf, cerita tidak dapat dimuat saat ini.<br>Periksa jaringanmu dan klik tombol di bawah untuk mencoba kembali.
          </p>
          <button style="
            padding: 10px 20px;
            margin-top: 20px;
            background-color: #9e6b34;
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
          " onclick="location.reload()">🔄 Coba Lagi</button>
        </div>
      `;
    }
  }

  setupUIHandlers() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach((link) =>
      link.addEventListener('click', (e) => {
        navLinks.forEach((l) => l.classList.remove('active'));
        e.target.classList.add('active');
      })
    );

    const toggleBtn = document.querySelector('.navbar-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    if (toggleBtn && mobileMenu) {
      toggleBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('show');
        mobileMenu.classList.toggle('hidden');
      });
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        swal({
          title: 'Yakin ingin keluar?',
          text: 'Kamu akan keluar dari akunmu.',
          icon: 'warning',
          buttons: ['Batal', 'Ya, Logout'],
          dangerMode: true,
        }).then((willLogout) => {
          if (willLogout) {
            localStorage.removeItem('token');
            location.hash = 'login';
          }
        });
      });
    }

    const addStoryBtn = document.getElementById('add-story-btn');
    if (addStoryBtn) {
      addStoryBtn.addEventListener('click', (e) => {
        e.preventDefault();
        location.hash = 'add-story';
      });
    }
  }
}
