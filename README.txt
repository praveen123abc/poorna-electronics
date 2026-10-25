POORNA ELECTRONICS PRODUCT CATALOGUE — DEMO

FILES
- index.html: page structure
- styles.css: dark theme and responsive layout
- app.js: sample product list, search, categories, cart and WhatsApp checkout

STORE SETTINGS
The website name is set to Poorna Electronics.
WhatsApp checkout is set to 918498068587 (India country code + number, digits only).

TEST
1. Extract this ZIP.
2. Open index.html in Chrome.
3. Click Add to cart. The button should briefly show “✓ Added +1”, and the cart badge at the top should increase.
4. Open the cart, change quantities and test the total.
5. WhatsApp checkout opens with the product names, quantities, unit prices, line totals and grand total.

HOW TO REPLACE SAMPLE PRODUCTS FOR NOW
1. Open app.js in Notepad or another text editor.
2. Find the `const products = [` section near the top.
3. Each product is one object, for example:
   {id:"LED003",name:"LED Headlight",category:"Lighting",price:450,description:"Bright LED headlight.",icon:"✦"}
4. Change id, name, category, price and description. Keep the quotation marks and commas.
5. To add another product, copy one complete product object, paste it inside the array, and give it a unique id.
6. Save app.js and refresh the website.
7. For a photo, upload an image into an `images` folder in the GitHub repository and add `image:"images/your-photo.jpg"` to that product object. Use simple file names.

IMPORTANT FUTURE PLAN
This version still uses sample products stored in app.js. Anyone with repository access can edit them, and it does not yet have a database or admin login. We will later connect a database and image storage, then build a protected admin panel with login and Excel import. Do not treat hiding an admin page as security; product updates must be protected by database permissions and authenticated access.

UPLOAD TO GITHUB
1. Open your repository and click Add file > Upload files.
2. Upload/replace index.html, styles.css and app.js at the repository root.
3. Commit changes, then wait for GitHub Pages to redeploy.

CART BUTTON BEHAVIOUR
Each product's Add to cart button now keeps a count such as '✓ Added +1' and '✓ Added +2'. To publish this fix, replace app.js in GitHub and commit the change.

PRODUCT CARD QUANTITY CONTROL
The + button is overlaid at the bottom-right of each product image. After adding one item, it becomes a minus / quantity / plus control. It stays in sync with the cart. To publish, upload the updated app.js and styles.css to GitHub and commit.
