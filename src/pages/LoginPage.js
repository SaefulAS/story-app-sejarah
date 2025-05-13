import LoginView from '../views/LoginView';
import LoginPresenter from '../presenters/LoginPresenter';

export default function LoginPage(container) {
  const view = new LoginView(container);
  new LoginPresenter(view);
}
