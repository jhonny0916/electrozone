const SAS_TOKEN = "?sp=r&st=2025-06-23T16:35:37Z&se=2025-07-15T00:35:37Z&sv=2024-11-04&sr=c&sig=rt4rD3pvSBG%2B19KkARuX3%2F2JjThomYr0845blO3skxY%3D"; // replace with your actual SAS token

async function searchArticles() {
  const q = document.getElementById('search').value;
  const res = await fetch(`http://localhost:3000/api/articles/search?q=${q}`);
  const articles = await res.json();
  const container = document.getElementById('articles');
  container.innerHTML = '';
  articles.forEach(a => {
    const div = document.createElement('div');
    div.classList.add('card');
    const fullImageUrl = a.image_url + SAS_TOKEN;
	var formattedPrice = Number(a.price).toLocaleString('es-CO');
    div.innerHTML = `
      <img src="${fullImageUrl}" onclick="showProductModal(${a.id})" />
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
  const res = await fetch(`http://localhost:3000/api/articles/${id}`);
  const a = await res.json();
  const fullImageUrl = a.image_url + SAS_TOKEN;
  const modal = document.getElementById('productModal');
  const modalContent = document.getElementById('productModalContent');
  const formattedPrice = Number(a.price).toLocaleString('es-CO');
  modalContent.innerHTML = `
    <button class="close-btn" onclick="closeProductModal()">✕</button>
    <img src="${fullImageUrl}" style="max-width:100%; border-radius:10px;">
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