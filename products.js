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
        ],
        sales: 85
    },

    {
        id: 2,
        name: "Piqué Polo",
        price: 1250,
        image: "images/knitted.jpg",
        colors: [
            "#032d37",
            "#cbb99d"
        ],
        sales: 120
    },

    {
        id: 3,
        name: "Tailored Trousers",
        price: 1650,
        image: "images/trousers.jpg",
        colors: [
            "#c9b89c",
            "#444444"
        ],
        sales: 60
    },

    {
        id: 4,
        name: "Overshirt",
        price: 1750,
        image: "images/overshirt.jpg",
        colors: [
            "#111111",
            "#e2ceb5"
        ],
        sales: 45
    }
];


const grid =
    document.getElementById("productsGrid");

const count =
    document.getElementById("productCount");

const sort =
    document.getElementById("sortProducts");


/* =========================
   FAVOURITES
========================= */

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


function saveFavourites(favourites) {

    localStorage.setItem(
        "avviamentoFavourites",
        JSON.stringify(favourites)
    );

}


function isFavourite(productId) {

    const favourites =
        getFavourites();

    return favourites.includes(
        productId
    );

}


function toggleFavourite(productId) {

    const favourites =
        getFavourites();


    const index =
        favourites.indexOf(
            productId
        );


    if (index === -1) {

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


    return favourites.includes(
        productId
    );

}


/* =========================
   PRODUCTS
========================= */

function renderProducts(list) {

    grid.innerHTML = "";

    count.textContent =
        `${list.length} Products`;


    list.forEach(product => {

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "product-card";


        const favouriteActive =
            isFavourite(
                product.id
            );


        card.innerHTML = `
            <div class="product-image">

                <img
                    src="${product.image}"
                    alt="${product.name}"
                >

                <button
                    class="favorite${favouriteActive ? " active" : ""}"
                    type="button"
                    aria-label="${favouriteActive ? "Remove from favourites" : "Add to favourites"}"
                >
                    <i class="fa-${favouriteActive ? "solid" : "regular"} fa-heart"></i>
                </button>

            </div>


            <div class="product-info">

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
            "pointerdown",
            event => {

                if (
                    event.target.closest(
                        ".favorite"
                    )
                ) {
                    return;
                }


                card.classList.add(
                    "touch-active"
                );

            }
        );


        card.addEventListener(
            "pointerup",
            () => {

                setTimeout(() => {

                    card.classList.remove(
                        "touch-active"
                    );

                }, 150);

            }
        );


        card.addEventListener(
            "pointerleave",
            () => {

                card.classList.remove(
                    "touch-active"
                );

            }
        );


        card.addEventListener(
            "click",
            event => {

                if (
                    event.target.closest(
                        ".favorite"
                    )
                ) {
                    return;
                }


                window.location.href =
                    `product-details.html?id=${product.id}`;

            }
        );


        const favorite =
            card.querySelector(
                ".favorite"
            );


        favorite.addEventListener(
            "click",
            event => {

                event.preventDefault();

                event.stopPropagation();


                const active =
                    toggleFavourite(
                        product.id
                    );


                favorite.classList.toggle(
                    "active",
                    active
                );


                favorite.setAttribute(
                    "aria-label",
                    active
                        ? "Remove from favourites"
                        : "Add to favourites"
                );


                const icon =
                    favorite.querySelector(
                        "i"
                    );


                if (active) {

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
        );


        grid.appendChild(
            card
        );

    });

}


/* =========================
   SORT
========================= */

function getSortedProducts() {

    let list =
        [...products];


    if (
        sort.value === "best"
    ) {

        list.sort(
            (a, b) =>
                b.sales - a.sales
        );

    }


    else if (
        sort.value === "low"
    ) {

        list.sort(
            (a, b) =>
                a.price - b.price
        );

    }


    else if (
        sort.value === "high"
    ) {

        list.sort(
            (a, b) =>
                b.price - a.price
        );

    }


    else if (
        sort.value === "name"
    ) {

        list.sort(
            (a, b) =>
                a.name.localeCompare(
                    b.name
                )
        );

    }


    return list;

}


sort.addEventListener(
    "change",
    () => {

        renderProducts(
            getSortedProducts()
        );

    }
);


/* =========================
   CART
========================= */

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

    catch {

        return [];

    }

}


function updateCartCount() {

    const cart =
        getCart();


    const totalQuantity =
        cart.reduce(

            (total, item) =>

                total +
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
        totalQuantity;


    cartCount.style.display =
        totalQuantity > 0
            ? "flex"
            : "none";

}


/* =========================
   START PAGE
========================= */

renderProducts(
    products
);

updateCartCount();


window.addEventListener(
    "pageshow",
    () => {

        renderProducts(
            getSortedProducts()
        );

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

            updateCartCount();

        }


        if (
            event.key ===
            "avviamentoFavourites"
        ) {

            renderProducts(
                getSortedProducts()
            );

        }

    }
);