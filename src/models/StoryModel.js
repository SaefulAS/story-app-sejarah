import { cacheStories, getCachedStories } from '../utils/db';
const API_URL = process.env.API_URL;

class StoryModel {
  static async getStories(size = 1000) {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_URL}/stories?size=${size}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      const safeList = data.listStory.map(
        ({ id, name, description, photoUrl, lat, lon, createdAt }) => ({
          id,
          name,
          description,
          photoUrl,
          lat,
          lon,
          createdAt,
        })
      );

      await cacheStories(safeList);
      return safeList;
    } catch (err) {
      console.warn('⚠️ Gagal fetch story list dari API:', err.message);
      const cached = await getCachedStories();
      if (cached) {
        return cached;
      } else {
        console.error('🛑 Tidak ada cache tersedia');
        return [];
      }
    }
  }

  static async getStoryById(id) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/stories/${id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    return data.story;
  }

  static async getStoriesWithLocation() {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_URL}/stories?location=1&size=1000`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      const safeList = data.listStory.map(
        ({ id, name, description, photoUrl, lat, lon, createdAt }) => ({
          id,
          name,
          description,
          photoUrl,
          lat,
          lon,
          createdAt,
        })
      );

      await cacheStories(safeList, 'cachedStoriesWithLocation');
      return safeList;
    } catch (err) {
      console.warn('⚠️ Gagal fetch stories with location:', err.message);
      const cached = await getCachedStories('cachedStoriesWithLocation');
      if (cached) {
        return cached;
      } else {
        console.error('🛑 Tidak ada cache stories lokasi tersedia');
        return [];
      }
    }
  }

  static async addStory(description, photo, lat = null, lon = null) {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photo);
    if (lat && lon) {
      formData.append('lat', lat);
      formData.append('lon', lon);
    }

    const response = await fetch(`${API_URL}/stories`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await response.json();
    return data;
  }
}

export default StoryModel;
