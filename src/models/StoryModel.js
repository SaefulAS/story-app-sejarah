const API_URL = process.env.API_URL;

class StoryModel {
  static async getStories(size = 1000) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/stories?size=${size}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    return data.listStory;
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
    const response = await fetch(`${API_URL}/stories?location=1&size=1000`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    return data.listStory;
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
