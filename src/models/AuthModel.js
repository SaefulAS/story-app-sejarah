const API_URL = process.env.API_URL;

export default class AuthModel {
  static async register(name, email, password) {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.message);
    }

    return data;
  }

  static async login(email, password) {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.message);
    }

    localStorage.setItem('token', data.loginResult.token);
    return data.loginResult;
  }
}
