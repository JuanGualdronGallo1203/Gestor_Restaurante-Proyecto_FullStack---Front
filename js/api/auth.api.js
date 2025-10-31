// js/api/auth.api.js

// La URL base de tu backend (¡asegúrate de que esté corriendo!)
const API_URL = 'http://localhost:3001/api/v1';

/**
 * Llama al endpoint de registro del backend.
 * @param {object} userData - { username, email, password }
 */
export const registerUser = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    // Si el backend manda un error (ej. "email ya existe"), captúralo
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error en el registro');
  }

  // Si todo ok, devuelve los datos (que incluyen el token)
  return response.json();
};

/**
 * Llama al endpoint de login del backend.
 * (La crearemos ahora para usarla en el siguiente paso)
 * @param {object} credentials - { email, password }
 */
export const loginUser = async (credentials) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Credenciales inválidas');
  }

  return response.json();
};