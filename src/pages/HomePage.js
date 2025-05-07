import HomeView from '../views/HomeView';
import HomePresenter from '../presenters/HomePresenter';

export default async function HomePage(container) {
  const view = new HomeView(container);
  const presenter = new HomePresenter(view);
  presenter.init();
}
