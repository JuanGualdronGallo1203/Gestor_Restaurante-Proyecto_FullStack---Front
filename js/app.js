// Navegación entre secciones y gestión de autenticación
document.addEventListener('DOMContentLoaded', function() {
    console.log('JavaScript cargado correctamente');
    
    // Obtener todas las secciones
    const sections = {
        register: document.getElementById('register'),
        login: document.getElementById('login'),
        restaurants: document.getElementById('restaurants'),
        admin: document.getElementById('admin'),
        restaurantDetail: document.getElementById('restaurant-detail')
    };

    // Datos del usuario actual y restaurante seleccionado
    let currentUser = null;
    let currentRestaurant = null;

    // Función para mostrar una sección específica
    function showSection(sectionName) {
        console.log('Intentando mostrar sección:', sectionName);
        
        // Ocultar todas las secciones
        Object.values(sections).forEach(section => {
            if (section) {
                section.classList.remove('active-section');
                section.classList.add('hidden-section');
            }
        });
        
        // Mostrar la sección solicitada
        if (sections[sectionName]) {
            sections[sectionName].classList.remove('hidden-section');
            sections[sectionName].classList.add('active-section');
            
            // Ejecutar funciones específicas según la sección
            switch(sectionName) {
                case 'restaurants':
                    loadRestaurants();
                    break;
                case 'admin':
                    loadAdminPanel();
                    break;
                case 'restaurantDetail':
                    loadRestaurantDetail();
                    break;
            }
            
            console.log('Sección mostrada:', sectionName);
        } else {
            console.error('Sección no encontrada:', sectionName);
        }
    }

    // Función para mostrar mensaje
    function showMessage(message, type = 'success') {
        const messageDiv = document.createElement('div');
        const backgroundColor = type === 'success' ? '#4CAF50' : '#e74c3c';
        
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${backgroundColor};
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            font-weight: bold;
            text-align: center;
            min-width: 300px;
        `;
        
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }

    // Función para guardar datos de usuario
    function saveUserData(userData) {
        localStorage.setItem('currentUser', JSON.stringify(userData));
        currentUser = userData;
    }

    // Función para obtener datos de usuario
    function getUserData() {
        const userData = localStorage.getItem('currentUser');
        return userData ? JSON.parse(userData) : null;
    }

    // Función para cerrar sesión
    function logout() {
        localStorage.removeItem('currentUser');
        currentUser = null;
        showSection('login');
        showMessage('✅ Sesión cerrada correctamente');
    }

    // Función para verificar autenticación
    function checkAuthentication() {
        const userData = getUserData();
        if (userData) {
            currentUser = userData;
            if (userData.role === 'admin') {
                showSection('admin');
            } else {
                showSection('restaurants');
            }
        } else {
            showSection('register');
        }
    }

    // Función para cargar restaurantes en lista principal
    function loadRestaurants() {
        const restaurantsList = document.getElementById('restaurantsList');
        if (!restaurantsList) return;

        const restaurants = JSON.parse(localStorage.getItem('restaurants') || '[]');
        
        if (restaurants.length === 0) {
            restaurantsList.innerHTML = '<p class="no-restaurants">No hay restaurantes disponibles en este momento.</p>';
            return;
        }

        restaurantsList.innerHTML = restaurants.map(restaurant => `
            <div class="restaurant-card" onclick="openRestaurantDetail(${restaurant.id})">
                <div class="restaurant-image">
                    ${restaurant.image || '🍽️'}
                </div>
                <div class="restaurant-info">
                    <h3>${restaurant.name}</h3>
                    <p class="restaurant-description">${restaurant.description}</p>
                    <div class="restaurant-details">
                        <span class="category">${restaurant.category}</span>
                        <span class="rating">⭐ ${getRestaurantRating(restaurant.id) || 'Nuevo'}</span>
                    </div>
                    <p class="restaurant-location">📍 ${restaurant.location}</p>
                </div>
            </div>
        `).join('');
    }

    // Función para obtener rating promedio de un restaurante
    function getRestaurantRating(restaurantId) {
        const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
        const restaurantReviews = reviews.filter(review => review.restaurantId === restaurantId);
        
        if (restaurantReviews.length === 0) return null;
        
        const average = restaurantReviews.reduce((sum, review) => sum + review.rating, 0) / restaurantReviews.length;
        return average.toFixed(1);
    }

    // Función para cargar panel de administración
    function loadAdminPanel() {
        const restaurantsList = document.getElementById('adminRestaurantsList');
        if (!restaurantsList) return;

        const restaurants = JSON.parse(localStorage.getItem('restaurants') || '[]');
        
        restaurantsList.innerHTML = restaurants.map(restaurant => `
            <div class="restaurant-card admin-card">
                <div class="restaurant-info">
                    <h3>${restaurant.name}</h3>
                    <p>${restaurant.description}</p>
                    <div class="restaurant-details">
                        <span class="category">${restaurant.category}</span>
                        <span class="location">📍 ${restaurant.location}</span>
                    </div>
                    <div class="admin-actions">
                        <button class="btn-edit" onclick="openRestaurantDetail(${restaurant.id})">Ver Detalle</button>
                        <button class="btn-delete" onclick="deleteRestaurant(${restaurant.id})">Eliminar</button>
                    </div>
                </div>
            </div>
        `).join('') || '<p>No hay restaurantes creados aún.</p>';
    }

    // Función para cargar detalle del restaurante
    function loadRestaurantDetail() {
        if (!currentRestaurant) return;

        // Actualizar información del restaurante
        document.getElementById('restaurantDetailName').textContent = currentRestaurant.name;
        document.getElementById('restaurantDetailDescription').textContent = currentRestaurant.description;
        document.getElementById('restaurantDetailCategory').textContent = currentRestaurant.category;
        document.getElementById('restaurantDetailLocation').textContent = currentRestaurant.location;

        // Configurar permisos según el rol
        const isAdmin = currentUser?.role === 'admin';
        document.getElementById('addDishBtn').style.display = isAdmin ? 'block' : 'none';
        document.getElementById('addReviewBtn').style.display = !isAdmin ? 'block' : 'none';

        // Cargar platillos y reseñas
        loadDishes();
        loadReviews();
    }

    // Función para cargar platillos del restaurante
    function loadDishes() {
        const dishesList = document.getElementById('dishesList');
        if (!dishesList || !currentRestaurant) return;

        const dishes = JSON.parse(localStorage.getItem('dishes') || '[]');
        const restaurantDishes = dishes.filter(dish => dish.restaurantId === currentRestaurant.id);
        
        const isAdmin = currentUser?.role === 'admin';

        if (restaurantDishes.length === 0) {
            dishesList.innerHTML = '<p class="no-items">No hay platillos disponibles.</p>';
            return;
        }

        dishesList.innerHTML = restaurantDishes.map(dish => `
            <div class="dish-card">
                <div class="dish-info">
                    <h4>${dish.name}</h4>
                    <p class="dish-description">${dish.description}</p>
                    <div class="dish-details">
                        <span class="dish-category">${dish.category}</span>
                        <span class="dish-price">$${dish.price}</span>
                    </div>
                </div>
                ${isAdmin ? `
                <div class="dish-actions">
                    <button class="btn-edit-small" onclick="editDish(${dish.id})">Editar</button>
                    <button class="btn-delete-small" onclick="deleteDish(${dish.id})">Eliminar</button>
                </div>
                ` : ''}
            </div>
        `).join('');
    }

    // Función para cargar reseñas del restaurante
    function loadReviews() {
        const reviewsList = document.getElementById('reviewsList');
        if (!reviewsList || !currentRestaurant) return;

        const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
        const restaurantReviews = reviews.filter(review => review.restaurantId === currentRestaurant.id);
        
        const isAdmin = currentUser?.role === 'admin';

        if (restaurantReviews.length === 0) {
            reviewsList.innerHTML = '<p class="no-items">No hay reseñas aún.</p>';
            return;
        }

        reviewsList.innerHTML = restaurantReviews.map(review => `
            <div class="review-card">
                <div class="review-header">
                    <span class="review-author">${review.authorName}</span>
                    <span class="review-rating">${'⭐'.repeat(review.rating)}</span>
                </div>
                <p class="review-comment">${review.comment}</p>
                <div class="review-footer">
                    <span class="review-date">${new Date(review.createdAt).toLocaleDateString()}</span>
                    ${!isAdmin && review.authorId === currentUser?.id ? `
                    <div class="review-actions">
                        <button class="btn-edit-small" onclick="editReview(${review.id})">Editar</button>
                        <button class="btn-delete-small" onclick="deleteReview(${review.id})">Eliminar</button>
                    </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    // Función para crear restaurante (admin)
    function createRestaurant(restaurantData) {
        const restaurants = JSON.parse(localStorage.getItem('restaurants') || '[]');
        const newRestaurant = {
            id: Date.now(),
            ...restaurantData,
            createdAt: new Date().toISOString(),
            createdBy: currentUser.id
        };
        
        restaurants.push(newRestaurant);
        localStorage.setItem('restaurants', JSON.stringify(restaurants));
        return newRestaurant;
    }

    // Función para crear platillo (admin)
    function createDish(dishData) {
        const dishes = JSON.parse(localStorage.getItem('dishes') || '[]');
        const newDish = {
            id: Date.now(),
            ...dishData,
            restaurantId: currentRestaurant.id,
            createdAt: new Date().toISOString()
        };
        
        dishes.push(newDish);
        localStorage.setItem('dishes', JSON.stringify(dishes));
        return newDish;
    }

    // Función para crear reseña (usuario)
    function createReview(reviewData) {
        const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
        const newReview = {
            id: Date.now(),
            ...reviewData,
            restaurantId: currentRestaurant.id,
            authorId: currentUser.id,
            authorName: currentUser.name,
            createdAt: new Date().toISOString()
        };
        
        reviews.push(newReview);
        localStorage.setItem('reviews', JSON.stringify(reviews));
        return newReview;
    }

    // Configurar eventos de navegación
    const showLoginLinks = document.querySelectorAll('#showLoginLink');
    showLoginLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showSection('login');
        });
    });

    const showRegisterLink2 = document.getElementById('showRegisterLink2');
    if (showRegisterLink2) {
        showRegisterLink2.addEventListener('click', function(e) {
            e.preventDefault();
            showSection('register');
        });
    }

    // Botón volver en detalle de restaurante
    const backBtn = document.querySelector('.back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (currentUser?.role === 'admin') {
                showSection('admin');
            } else {
                showSection('restaurants');
            }
        });
    }

    // Manejo del formulario de registro
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(registerForm);
            const userData = {
                name: formData.get('fullName'),
                email: formData.get('email'),
                password: formData.get('password'),
                confirmPassword: formData.get('confirmPassword')
            };
            
            // Validaciones...
            if (!userData.name || !userData.email || !userData.password || !userData.confirmPassword) {
                showMessage('Por favor, completa todos los campos', 'error');
                return;
            }
            
            if (userData.name.length < 3) {
                showMessage('El nombre debe tener al menos 3 caracteres', 'error');
                return;
            }
            
            if (userData.password.length < 8) {
                showMessage('La contraseña debe tener al menos 8 caracteres', 'error');
                return;
            }
            
            if (userData.password !== userData.confirmPassword) {
                showMessage('Las contraseñas no coinciden', 'error');
                return;
            }
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(userData.email)) {
                showMessage('Por favor ingresa un email válido', 'error');
                return;
            }
            
            // SIMULACIÓN: Registrar usuario
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const existingUser = users.find(u => u.email === userData.email);
            if (existingUser) {
                showMessage('Este email ya está registrado', 'error');
                return;
            }
            
            const isFirstUser = users.length === 0;
            const newUser = {
                id: Date.now(),
                name: userData.name,
                email: userData.email,
                role: isFirstUser ? 'admin' : 'user',
                createdAt: new Date().toISOString()
            };

            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));

            showMessage(`✅ Registro exitoso! Rol: ${isFirstUser ? 'Administrador' : 'Usuario'}`);
            
            setTimeout(() => {
                showSection('login');
                registerForm.reset();
            }, 2000);
        });
    }

    // Manejo del formulario de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(loginForm);
            const credentials = {
                email: formData.get('email'),
                password: formData.get('password')
            };
            
            if (!credentials.email || !credentials.password) {
                showMessage('Por favor, completa todos los campos', 'error');
                return;
            }
            
            // SIMULACIÓN: Login
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === credentials.email);
            
            if (!user) {
                showMessage('Usuario no encontrado. Regístrate primero.', 'error');
                return;
            }
            
            saveUserData(user);
            showMessage(`✅ Bienvenido ${user.name} (${user.role})`);
            
            setTimeout(() => {
                if (user.role === 'admin') {
                    showSection('admin');
                } else {
                    showSection('restaurants');
                }
                loginForm.reset();
            }, 2000);
        });
    }

    // Manejo del formulario de crear restaurante (admin)
    const createRestaurantForm = document.getElementById('createRestaurantForm');
    if (createRestaurantForm) {
        createRestaurantForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (currentUser?.role !== 'admin') {
                showMessage('No tienes permisos para crear restaurantes', 'error');
                return;
            }
            
            const formData = new FormData(createRestaurantForm);
            const restaurantData = {
                name: formData.get('restaurantName'),
                description: formData.get('restaurantDescription'),
                category: formData.get('restaurantCategory'),
                location: formData.get('restaurantLocation')
            };
            
            if (!restaurantData.name || !restaurantData.description || !restaurantData.category || !restaurantData.location) {
                showMessage('Por favor, completa todos los campos', 'error');
                return;
            }
            
            createRestaurant(restaurantData);
            showMessage('✅ Restaurante creado exitosamente');
            createRestaurantForm.reset();
            loadAdminPanel();
        });
    }

    // Manejo del formulario de crear platillo (admin)
    const createDishForm = document.getElementById('createDishForm');
    if (createDishForm) {
        createDishForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (currentUser?.role !== 'admin') {
                showMessage('No tienes permisos para crear platillos', 'error');
                return;
            }
            
            const formData = new FormData(createDishForm);
            const dishData = {
                name: formData.get('dishName'),
                description: formData.get('dishDescription'),
                price: parseFloat(formData.get('dishPrice')),
                category: formData.get('dishCategory')
            };
            
            if (!dishData.name || !dishData.description || !dishData.price || !dishData.category) {
                showMessage('Por favor, completa todos los campos', 'error');
                return;
            }
            
            createDish(dishData);
            showMessage('✅ Platillo creado exitosamente');
            createDishForm.reset();
            document.getElementById('addDishForm').style.display = 'none';
            loadDishes();
        });
    }

    // Manejo del formulario de crear reseña (usuario)
    const createReviewForm = document.getElementById('createReviewForm');
    if (createReviewForm) {
        createReviewForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (currentUser?.role === 'admin') {
                showMessage('Los administradores no pueden crear reseñas', 'error');
                return;
            }
            
            const formData = new FormData(createReviewForm);
            const reviewData = {
                comment: formData.get('reviewComment'),
                rating: parseInt(formData.get('reviewRating'))
            };
            
            if (!reviewData.comment || !reviewData.rating) {
                showMessage('Por favor, completa todos los campos', 'error');
                return;
            }
            
            createReview(reviewData);
            showMessage('✅ Reseña publicada exitosamente');
            createReviewForm.reset();
            document.getElementById('addReviewForm').style.display = 'none';
            loadReviews();
        });
    }

    // Configurar botones de mostrar formularios
    const addDishBtn = document.getElementById('addDishBtn');
    const addReviewBtn = document.getElementById('addReviewBtn');
    const cancelDishBtn = document.getElementById('cancelDishBtn');
    const cancelReviewBtn = document.getElementById('cancelReviewBtn');

    if (addDishBtn) {
        addDishBtn.addEventListener('click', function() {
            document.getElementById('addDishForm').style.display = 'block';
        });
    }

    if (addReviewBtn) {
        addReviewBtn.addEventListener('click', function() {
            document.getElementById('addReviewForm').style.display = 'block';
        });
    }

    if (cancelDishBtn) {
        cancelDishBtn.addEventListener('click', function() {
            document.getElementById('addDishForm').style.display = 'none';
            document.getElementById('createDishForm').reset();
        });
    }

    if (cancelReviewBtn) {
        cancelReviewBtn.addEventListener('click', function() {
            document.getElementById('addReviewForm').style.display = 'none';
            document.getElementById('createReviewForm').reset();
        });
    }

    // Configurar estrellas de rating
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = this.getAttribute('data-rating');
            document.getElementById('reviewRating').value = rating;
            
            // Actualizar visualización de estrellas
            stars.forEach(s => {
                s.style.opacity = s.getAttribute('data-rating') <= rating ? '1' : '0.3';
            });
        });
    });

    // Configurar botones de logout
    const logoutButtons = document.querySelectorAll('.logout-btn');
    logoutButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    });

    // Verificar autenticación al cargar la página
    checkAuthentication();

    console.log('=== SISTEMA CARGADO CORRECTAMENTE ===');
});

// Funciones globales
function openRestaurantDetail(restaurantId) {
    const restaurants = JSON.parse(localStorage.getItem('restaurants') || '[]');
    const restaurant = restaurants.find(r => r.id === restaurantId);
    
    if (restaurant) {
        currentRestaurant = restaurant;
        showSection('restaurantDetail');
    }
}

function deleteRestaurant(restaurantId) {
    if (confirm('¿Estás seguro de que quieres eliminar este restaurante?')) {
        const restaurants = JSON.parse(localStorage.getItem('restaurants') || '[]');
        const updatedRestaurants = restaurants.filter(r => r.id !== restaurantId);
        localStorage.setItem('restaurants', JSON.stringify(updatedRestaurants));
        
        // También eliminar platillos y reseñas asociadas
        const dishes = JSON.parse(localStorage.getItem('dishes') || '[]');
        const updatedDishes = dishes.filter(d => d.restaurantId !== restaurantId);
        localStorage.setItem('dishes', JSON.stringify(updatedDishes));
        
        const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
        const updatedReviews = reviews.filter(r => r.restaurantId !== restaurantId);
        localStorage.setItem('reviews', JSON.stringify(updatedReviews));
        
        location.reload();
    }
}

function editDish(dishId) {
    alert(`Editar platillo ${dishId} - Funcionalidad en desarrollo`);
}

function deleteDish(dishId) {
    if (confirm('¿Estás seguro de que quieres eliminar este platillo?')) {
        const dishes = JSON.parse(localStorage.getItem('dishes') || '[]');
        const updatedDishes = dishes.filter(d => d.id !== dishId);
        localStorage.setItem('dishes', JSON.stringify(updatedDishes));
        location.reload();
    }
}

function editReview(reviewId) {
    alert(`Editar reseña ${reviewId} - Funcionalidad en desarrollo`);
}

function deleteReview(reviewId) {
    if (confirm('¿Estás seguro de que quieres eliminar esta reseña?')) {
        const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
        const updatedReviews = reviews.filter(r => r.id !== reviewId);
        localStorage.setItem('reviews', JSON.stringify(updatedReviews));
        location.reload();
    }
}