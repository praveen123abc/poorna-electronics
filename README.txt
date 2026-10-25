POORNA ELECTRONICS CATALOGUE v5 (PREVIEW)
========================================

Files
-----
index.html            Public product catalogue
styles.css            Public website styling
app.js                Cart, WhatsApp checkout and public catalogue loading
admin.html            Private admin login and catalogue manager
admin.css             Admin page styling
admin.js              Admin authentication and CRUD functions
supabase-config.js    Public Supabase URL and publishable key

BEFORE PUBLISHING
-----------------
1. Open supabase-config.js.
2. Replace YOUR_PROJECT_REF with your Supabase project URL (the project URL is visible in Supabase Settings > API Keys / Data API).
3. Replace YOUR_SUPABASE_PUBLISHABLE_KEY with the project's sb_publishable_... key.
   Do NOT use an sb_secret_... key or service_role key in browser files.
4. Upload all these files to the ROOT of your existing GitHub repository, replacing the old index.html/styles.css/app.js and adding admin.html/admin.css/admin.js/supabase-config.js.
5. Keep the Supabase URL and publishable key public-safe; never commit secret keys.

SUPABASE EXPECTATIONS
--------------------
- Existing tables: public.products and public.categories.
- Existing admin allowlist table: public.admins; the signed-in user's auth UID must have a row.
- Existing Row Level Security policies: public catalogue SELECT access, admin-only INSERT/UPDATE/DELETE.
- Existing Storage bucket: Product_images (exact bucket name).
- Existing storage policies: public SELECT; admins only INSERT/UPDATE/DELETE.
- Product table columns expected: id, name, description, price, image_url, category_id, is_available, created_at, updated_at.
- Category table columns expected: id, name, created_at.

IMPORTANT SECURITY NOTES
------------------------
- This frontend checks the signed-in user against public.admins, but Supabase RLS remains the real security boundary.
- Never disable RLS or add a public write policy.
- Public bucket images can be viewed by anyone with their URLs. Uploading/replacing/deleting is intended to remain admin-only.
- Before using with real catalogue data, test as the admin and test that an ordinary non-admin account cannot insert/update/delete products or images.
- Do not use an admin account password on a shared computer.

CURRENT BEHAVIOUR
-----------------
- If Supabase configuration is not filled in, the public page displays the original demo products.
- When configured successfully, the public page loads available products from Supabase.
- Admin URL: https://praveen123abc.github.io/poorna-electronics/admin.html (after publishing).
- Product images are uploaded to Product_images/products/ and their public URLs are stored in products.image_url.
- Deleting a category is blocked if products still belong to it. Reassign products first.
- Product deletion asks for confirmation.
- Excel import is not included in this preview; it remains a planned later enhancement.


Recent updates
- Removed the AP initials beside the Poorna Electronics name.
- Added Contact Us page at contact.html with the supplied Sircilla address, phone number, and map link.
- Added a Manage catalogue link that is hidden unless the browser has an authenticated Supabase session and that account is present in public.admins.
- admin.html can still be opened directly, but catalogue controls are shown only after sign-in and admin verification. Database RLS remains the actual security boundary.

Before publishing
- Verify supabase-config.js contains your Supabase Project URL and sb_publishable_... key. Never publish a secret/service_role key.
- Test admin login, image upload, and catalogue reads on the deployed GitHub Pages URL.


Navigation update:
- Home, Contact Us, Admin login, and (for authenticated admins only) Manage catalogue are in the top navigation.
- After logout, the browser returns to index.html.
- Poorna Electronics brand link returns to the home page.
