import AddStoryView from '../views/AddStoryView';
import AddStoryPresenter from '../presenters/AddStoryPresenter';

export default function AddStoryPage(container) {
  const view = new AddStoryView(container);
  new AddStoryPresenter(view);
}
