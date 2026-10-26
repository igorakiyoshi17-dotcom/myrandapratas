let products = [
  {id:"AN023", name:"Anel Coração", category:"Anéis", price:49.90, available:true, type:"ring", featured:true},
  {id:"AN031", name:"Anel Solitário", category:"Anéis", price:59.90, available:true, type:"ring", featured:false},
  {id:"BR014", name:"Brinco Argola", category:"Brincos", price:39.90, available:true, type:"earring", featured:true},
  {id:"BR027", name:"Brinco Gota", category:"Brincos", price:44.90, available:true, type:"earring", featured:false},
  {id:"CL018", name:"Colar Ponto de Luz", category:"Colares", price:59.90, available:true, type:"necklace", featured:true},
  {id:"CL025", name:"Colar Gravatinha", category:"Colares", price:79.90, available:true, type:"necklace", featured:false},
  {id:"PU011", name:"Pulseira Elos", category:"Pulseiras", price:69.90, available:true, type:"bracelet", featured:true},
  {id:"CJ006", name:"Conjunto Essencial", category:"Conjuntos", price:119.90, available:true, type:"set", featured:true},
  {id:"AN044", name:"Anel Flor", category:"Anéis", price:54.90, available:false, type:"ring", featured:false},
  {id:"BR035", name:"Brinco Mini Pérola", category:"Brincos", price:42.90, available:true, type:"earring", featured:false},
  {id:"CL032", name:"Colar Medalha", category:"Colares", price:74.90, available:true, type:"necklace", featured:false},
  {id:"PU019", name:"Pulseira Delicada", category:"Pulseiras", price:64.90, available:true, type:"bracelet", featured:false}
];

const SUPABASE_URL = "https://rrzsymawplobtgiefqed.supabase.co";
const SUPABASE_KEY = "sb_publishable_zlv5ZXiuoUFR80E_zeHfwg_8oAMLkVV";


function normalizeCategory(value) {
  const raw = String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const aliases = {
    "anel": "Anéis",
    "aneis": "Anéis",
    "brinco": "Brincos",
    "brincos": "Brincos",
    "colar": "Colares",
    "colares": "Colares",
    "pulseira": "Pulseiras",
    "pulseiras": "Pulseiras",
    "conjunto": "Conjuntos",
    "conjuntos": "Conjuntos",
    "novidade": "Novidades",
    "novidades": "Novidades"
  };

  return aliases[raw] || String(value || "").trim();
}

async function carregarProdutosSupabase() {
  try {
    const resposta = await fetch(
      `${SUPABASE_URL}/rest/v1/produtos?select=*&order=id.asc`,
      {
        headers: {
          apikey: SUPABASE_KEY
        }
      }
    );

    if (!resposta.ok) {
      throw new Error("Não foi possível carregar os produtos.");
    }

    const dados = await resposta.json();

    if (dados.length > 0) {
products = dados
  .filter(produto => produto.disponivel && Number(produto.estoque) > 0)
  .map(produto => ({        id: produto.codigo,
        dbId: Number(produto.id),
        name: produto.nome,
        category: normalizeCategory(produto.categoria),
        price: Number(produto.preco),
                    stock: Number(produto.estoque),
        available: produto.disponivel && produto.estoque > 0,
        featured: produto.destaque,
        image: produto.imagem_url,
        type: "ring"
      }));
    }
  } catch (erro) {
    console.error("Erro ao carregar produtos do Supabase:", erro);
  }
}

const categories = [
  {name:"Anéis"},
  {name:"Brincos"},
  {name:"Colares"},
  {name:"Pulseiras"},
  {name:"Conjuntos"},
  {name:"Novidades"}
];


let selected = {};
let activeCategory = "Todos";

const money = v => v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const $ = s => document.querySelector(s);

function jewel(type, small=false){
  return `<div class="jewel-art jewel-${type}"></div>`;
}

function renderCategories(){
  $("#categoryGrid").innerHTML = categories.map(c =>
    `<button class="category-card" data-category="${c.name}">
<span>${c.name}</span>
</button>`).join("");
  document.querySelectorAll(".category-card").forEach(btn => btn.onclick = () => {
    activeCategory = btn.dataset.category;
    if(activeCategory === "Novidades") activeCategory = "Novidades";
    renderFilters(); renderProducts();
    document.querySelector("#catalogo").scrollIntoView({behavior:"smooth"});
  });
}

function renderFilters(){
  const filters = ["Todos", ...categories.map(c=>c.name)];
  $("#filterRow").innerHTML = filters.map(c =>
    `<button class="filter ${c===activeCategory?"active":""}" data-filter="${c}">${c}</button>`).join("");
  document.querySelectorAll(".filter").forEach(b=>b.onclick=()=>{
    activeCategory=b.dataset.filter; renderFilters(); renderProducts();
  });
}

function visibleProducts(){
  let list = [...products];
if(activeCategory === "Novidades") list = list.filter(p => p.featured);
else if(activeCategory !== "Todos") list = list.filter(p=>p.category===activeCategory);
  return list;
}

function renderProducts(){
  const list = visibleProducts();
  $("#productGrid").innerHTML = list.map(p => {
    const isSelected = (selected[p.id] || 0) > 0;
    return `<article class="product-card" data-product-id="${p.id}">
      <div class="product-image" data-open-product="${p.id}">
        ${p.featured ? '<span class="badge">DESTAQUE</span>' : ''}
        ${!p.available ? '<span class="badge off">INDISPONÍVEL</span>' : ''}
        <button type="button" class="heart-btn ${isFavorite(p.id) ? "is-favorite" : ""}" data-favorite="${p.id}" aria-label="${isFavorite(p.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}" aria-pressed="${isFavorite(p.id)}">${isFavorite(p.id) ? "♥" : "♡"}</button>
        ${p.image ? `<img src="${p.image}" alt="${p.name}" class="product-photo">` : jewel(p.type)}
        ${p.image ? `<button type="button" class="photo-zoom-btn" data-zoom="${p.id}" aria-label="Ampliar foto de ${p.name}">⌕</button>` : ""}
      </div>
      <div class="product-info">
        <h3 class="product-name" data-open-product="${p.id}">${p.name}</h3>
        <div class="product-meta">CÓDIGO ${p.id} • ${p.available ? "DISPONÍVEL" : "SEM ESTOQUE"}</div>
        <div class="product-bottom">
          <span class="price">${money(p.price)}</span>
          ${isSelected ? `
            <div class="card-quantity-control">
              <button type="button" data-card-minus="${p.id}">−</button>
              <span>${selected[p.id]}</span>
              <button type="button" data-card-plus="${p.id}">+</button>
            </div>
          ` : `
            <button class="add-btn" ${!p.available ? "disabled" : ""} data-add="${p.id}">Adicionar</button>
          `}
        </div>
      </div>
    </article>`;
  }).join("");

  document.querySelectorAll("[data-favorite]").forEach(btn => {
    btn.onclick = (event) => {
      event.stopPropagation();
      toggleFavorite(btn.dataset.favorite);
    };
  });

  document.querySelectorAll("[data-zoom]").forEach(btn => {
    btn.onclick = (event) => {
      event.stopPropagation();
      openPhotoZoom(btn.dataset.zoom);
    };
  });

  document.querySelectorAll("[data-open-product]").forEach(el => {
    el.onclick = (event) => {
      if (event.target.closest(".heart-btn") || event.target.closest(".photo-zoom-btn")) return;
      const produto = products.find(p => String(p.id) === String(el.dataset.openProduct));
      if (produto) openProductDetails(produto);
    };
  });

  document.querySelectorAll("[data-add]").forEach(btn => {
    btn.onclick = () => toggleProduct(btn.dataset.add);
  });

  document.querySelectorAll("[data-card-minus]").forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.cardMinus;
      if ((selected[id] || 0) > 1) selected[id]--;
      else delete selected[id];
      renderProducts();
      updateSelectionUI();
    };
  });

  document.querySelectorAll("[data-card-plus]").forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.cardPlus;
      const produto = products.find(p => p.id === id);
      if (!produto) return;
      const estoqueDisponivel = Number(produto.stock || 0);
      if ((selected[id] || 0) >= estoqueDisponivel) {
        showToast(`Quantidade máxima disponível: ${estoqueDisponivel}`);
        return;
      }
      selected[id] = (selected[id] || 0) + 1;
      renderProducts();
      updateSelectionUI();
    };
  });
}


const FAVORITES_STORAGE_KEY = "myranda-pratas-favoritos-v1";
let favorites = new Set();

try {
  const saved = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) || "[]");
  if (Array.isArray(saved)) favorites = new Set(saved.map(String));
} catch (e) {
  console.warn("Favoritos locais indisponíveis:", e);
}

function isFavorite(id) {
  return favorites.has(String(id));
}

function persistFavorites() {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...favorites]));
  } catch (e) {
    console.warn("Não foi possível salvar favoritos neste navegador.", e);
  }
}

function updateFavoritesUI() {
  const count = favorites.size;
  const bottom = document.getElementById("favoriteCountBottom");
  if (bottom) bottom.textContent = count;
  renderFavoritesList();
}

function toggleFavorite(id) {
  const product = products.find(p => String(p.id) === String(id));
  if (!product) return;

  const key = String(id);

  if (favorites.has(key)) {
    favorites.delete(key);
    showToast("Removida dos favoritos");
  } else {
    favorites.add(key);
    showToast("Salva nos favoritos");
  }

  persistFavorites();
  renderProducts();
  updateFavoritesUI();
}

function renderFavoritesList() {
  const container = document.getElementById("favoritesList");
  if (!container) return;

  const items = products.filter(p => isFavorite(p.id));

  if (!items.length) {
    container.innerHTML = '<p class="favorites-empty">Você ainda não salvou nenhuma joia. Toque no coração de uma peça para encontrá-la aqui.</p>';
    return;
  }

  container.innerHTML = items.map(p => `
    <article class="favorite-item">
      <div class="favorite-thumb">${p.image ? `<img src="${p.image}" alt="${p.name}">` : jewel(p.type)}</div>
      <div class="favorite-info">
        <strong>${p.name}</strong>
        <small>Código ${p.id}</small>
        <span>${money(p.price)}</span>
      </div>
      <div class="favorite-actions">
        <button type="button" data-fav-add="${p.id}" class="add-btn">Adicionar</button>
        <button type="button" data-fav-remove="${p.id}" class="remove-favorite" aria-label="Remover favorito">♥</button>
      </div>
    </article>
  `).join("");

  container.querySelectorAll("[data-fav-remove]").forEach(btn => {
    btn.onclick = () => toggleFavorite(btn.dataset.favRemove);
  });

  container.querySelectorAll("[data-fav-add]").forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.favAdd;
      const p = products.find(p => String(p.id) === String(id));
      if (!p || !p.available || (selected[id] || 0) >= Number(p.stock || 0)) {
        showToast("Quantidade máxima disponível.");
        return;
      }
      selected[id] = (selected[id] || 0) + 1;
      renderProducts();
      updateSelectionUI();
      showToast("Joia adicionada à seleção!");
    };
  });
}

function openFavorites() {
  updateFavoritesUI();
  openModal("#favoritesModal");
}

function openPhotoZoom(id) {
  const product = products.find(p => String(p.id) === String(id));
  if (!product || !product.image) return;

  const modal = document.getElementById("photoZoomModal");
  const image = document.getElementById("zoomedProductImage");

  image.src = product.image;
  image.alt = `Foto ampliada de ${product.name}`;
  document.getElementById("zoomedProductName").textContent = product.name;

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closePhotoZoom() {
  const modal = document.getElementById("photoZoomModal");
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");

  const img = document.getElementById("zoomedProductImage");
  if (img) img.removeAttribute("src");

  document.body.style.overflow = document.querySelector(".modal-backdrop.open") ? "hidden" : "";
}

async function shareProduct(id) {
  const product = products.find(p => String(p.id) === String(id));
  if (!product) return;

  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set("joia", product.id);

  const data = {
    title: `${product.name} | Myranda Pratas`,
    text: `Veja esta joia em Prata 925: ${product.name}`,
    url: url.href
  };

  try {
    if (navigator.share) {
      await navigator.share(data);
      return;
    }

    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(url.href);
      showToast("Link da joia copiado!");
      return;
    }

    window.prompt("Copie o link desta joia:", url.href);
  } catch (err) {
    if (err.name !== "AbortError") showToast("Não foi possível compartilhar agora.");
  }
}

function openProductDetails(produto) {
  const catalogo = document.querySelector("#catalogo");
  const detalhes = document.querySelector("#productDetails");
  const conteudo = document.querySelector("#productDetailsContent");

  if (!catalogo || !detalhes || !conteudo) return;

  const relacionados = products
    .filter(p =>
      String(p.id) !== String(produto.id) &&
      p.available &&
      Number(p.stock || 0) > 0
    )
    .sort(() => Math.random() - 0.5)
    .slice(0, 4);

  conteudo.innerHTML = `
    <div class="product-detail-card">
      <div class="product-detail-image" ${produto.image ? `data-detail-zoom="${produto.id}" role="button" tabindex="0"` : ""}>
        ${produto.image ? `<img src="${produto.image}" alt="${produto.name}">` : jewel(produto.type)}
      </div>

      <div class="product-detail-info">
        <span class="eyebrow">MYRANDA PRATAS · PRATA 925</span>
        <h2>${produto.name}</h2>
        <p>CÓDIGO ${produto.id}</p>
        <h3>${money(produto.price)}</h3>
        <p>${produto.available ? "Disponível" : "Indisponível"}</p>

        <button type="button" id="shareProductDetails" class="detail-secondary">↗ Compartilhar esta joia</button>
        <button type="button" id="favoriteProductDetails" class="detail-secondary ${isFavorite(produto.id) ? "is-favorite" : ""}">
          ${isFavorite(produto.id) ? "♥ Remover dos favoritos" : "♡ Salvar nos favoritos"}
        </button>

        <button type="button" class="primary-btn" id="addProductDetails" ${!produto.available ? "disabled" : ""}>
          Adicionar à minha seleção
        </button>
      </div>
    </div>

    <section class="related-products">
      <div class="related-products-heading">
        <span class="eyebrow">DESCUBRA MAIS</span>
        <h2>Você também pode gostar</h2>
        <p>Outras joias para completar sua seleção.</p>
      </div>
      <div id="relatedProductsGrid" class="product-grid"></div>
    </section>
  `;

  const grid = document.querySelector("#relatedProductsGrid");

  if (grid) {
    grid.innerHTML = relacionados.map(p => `
      <article class="product-card">
        <div class="product-image" data-related-product="${p.id}">
          <button type="button" class="heart-btn ${isFavorite(p.id) ? "is-favorite" : ""}" data-favorite-related="${p.id}">
            ${isFavorite(p.id) ? "♥" : "♡"}
          </button>
          ${p.image ? `<img src="${p.image}" alt="${p.name}" class="product-photo">` : jewel(p.type)}
        </div>
        <div class="product-info">
          <h3 class="product-name" data-related-product="${p.id}">${p.name}</h3>
          <div class="product-meta">CÓDIGO ${p.id}</div>
          <div class="product-bottom">
            <span class="price">${money(p.price)}</span>
            <button type="button" class="add-btn" data-related-add="${p.id}">Adicionar</button>
          </div>
        </div>
      </article>
    `).join("");

    grid.querySelectorAll("[data-favorite-related]").forEach(btn => {
      btn.onclick = event => {
        event.stopPropagation();
        toggleFavorite(btn.dataset.favoriteRelated);
        openProductDetails(produto);
      };
    });

    grid.querySelectorAll("[data-related-product]").forEach(el => {
      el.onclick = event => {
        if (event.target.closest(".heart-btn")) return;
        const outra = products.find(p => String(p.id) === String(el.dataset.relatedProduct));
        if (outra) openProductDetails(outra);
      };
    });

    grid.querySelectorAll("[data-related-add]").forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.relatedAdd;
        const joia = products.find(p => String(p.id) === String(id));
        if (!joia) return;

        const atual = Number(selected[id] || 0);
        const estoque = Number(joia.stock || 0);

        if (!joia.available || atual >= estoque) {
          showToast("Quantidade máxima disponível para esta joia.");
          return;
        }

        selected[id] = atual + 1;
        renderProducts();
        updateSelectionUI();
        showToast("Joia adicionada à sua seleção!");
      };
    });
  }

  const detailShare = document.querySelector("#shareProductDetails");
  if (detailShare) detailShare.onclick = () => shareProduct(produto.id);

  const detailZoom = document.querySelector("[data-detail-zoom]");
  if (detailZoom) {
    detailZoom.onclick = () => openPhotoZoom(produto.id);
    detailZoom.onkeydown = event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openPhotoZoom(produto.id);
      }
    };
  }

  const detailFavorite = document.querySelector("#favoriteProductDetails");
  if (detailFavorite) {
    detailFavorite.onclick = () => {
      toggleFavorite(produto.id);
      openProductDetails(produto);
    };
  }

  const addButton = document.querySelector("#addProductDetails");
  if (addButton) {
    addButton.onclick = () => {
      const atual = Number(selected[produto.id] || 0);
      const estoque = Number(produto.stock || 0);

      if (!produto.available || atual >= estoque) {
        showToast("Quantidade máxima disponível para esta joia.");
        return;
      }

      selected[produto.id] = atual + 1;
      renderProducts();
      updateSelectionUI();
      showToast("Joia adicionada à sua seleção!");
    };
  }

  catalogo.hidden = true;
  detalhes.hidden = false;

  detalhes.scrollIntoView({ behavior: "smooth", block: "start" });
}

function voltarAoCatalogo() {
  const detalhes = document.querySelector("#productDetails");
  const catalogo = document.querySelector("#catalogo");

  if (!detalhes || !catalogo) return;

  detalhes.hidden = true;
  catalogo.hidden = false;

  requestAnimationFrame(() => {
    catalogo.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}


function toggleProduct(id){
  const p = products.find(x=>x.id===id);
  if(!p || !p.available) return;
if((selected[id] || 0) > 0){
  delete selected[id];
    showToast("Peça removida da seleção");
  }else{
    selected[id] = 1;
    showToast(`${p.name} adicionada à seleção`);
  }
  renderProducts(); updateSelectionUI();
}

function updateSelectionUI(){
  const items = Object.entries(selected)
    .map(([id, quantidade]) => {
      const produto = products.find(p => p.id === id);

      if (!produto) return null;

      return {
        ...produto,
        quantidade
      };
    })
    .filter(Boolean);

  const count = items.reduce(
    (total, item) => total + item.quantidade,
    0
  );

  const total = items.reduce(
    (s, item) => s + (item.price * item.quantidade),
    0
  );

  $("#topCount").textContent = count;
  $("#bottomCount").textContent = count;

  $("#selectionBarCount").textContent =
    `${count} ${count === 1 ? "peça" : "peças"}`;

  $("#selectionBarTotal").textContent = money(total);
  $("#modalTotal").textContent = money(total);

  $("#selectionBar").hidden = count === 0;

  renderSelectionList(items);
}

function renderSelectionList(items){
  if(!items.length){
    $("#selectionList").innerHTML='<div class="empty-state">Sua seleção está vazia.<br>Escolha algumas peças no catálogo. ✨</div>';
    return;
  }
  $("#selectionList").innerHTML=items.map(p=>`
    <div class="selected-item">
      <div class="selected-thumb">${p.image ? `<img src="${p.image}" alt="${p.name}" class="selected-product-photo">` : jewel(p.type,true)}</div>
      <div class="selected-details"><strong>${p.name}</strong><span>${p.id} • ${p.category}</span></div>
      <div class="quantity-control">
  <button type="button" data-minus="${p.id}">−</button>

  <span>${p.quantidade}</span>

  <button type="button" data-plus="${p.id}">+</button>
</div>

<span class="selected-price">${money(p.price * p.quantidade)}</span>
      <button class="remove-btn" data-remove="${p.id}" aria-label="Remover">×</button>
    </div>`).join("");
  document.querySelectorAll("[data-remove]").forEach(b=>b.onclick=()=>toggleProduct(b.dataset.remove));
  document.querySelectorAll("[data-minus]").forEach(btn => {
  btn.onclick = () => {
    const id = btn.dataset.minus;

    if ((selected[id] || 0) > 1) {
      selected[id]--;
    } else {
      delete selected[id];
    }

    renderProducts();
    updateSelectionUI();
  };
});

document.querySelectorAll("[data-plus]").forEach(btn => {
  btn.onclick = () => {
    const id = btn.dataset.plus;
    const produto = products.find(p => p.id === id);

    if (!produto) return;

    const estoqueDisponivel = Number(produto.stock || produto.estoque || 0);

    if ((selected[id] || 0) >= estoqueDisponivel) {
      showToast(`Quantidade máxima disponível: ${estoqueDisponivel}`);
      return;
    }

    selected[id] = (selected[id] || 0) + 1;

    renderProducts();
    updateSelectionUI();
  };
});
}

function openModal(id){$(id).classList.add("open");$(id).setAttribute("aria-hidden","false");document.body.style.overflow="hidden"}
function closeModal(id){$(id).classList.remove("open");$(id).setAttribute("aria-hidden","true");document.body.style.overflow=""}

function showToast(msg){
  const t=$("#toast"); t.textContent=msg; t.classList.add("show");
  clearTimeout(window.toastTimer); window.toastTimer=setTimeout(()=>t.classList.remove("show"),1800);
}

$("#goCatalog").onclick=()=>$("#catalogo").scrollIntoView({behavior:"smooth"});
$("#showAll").onclick=()=>{activeCategory="Todos";renderFilters();renderProducts();};
["#openSelection","#openSelectionTop","#openSelectionBottom"].forEach(s=>$(s).onclick=()=>openModal("#selectionModal"));
$("#closeSelection").onclick=()=>closeModal("#selectionModal");
$("#selectionModal").addEventListener("click",e=>{if(e.target.id==="selectionModal")closeModal("#selectionModal")});


const favoritesTop = document.getElementById("openFavoritesTop");
if (favoritesTop) favoritesTop.onclick = openFavorites;

const favoritesBottom = document.getElementById("openFavoritesBottom");
if (favoritesBottom) favoritesBottom.onclick = openFavorites;

const closeFavoritesBtn = document.getElementById("closeFavorites");
if (closeFavoritesBtn) closeFavoritesBtn.onclick = () => closeModal("#favoritesModal");

const favoritesModal = document.getElementById("favoritesModal");
if (favoritesModal) {
  favoritesModal.addEventListener("click", event => {
    if (event.target.id === "favoritesModal") closeModal("#favoritesModal");
  });
}

const backDetails = document.getElementById("backToCatalogDetails");
if (backDetails) backDetails.addEventListener("click", voltarAoCatalogo);

const closeZoomBtn = document.getElementById("closePhotoZoom");
if (closeZoomBtn) closeZoomBtn.onclick = closePhotoZoom;

const photoZoomModal = document.getElementById("photoZoomModal");
if (photoZoomModal) {
  photoZoomModal.onclick = e => {
    if (e.target.id === "photoZoomModal") closePhotoZoom();
  };
}

document.addEventListener("keydown", e => {
  const modal = document.getElementById("photoZoomModal");
  if (e.key === "Escape" && modal && modal.classList.contains("open")) closePhotoZoom();
});


$("#confirmSelection").onclick=async()=>{
  if(Object.keys(selected).length === 0){
    showToast("Adicione pelo menos uma peça.");
    return;
  }

  const code = "#" + Math.random().toString(36).slice(2,7).toUpperCase();

const items = Object.entries(selected)
  .map(([id, quantidade]) => {
    const produto = products.find(p => p.id === id);

    if (!produto) return null;

    return {
      ...produto,
      quantidade
    };
  })
  .filter(Boolean);

  const total = items.reduce(
  (s, p) => s + (p.price * p.quantidade),
  0
);

  const itensParaSalvar = items.map(p => ({
    codigo: p.id,
    nome: p.name,
    preco: p.price,
    quantidade: p.quantidade
  }));

  try {
    const resposta = await fetch(
      `${SUPABASE_URL}/rest/v1/selecoes`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_KEY
        },
        body: JSON.stringify({
          codigo: code,
          itens: itensParaSalvar,
          total: total,
          quantidade: items.reduce(
  (total, item) => total + item.quantidade,
  0
)
        })
      }
    );

    if (!resposta.ok) {
      const erro = await resposta.text();
      console.error("Erro ao salvar seleção:", erro);
      throw new Error("Não foi possível registrar sua seleção.");
    }

    $("#selectionCode").textContent = code;

    
    const quantidadeTotal = items.reduce(
  (total, item) => total + item.quantidade,
  0
);

$("#successSummary").innerHTML =
  `${quantidadeTotal} ${quantidadeTotal === 1 ? "peça selecionada" : "peças selecionadas"} • Total ${money(total)}<br>Guarde este código para consultar sua seleção.`;
    

    closeModal("#selectionModal");
    openModal("#successModal");

  } catch (erro) {
    console.error(erro);
    showToast("Não foi possível confirmar a seleção. Tente novamente.");
  }
};

$("#sendWhatsApp").onclick=()=>{
  const code = $("#selectionCode").textContent;

  const items = Object.entries(selected)
    .map(([id, quantidade]) => {
      const produto = products.find(p => p.id === id);
      if (!produto) return null;
      return { ...produto, quantidade };
    })
    .filter(Boolean);

  if (!items.length) {
    showToast("Sua seleção está vazia.");
    return;
  }

  const total = items.reduce((s, p) => s + (p.price * p.quantidade), 0);

  const listaProdutos = items
    .map(p => `
*${p.name}*
Código: ${p.id}
Quantidade: ${p.quantidade}
Valor unitário: ${money(p.price)}
Subtotal: ${money(p.price * p.quantidade)}
    `.trim())
    .join("\n\n");

  const mensagem = `Olá! Gostaria de finalizar meu pedido na Myranda Pratas.

*MINHA SELEÇÃO*
Código do pedido: ${code}

*JOIAS ESCOLHIDAS*

${listaProdutos}

TOTAL: ${money(total)}

Gostaria de confirmar a disponibilidade e combinar o pagamento e a entrega.`;

  const numeroWhatsApp = "5561991318964";
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const linkWhatsApp = isMobile
    ? `https://api.whatsapp.com/send?phone=${numeroWhatsApp}&text=${encodeURIComponent(mensagem)}`
    : `https://web.whatsapp.com/send?phone=${numeroWhatsApp}&text=${encodeURIComponent(mensagem)}`;

  window.open(linkWhatsApp, "_blank");
};

$("#backToCatalog").onclick=()=>{closeModal("#successModal");document.querySelector("#catalogo").scrollIntoView({behavior:"smooth"});};

async function iniciarCatalogo() {
  await carregarProdutosSupabase();
  renderCategories();
  renderFilters();
  renderProducts();
  updateSelectionUI();
  updateFavoritesUI();

  const requestedCode = new URLSearchParams(window.location.search).get("joia");
  if (requestedCode) {
    const product = products.find(p => String(p.id) === String(requestedCode));
    if (product) openProductDetails(product);
  }
}

iniciarCatalogo();
