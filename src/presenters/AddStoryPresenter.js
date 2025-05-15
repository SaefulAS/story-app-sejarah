import StoryModel from '../models/StoryModel';
import { getFlag, setFlag } from '../utils/db';
import { serviceWorkerState } from '../utils/serviceWorkerUtils';

export default class AddStoryPresenter {
  constructor(view) {
    this.view = view;
    this.selectedLat = null;
    this.selectedLon = null;
    this.capturedBlob = null;
    this.videoStream = null;

    this.view.render();
    this.view.on('submit', this.handleSubmit.bind(this));
    this.view.on('cancel', this.handleCancel.bind(this));
    this.view.on('methodChange', this.handleMethodChange.bind(this));
    this.view.on('capture', this.handleCapture.bind(this));
    this.view.on('retake', this.handleRetake.bind(this));

    this.view.initMap(this.handleMapClick.bind(this));
  }

  handleMapClick(lat, lon) {
    this.selectedLat = lat;
    this.selectedLon = lon;
    this.view.setLocation(lat, lon);
  }

  handleMethodChange(selected) {
    this.view.resetCameraPreview();
    if (selected === 'file') {
      this.view.showFileUpload();
      this.view.hideCamera();
      this.stopCamera();
    } else {
      this.view.hideFileUpload();
      this.view.showCamera();
      this.view
        .startCamera()
        .then((stream) => {
          this.videoStream = stream;
          this.view.attachStreamToCamera(stream);
        })
        .catch(() => {
          this.view.showCameraError();
        });
    }
  }

  handleCapture() {
    this.view.capturePhoto((blob, url) => {
      this.capturedBlob = blob;
      this.view.showCameraPreview(url);
    });
  }

  handleRetake() {
    this.capturedBlob = null;
    this.view.resetCameraPreview();
  }

  stopCamera() {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach((track) => track.stop());
      this.videoStream = null;
    }
  }

  async handleSubmit() {
    const description = this.view.getDescription();
    const method = this.view.getSelectedMethod();
    let photo = null;

    if (!this.selectedLat || !this.selectedLon) {
      return this.view.showWarning('Lokasi belum dipilih', 'Klik lokasi di peta dulu.');
    }

    if (method === 'file') {
      photo = this.view.getUploadedFile();
      if (!photo) return this.view.showWarning('Belum pilih foto', 'Silakan pilih file.');
    } else {
      if (!this.capturedBlob) return this.view.showWarning('Belum ambil foto', 'Klik 📸 dulu.');
      photo = this.capturedBlob;
    }

    try {
      await StoryModel.addStory(description, photo, this.selectedLat, this.selectedLon);
      this.stopCamera();
      await this.view.showSuccess('Berhasil', 'Story ditambahkan!');
      await this.sendPushNotification(description);
      this.view.redirectToHome();
    } catch (err) {
      this.view.showError('Gagal', err.message || 'Terjadi kesalahan.');
    }
  }

  handleCancel() {
    this.view.confirmCancel(() => {
      this.stopCamera();
      this.view.redirectToHome();
    });
  }

  async sendPushNotification(desc) {
    try {
      const alreadyNotified = await getFlag('notified');

      if (!serviceWorkerState.isSubscribed) {
        return;
      }

      if (!alreadyNotified) {
        await setFlag('notified', true);
        const reg = await navigator.serviceWorker.ready;
        await reg.showNotification('Story berhasil dibuat', {
          body: `Anda telah membuat story baru dengan deskripsi: ${desc}`,
          data: { link: '/#home' },
          tag: 'story-created',
          renotify: false,
        });
      }
    } catch (err) {
      console.error('❌ Gagal menampilkan notifikasi:', err);
    }
  }
}
