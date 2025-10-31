// js/services/auth.service.js

const AuthService = {
  /**
   * Guarda el token JWT en el localStorage.
   * @param {string} token
   */
  saveToken: (token) => {
    localStorage.setItem('authToken', token);
  },

  /**
   * Obtiene el token del localStorage.
   * @returns {string|null}
   */
  getToken: () => {
    return localStorage.getItem('authToken');
  },

  /**
   * Elimina el token del localStorage (para cerrar sesión).
   */
  logout: () => {
    localStorage.removeItem('authToken');
  },

  /**
   * Decodifica el token JWT para obtener los datos del usuario.
   * @param {string} token
   * @returns {object|null} El payload del token (ej. { sub, email, role })
   */
  parseToken: (token) => {
    if (!token) {
      return null;
    }
    try {
      // El payload del JWT está en la parte del medio (base64)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error al decodificar el token:', e);
      return null;
    }
  },

  /**
   * Obtiene el rol del usuario desde el token guardado.
   * @returns {string|null} 'administrador' o 'usuario'
   */
  getUserRole: () => {
    const token = AuthService.getToken();
    const payload = AuthService.parseToken(token);
    return payload ? payload.role : null;
  }
};

// Usamos 'export default' para exportar el objeto completo
export default AuthService;