(() => {
 const $=id=>document.getElementById(id);
 const url=window.POORNA_SUPABASE_URL,key=window.POORNA_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key||url.includes('YOUR_PROJECT_REF')||key.includes('YOUR_SUPABASE')){
  $('loginMessage').textContent='Setup needed: edit supabase-config.js and add your Project URL and publishable key.';return;
 }
 const db=window.supabase.createClient(url,key);
 let categories=[],products=[],selectedImage=null,currentUser=null;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const money=n=>'₹'+Number(n||0).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
 const say=(message,error=false)=>{ $('statusMessage').textContent=message;$('statusMessage').style.color=error?'#ff9292':'#ffd98b'; };
 const loginSay=(message,error=false)=>{ $('loginMessage').textContent=message;$('loginMessage').style.color=error?'#ff9292':'#ffd98b'; };
 async function isAdmin(user){const {data,error}=await db.from('admins').select('user_id').eq('user_id',user.id).maybeSingle();return !error&&!!data;}
 async function refresh(){
  const [c,p]=await Promise.all([db.from('categories').select('id,name,created_at').order('name'),db.from('products').select('id,name,description,price,image_url,category_id,is_available,created_at').order('name')]);
  if(c.error||p.error)throw(c.error||p.error);categories=c.data||[];products=p.data||[];renderCategories();renderProducts();
 }
 function renderCategories(){
  $('categoryList').innerHTML=categories.map(c=>`<li>${esc(c.name)} <button type="button" data-edit-cat="${c.id}">Rename</button> <button type="button" class="danger" data-delete-cat="${c.id}">Delete</button></li>`).join('')||'<li>No categories yet.</li>';
  $('productCategory').innerHTML='<option value="">No category</option>'+categories.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('');
 }
 function renderProducts(){
  const q=$('productSearch').value.trim().toLowerCase();const list=products.filter(p=>`${p.name} ${p.description||''}`.toLowerCase().includes(q));
  $('productsTable').innerHTML=list.map(p=>{const cat=categories.find(c=>String(c.id)===String(p.category_id));return `<tr><td>${p.image_url?`<img src="${esc(p.image_url)}" alt="">`:'—'}</td><td><strong>${esc(p.name)}</strong><br><small>${esc(p.description||'')}</small></td><td>${esc(cat?.name||'Uncategorised')}</td><td>${money(p.price)}</td><td><div class="actions"><button type="button" data-edit-product="${p.id}">Edit</button><button type="button" class="danger" data-delete-product="${p.id}">Delete</button></div></td></tr>`}).join('')||'<tr><td colspan="5">No products found.</td></tr>';
 }
 function resetProduct(){ $('productForm').reset();$('productId').value='';selectedImage=null;$('imagePreviewWrap').classList.add('hidden');$('productFormTitle').textContent='Add product';$('saveProduct').textContent='Add product';$('cancelProduct').classList.add('hidden'); }
 function resetCategory(){ $('categoryForm').reset();$('categoryId').value='';$('saveCategory').textContent='Add category';$('cancelCategory').classList.add('hidden'); }
 async function uploadImage(file){
  if(!file)return null;if(file.size>5*1024*1024)throw new Error('Image must be smaller than 5 MB.');
  if(!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type))throw new Error('Choose a JPG, PNG, WEBP or GIF image.');
  const ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'');const path=`products/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const {error}=await db.storage.from('Product_images').upload(path,file,{cacheControl:'3600',upsert:false,contentType:file.type});if(error)throw error;
  const {data}=db.storage.from('Product_images').getPublicUrl(path);return data.publicUrl;
 }
 $('loginForm').addEventListener('submit',async e=>{e.preventDefault();loginSay('Signing in…');const {data,error}=await db.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});if(error){loginSay(error.message,true);return;}currentUser=data.user;if(!await isAdmin(currentUser)){await db.auth.signOut();currentUser=null;loginSay('This account is not authorised to manage the catalogue.',true);return;}try{await showAdmin();loginSay('');}catch(err){loginSay(err.message||'Could not load catalogue.',true);}});
 async function showAdmin(){ $('loginPanel').classList.add('hidden');$('adminPanel').classList.remove('hidden');$('sessionLabel').textContent=currentUser.email||'Admin';await refresh();say('Signed in. Changes are saved to Supabase.'); }
 $('logoutBtn').addEventListener('click',async()=>{await db.auth.signOut();currentUser=null;window.location.href='index.html';});
 $('categoryForm').addEventListener('submit',async e=>{e.preventDefault();const id=$('categoryId').value,name=$('categoryName').value.trim();if(!name)return;const query=id?db.from('categories').update({name}).eq('id',id):db.from('categories').insert({name});const {error}=await query;if(error){say(error.message,true);return;}resetCategory();await refresh();say(id?'Category renamed.':'Category added.');});
 $('cancelCategory').addEventListener('click',resetCategory);
 $('categoryList').addEventListener('click',async e=>{const edit=e.target.closest('[data-edit-cat]'),del=e.target.closest('[data-delete-cat]');if(edit){const c=categories.find(x=>String(x.id)===edit.dataset.editCat);if(!c)return;$('categoryId').value=c.id;$('categoryName').value=c.name;$('saveCategory').textContent='Save category';$('cancelCategory').classList.remove('hidden');$('categoryName').focus();}if(del){const id=del.dataset.deleteCat;const count=products.filter(p=>String(p.category_id)===id).length;if(count){say(`This category has ${count} product(s). Reassign or remove those products before deleting the category.`,true);return;}const c=categories.find(x=>String(x.id)===id);if(!c||!confirm(`Delete category “${c.name}”?`))return;const {error}=await db.from('categories').delete().eq('id',id);if(error){say(error.message,true);return;}await refresh();say('Category deleted.');}});
 $('productImage').addEventListener('change',()=>{const f=$('productImage').files[0];selectedImage=f||null;if(f){$('imagePreview').src=URL.createObjectURL(f);$('imagePreviewWrap').classList.remove('hidden');}else $('imagePreviewWrap').classList.add('hidden');});
 $('removeImage').addEventListener('click',()=>{selectedImage=null;$('productImage').value='';$('imagePreview').removeAttribute('src');$('imagePreviewWrap').classList.add('hidden');});
 $('productForm').addEventListener('submit',async e=>{e.preventDefault();try{const id=$('productId').value;const name=$('productName').value.trim(),price=Number($('productPrice').value);if(!name||!Number.isFinite(price)||price<0)throw new Error('Enter a product name and valid price.');const old=id?products.find(p=>String(p.id)===id):null;let image_url=old?.image_url||'';if(selectedImage)image_url=await uploadImage(selectedImage);if(!selectedImage&&!$('productImage').files.length&&$('imagePreviewWrap').classList.contains('hidden'))image_url='';const payload={name,price,description:$('productDescription').value.trim(),category_id:$('productCategory').value?Number($('productCategory').value):null,image_url,is_available:true,updated_at:new Date().toISOString()};const result=id?await db.from('products').update(payload).eq('id',id):await db.from('products').insert(payload);if(result.error)throw result.error;resetProduct();await refresh();say(id?'Product updated.':'Product added.');}catch(err){say(err.message||'Could not save product.',true);}});
 $('cancelProduct').addEventListener('click',resetProduct);
 $('productsTable').addEventListener('click',async e=>{const edit=e.target.closest('[data-edit-product]'),del=e.target.closest('[data-delete-product]');if(edit){const p=products.find(x=>String(x.id)===edit.dataset.editProduct);if(!p)return;$('productId').value=p.id;$('productName').value=p.name;$('productPrice').value=p.price;$('productDescription').value=p.description||'';$('productCategory').value=p.category_id??'';$('productImage').value='';selectedImage=null;$('productFormTitle').textContent='Edit product';$('saveProduct').textContent='Save changes';$('cancelProduct').classList.remove('hidden');if(p.image_url){$('imagePreview').src=p.image_url;$('imagePreviewWrap').classList.remove('hidden');}else $('imagePreviewWrap').classList.add('hidden');$('productFormTitle').scrollIntoView({behavior:'smooth',block:'start'});}if(del){const id=del.dataset.deleteProduct,p=products.find(x=>String(x.id)===id);if(!p||!confirm(`Delete “${p.name}”? This cannot be undone.`))return;const {error}=await db.from('products').delete().eq('id',id);if(error){say(error.message,true);return;}await refresh();say('Product deleted.');}});
 $('productSearch').addEventListener('input',renderProducts);
 db.auth.getSession().then(async({data})=>{if(data.session?.user){currentUser=data.session.user;if(await isAdmin(currentUser)){try{await showAdmin();}catch(e){loginSay(e.message,true);}}else{await db.auth.signOut();}}});
 db.auth.onAuthStateChange((_event,session)=>{if(!session){$('adminPanel').classList.add('hidden');$('loginPanel').classList.remove('hidden');$('sessionLabel').textContent='Not signed in';}});
})();
