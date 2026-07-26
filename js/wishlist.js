/*=========================================
        WISHLIST
=========================================*/
console.log("wishlist.js loaded");
let wishlist =
    (JSON.parse(localStorage.getItem("wishlist")) || [])
    .map(Number);


/*-----------------------------
    Restore Wishlist
-----------------------------*/

function restoreWishlist(){
    console.log("Restoring wishlist...", wishlist);

    document
        .querySelectorAll(".product-card")
        .forEach(card=>{

            const id = Number(card.dataset.id);

            const button =
                card.querySelector(".wishlist-btn");

            if(wishlist.includes(id)){
                console.log(
                    "Card:",
                    id,
                    "Liked:",
                    wishlist.includes(id)
                );

                button.classList.add("liked");

                button.textContent = "❤";

            }

        });

}


/*-----------------------------
    Wishlist Click
-----------------------------*/

// productsGrid.addEventListener("click",(e)=>{

//     const button =
//         e.target.closest(".wishlist-btn");

//     if(!button) return;

//     const card =
//         button.closest(".product-card");

//     const id =
//         Number(card.dataset.id);

//     if(wishlist.includes(id)){

//         wishlist =
//             wishlist.filter(item=>item!==id);

//         button.classList.remove("liked");

//         button.textContent="♡";

//     }else{

//         wishlist.push(id);

//         button.classList.add("liked");

//         button.textContent="❤";

//     }

//     localStorage.setItem(

//         "wishlist",

//         JSON.stringify(wishlist)

//     );

// });
function initWishlist(){

    productsGrid.addEventListener("click",(e)=>{

        const button = e.target.closest(".wishlist-btn");

        if(!button) return;

        const card = button.closest(".product-card");

        const id = Number(card.dataset.id);

        if(wishlist.includes(id)){

            wishlist = wishlist.filter(item=>item!==id);

            button.classList.remove("liked");

            button.textContent="♡";

        }

        else{

            wishlist.push(id);

            button.classList.add("liked");

            button.textContent="❤";

        }

        localStorage.setItem(

            "wishlist",

            JSON.stringify(wishlist)

        );

    });

}