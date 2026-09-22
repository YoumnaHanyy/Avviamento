document.addEventListener(
    "DOMContentLoaded",
    () => {

        const productCards =
            document.querySelectorAll(
                ".new-arrivals .product-card"
            );


        function getFavourites() {

            try {

                const saved =
                    JSON.parse(
                        localStorage.getItem(
                            "avviamentoFavourites"
                        )
                    );


                return Array.isArray(saved)
                    ? saved
                    : [];

            }

            catch {

                return [];

            }

        }


        function saveFavourites(
            favourites
        ) {

            localStorage.setItem(
                "avviamentoFavourites",
                JSON.stringify(
                    favourites
                )
            );

        }


        function updateNavbarFavourite() {

            const navbarFavourite =
                document.getElementById(
                    "navbarFavourite"
                );


            if (!navbarFavourite) {
                return;
            }


            const favourites =
                getFavourites();


            const hasFavourites =
                favourites.length > 0;


            const icon =
                navbarFavourite.querySelector(
                    "i"
                );


            navbarFavourite.classList.toggle(
                "active",
                hasFavourites
            );


            if (hasFavourites) {

                icon.classList.remove(
                    "fa-regular"
                );

                icon.classList.add(
                    "fa-solid"
                );

            }

            else {

                icon.classList.remove(
                    "fa-solid"
                );

                icon.classList.add(
                    "fa-regular"
                );

            }

        }


        function updateHomeFavouriteButtons() {

            const favourites =
                getFavourites();


            productCards.forEach(
                card => {

                    const productId =
                        Number(
                            card.dataset.productId
                        );


                    const button =
                        card.querySelector(
                            ".favorite-button"
                        );


                    if (!button) {
                        return;
                    }


                    const active =
                        favourites.includes(
                            productId
                        );


                    button.classList.toggle(
                        "active",
                        active
                    );


                    const icon =
                        button.querySelector(
                            "i"
                        );


                    if (active) {

                        icon.classList.remove(
                            "fa-regular"
                        );

                        icon.classList.add(
                            "fa-solid"
                        );


                        button.setAttribute(
                            "aria-label",
                            "Remove from favourites"
                        );

                    }

                    else {

                        icon.classList.remove(
                            "fa-solid"
                        );

                        icon.classList.add(
                            "fa-regular"
                        );


                        button.setAttribute(
                            "aria-label",
                            "Add to favourites"
                        );

                    }

                }
            );

        }


        productCards.forEach(
            card => {

                const productId =
                    Number(
                        card.dataset.productId
                    );


                const productLink =
                    card.querySelector(
                        "a"
                    );


                if (productLink) {

                    productLink.href =
                        `product-details.html?id=${productId}`;

                }


                card.addEventListener(
                    "click",
                    event => {

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

                    }
                );


                const favouriteButton =
                    card.querySelector(
                        ".favorite-button"
                    );


                if (!favouriteButton) {
                    return;
                }


                favouriteButton.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        event.stopPropagation();


                        const favourites =
                            getFavourites();


                        const index =
                            favourites.indexOf(
                                productId
                            );


                        if (
                            index === -1
                        ) {

                            favourites.push(
                                productId
                            );

                        }

                        else {

                            favourites.splice(
                                index,
                                1
                            );

                        }


                        saveFavourites(
                            favourites
                        );


                        updateHomeFavouriteButtons();

                        updateNavbarFavourite();

                    }
                );

            }
        );


        updateHomeFavouriteButtons();

        updateNavbarFavourite();


        window.addEventListener(
            "pageshow",
            () => {

                updateHomeFavouriteButtons();

                updateNavbarFavourite();

            }
        );


        window.addEventListener(
            "storage",
            event => {

                if (
                    event.key ===
                    "avviamentoFavourites"
                ) {

                    updateHomeFavouriteButtons();

                    updateNavbarFavourite();

                }

            }
        );

    }
);



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



updateCartCount();


window.addEventListener(
    "pageshow",
    () => {

        updateCartCount();

    }
);


window.addEventListener(
    "storage",
    event => {

        if (
            event.key ===
            "avviamentoCart"
        ) {

            updateCartCount(); //mmmmmm

        }

    }
);