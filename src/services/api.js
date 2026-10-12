const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function getAuthToken() {
  return localStorage.getItem('authToken');
}

function setAuthToken(token) {
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
}

function authHeaders() {
  const token = getAuthToken();
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse(response) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const data = await response.json();
    if (!response.ok) {
      const message = data.message || data.error || data.detail || `Request failed (${response.status})`;
      const error = new Error(message);
      error.status = response.status;
      error.data = data;
      throw error;
    }
    return data;
  }

  if (!response.ok) {
    const error = new Error(`Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }

  return response;
}

function resolveUrl(path) {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  if (path.startsWith('/')) {
    return `${API_BASE_URL}${path}`;
  }
  return `${API_BASE_URL}/${path}`;
}

export const api = {
  baseUrl: API_BASE_URL,
  getAuthToken,
  setAuthToken,
  resolveUrl,



async signup({ name, email, password }) {
  const response = await fetch(resolveUrl('/api/auth/signup'), {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: name,
      email,
      password,
    }),
  });

  return handleResponse(response);
},




async login({ email, password }) {
  const response = await fetch(resolveUrl('/api/auth/login'), {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  return handleResponse(response);
},

async getProfile() {
  const response = await fetch(resolveUrl('/api/auth/profile'), {
    method: 'GET',
    credentials: 'include',
  });

  return handleResponse(response);
},

async logout() {
  try {
    await fetch(resolveUrl('/api/auth/logout'), {
      method: 'POST',
      credentials: 'include',
    });
  } finally {
    setAuthToken(null);
  }
},

async uploadImage(file, onProgress) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('image', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', resolveUrl('/api/images/upload'));
    xhr.withCredentials = true;

    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });
    }

    xhr.addEventListener('load', () => {
      try {
        const data = JSON.parse(xhr.responseText);

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data);
        } else {
          const message =
            data.message || data.error || `Upload failed (${xhr.status})`;
          const error = new Error(message);
          error.status = xhr.status;
          error.data = data;
          reject(error);
        }
      } catch (e) {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({});
        } else {
          reject(new Error(`Upload failed (${xhr.status})`));
        }
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Unable to upload this image. Please try again.'));
    });

    xhr.send(formData);
  });
},



async getMyImages() {
  const response = await fetch(resolveUrl('/api/images/my-images'), {
    method: 'GET',
    credentials: 'include',
  });

  return handleResponse(response);
},

async detectImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(resolveUrl('/api/images/detect'), {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  return handleResponse(response);
},

async getImageById(id) {
  const response = await fetch(resolveUrl(`/api/images/${id}`), {
    method: 'GET',
    credentials: 'include',
  });

  return handleResponse(response);
},
};
