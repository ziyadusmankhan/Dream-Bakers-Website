/*=========================================
        RENDER PRODUCTS
=========================================*/

const productsGrid = document.getElementById("productsGrid");

function renderProducts(productsToRender = products){

    let html = "";

    productsToRender.forEach(product=>{

        html += `

<div class="product-card"

    data-id="${product.id}"

    data-category="${product.category}"

    data-price="${product.price}"

    data-popularity="${product.popularity}"

    data-date="${product.date}"

    data-title="${product.title}"

    data-description="${product.description}"

    data-image="${product.image}"

    data-reviews="${product.reviews}">

    <span class="product-badge">

        ${product.badge}

    </span>

    <button class="wishlist-btn">♡</button>

    <div class="product-image">

    <img src="${product.image}" alt="${product.title}">

   

</div>

    <div class="product-content">

        <div class="product-rating">

            ⭐⭐⭐⭐⭐

            <span>${product.reviews}</span>

        </div>

        <h3>${product.title}</h3>

        <p>${product.description}</p>

        <div class="product-footer">

    <div class="custom-label">

        <span>✨ Fully Customizable</span>

        <small>
            Price depends on weight & design
        </small>

    </div>

    <a href="order.html" class="product-btn">

        🎂 Customize Cake

    </a>

        </div>

    </div>

</div>

`;

    });

    productsGrid.innerHTML = html;
    // if (typeof restoreWishlist === "function") {
    //     restoreWishlist();

}



// renderProducts();