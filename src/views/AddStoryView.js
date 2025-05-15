import Swal from 'sweetalert2';
import L from 'leaflet';

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
    const el = this.getElements();
    if (event === 'submit')
      el.form.addEventListener('submit', (e) => {
        e.preventDefault();
        handler();
      });
    else if (event === 'cancel') el.cancelBtn.addEventListener('click', handler);
    else if (event === 'methodChange') {
      el.radioButtons.forEach((radio) => {
        radio.addEventListener('change', () => {
          const selected = document.querySelector('input[name="upload-method"]:checked').value;
          handler(selected);
        });
      });
    } else if (event === 'capture') el.captureBtn.addEventListener('click', handler);
    else if (event === 'retake') el.retakeBtn.addEventListener('click', handler);
  }

  setLocation(lat, lon) {
    const el = this.getElements();
    el.lat.value = lat.toFixed(6);
    el.lon.value = lon.toFixed(6);
  }

  showFileUpload() {
    this.getElements().fileSection.style.display = 'block';
  }

  hideFileUpload() {
    this.getElements().fileSection.style.display = 'none';
  }

  showCamera() {
    this.getElements().cameraSection.style.display = 'block';
  }

  hideCamera() {
    this.getElements().cameraSection.style.display = 'none';
  }

  resetCameraPreview() {
    const el = this.getElements();
    el.preview.style.display = 'none';
    el.camera.style.display = 'block';
    el.captureBtn.style.display = 'inline-block';
    el.retakeBtn.style.display = 'none';
  }

  startCamera() {
    return navigator.mediaDevices.getUserMedia({ video: true });
  }

  attachStreamToCamera(stream) {
    this.getElements().camera.srcObject = stream;
  }

  showCameraPreview(imageUrl) {
    const el = this.getElements();
    el.preview.src = imageUrl;
    el.preview.style.display = 'block';
    el.camera.style.display = 'none';
    el.captureBtn.style.display = 'none';
    el.retakeBtn.style.display = 'inline-block';
  }

  capturePhoto(callback) {
    const el = this.getElements();
    const ctx = el.canvas.getContext('2d');
    el.canvas.width = el.camera.videoWidth;
    el.canvas.height = el.camera.videoHeight;
    ctx.drawImage(el.camera, 0, 0, el.canvas.width, el.canvas.height);
    el.canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      callback(blob, url);
    }, 'image/jpeg');
  }

  getDescription() {
    return this.getElements().description.value;
  }

  getSelectedMethod() {
    return document.querySelector('input[name="upload-method"]:checked').value;
  }

  getUploadedFile() {
    return this.getElements().photo.files[0];
  }

  showSuccess(title, message) {
    return Swal.fire({ icon: 'success', title, text: message });
  }

  showError(title, message) {
    return Swal.fire({ icon: 'error', title, text: message });
  }

  showWarning(title, message) {
    return Swal.fire({ icon: 'warning', title, text: message });
  }

  confirmCancel(callback) {
    Swal.fire({
      title: 'Batalkan?',
      text: 'Data belum tersimpan akan hilang.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya',
      cancelButtonText: 'Tidak',
    }).then((result) => {
      if (result.isConfirmed) callback();
    });
  }

  showCameraError() {
    this.showError('❌ Kamera tidak bisa diakses', 'Periksa izin atau perangkat kamera.');
  }

  redirectToHome() {
    location.hash = 'home';
  }

  initMap(onClickHandler) {
    const map = L.map('select-map').setView([-2.5489, 118.0149], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map);

    const markerIcon = L.divIcon({
      html: `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42" fill="none">
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#9e6b34"/>
              <stop offset="100%" stop-color="#7a4e22"/>
            </linearGradient>
          </defs>
          <path d="M16 0C7.16 0 0 7.16 0 16C0 26 16 42 16 42C16 42 32 26 32 16C32 7.16 24.84 0 16 0Z" fill="url(#grad)"/>
          <circle cx="16" cy="16" r="7" fill="white" stroke="#3b3a36" stroke-width="2"/>
          <text x="16" y="20.5" font-family="EB Garamond, serif" font-size="10" fill="#3b3a36" text-anchor="middle" dominant-baseline="middle">🏛️</text>
        </svg>
      `,
      className: '',
      iconSize: [32, 42],
      iconAnchor: [16, 42],
    });

    let marker = null;

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;

      if (!marker) {
        marker = L.marker([lat, lng], { draggable: true, icon: markerIcon }).addTo(map);
      } else {
        marker.setLatLng([lat, lng]);
      }

      onClickHandler(lat, lng);

      marker.on('dragend', (event) => {
        const { lat, lng } = event.target.getLatLng();
        onClickHandler(lat, lng);
      });
    });
  }
}
