import Navbar from '../components/navbar';
import Footer from '../components/footer';

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
}
