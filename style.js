document.addEventListener("DOMContentLoaded", () => {

    const productCards =
        document.querySelectorAll(
            ".new-arrivals .product-card"
        );


    productCards.forEach(card => {

        const productId =
            card.dataset.productId;


        const productLink =
            card.querySelector("a");


        /*
        Make sure the image link contains
        the correct product ID
        */

        if (productLink) {

            productLink.href =
                `product-details.html?id=${productId}`;

        }


        /*
        Open product details when clicking
        anywhere on the product card
        */

        card.addEventListener("click", event => {

            /*
            Do not open product details
            when clicking the favourite button
            */

            if (
                event.target.closest(
                    ".favorite-button"
                )
            ) {

                return;

            }


            event.preventDefault();


            window.location.href =
                `product-details.html?id=${productId}`;

        });

    });



    /*
    Favourite buttons
    */

    const favouriteButtons =
        document.querySelectorAll(
            ".favorite-button"
        );


    favouriteButtons.forEach(button => {

        button.addEventListener(
            "click",

            event => {

                event.preventDefault();

                event.stopPropagation();


                button.classList.toggle("active");


                if (
                    button.classList.contains("active")
                ) {

                    button.textContent = "♥";

                }

                else {

                    button.textContent = "♡";

                }

            }
        );

    });

});


function getCart() {

    try {

        const savedCart =
            JSON.parse(
                localStorage.getItem(
                    "avviamentoCart"
                )
            );


        return Array.isArray(savedCart)
            ? savedCart
            : [];

    }

    catch (error) {

        return [];

    }

}



function updateCartCount() {

    const cart =
        getCart();


    const totalQuantity =
        cart.reduce(

            (total, item) => {

                return total
                    + Number(
                        item.quantity || 0
                    );

            },

            0
        );


    const cartCount =
        document.getElementById(
            "cartCount"
        );


    if (!cartCount) {

        return;

    }


    cartCount.textContent =
        totalQuantity;


    cartCount.style.display =
        totalQuantity > 0
            ? "flex"
            : "none";

}



/*
Update cart when the page opens
*/

updateCartCount();



/*
Update cart when returning
to the home page
*/

window.addEventListener(
    "pageshow",

    () => {

        updateCartCount();

    }
);



/*
Update cart if another tab changes it
*/

window.addEventListener(
    "storage",

    event => {

        if (
            event.key ===
            "avviamentoCart"
        ) {

            updateCartCount();

        }

    }
);