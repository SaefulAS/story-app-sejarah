import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import AddStoryPage from './pages/AddStoryPage';
import NotFoundPage from './pages/NotFoundPage';
import { initNotificationButton } from './utils/initNotification';

const routes = {
  login: LoginPage,
  register: RegisterPage,
  home: HomePage,
  'add-story': AddStoryPage,
};

export default function Router() {
  const app = document.getElementById('app');
  const token = localStorage.getItem('token');

  const rawHash = location.hash.slice(1);
  const hash = rawHash.replace(/^\//, '');

  if (rawHash === 'home-skip') return;

  const renderPage = () => {
    app.innerHTML = '';

    if (!token && hash !== 'register' && hash !== 'login') {
      location.hash = '/login';
      return;
    }

    if (token && hash === '') {
      location.hash = '/home';
      return;
    }

    if (routes[hash]) {
      routes[hash](app);
      setTimeout(() => {
        initNotificationButton();
      }, 0);
    } else {
      NotFoundPage(app);
    }
  };

  if (document.startViewTransition) {
    document.startViewTransition(() => renderPage());
  } else {
    renderPage();
  }
}
