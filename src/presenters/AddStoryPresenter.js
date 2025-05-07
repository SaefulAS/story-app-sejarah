import L from 'leaflet';
import swal from 'sweetalert';
import StoryModel from '../models/StoryModel';
import { getFlag, setFlag } from '../utils/db';

export default class AddStoryPresenter {
  constructor(view) {
    this.view = view;
    this.selectedLat = null;
    this.selectedLon = null;
    this.marker = null;
    this.videoStream = null;
    this.capturedBlob = null;

    this.view.render();
    this.setupEventHandlers();
    this.initMap();
  }

  setupEventHandlers() {
    const video = document.getElementById('camera');
    const canvas = document.getElementById('canvas');
    const captureBtn = document.getElementById('capture-btn');
    const previewImage = document.getElementById('preview-image');
    const retakeBtn = document.getElementById('retake-btn');

    const resetCameraPreview = () => {
      previewImage.style.display = 'none';
      video.style.display = 'block';
      captureBtn.style.display = 'inline-block';
      retakeBtn.style.display = 'none';
      this.capturedBlob = null;
    };

    const startCamera = () => {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          video.srcObject = stream;
          this.videoStream = stream;
        })
        .catch((err) => {
          console.error('Kamera tidak bisa diakses:', err);
          swal('❌ Kamera tidak bisa diakses', 'Periksa izin atau perangkat kamera.', 'error');
        });
    };

    const stopCamera = () => {
      if (this.videoStream) {
        this.videoStream.getTracks().forEach((track) => track.stop());
        this.videoStream = null;
      }
    };

    document.querySelectorAll('input[name="upload-method"]').forEach((radio) => {
      radio.addEventListener('change', () => {
        const selected = document.querySelector('input[name="upload-method"]:checked').value;
        resetCameraPreview();

        if (selected === 'file') {
          document.getElementById('file-upload-section').style.display = 'block';
          document.getElementById('camera-section').style.display = 'none';
          stopCamera();
        } else {
          document.getElementById('file-upload-section').style.display = 'none';
          document.getElementById('camera-section').style.display = 'block';
          startCamera();
        }
      });
    });

    captureBtn.addEventListener('click', () => {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        this.capturedBlob = blob;
        previewImage.src = URL.createObjectURL(blob);
        previewImage.style.display = 'block';
        video.style.display = 'none';
        captureBtn.style.display = 'none';
        retakeBtn.style.display = 'inline-block';
      }, 'image/jpeg');
    });

    retakeBtn.addEventListener('click', resetCameraPreview);

    async function sendPushNotification(storyDescription) {
      try {
        console.log('[DEBUG] Memeriksa flag...');
        const alreadyNotified = await getFlag('notified');
        console.log('[DEBUG] alreadyNotified:', alreadyNotified);

        await setFlag('notified', true);
        console.log('[DEBUG] Flag "notified" diset ke true');

        const registration = await navigator.serviceWorker.ready;
        const title = 'Story berhasil dibuat';
        const options = {
          body: `Anda telah membuat story baru dengan deskripsi: ${storyDescription}`,
          data: {
            link: '/#home',
          },
          tag: 'story-created',
          renotify: false,
        };

        await registration.showNotification(title, options);
        console.log('✅ Notifikasi lokal ditampilkan.');
      } catch (err) {
        console.error('❌ Gagal menampilkan notifikasi lokal:', err);
      }
    }

    document.getElementById('add-story-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const description = document.getElementById('description').value;
      const selected = document.querySelector('input[name="upload-method"]:checked').value;
      let photo = null;

      if (!this.selectedLat || !this.selectedLon) {
        return swal('Lokasi belum dipilih', 'Klik lokasi di peta dulu.', 'warning');
      }

      if (selected === 'file') {
        photo = document.getElementById('photo').files[0];
        if (!photo) return swal('Belum pilih foto', 'Silakan pilih file.', 'warning');
      } else {
        if (!this.capturedBlob) return swal('Belum ambil foto', 'Klik 📸 dulu.', 'warning');
        photo = this.capturedBlob;
      }

      try {
        await StoryModel.addStory(description, photo, this.selectedLat, this.selectedLon);
        stopCamera();
        await swal('Berhasil', 'Story ditambahkan!', 'success');
        await sendPushNotification(description);
        location.hash = 'home';
      } catch (err) {
        swal('Gagal', err.message || 'Terjadi kesalahan.', 'error');
      }
    });

    document.getElementById('cancel-btn').addEventListener('click', () => {
      swal({
        title: 'Batalkan?',
        text: 'Data belum tersimpan akan hilang.',
        icon: 'warning',
        buttons: ['Tidak', 'Ya'],
        dangerMode: true,
      }).then((willCancel) => {
        if (willCancel) {
          stopCamera();
          location.hash = 'home';
        }
      });
    });
  }

  initMap() {
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

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      this.selectedLat = lat;
      this.selectedLon = lng;
      document.getElementById('lat').value = lat.toFixed(6);
      document.getElementById('lon').value = lng.toFixed(6);

      if (this.marker) {
        this.marker.setLatLng([lat, lng]);
      } else {
        this.marker = L.marker([lat, lng], {
          icon: markerIcon,
          draggable: true,
        }).addTo(map);

        this.marker.on('dragend', (event) => {
          const newLatLng = event.target.getLatLng();
          this.selectedLat = newLatLng.lat;
          this.selectedLon = newLatLng.lng;
          document.getElementById('lat').value = this.selectedLat.toFixed(6);
          document.getElementById('lon').value = this.selectedLon.toFixed(6);
        });
      }
    });
  }
}
