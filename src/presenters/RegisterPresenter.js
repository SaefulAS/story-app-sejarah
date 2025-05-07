import swal from 'sweetalert';
import AuthModel from '../models/AuthModel';

export default class RegisterPresenter {
  constructor(view) {
    this.view = view;
    this.view.render();
    this.view.bindTogglePassword();
    this.view.addRealtimeValidation();
    this.view.onSubmit((e) => this.handleSubmit(e));
  }

  async handleSubmit(e) {
    e.preventDefault();

    const { name, email, password } = this.view.getFormValues();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    this.view.setErrorMessage('name', '');
    this.view.setErrorMessage('email', '');
    this.view.setErrorMessage('password', '');

    if (!name || name.length < 3) {
      this.view.setErrorMessage('name', 'Nama minimal 3 karakter');
      return;
    }

    if (!emailPattern.test(email)) {
      this.view.setErrorMessage('email', 'Format email tidak valid');
      return;
    }

    if (password.length < 6) {
      this.view.setErrorMessage('password', 'Kata sandi minimal 6 karakter');
      return;
    }

    this.view.toggleLoading(true);

    try {
      await AuthModel.register(name, email, password);
      swal('Registrasi Berhasil', 'Silakan masuk dengan akun Anda.', 'success').then(() => {
        location.hash = 'login';
      });
    } catch (err) {
      swal('Registrasi Gagal', err.message || 'Terjadi kesalahan. Silakan coba lagi.', 'error');
    } finally {
      this.view.toggleLoading(false);
    }
  }
}
