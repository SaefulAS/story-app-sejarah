import Navbar from '../components/navbar';
import Footer from '../components/footer';
import Swal from 'sweetalert2';

export default class HomeView {
  constructor(container) {
    this.container = container;
  }

  render() {
    this.container.innerHTML = `
      <div class="homepage-container">
        ${Navbar()}
        <header class="home-header-section">
          <h1 class="home-title">📍 Cerita Sejarah dari Seluruh Indonesia</h1>
          <p class="home-subtitle">Lihat cerita-cerita menarik dari Sejarah beserta lokasinya di peta interaktif!</p>
        </header>
        <section id="map-section"><div id="map" class="scroll-animate"></div></section>
        <section id="stories-section" class="scroll-animate" tabindex="-1">
          <div id="stories"></div>
        </section>
      </div>
    `;
    this.container.innerHTML += Footer();
  }

  getMapContainer() {
    return document.getElementById('map');
  }

  getStoriesContainer() {
    return document.getElementById('stories');
  }

  setHandlers({ onLogout, onAddStory, onToggleMenu, onNavClick }) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach((link) =>
      link.addEventListener('click', (e) => {
        e.preventDefault();
        onNavClick(e.target);
      })
    );

    const toggleBtn = document.querySelector('.navbar-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    if (toggleBtn && mobileMenu) {
      toggleBtn.addEventListener('click', onToggleMenu);
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        onLogout();
      });
    }

    const addStoryBtn = document.getElementById('add-story-btn');
    if (addStoryBtn) {
      addStoryBtn.addEventListener('click', (e) => {
        e.preventDefault();
        onAddStory();
      });
    }
  }

  showConfirmLogout(callback) {
    Swal.fire({
      title: 'Yakin ingin keluar?',
      text: 'Kamu akan keluar dari akunmu.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Logout',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) callback();
    });
  }

  showInfo(title, message) {
    Swal.fire({ icon: 'info', title, text: message });
  }

  toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
      menu.classList.toggle('show');
      menu.classList.toggle('hidden');
    }
  }

  setActiveNav(target) {
    document.querySelectorAll('.nav-link').forEach((link) => link.classList.remove('active'));
    target.classList.add('active');
  }

  showOfflineFallback() {
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
}
