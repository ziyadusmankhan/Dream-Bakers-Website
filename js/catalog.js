
/*=========================================
        SEARCH • FILTER • SORT
=========================================*/

const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filter-btn");
const sortSelect = document.getElementById("sortSelect");
const productCount = document.getElementById("productCount");

let currentCategory = "all";

function updateCatalog(){

    let filtered = [...products];

    // Search
    const search =
        searchInput.value.toLowerCase();

    if(search){

        filtered = filtered.filter(product=>

            product.title
            .toLowerCase()
            .includes(search)

        );

    }

    // Category
    if(currentCategory !== "all"){

        filtered = filtered.filter(product=>

            product.category === currentCategory

        );

    }

    // Sort
    switch(sortSelect.value){

        case "low":

            filtered.sort(

                (a,b)=>a.price-b.price

            );

            break;

        case "high":

            filtered.sort(

                (a,b)=>b.price-a.price

            );

            break;

        case "popular":

            filtered.sort(

                (a,b)=>b.popularity-a.popularity

            );

            break;

        case "newest":

            filtered.sort(

                (a,b)=>

                new Date(b.date)-new Date(a.date)

            );

            break;

        case "name":

            filtered.sort(

                (a,b)=>

                a.title.localeCompare(b.title)

            );

            break;

    }

    productCount.textContent = filtered.length;

    renderProducts(filtered);
    if (typeof restoreWishlist === "function") {
        restoreWishlist();
}
    
   
}




searchInput.addEventListener("input", updateCatalog);

sortSelect.addEventListener("change", updateCatalog);

filterButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        filterButtons.forEach(btn=>

            btn.classList.remove("active")

        );

        button.classList.add("active");

        currentCategory = button.dataset.category;

        updateCatalog();

    });

});

// initWishlist();

// initModal();

// updateCatalog();

// updateCatalog();
