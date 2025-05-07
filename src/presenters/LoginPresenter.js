import AuthModel from '../models/AuthModel';
import swal from 'sweetalert';

export default class LoginPresenter {
  constructor(view) {
    this.view = view;
    this.view.render();
    this.view.bindTogglePassword();
    this.view.bindRealtimeValidation();
    this.view.onSubmit((e) => this.handleSubmit(e));
  }

  async handleSubmit(e) {
    e.preventDefault();

    const { email, password } = this.view.getFormValues();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    this.view.setErrorMessage('email', '');
    this.view.setErrorMessage('password', '');

    if (!emailPattern.test(email)) {
      this.view.setErrorMessage('email', 'Format email tidak valid.');
      return;
    }

    if (password.length < 6) {
      this.view.setErrorMessage('password', 'Kata sandi minimal 6 karakter.');
      return;
    }

    this.view.toggleLoading(true);

    try {
      const result = await AuthModel.login(email, password);
      await swal('Berhasil Masuk', `Selamat datang, ${result.name}!`, 'success');
      location.hash = 'home';
    } catch (err) {
      swal('Gagal Masuk', err.message || 'Email atau kata sandi salah.', 'error');
    } finally {
      this.view.toggleLoading(false);
    }
  }
}
