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
        name: produto.nome,
        category: produto.categoria,
        price: Number(produto.preco),
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
  {name:"Anéis", icon:"💍"}, {name:"Brincos", icon:"◌"}, {name:"Colares", icon:"✧"},
  {name:"Pulseiras", icon:"⌁"}, {name:"Conjuntos", icon:"🎁"}, {name:"Novidades", icon:"✦"}
];

let selected = [];
let activeCategory = "Todos";

const money = v => v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const $ = s => document.querySelector(s);

function jewel(type, small=false){
  return `<div class="jewel-art jewel-${type}"></div>`;
}

function renderCategories(){
  $("#categoryGrid").innerHTML = categories.map(c =>
    `<button class="category-card" data-category="${c.name}">
      <span class="category-icon">${c.icon}</span><span>${c.name}</span>
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
  if(activeCategory === "Novidades") list = list.filter(p=>["CJ006","CL032","BR035"].includes(p.id));
  else if(activeCategory !== "Todos") list = list.filter(p=>p.category===activeCategory);
  return list;
}

function renderProducts(){
  const list = visibleProducts();
  $("#productGrid").innerHTML = list.map(p => {
    const isSelected = selected.includes(p.id);
    return `<article class="product-card">
      <div class="product-image">
        ${p.featured ? '<span class="badge">DESTAQUE</span>' : ''}
        ${!p.available ? '<span class="badge off">INDISPONÍVEL</span>' : ''}
        <button class="heart-btn" aria-label="Favoritar">♡</button>
       ${p.image ? `<img src="${p.image}" alt="${p.name}" class="product-photo">` : jewel(p.type)}
      </div>
      <div class="product-info">
        <h3 class="product-name">${p.name}</h3>
        <div class="product-meta">CÓDIGO ${p.id} • ${p.available ? "DISPONÍVEL" : "SEM ESTOQUE"}</div>
        <div class="product-bottom">
          <span class="price">${money(p.price)}</span>
          <button class="add-btn ${isSelected?"added":""}" ${!p.available?"disabled":""} data-add="${p.id}">
            ${isSelected ? "✓ Adicionada" : "Adicionar"}
          </button>
        </div>
      </div>
    </article>`;
  }).join("");
  document.querySelectorAll("[data-add]").forEach(btn=>btn.onclick=()=>toggleProduct(btn.dataset.add));
}

function toggleProduct(id){
  const p = products.find(x=>x.id===id);
  if(!p || !p.available) return;
  if(selected.includes(id)){
    selected = selected.filter(x=>x!==id);
    showToast("Peça removida da seleção");
  }else{
    selected.push(id);
    showToast(`${p.name} adicionada à seleção`);
  }
  renderProducts(); updateSelectionUI();
}

function updateSelectionUI(){
  const items = selected.map(id=>products.find(p=>p.id===id)).filter(Boolean);
  const total = items.reduce((s,p)=>s+p.price,0);
  const count = items.length;
  $("#topCount").textContent=count;
  $("#bottomCount").textContent=count;
  $("#selectionBarCount").textContent=`${count} ${count===1?"peça":"peças"}`;
  $("#selectionBarTotal").textContent=money(total);
  $("#modalTotal").textContent=money(total);
  $("#selectionBar").hidden = count===0;
  renderSelectionList(items);
}

function renderSelectionList(items){
  if(!items.length){
    $("#selectionList").innerHTML='<div class="empty-state">Sua seleção está vazia.<br>Escolha algumas peças no catálogo. ✨</div>';
    return;
  }
  $("#selectionList").innerHTML=items.map(p=>`
    <div class="selected-item">
      <div class="selected-thumb">${jewel(p.type,true)}</div>
      <div class="selected-details"><strong>${p.name}</strong><span>${p.id} • ${p.category}</span></div>
      <span class="selected-price">${money(p.price)}</span>
      <button class="remove-btn" data-remove="${p.id}" aria-label="Remover">×</button>
    </div>`).join("");
  document.querySelectorAll("[data-remove]").forEach(b=>b.onclick=()=>toggleProduct(b.dataset.remove));
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

$("#confirmSelection").onclick=()=>{
  if(!selected.length){showToast("Adicione pelo menos uma peça.");return;}
  const code = "#" + Math.random().toString(36).slice(2,7).toUpperCase();
  $("#selectionCode").textContent=code;
  const total=selected.reduce((s,id)=>s+products.find(p=>p.id===id).price,0);
  $("#successSummary").innerHTML=`${selected.length} ${selected.length===1?"peça selecionada":"peças selecionadas"} • Total ${money(total)}<br>Guarde este código para consultar sua seleção.`;
  closeModal("#selectionModal"); openModal("#successModal");
};

$("#sendWhatsApp").onclick=()=>{
  const code = $("#selectionCode").textContent;

  const items = selected
    .map(id => products.find(p => p.id === id))
    .filter(Boolean);

  if (!items.length) {
    showToast("Sua seleção está vazia.");
    return;
  }

  const total = items.reduce((s,p) => s + p.price, 0);

  const listaProdutos = items
    .map(p => `• ${p.id} — ${p.name} — ${money(p.price)}`)
    .join("\n");

  const mensagem = `Olá! Quero finalizar minha seleção na Myrandapratas 🤎

Código da seleção: ${code}

${listaProdutos}

Total: ${money(total)}

Gostaria de finalizar minha compra.`;

  const numeroWhatsApp = "5561991318964";
  const linkWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;

  window.open(linkWhatsApp, "_blank");
};

$("#backToCatalog").onclick=()=>{closeModal("#successModal");document.querySelector("#catalogo").scrollIntoView({behavior:"smooth"});};

async function iniciarCatalogo() {
  await carregarProdutosSupabase();
  renderCategories();
  renderFilters();
  renderProducts();
  updateSelectionUI();
}

iniciarCatalogo();
