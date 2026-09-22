const products = [
    {
        id: 1,
        name: "Linen Shirt",
        price: 1450,
        image: "images/henley.jpg",
        colors: [
            "#eee6d8",
            "#032d37",
            "#222222"
        ]
    },

    {
        id: 2,
        name: "Piqué Polo",
        price: 1250,
        image: "images/knitted.jpg",
        colors: [
            "#032d37",
            "#cbb99d"
        ]
    },

    {
        id: 3,
        name: "Tailored Trousers",
        price: 1650,
        image: "images/trousers.jpg",
        colors: [
            "#c9b89c",
            "#444444"
        ]
    },

    {
        id: 4,
        name: "Overshirt",
        price: 1750,
        image: "images/overshirt.jpg",
        colors: [
            "#111111",
            "#e2ceb5"
        ]
    }
];


const favoritesGrid =
    document.getElementById(
        "favoritesGrid"
    );

const emptyFavorites =
    document.getElementById(
        "emptyFavorites"
    );


function getFavourites() {
    try {
        const favourites =
            JSON.parse(
                localStorage.getItem(
                    "avviamentoFavourites"
                )
            );

        return Array.isArray(favourites)
            ? favourites
            : [];
    }

    catch {
        return [];
    }
}


function saveFavourites(favourites) {
    localStorage.setItem(
        "avviamentoFavourites",
        JSON.stringify(favourites)
    );
}


function removeFavourite(productId) {
    const favourites =
        getFavourites();

    const updatedFavourites =
        favourites.filter(
            id => id !== productId
        );

    saveFavourites(
        updatedFavourites
    );

    renderFavourites();
}


function renderFavourites() {
    const favouriteIds =
        getFavourites();

    const favouriteProducts =
        products.filter(product =>
            favouriteIds.includes(
                product.id
            )
        );


    favoritesGrid.innerHTML = "";


    if (
        favouriteProducts.length === 0
    ) {
        favoritesGrid.style.display =
            "none";

        emptyFavorites.classList.add(
            "show"
        );

        return;
    }


    favoritesGrid.style.display =
        "grid";

    emptyFavorites.classList.remove(
        "show"
    );


    favouriteProducts.forEach(
        product => {
            const card =
                document.createElement(
                    "article"
                );

            card.className =
                "favorite-card";


            card.innerHTML = `
                <div class="favorite-image">

                    <img
                        src="${product.image}"
                        alt="${product.name}"
                    >

                    <button
                        class="remove-favorite"
                        type="button"
                        aria-label="Remove ${product.name} from favourites"
                    >
                        <i class="fa-solid fa-heart"></i>
                    </button>

                </div>


                <div class="favorite-info">

                    <h3>
                        ${product.name}
                    </h3>

                    <p>
                        EGP ${product.price.toLocaleString()}
                    </p>

                    <div class="colors">

                        ${product.colors
                            .map(color => `
                                <span
                                    class="color"
                                    style="background:${color}">
                                </span>
                            `)
                            .join("")}

                    </div>

                </div>
            `;


            card.addEventListener(
                "click",
                event => {
                    if (
                        event.target.closest(
                            ".remove-favorite"
                        )
                    ) {
                        return;
                    }

                    window.location.href =
                        `product-details.html?id=${product.id}`;
                }
            );


            const removeButton =
                card.querySelector(
                    ".remove-favorite"
                );


            removeButton.addEventListener(
                "click",
                event => {
                    event.preventDefault();
                    event.stopPropagation();

                    removeFavourite(
                        product.id
                    );
                }
            );


            favoritesGrid.appendChild(
                card
            );
        }
    );
}


function getCart() {
    try {
        const cart =
            JSON.parse(
                localStorage.getItem(
                    "avviamentoCart"
                )
            );

        return Array.isArray(cart)
            ? cart
            : [];
    }

    catch {
        return [];
    }
}


function updateCartCount() {
    const cart =
        getCart();

    const total =
        cart.reduce(
            (sum, item) =>
                sum +
                Number(
                    item.quantity || 0
                ),
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
        total;

    cartCount.style.display =
        total > 0
            ? "flex"
            : "none";
}


renderFavourites();
updateCartCount();


window.addEventListener(
    "pageshow",
    () => {
        renderFavourites();
        updateCartCount();
    }
);


window.addEventListener(
    "storage",
    event => {
        if (
            event.key ===
            "avviamentoFavourites"
        ) {
            renderFavourites();
        }

        if (
            event.key ===
            "avviamentoCart"
        ) {
            updateCartCount();
        }
    }
);