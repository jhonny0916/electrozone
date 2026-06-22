let userId = null;
let username = null;

function openAuthModal() {
  document.getElementById('authModal').classList.add('show');
}
function closeAuthModal() {
  document.getElementById('authModal').classList.remove('show');
}
function openCartModal() {
  loadCart();
  document.getElementById('cartModal').classList.add('show');
}
function closeCartModal() {
  document.getElementById('cartModal').classList.remove('show');
}

function openPurchaseHistory() {
  if (!userId) {
    alert('Debes iniciar sesion para ver tus compras.');
    return;
  }
  window.location.href = '/purchases.html';
}

function updateUI() {
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const greeting = document.getElementById('userGreeting');
  const historyBtn = document.getElementById('historyBtn');

  if (userId) {
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    historyBtn.style.display = 'inline-block';
    greeting.innerText = 'Hola ' + username;
  } else {
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    historyBtn.style.display = 'none';
    greeting.innerText = '';
    document.getElementById('cart').innerHTML = '';
  }
}

async function register() {
  username = document.getElementById('registerUsername').value;
  if (!username) return alert('Ingresa un nombre de usuario');
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ username })
  });
  const data = await res.json();
  if (data.userId) {
    userId = data.userId;
    sessionStorage.setItem('userId', String(userId));
    sessionStorage.setItem('username', username);
    alert('Registrado e ingresado como ' + username);
    closeAuthModal();
    updateUI();
  }
  else{
	  alert(data.error || 'Error al registrarse');
  }
}

async function login() {
  username = document.getElementById('loginUsername').value;
  if (!username) return alert('Ingresa tu nombre de usuario');
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ username })
  });
  const data = await res.json();
  if (data.userId) {
    userId = data.userId;
    sessionStorage.setItem('userId', String(userId));
    sessionStorage.setItem('username', username);
    alert('Bienvenido ' + username);
    closeAuthModal();
    updateUI();
  } else {
    alert('Usuario no encontrado');
  }
}

function logout() {
  userId = null;
  username = null;
  sessionStorage.removeItem('userId');
  sessionStorage.removeItem('username');
  updateUI();
}

window.onload = () => {
  const persistedUserId = Number(sessionStorage.getItem('userId') || 0);
  const persistedUsername = sessionStorage.getItem('username') || null;
  if (persistedUserId) {
    userId = persistedUserId;
    username = persistedUsername;
    updateUI();
  }
  searchArticles();
};
