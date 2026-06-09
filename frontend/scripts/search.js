function getLocalImageUrl(imageUrl) {
  if (!imageUrl) return '';
  const fileName = String(imageUrl).trim();
  const validFileName = /^[a-zA-Z0-9._-]+$/.test(fileName);
  if (!validFileName) return '';
  return `/electrozone_images/${fileName}`;
}

async function searchArticles() {
  const q = document.getElementById('search').value;
  const res = await fetch(`/api/articles/search?q=${q}`);
  const articles = await res.json();
  const container = document.getElementById('articles');
  container.innerHTML = '';
  articles.forEach(a => {
    const div = document.createElement('div');
    div.classList.add('card');
    const fullImageUrl = getLocalImageUrl(a.image_url);
	  var formattedPrice = Number(a.price).toLocaleString('es-CO');
    div.innerHTML = `
      ${fullImageUrl ? `<img src="${fullImageUrl}" onerror="this.remove()" onclick="showProductModal(${a.id})" />` : ''}
      <h3>${a.name}</h3>
      <p><strong>$${formattedPrice}</strong></p>
      <input type="number" min="1" value="1" id="qty-${a.id}" />	 
      <br> 
      <br> 	  
      <button onclick="addToCart(${a.id})">Agregar al carrito</button>
    `;
    container.appendChild(div);
  });
}

async function showProductModal(id) {
  const res = await fetch(`/api/articles/${id}`);
  const a = await res.json();
  const fullImageUrl = getLocalImageUrl(a.image_url);
  const modal = document.getElementById('productModal');
  const modalContent = document.getElementById('productModalContent');
  const formattedPrice = Number(a.price).toLocaleString('es-CO');
  modalContent.innerHTML = `
    <button class="close-btn" onclick="closeProductModal()">✕</button>
    ${fullImageUrl ? `<img src="${fullImageUrl}" onerror="this.remove()" style="max-width:100%; border-radius:10px;">` : ''}
    <h2>${a.name}</h2>
    <p><strong>$${formattedPrice}</strong></p>
    <p>${a.description}</p>
	<p><b>Caracteristicas:</b> ${a.characteristics}</p>
	<p><b>Stock:</b> ${a.stock} unidades</p>
  `;
  modal.classList.add('show');
}

function closeProductModal() {
  document.getElementById('productModal').classList.remove('show');
}