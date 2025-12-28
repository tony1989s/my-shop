

// STATE MANAGEMENT
const appState = {
    products: [],
    categories: [],
    cart: [],
    currentCategory: null,
    isLoading: false,
    error: null
};

// DOM ELEMENTS CACHE
const DOM = {
    nav: document.querySelector('nav'),
    main: document.querySelector('main'),
    cartButton: null,
    searchInput: null,
    cartCount: null,
    cartModal: null,
    loadingIndicator: null
};

// INITIALIZATION
function initializeApp() {
    console.log('🚀 My-Shop Application Initializing...');
    
    // Create additional UI elements if they don't exist
    createUIElements();
    
    // Load categories and initial products
    loadCategories();
    loadAllProducts();
    
    // Setup event listeners
    setupEventListeners();
    
    // Restore cart from localStorage
    restoreCart();
    
    console.log('✅ Application initialized successfully');
}

// UI ELEMENTS CREATION
function createUIElements() {
    // Create search input
    const header = document.querySelector('header') || document.body;
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    
    DOM.searchInput = document.createElement('input');
    DOM.searchInput.type = 'text';
    DOM.searchInput.placeholder = 'Cerca prodotti...';
    DOM.searchInput.className = 'search-input';
    
    searchContainer.appendChild(DOM.searchInput);
    header.insertBefore(searchContainer, header.firstChild);
    
    // Create cart button
    DOM.cartButton = document.createElement('button');
    DOM.cartButton.className = 'cart-button';
    DOM.cartButton.innerHTML = '🛒 <span class="cart-count">0</span>';
    DOM.cartCount = DOM.cartButton.querySelector('.cart-count');
    
    header.appendChild(DOM.cartButton);
    
    // Create loading indicator
    DOM.loadingIndicator = document.createElement('div');
    DOM.loadingIndicator.className = 'loading-indicator';
    DOM.loadingIndicator.textContent = 'Caricamento...';
    DOM.loadingIndicator.style.display = 'none';
    document.body.appendChild(DOM.loadingIndicator);
}

// EVENT LISTENERS SETUP
function setupEventListeners() {
    // Search functionality
    DOM.searchInput.addEventListener('input', debounce(handleSearch, 300));
    
    // Cart button click
    DOM.cartButton.addEventListener('click', showCartModal);
    
    // Close modal on outside click
    document.addEventListener('click', (e) => {
        if (DOM.cartModal && !DOM.cartModal.contains(e.target) && e.target !== DOM.cartButton) {
            DOM.cartModal.style.display = 'none';
        }
    });
}

// API FUNCTIONS
async function loadCategories() {
    try {
        showLoading(true);
        const response = await fetch('https://fakestoreapi.com/products/categories');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        appState.categories = await response.json();
        renderCategories(appState.categories);
        appState.error = null;
    } catch (error) {
        appState.error = `Errore nel caricamento categorie: ${error.message}`;
        showError(appState.error);
        console.error('Errore nel caricamento delle categorie:', error);
    } finally {
        showLoading(false);
    }
}

async function loadAllProducts() {
    try {
        showLoading(true);
        const response = await fetch('https://fakestoreapi.com/products');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        appState.products = await response.json();
        renderProducts(appState.products);
        appState.currentCategory = 'all';
        appState.error = null;
    } catch (error) {
        appState.error = `Errore nel caricamento prodotti: ${error.message}`;
        showError(appState.error);
        console.error('Errore nel caricamento prodotti:', error);
    } finally {
        showLoading(false);
    }
}

async function loadProductsByCategory(category) {
    try {
        showLoading(true);
        appState.currentCategory = category;
        
        const response = await fetch(`https://fakestoreapi.com/products/category/${category}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const products = await response.json();
        renderProducts(products);
        appState.error = null;
    } catch (error) {
        appState.error = `Errore nel caricamento prodotti: ${error.message}`;
        showError(appState.error);
        console.error('Errore nel caricamento prodotti:', error);
    } finally {
        showLoading(false);
    }
}

// RENDERING FUNCTIONS
function renderCategories(categories) {
    DOM.nav.innerHTML = '';
    
    // Add "All Products" button
    const allButton = document.createElement('button');
    allButton.textContent = 'Tutti i prodotti';
    allButton.className = 'category-btn active';
    allButton.addEventListener('click', () => {
        document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
        allButton.classList.add('active');
        loadAllProducts();
    });
    DOM.nav.appendChild(allButton);
    
    // Add category buttons
    categories.forEach(category => {
        const button = document.createElement('button');
        button.textContent = formatCategoryName(category);
        button.className = 'category-btn';
        button.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            loadProductsByCategory(category);
        });
        DOM.nav.appendChild(button);
    });
}

function renderProducts(products) {
    DOM.main.innerHTML = '';
    
    if (products.length === 0) {
        DOM.main.innerHTML = '<p class="no-products">Nessun prodotto trovato</p>';
        return;
    }
    
    products.forEach(product => {
        const article = createProductCard(product);
        DOM.main.appendChild(article);
    });
}

function createProductCard(product) {
    const article = document.createElement('article');
    article.className = 'product-card';
    article.dataset.id = product.id;
    article.dataset.category = product.category;
    
    const title = document.createElement('h2');
    title.textContent = product.title;
    title.className = 'product-title';
    
    const img = document.createElement('img');
    img.src = product.image;
    img.alt = product.title;
    img.className = 'product-image';
    img.loading = 'lazy';
    
    const description = document.createElement('p');
    description.textContent = truncateText(product.description, 100);
    description.className = 'product-description';
    
    const price = document.createElement('strong');
    price.textContent = `Prezzo: €${product.price}`;
    price.className = 'product-price';
    
    const rating = document.createElement('div');
    rating.className = 'product-rating';
    rating.innerHTML = `⭐ ${product.rating.rate} (${product.rating.count} recensioni)`;
    
    const addButton = document.createElement('button');
    addButton.textContent = 'Aggiungi al carrello';
    addButton.className = 'add-to-cart-btn';
    addButton.addEventListener('click', () => addToCart(product));
    
    article.append(title, img, description, rating, price, addButton);
    
    return article;
}

// CART FUNCTIONALITY
function addToCart(product) {
    const existingItem = appState.cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        appState.cart.push({
            ...product,
            quantity: 1
        });
    }
    
    updateCart();
    showNotification(`${product.title} aggiunto al carrello!`);
}

function removeFromCart(productId) {
    appState.cart = appState.cart.filter(item => item.id !== productId);
    updateCart();
}

function updateCart() {
    // Update cart count
    const totalItems = appState.cart.reduce((sum, item) => sum + item.quantity, 0);
    DOM.cartCount.textContent = totalItems;
    
    // Save to localStorage
    localStorage.setItem('myShopCart', JSON.stringify(appState.cart));
    
    // Update cart modal if open
    if (DOM.cartModal) {
        renderCartModal();
    }
}

function restoreCart() {
    const savedCart = localStorage.getItem('myShopCart');
    if (savedCart) {
        appState.cart = JSON.parse(savedCart);
        updateCart();
    }
}

function showCartModal() {
    if (!DOM.cartModal) {
        createCartModal();
    }
    
    renderCartModal();
    DOM.cartModal.style.display = 'block';
}

function createCartModal() {
    DOM.cartModal = document.createElement('div');
    DOM.cartModal.className = 'cart-modal';
    document.body.appendChild(DOM.cartModal);
}

function renderCartModal() {
    DOM.cartModal.innerHTML = '';
    
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    modalHeader.innerHTML = '<h3>Il Tuo Carrello</h3><button class="close-modal">&times;</button>';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    if (appState.cart.length === 0) {
        modalContent.innerHTML = '<p class="empty-cart">Il carrello è vuoto</p>';
    } else {
        appState.cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            
            cartItem.innerHTML = `
                <div class="cart-item-info">
                    <h4>${truncateText(item.title, 30)}</h4>
                    <p>€${item.price} x ${item.quantity}</p>
                    <p class="item-total">Totale: €${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <button class="remove-item" data-id="${item.id}">Rimuovi</button>
            `;
            
            modalContent.appendChild(cartItem);
        });
        
        // Calculate total
        const total = appState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalElement = document.createElement('div');
        totalElement.className = 'cart-total';
        totalElement.innerHTML = `<strong>Totale: €${total.toFixed(2)}</strong>`;
        modalContent.appendChild(totalElement);
        
        // Add checkout button
        const checkoutButton = document.createElement('button');
        checkoutButton.className = 'checkout-btn';
        checkoutButton.textContent = 'Procedi al checkout';
        checkoutButton.addEventListener('click', () => alert('Checkout non implementato in questa demo'));
        modalContent.appendChild(checkoutButton);
    }
    
    // Close button functionality
    modalHeader.querySelector('.close-modal').addEventListener('click', () => {
        DOM.cartModal.style.display = 'none';
    });
    
    // Remove item functionality
    modalContent.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-item')) {
            const productId = parseInt(e.target.dataset.id);
            removeFromCart(productId);
        }
    });
    
    DOM.cartModal.append(modalHeader, modalContent);
}

// SEARCH FUNCTIONALITY
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        if (appState.currentCategory === 'all') {
            renderProducts(appState.products);
        } else if (appState.currentCategory) {
            const filtered = appState.products.filter(p => 
                p.category === appState.currentCategory
            );
            renderProducts(filtered);
        }
        return;
    }
    
    const filteredProducts = appState.products.filter(product => 
        product.title.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
    );
    
    renderProducts(filteredProducts);
}

// UTILITY FUNCTIONS
function formatCategoryName(category) {
    return category
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

function showLoading(show) {
    DOM.loadingIndicator.style.display = show ? 'block' : 'none';
    appState.isLoading = show;
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    DOM.main.innerHTML = '';
    DOM.main.appendChild(errorDiv);
    
    setTimeout(() => errorDiv.remove(), 5000);
}

function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// INITIALIZE APP ON DOM CONTENT LOADED
document.addEventListener('DOMContentLoaded', initializeApp);

// EXPORT FOR TESTING (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        appState,
        DOM,
        initializeApp,
        loadCategories,
        loadProductsByCategory,
        addToCart,
        removeFromCart,
        formatCategoryName,
        truncateText
    };
}