import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import StoryModel from '../models/StoryModel';

const customIcon = L.divIcon({
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

export async function renderLeafletMap(containerId = 'map') {
  const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
  });

  const esri = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    {
      attribution: 'Tiles © Esri',
    }
  );

  const mapTiler = L.tileLayer(
    `https://api.maptiler.com/maps/toner/{z}/{x}/{y}.png?key=${process.env.MAPTILER_API_KEY}`, 
    {
      attribution: '© MapTiler',
      tileSize: 512,
      zoomOffset: -1,
    }
  );  

  const baseLayers = {
    OpenStreetMap: osm,
    'Esri Street': esri,
    'MapTiler Toner': mapTiler,
  };

  const savedLayer = localStorage.getItem('selectedMapLayer');

  let initialLayer;
  if (savedLayer === 'Esri Street') {
    initialLayer = esri;
  } else if (savedLayer === 'MapTiler Toner') {
    initialLayer = mapTiler;
  } else {
    initialLayer = osm;
  }

  const map = L.map(containerId, {
    center: [-2.5489, 118.0149],
    zoom: 5,
    minZoom: 3,
    layers: [initialLayer],
  });

  map.on('baselayerchange', function (e) {
    localStorage.setItem('selectedMapLayer', e.name);
  });

  L.control.layers(baseLayers).addTo(map);
  L.control.scale({ position: 'bottomleft', imperial: false }).addTo(map);

  const stories = await StoryModel.getStoriesWithLocation();
  const markerMap = new Map();

  stories.forEach((story) => {
    if (story.lat && story.lon) {
      const marker = L.marker([story.lat, story.lon], { icon: customIcon }).addTo(map);
      marker.bindPopup(`
        <div style="text-align:center">
          <strong>${story.name}</strong><br />
          <em>${story.description}</em><br />
          <img src="${story.photoUrl}" alt="Story image" style="width:100px; border-radius:8px; margin-top:6px;" />
        </div>
      `);
      markerMap.set(`${story.lat},${story.lon}`, marker);
    }
  });

  const markerCountControl = L.control({ position: 'bottomleft' });

  markerCountControl.onAdd = function () {
    const div = L.DomUtil.create('div', 'marker-count-control');
    div.innerHTML = `🔖 Jumlah Titik Sejarah: <strong>${stories.length}</strong>`;
    div.style.background = '#fff';
    div.style.padding = '6px 10px';
    div.style.marginTop = '5px';
    div.style.borderRadius = '6px';
    div.style.boxShadow = '0 1px 4px rgba(0,0,0,0.2)';
    div.style.fontSize = '14px';
    div.style.color = '#3b3a36';
    return div;
  };

  markerCountControl.addTo(map);

  window.addEventListener('focusMarker', (e) => {
    const { lat, lon } = e.detail;
    if (!lat || !lon) return;

    const key = `${lat},${lon}`;
    const marker = markerMap.get(key);

    if (marker) {
      marker.openPopup();
      setTimeout(() => {
        map.setView([lat, lon], 12, { animate: true });
      }, 300);
    }
  });

  return map;
}
