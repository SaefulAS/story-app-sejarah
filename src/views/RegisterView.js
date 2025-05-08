import Swal from 'sweetalert2';

export default class RegisterView {
  constructor(container) {
    this.container = container;
  }

  render() {
    this.container.innerHTML = `
      <div class="auth-fullscreen">
        <div class="auth-card">
          <div class="auth-branding">
            <h1 class="site-title">Titik Sejarah</h1>
            <p class="site-tagline">Menjelajah Jejak Sejarah Indonesia</p>
          </div>
          <div class="login-card" id="register-skip" tabindex="-1">
            <h2>Buat Akun Baru</h2>
            <p class="login-subtext">Daftar untuk memulai petualanganmu</p>
            <form id="register-form">
              <div class="form-group">
                <label for="name" class="sr-only">Nama Lengkap</label>
                <input type="text" id="name" placeholder="Nama Lengkap" required aria-describedby="name-error" />
                <small id="name-error" class="error-message" aria-live="polite"></small>
              </div>
              <div class="form-group">
                <label for="email" class="sr-only">Alamat Email</label>
                <input type="email" id="email" placeholder="Alamat Email" required aria-describedby="email-error" />
                <small id="email-error" class="error-message" aria-live="polite"></small>
              </div>
              <div class="form-group password-wrapper">
                <label for="password" class="sr-only">Kata Sandi</label>
                <input type="password" id="password" placeholder="Kata Sandi" required aria-describedby="password-error" />
                <span id="toggle-password" class="toggle-eye" data-visible="false">🙈</span>
                <small id="password-error" class="error-message" aria-live="polite"></small>
              </div>
              <button type="submit">Daftar</button>
            </form>
            <a href="#login">Sudah punya akun? Masuk</a>
          </div>
        </div>
      </div>
    `;
  }

  getFormValues() {
    return {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      password: document.getElementById('password').value,
    };
  }

  addRealtimeValidation() {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    nameInput.addEventListener('input', () => {
      const val = nameInput.value.trim();
      this.setErrorMessage('name', val.length < 3 ? 'Nama minimal 3 karakter' : '');
    });

    emailInput.addEventListener('input', () => {
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      this.setErrorMessage(
        'email',
        pattern.test(emailInput.value.trim()) ? '' : 'Format email tidak valid'
      );
    });

    passwordInput.addEventListener('input', () => {
      const val = passwordInput.value;
      this.setErrorMessage('password', val.length < 6 ? 'Kata sandi minimal 6 karakter' : '');
    });
  }

  setErrorMessage(field, message) {
    const el = document.getElementById(`${field}-error`);
    if (el) el.textContent = message;
  }

  toggleLoading(isLoading) {
    const button = document.querySelector('#register-form button');
    button.disabled = isLoading;
    button.innerHTML = isLoading ? `<span class="spinner"></span> Mendaftar...` : 'Daftar';
  }

  onSubmit(callback) {
    document.getElementById('register-form').addEventListener('submit', callback);
  }

  bindTogglePassword() {
    const toggle = document.getElementById('toggle-password');
    const input = document.getElementById('password');
    toggle.addEventListener('click', () => {
      const isVisible = toggle.getAttribute('data-visible') === 'true';
      input.type = isVisible ? 'password' : 'text';
      toggle.textContent = isVisible ? '🙈' : '👁️';
      toggle.setAttribute('data-visible', String(!isVisible));
    });
  }

  showSuccess(title, message) {
    return Swal.fire({ icon: 'success', title, text: message });
  }

  showError(title, message) {
    return Swal.fire({ icon: 'error', title, text: message });
  }
}
