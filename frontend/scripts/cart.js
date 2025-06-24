async function loadCart() {
  const cartContainer = document.getElementById('cart');
  cartContainer.innerHTML = '';

  if (!userId) {
    cartContainer.innerHTML = '<p>Debes iniciar sesión para ver el carrito.</p>';
    return;
  }

  try {
    const res = await fetch(`/api/cart/${userId}`);
    const cartItems = await res.json();

    if (cartItems.length === 0) {
      cartContainer.innerHTML = '<p>El carrito está vacío.</p>';
      return;
    }
	
	let total = 0;

    cartItems.forEach(item => {
	  const itemTotal = item.price * item.quantity;
      total += itemTotal;
      const itemDiv = document.createElement('div');
      itemDiv.classList.add('cart-item');
      itemDiv.innerHTML = `
        <h4>${item.name}</h4>
        <p>Precio: $${itemTotal.toLocaleString('es-CO')}</p>
        <input type="number" min="1" value="${item.quantity}" id="cart-qty-${item.article_id}">
        <button onclick="updateCartItem(${item.article_id})">Actualizar</button>
        <button onclick="removeCartItem(${item.article_id})">Eliminar</button>
      `;
      cartContainer.appendChild(itemDiv);
    });
	
	const totalDiv = document.createElement('div');
    totalDiv.classList.add('cart-total');
    totalDiv.innerHTML = `<h3>Total: $${total.toLocaleString('es-CO')}</h3>`;
    cartContainer.appendChild(totalDiv);

  } catch (error) {
    console.error('Error cargando el carrito:', error);
    cartContainer.innerHTML = '<p>Error al cargar el carrito.</p>';
  }
}

async function addToCart(productId) {
  const qty = parseInt(document.getElementById(`qty-${productId}`).value);
  if (!userId) {
    alert('Debes iniciar sesión para agregar productos al carrito.');
    return;
  }

  try {
    // Check current cart
    const res = await fetch(`/api/cart/${userId}`);
    const cartItems = await res.json();

    const existingItem = cartItems.find(item => item.article_id === productId);

    if (existingItem) {
      // Update quantity (add to existing)
      const newQty = existingItem.quantity + qty;

      await fetch('/api/cart/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId, quantity: newQty })
      });

      alert('Cantidad actualizada en el carrito.');

    } else {
      // Add new item
      await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId, quantity: qty })
      });

      alert('Producto agregado al carrito.');
    }

  } catch (error) {
    console.error('Error al agregar producto al carrito:', error);
    alert('No se pudo agregar al carrito.');
  }
}

async function updateCartItem(productId) {
  const qty = parseInt(document.getElementById(`cart-qty-${productId}`).value);
  if (!userId) return;
  
  console.log(qty);
  console.log(productId);


  try {
    await fetch('/api/cart/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, productId, quantity: qty })
    });
    loadCart();
  } catch (error) {
    console.error('Error actualizando producto:', error);
  }
}

async function removeCartItem(productId) {
  if (!userId) return;

  try {
    await fetch('/api/cart/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, productId, quantity: 0 })
    });
    loadCart();
  } catch (error) {
    console.error('Error eliminando producto:', error);
  }
}

async function payCart() {
  if (!userId) return;

  try {
    const res = await fetch('/api/cart/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    const data = await res.json();

    if (data.totalPaid !== undefined) {
      alert(`Su compra fue exitosa. Total pagado: $${data.totalPaid.toLocaleString('es-CO')}`);
      loadCart(); // Refresh empty cart
    } else {
      alert(data.message || 'No hay productos para pagar.');
    }
  } catch (error) {
    console.error('Error al pagar:', error);
    alert('Hubo un problema al procesar el pago.');
  }
}
