export default class StoryDetailView {
  show(story) {
    const popup = document.createElement('div');
    popup.className = 'story-popup';
    popup.innerHTML = `
          <div class="story-popup-content">
            <span class="story-popup-close">&times;</span>
            <h3>${story.name}</h3>
            <p><strong>Pembuat:</strong> ${story.name}</p>
            <p><strong>Dibuat pada:</strong> ${new Date(story.createdAt).toLocaleString('id-ID')}</p>
            <img src="${story.photoUrl}" style="width: 100%; border-radius: 8px; margin: 12px 0;" />
            <p style="text-align: justify;">${story.description}</p>
          </div>
        `;

    popup.querySelector('.story-popup-close').addEventListener('click', () => popup.remove());
    document.body.appendChild(popup);
  }
}
