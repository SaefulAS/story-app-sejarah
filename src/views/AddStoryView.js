export default class AddStoryView {
  constructor(container) {
    this.container = container;
  }

  render() {
    this.container.innerHTML = `
      <div class="add-story-container">
        <div class="add-story-card">
          <section id="add-story-skip" tabindex="-1">
            <h2 class="add-story-title">Tambah Cerita Baru</h2>
            <p class="add-story-subtext">Bagikan cerita dan lokasi terbaikmu sekarang!</p>
          </section>
          <form id="add-story-form">
            <label for="description">Deskripsi Cerita</label>
            <input type="text" id="description" placeholder="Deskripsi cerita..." required />

            <fieldset class="form-group">
              <legend>Pilih metode upload:</legend>
              <div class="radio-list">
                <label class="radio-line">
                  <input type="radio" name="upload-method" value="file" checked />
                  <span>Upload File</span>
                </label>
                <label class="radio-line">
                  <input type="radio" name="upload-method" value="camera" />
                  <span>Gunakan Kamera</span>
                </label>
              </div>
            </fieldset>

            <div id="file-upload-section" class="form-group">
              <input type="file" id="photo" accept="image/*" />
            </div>

            <div id="camera-section" class="form-group" style="display: none;">
              <div id="camera-wrapper">
                <video id="camera" autoplay playsinline></video>
                <img id="preview-image" alt="Preview of captured photo" />
              </div>
              <canvas id="canvas" style="display: none;"></canvas>
              <div id="camera-buttons">
                <button type="button" id="capture-btn">📸 Ambil Foto</button>
                <button type="button" id="retake-btn">🔄 Ulangi</button>
              </div>
            </div>

            <p><strong>Klik pada peta untuk memilih lokasi!</strong></p>
            <div id="select-map"></div>
            <input type="text" id="lat" placeholder="Latitude" readonly />
            <input type="text" id="lon" placeholder="Longitude" readonly />

            <div class="form-actions">
              <button type="submit">✅ Tambah Story</button>
              <button type="button" id="cancel-btn" class="cancel-btn">❌ Batal</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  getElements() {
    return {
      form: document.getElementById('add-story-form'),
      description: document.getElementById('description'),
      photo: document.getElementById('photo'),
      lat: document.getElementById('lat'),
      lon: document.getElementById('lon'),
      captureBtn: document.getElementById('capture-btn'),
      retakeBtn: document.getElementById('retake-btn'),
      camera: document.getElementById('camera'),
      canvas: document.getElementById('canvas'),
      preview: document.getElementById('preview-image'),
      cancelBtn: document.getElementById('cancel-btn'),
      radioButtons: document.getElementsByName('upload-method'),
      fileSection: document.getElementById('file-upload-section'),
      cameraSection: document.getElementById('camera-section'),
    };
  }

  on(event, handler) {
    if (event === 'submit') {
      this.getElements().form.addEventListener('submit', handler);
    } else if (event === 'cancel') {
      this.getElements().cancelBtn.addEventListener('click', handler);
    } else if (event === 'methodChange') {
      this.getElements().radioButtons.forEach((r) => r.addEventListener('change', handler));
    } else if (event === 'capture') {
      this.getElements().captureBtn.addEventListener('click', handler);
    } else if (event === 'retake') {
      this.getElements().retakeBtn.addEventListener('click', handler);
    }
  }

  setLocation(lat, lon) {
    this.getElements().lat.value = lat.toFixed(6);
    this.getElements().lon.value = lon.toFixed(6);
  }

  showCameraPreview(imageUrl) {
    const { preview, camera, captureBtn, retakeBtn } = this.getElements();
    preview.src = imageUrl;
    preview.style.display = 'block';
    camera.style.display = 'none';
    captureBtn.style.display = 'none';
    retakeBtn.style.display = 'inline-block';
  }

  resetCameraPreview() {
    const { preview, camera, captureBtn, retakeBtn } = this.getElements();
    preview.style.display = 'none';
    camera.style.display = 'block';
    captureBtn.style.display = 'inline-block';
    retakeBtn.style.display = 'none';
  }
}
