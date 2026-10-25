/*
 * Demo settings. Change STORE_NAME and WHATSAPP_NUMBER before taking real orders.
 * Number format: country code plus digits only. India example: 91 + 10-digit mobile number.
 */
const STORE_NAME="Poorna Electronics";
const WHATSAPP_NUMBER="918498068587"; // Poorna Electronics WhatsApp number.
const products=[];
const $=id=>document.getElementById(id),cart=new Map();
let activeCategory="All",searchTerm="";
let usingSupabase=false;
const supabaseUrl=window.POORNA_SUPABASE_URL;
const supabaseKey=window.POORNA_SUPABASE_PUBLISHABLE_KEY;
const supabaseClient=(window.supabase && supabaseUrl && supabaseKey &&
 !supabaseUrl.includes('YOUR_PROJECT_REF') &&
 !supabaseKey.includes('YOUR_SUPABASE') &&
 !supabaseKey.includes('PASTE_YOUR')) ? window.supabase.createClient(supabaseUrl,supabaseKey) : null;
async function updateAdminLink(session){
 const manage=$('manageCatalogueLink'),login=$('adminLoginLink'),logout=$('navLogoutBtn');
 if(!supabaseClient){
  if(manage)manage.classList.add('hidden');
  if(login)login.classList.remove('hidden');
  if(logout)logout.classList.add('hidden');
  return;
 }
 if(!session?.user){
  if(manage)manage.classList.add('hidden');
  if(login)login.classList.remove('hidden');
  if(logout)logout.classList.add('hidden');
  return;
 }
 const {data,error}=await supabaseClient.from('admins').select('user_id').eq('user_id',session.user.id).maybeSingle();
 const admin=!!data&&!error;
 if(manage)manage.classList.toggle('hidden',!admin);
 if(login)login.classList.toggle('hidden',admin);
 if(logout)logout.classList.toggle('hidden',!admin);
}

if(supabaseClient){
 supabaseClient.auth.getSession().then(({data})=>updateAdminLink(data.session));
 supabaseClient.auth.onAuthStateChange((_event,session)=>{updateAdminLink(session);});
}
const navLogout=$('navLogoutBtn');
if(navLogout)navLogout.addEventListener('click',async()=>{
 if(supabaseClient)await supabaseClient.auth.signOut();
 window.location.href='index.html';
});

async function loadCatalogue(){
 const errorBox=$('connectionError');
 const grid=$('productGrid');
 if(errorBox){errorBox.classList.add('hidden');errorBox.textContent='';}
 if(!supabaseClient){
   products.splice(0,products.length);
   renderCategories();renderProducts();renderCart();
   if(errorBox){errorBox.textContent='Catalogue connection is not configured. Check supabase-config.js and its publishable key.';errorBox.classList.remove('hidden');}
   return;
 }
 try{
  const client=supabaseClient;
  const [{data:cats,error:catErr},{data:rows,error:prodErr}]=await Promise.all([
   client.from('categories').select('id,name').order('name'),
   client.from('products').select('id,name,description,price,image_url,category_id,is_available').eq('is_available',true).order('name')
  ]);
  if(catErr) throw new Error('Could not load categories: '+catErr.message);
  if(prodErr) throw new Error('Could not load products: '+prodErr.message);
  const catMap=new Map((cats||[]).map(c=>[String(c.id),c.name]));
  products.splice(0,products.length,...(rows||[]).map(r=>({
   id:String(r.id),name:r.name,category:catMap.get(String(r.category_id))||'Other',
   price:Number(r.price)||0,description:r.description||'',image:r.image_url||'',icon:'⚙'
  })));
  usingSupabase=true;
  renderCategories();renderProducts();renderCart();
  if(errorBox && products.length===0){errorBox.textContent='Your Supabase connection works, but there are no available products to display.';errorBox.classList.remove('hidden');}
 }catch(err){
  console.error('Supabase catalogue load failed:',err);
  products.splice(0,products.length);
  renderCategories();renderProducts();renderCart();
  if(errorBox){errorBox.textContent='Could not load catalogue from Supabase. '+(err.message||'Check your connection and table permissions.');errorBox.classList.remove('hidden');}
 }
}
const money=n=>"₹"+Number(n).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function updateBrand(){ $("brandName").textContent=STORE_NAME;$("footerBrand").textContent=STORE_NAME;document.title=STORE_NAME+" | Product Catalogue";}
function setupWhatsApp(){const u=`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hello ${STORE_NAME}, I have a product enquiry.`)}`;$("contactWhatsapp").href=u;}
function categories(){return ["All",...new Set(products.map(p=>p.category))]}
function renderCategories(){$("categoryList").innerHTML=categories().map(c=>`<button class="chip ${c===activeCategory?"active":""}" data-cat="${esc(c)}">${esc(c)}</button>`).join("");}
function renderProducts(){
 const list=products.filter(p=>(activeCategory==="All"||p.category===activeCategory)&&`${p.name} ${p.id} ${p.category} ${p.description}`.toLowerCase().includes(searchTerm.toLowerCase()));
 $("resultCount").textContent=`${list.length} products`;$("emptyState").classList.toggle("hidden",list.length>0);
 $("productGrid").innerHTML=list.map(p=>{
  const q=cart.get(p.id)||0;
  const quantityControl=q>0
   ? `<div class="image-quantity"><button data-card-qty="${esc(p.id)}" data-delta="-1" aria-label="Decrease ${esc(p.name)}">−</button><span class="quantity-number">${q}</span><button data-card-qty="${esc(p.id)}" data-delta="1" aria-label="Increase ${esc(p.name)}">+</button></div>`
   : `<div class="image-quantity"><button class="single-add" data-card-qty="${esc(p.id)}" data-delta="1" aria-label="Add ${esc(p.name)}">+</button></div>`;
  return `<article class="product-card"><div class="product-image">${p.image?`<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">`:`<div class="placeholder">${esc(p.icon||"⚙")}</div>`}${p.tag?`<span class="product-badge">${esc(p.tag)}</span>`:""}${quantityControl}</div><div class="product-info"><div class="product-code">${esc(p.id)} · ${esc(p.category.toUpperCase())}</div><h3 class="product-name">${esc(p.name)}</h3><p class="product-description">${esc(p.description||"Contact us for details.")}</p><div class="product-bottom"><div class="price">${money(p.price)} <small>/ unit</small></div><button class="add-btn" data-add="${esc(p.id)}">+ Add to cart</button></div></div></article>`;
 }).join("");
}
function renderCart(){
 const list=[...cart.entries()].map(([id,q])=>({p:products.find(p=>p.id===id),q})).filter(x=>x.p);
 const qty=list.reduce((s,x)=>s+x.q,0),total=list.reduce((s,x)=>s+x.p.price*x.q,0);
 $("cartCount").textContent=qty;$("cartTotal").textContent=money(total);$("checkoutTotal").textContent=money(total);if($("fixedCart")){ $("fixedCartCount").textContent=qty;$("fixedCart").classList.toggle("hidden",qty===0); }
 $("cartEmpty").classList.toggle("hidden",list.length>0);$("cartItems").classList.toggle("hidden",!list.length);
 $("cartItems").innerHTML=list.map(({p,q})=>`<div class="cart-row"><div class="cart-product">${p.image?`<img src="${esc(p.image)}" alt="">`:`<div class="cart-placeholder">${esc(p.icon||"⚙")}</div>`}<div><div class="cart-product-name">${esc(p.name)}</div><div class="cart-product-price">${money(p.price)}</div></div></div><div class="quantity-area"><div class="quantity-control"><button data-qty="${esc(p.id)}" data-delta="-1" aria-label="Decrease quantity">−</button><span>${q}</span><button data-qty="${esc(p.id)}" data-delta="1" aria-label="Increase quantity">+</button></div><button class="delete-btn" data-remove="${esc(p.id)}" aria-label="Remove ${esc(p.name)}">♧</button></div></div>`).join("");
}
function openCart(){$("drawer").classList.add("open");$("drawer").setAttribute("aria-hidden","false");$("overlay").classList.remove("hidden");document.body.style.overflow="hidden"}
function closeCart(){$("drawer").classList.remove("open");$("drawer").setAttribute("aria-hidden","true");$("overlay").classList.add("hidden");document.body.style.overflow=""}
function toast(msg){$("toast").textContent=msg;$("toast").classList.remove("hidden");clearTimeout(toast.timer);toast.timer=setTimeout(()=>$("toast").classList.add("hidden"),2300)}
$("categoryList").addEventListener("click",e=>{const b=e.target.closest("[data-cat]");if(!b)return;activeCategory=b.dataset.cat;renderCategories();renderProducts()});
$("menuBtn").addEventListener("click",()=>{$("categoryList").scrollBy({left:250,behavior:"smooth"})});
$("searchInput").addEventListener("input",e=>{searchTerm=e.target.value.trim();renderProducts()});
function updateAddButtons(){
 $("productGrid").querySelectorAll("[data-add]").forEach(b=>{
  const quantity=cart.get(b.dataset.add)||0;
  b.textContent=quantity>0?`✓ Added +${quantity}`:"+ Add to cart";
  b.classList.toggle("added",quantity>0);
 });
}
$("productGrid").addEventListener("click",e=>{
 const cardQty=e.target.closest("[data-card-qty]");
 if(cardQty){
  const id=cardQty.dataset.cardQty,delta=Number(cardQty.dataset.delta);
  const next=(cart.get(id)||0)+delta;
  if(next<=0)cart.delete(id);else cart.set(id,next);
  renderCart();renderProducts();toast(next>0?"Cart updated":"Removed from cart");return;
 }
 const b=e.target.closest("[data-add]");
 if(!b)return;
 const id=b.dataset.add;
 cart.set(id,(cart.get(id)||0)+1);
 renderCart();renderProducts();toast("Cart updated");
});
$("cartItems").addEventListener("click",e=>{const q=e.target.closest("[data-qty]"),r=e.target.closest("[data-remove]");if(q){const n=(cart.get(q.dataset.qty)||0)+Number(q.dataset.delta);if(n<=0)cart.delete(q.dataset.qty);else cart.set(q.dataset.qty,n);renderCart();renderProducts()}if(r){cart.delete(r.dataset.remove);renderCart();renderProducts()}});
$("openCart").addEventListener("click",openCart);if($("fixedCart"))$("fixedCart").addEventListener("click",openCart);$("closeCart").addEventListener("click",closeCart);$("overlay").addEventListener("click",closeCart);$("continueShopping").addEventListener("click",closeCart);
$("clearCart").addEventListener("click",()=>{cart.clear();renderCart();renderProducts()});
$("checkout").addEventListener("click",()=>{
 if(!cart.size){toast("Add a product to your cart first.");return}
 if(!/^\d{10,15}$/.test(WHATSAPP_NUMBER)){toast("Set your real WhatsApp number in app.js first.");return}
 let total=0;const lines=[`━━━━━━━━━━━━━━━━━━━━━━`,`*NEW ORDER REQUEST*`,`━━━━━━━━━━━━━━━━━━━━━━`,""];
 let i=1;
 for(const [id,q] of cart){const p=products.find(x=>x.id===id);if(!p)continue;const line=p.price*q;total+=line;lines.push(`*${i}. ${p.name}*`,`   ├ Quantity: ${q}`,`   ├ Unit Price: ${money(p.price)}`,`   └ Line Total: ${money(line)}`,"");i++}
 lines.push(`━━━━━━━━━━━━━━━━━━━━━━`,`*TOTAL AMOUNT: ${money(total)}*`,`━━━━━━━━━━━━━━━━━━━━━━`,"","_Please confirm pricing and availability_");
 const url=`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
 window.open(url,"_blank","noopener");
});
updateBrand();setupWhatsApp();renderCategories();renderProducts();renderCart();loadCatalogue();
