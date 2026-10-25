(() => {
 const manage=document.getElementById('manageCatalogueLink');
 const login=document.getElementById('adminLoginLink');
 const logout=document.getElementById('navLogoutBtn');
 const url=window.POORNA_SUPABASE_URL,key=window.POORNA_SUPABASE_PUBLISHABLE_KEY;
 if(!window.supabase||!url||!key||url.includes('YOUR_PROJECT_REF')||key.includes('YOUR_SUPABASE')) {
   if(manage)manage.classList.add('hidden');
   if(login)login.classList.remove('hidden');
   if(logout)logout.classList.add('hidden');
   return;
 }
 const db=window.supabase.createClient(url,key);
 async function sync(session){
   let admin=false;
   if(session?.user){
     const {data,error}=await db.from('admins').select('user_id').eq('user_id',session.user.id).maybeSingle();
     admin=!!data&&!error;
   }
   if(manage)manage.classList.toggle('hidden',!admin);
   if(login)login.classList.toggle('hidden',admin);
   if(logout)logout.classList.toggle('hidden',!admin);
 }
 db.auth.getSession().then(({data})=>sync(data.session));
 db.auth.onAuthStateChange((_event,session)=>sync(session));
 if(logout)logout.addEventListener('click',async()=>{await db.auth.signOut();window.location.href='index.html';});
})();
