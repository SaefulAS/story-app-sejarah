export default class LoginView {
  constructor(container) {
    this.container = container;
  }

  render() {
    this.container.innerHTML = `
        <div class="login-wrapper">
          <div class="login-branding">
            <h1 class="site-title">Titik Sejarah</h1>
            <p class="site-tagline">Menjelajah Jejak Sejarah Indonesia</p>
          </div>
          <div class="login-card" id="login-skip" tabindex="-1">
            <h2>Selamat Datang Kembali!</h2>
            <p class="login-subtext">Masuk ke akun kamu untuk melanjutkan</p>
            <form id="login-form">
              <div class="form-group">
                <label for="email" class="sr-only">Alamat Email</label>
                <input type="email" id="email" placeholder="Alamat Email" required />
                <small id="email-error" class="error-message" aria-live="polite"></small>
              </div>
              <div class="form-group password-wrapper">
                <label for="password" class="sr-only">Kata Sandi</label>
                <input type="password" id="password" placeholder="Kata Sandi" required />
                <span id="toggle-password" class="toggle-eye" data-visible="false">🙈</span>
                <small id="password-error" class="error-message" aria-live="polite"></small>
              </div>
              <button type="submit">Masuk</button>
            </form>
            <a href="#register">Belum punya akun? Daftar</a>
          </div>
        </div>
      `;
  }

  bindTogglePassword() {
    const toggle = document.getElementById('toggle-password');
    const pwd = document.getElementById('password');

    toggle.addEventListener('click', () => {
      const isVisible = toggle.getAttribute('data-visible') === 'true';
      pwd.type = isVisible ? 'password' : 'text';
      toggle.textContent = isVisible ? '🙈' : '👁️';
      toggle.setAttribute('data-visible', String(!isVisible));
    });
  }

  bindRealtimeValidation() {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    emailInput.addEventListener('input', (e) => {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const error = emailPattern.test(e.target.value.trim()) ? '' : 'Format email tidak valid';
      this.setErrorMessage('email', error);
    });

    passwordInput.addEventListener('input', (e) => {
      const error = e.target.value.length < 6 ? 'Kata sandi minimal 6 karakter' : '';
      this.setErrorMessage('password', error);
    });
  }

  getFormValues() {
    return {
      email: document.getElementById('email').value.trim(),
      password: document.getElementById('password').value,
    };
  }

  onSubmit(handler) {
    document.getElementById('login-form').addEventListener('submit', handler);
  }

  setErrorMessage(field, message) {
    document.getElementById(`${field}-error`).textContent = message;
  }

  toggleLoading(state) {
    const button = document.querySelector('#login-form button');
    button.disabled = state;
    button.innerHTML = state ? `<span class="spinner"></span> Sedang Masuk...` : 'Masuk';
  }
}
