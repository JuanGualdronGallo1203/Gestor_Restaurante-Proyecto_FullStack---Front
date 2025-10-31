// js/app.js

// Importamos nuestras funciones y servicios
import { registerUser, loginUser } from './api/auth.api.js';
import AuthService from './services/auth.service.js';

// --- SELECCIÓN DE ELEMENTOS DEL DOM ---
// Secciones
const registerSection = document.getElementById('register');
const loginSection = document.getElementById('login');
const restaurantsSection = document.getElementById('restaurants');
const adminSection = document.getElementById('admin');
const detailSection = document.getElementById('restaurant-detail');

// Formularios
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');

// Enlaces de navegación
const showLoginLink = document.getElementById('showLoginLink');
const showRegisterLink = document.getElementById('showRegisterLink2');

// Botones de Logout (¡Importante!)
// Usamos querySelectorAll para seleccionar ambos botones
const logoutButtons = document.querySelectorAll('.logout-btn');


// --- MANEJO DE NAVEGACIÓN (Mostrar/Ocultar Secciones) ---

function showSection(sectionId) {
  [registerSection, loginSection, restaurantsSection, adminSection, detailSection].forEach(
    (section) => {
      section.classList.remove('active-section');
      section.classList.add('hidden-section');
    }
  );

  const activeSection = document.getElementById(sectionId);
  if (activeSection) {
    activeSection.classList.remove('hidden-section');
    activeSection.classList.add('active-section');
  }
}

// --- LÓGICA DE AUTENTICACIÓN ---

/**
 * Manejador para el formulario de Registro.
 */
async function handleRegisterSubmit(event) {
  event.preventDefault(); 
  const formData = new FormData(registerForm);
  const data = Object.fromEntries(formData.entries());

  if (data.password !== data.confirmPassword) {
    alert('Las contraseñas no coinciden.');
    return;
  }
  
  const userData = {
      username: data.fullName,
      email: data.email,
      password: data.password
  };

  try {
    const result = await registerUser(userData);
    AuthService.saveToken(result.token);
    alert('¡Registro exitoso! Por favor, inicia sesión.');
    showSection('login');
    registerForm.reset(); 

  } catch (error) {
    console.error('Error en el registro:', error);
    alert(error.message);
  }
}

/**
 * Manejador para el formulario de Login. (¡NUEVO!)
 */
async function handleLoginSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(loginForm);
    const credentials = Object.fromEntries(formData.entries()); // { email, password }

    try {
      // 1. Llamar a la API de login
      const result = await loginUser(credentials); // { token }

      // 2. Guardar el token
      AuthService.saveToken(result.token);

      // 3. Decidir a dónde enviar al usuario
      checkUserRoleAndNavigate();

      loginForm.reset();
    } catch (error) {
      console.error('Error en el login:', error);
      alert(error.message);
    }
}

/**
 * Manejador para cerrar sesión. (¡NUEVO!)
 */
function handleLogout() {
  AuthService.logout();
  alert('Has cerrado sesión.');
  showSection('login'); // Llevar al login
}

/**
 * Revisa el rol del token y navega a la sección correcta. (¡NUEVO!)
 */
function checkUserRoleAndNavigate() {
  const role = AuthService.getUserRole();
  
  if (role === 'administrador') {
    showSection('admin');
    // (Aquí cargaremos los restaurantes del admin)
  } else if (role === 'usuario') {
    showSection('restaurants');
    // (Aquí cargaremos los restaurantes para el usuario)
  } else {
    // No hay token o el rol es inválido
    showSection('login');
  }
}

// --- INICIALIZACIÓN DE LA APP ---
function initApp() {
  // Configurar listeners de navegación
  showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('login');
  });

  showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('register');
  });

  // Configurar listeners de formularios
  registerForm.addEventListener('submit', handleRegisterSubmit);
  loginForm.addEventListener('submit', handleLoginSubmit);

  // Configurar TODOS los botones de logout
  logoutButtons.forEach(button => {
    button.addEventListener('click', handleLogout);
  });

  // Decidir qué sección mostrar al cargar
  // ¡Revisa si el usuario ya está logueado!
  checkUserRoleAndNavigate();
}

// Esperar a que el DOM esté cargado para iniciar la app
document.addEventListener('DOMContentLoaded', initApp);