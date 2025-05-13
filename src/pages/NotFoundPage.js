export default function NotFoundPage(app) {
  app.innerHTML = `
    <section style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; text-align: center; font-family: 'Lora', serif;">
      <img src="/icons/icon-512x512.png" alt="404 Icon" style="max-width: 150px; margin-bottom: 30px; animation: float 3s ease-in-out infinite;" />
      <h1 style="font-size: 64px; margin: 0; color: #9e6b34;">404</h1>
      <p style="font-size: 20px; color: #5d5343; margin: 16px 0 24px;">
        Waduh, halaman yang kamu cari tidak ditemukan.
      </p>
      <a href="#/home" style="
        display: inline-block;
        padding: 12px 24px;
        background-color: #9e6b34;
        color: white;
        text-decoration: none;
        border-radius: 8px;
        font-weight: bold;
        transition: background-color 0.3s ease;
      " onmouseover="this.style.backgroundColor='#7a4e22'" onmouseout="this.style.backgroundColor='#9e6b34'">
        Kembali ke Beranda
      </a>
    </section>

    <style>
      @keyframes float {
        0%   { transform: translateY(0); }
        50%  { transform: translateY(-8px); }
        100% { transform: translateY(0); }
      }
    </style>
  `;
}
