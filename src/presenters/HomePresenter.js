import { renderLeafletMap } from '../maps/LeafletMap';
import { clearFlag } from '../utils/db';
import swal from 'sweetalert';
import StoryListPresenter from './StoryListPresenter';
import StoryListView from '../views/StoryListView';

export default class HomePresenter {
  constructor(view) {
    this.view = view;
  }

  async init() {
    this.view.render();
    this.setupUIHandlers();

    await renderLeafletMap('map');

    const storyView = new StoryListView(this.view.getStoriesContainer());
    const storyPresenter = new StoryListPresenter(storyView);
    await storyPresenter.init();
    await clearFlag('notified');
  }

  setupUIHandlers() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach((link) =>
      link.addEventListener('click', (e) => {
        navLinks.forEach((l) => l.classList.remove('active'));
        e.target.classList.add('active');
      })
    );

    const toggleBtn = document.querySelector('.navbar-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    if (toggleBtn && mobileMenu) {
      toggleBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('show');
        mobileMenu.classList.toggle('hidden');
      });
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        swal({
          title: 'Yakin ingin keluar?',
          text: 'Kamu akan keluar dari akunmu.',
          icon: 'warning',
          buttons: ['Batal', 'Ya, Logout'],
          dangerMode: true,
        }).then((willLogout) => {
          if (willLogout) {
            localStorage.removeItem('token');
            location.hash = 'login';
          }
        });
      });
    }

    const addStoryBtn = document.getElementById('add-story-btn');
    if (addStoryBtn) {
      addStoryBtn.addEventListener('click', (e) => {
        e.preventDefault();
        location.hash = 'add-story';
      });
    }
  }
}
