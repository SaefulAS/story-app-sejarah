import RegisterView from '../views/RegisterView';
import RegisterPresenter from '../presenters/RegisterPresenter';

export default function RegisterPage(container) {
  const view = new RegisterView(container);
  new RegisterPresenter(view);
}
