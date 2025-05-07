export default function Navbar() {
  return `
      <nav class="navbar">
        <div class="navbar-left">
          <a href="#home" class="nav-link active">Cerita Sejarah</a>
        </div>
        <button class="navbar-toggle" aria-label="Toggle menu">☰</button>
        <div class="navbar-right hidden" id="mobile-menu">
          <a href="#add-story" class="nav-link" id="add-story-btn">Tambah Sejarah</a>
          <a href="#logout" class="nav-link" id="logout-btn">Logout</a>
        </div>
      </nav>
    `;
}
