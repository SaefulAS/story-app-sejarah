export function handleSkipLink() {
    const skipLink = document.getElementById('skip-link');
    if (!skipLink) return;
  
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
  
      setTimeout(() => {
        const currentHash = location.hash.slice(1).replace(/^\//, '');
        const targetMap = {
          home: 'stories-section',
          'add-story': 'add-story-skip',
          login: 'login-skip',
          register: 'register-skip',
        };
  
        const targetId = targetMap[currentHash];
        const el = document.getElementById(targetId);
        if (el) {
          el.focus();
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    });
  }
  