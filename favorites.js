/* ================================
   Avviamento - Favorites
   Guest / localStorage Version
================================ */


/* HTML elements */

const favoritesGrid =
    document.getElementById(
        "favoritesGrid"
    );

const emptyFavorites =
    document.getElementById(
        "emptyFavorites"
    );


/* =================================
   Get favourites from localStorage
================================= */

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


/* =================================
   Save favourites
================================= */

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


/* =================================
   Load products from Supabase
================================= */

async function getProducts() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("products")
            .select(`
                id,
                name,
                price,

                product_images (
                    image_url,
                    is_primary
                ),

                product_variants (
                    color
                )
            `)
            .eq(
                "is_active",
                true
            );


    if (error) {

        console.error(
            "Error loading products:",
            error
        );

        return [];

    }


    return data || [];

}


/* =================================
   Get product image
================================= */

function getProductImage(
    product
) {

    const images =
        product.product_images || [];


    const primaryImage =
        images.find(
            image =>
                image.is_primary === true
        );


    if (
        primaryImage &&
        primaryImage.image_url
    ) {

        return primaryImage.image_url;

    }


    if (
        images.length > 0 &&
        images[0].image_url
    ) {

        return images[0].image_url;

    }


    /*
       Temporary fallback images
       Used only until real product
       images are added from Admin Dashboard.
    */

    const fallbackImages = {

        1: "images/henley.jpg",

        2: "images/knitted.jpg",

        3: "images/trousers.jpg",

        4: "images/overshirt.jpg"

    };


    return (
        fallbackImages[product.id] ||
        "images/placeholder.jpg"
    );

}


/* =================================
   Get product colors
================================= */

function getProductColors(
    product
) {

    const variants =
        product.product_variants || [];


    const colors =
        variants
            .map(
                variant =>
                    variant.color
            )
            .filter(
                color =>
                    color
            );


    return [
        ...new Set(
            colors
        )
    ];

}


/* =================================
   Convert color name to color
================================= */

function getColorValue(
    color
) {

    const colors = {

        Black:
            "#111111",

        White:
            "#ffffff",

        Ivory:
            "#eee6d8",

        Cream:
            "#f4ead8",

        Beige:
            "#d8c7a6",

        Sand:
            "#cbb99d",

        Brown:
            "#795548",

        Navy:
            "#032d37",

        Blue:
            "#4169e1",

        Grey:
            "#888888",

        Gray:
            "#888888",

        Charcoal:
            "#444444",

        Olive:
            "#69723a",

        Green:
            "#3f6b4f",

        Petrol:
            "#032d37",

        Stone:
            "#aaa394",

        Red:
            "#a33b3b"

    };


    return (
        colors[color] ||
        color
    );

}


/* =================================
   Remove favourite
================================= */

function removeFavourite(
    productId
) {

    const favourites =
        getFavourites();


    const updatedFavourites =
        favourites.filter(
            id =>
                Number(id) !==
                Number(productId)
        );


    saveFavourites(
        updatedFavourites
    );


    renderFavourites();

}


/* =================================
   Render favourites
================================= */

async function renderFavourites() {

    const favouriteIds =
        getFavourites();


    const products =
        await getProducts();


    const favouriteProducts =
        products.filter(
            product =>
                favouriteIds.some(
                    id =>
                        Number(id) ===
                        Number(product.id)
                )
        );


    favoritesGrid.innerHTML =
        "";


    /* No favourites */

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


    /* Has favourites */

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


            const image =
                getProductImage(
                    product
                );


            const colors =
                getProductColors(
                    product
                );


            card.innerHTML = `

                <div class="favorite-image">

                    <img
                        src="${image}"
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
                        EGP ${Number(
                            product.price
                        ).toLocaleString("en-EG")}
                    </p>


                    <div class="colors">

                        ${
                            colors
                                .map(
                                    color => `

                                        <span
                                            class="color"
                                            style="background:${getColorValue(
                                                color
                                            )}"
                                            title="${color}"
                                        >
                                        </span>

                                    `
                                )
                                .join("")
                        }

                    </div>

                </div>

            `;


            /* =================================
               Open product details
            ================================= */

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


            /* =================================
               Remove button
            ================================= */

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


/* =================================
   Cart
   Temporary localStorage version
================================= */

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


/* =================================
   Update cart count
================================= */

function updateCartCount() {

    const cart =
        getCart();


    const total =
        cart.reduce(
            (
                sum,
                item
            ) => {

                return (
                    sum +
                    Number(
                        item.quantity || 0
                    )
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
        total;


    cartCount.style.display =
        total > 0
            ? "flex"
            : "none";

}


/* =================================
   Start page
================================= */

async function initializeFavorites() {

    await renderFavourites();

    updateCartCount();

}


/* =================================
   Refresh when returning
================================= */

window.addEventListener(
    "pageshow",
    async () => {

        await renderFavourites();

        updateCartCount();

    }
);


/* =================================
   Sync between tabs
================================= */

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


/* =================================
   Start
================================= */

initializeFavorites();