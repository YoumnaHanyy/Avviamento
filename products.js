/* =========================
   SUPABASE PRODUCTS
========================= */

let products = [];


/* =========================
   ELEMENTS
========================= */

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

    } catch {

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

    return getFavourites().includes(
        productId
    );

}


function toggleFavourite(productId) {

    const favourites =
        getFavourites();

    const index =
        favourites.indexOf(productId);


    if (index === -1) {

        favourites.push(productId);

    } else {

        favourites.splice(index, 1);

    }


    saveFavourites(favourites);

    return favourites.includes(productId);

}


/* =========================
   LOAD PRODUCTS FROM SUPABASE
========================= */

async function loadProducts() {

    if (!grid) {
        return;
    }


    grid.innerHTML = `
        <p class="products-loading">
            Loading products...
        </p>
    `;


    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("products")
            .select(`
                id,
                name,
                price,
                sale_price,
                sales,
                is_active,
                created_at,

                product_images (
                    id,
                    image_url,
                    is_primary
                ),

                product_variants (
                    id,
                    color,
                    size,
                    stock
                )
            `)
            .eq("is_active", true)
            .order("created_at", {
                ascending: false
            });


        if (error) {

            console.error(
                "Error loading products:",
                error
            );

            grid.innerHTML = `
                <p class="products-error">
                    Failed to load products.
                </p>
            `;

            return;

        }


        products =
            (data || []).map(product => {

                /* =========================
                   GET DATABASE IMAGE ONLY
                ========================= */

                let image = "";


                if (
                    product.product_images &&
                    product.product_images.length > 0
                ) {

                    const primaryImage =
                        product.product_images.find(
                            image =>
                                image.is_primary === true
                        );


                    if (primaryImage) {

                        image =
                            primaryImage.image_url;

                    } else {

                        image =
                            product.product_images[0]
                                .image_url;

                    }

                }


                /* =========================
                   GET COLORS FROM VARIANTS
                ========================= */

                const colors =
                    [
                        ...new Set(
                            (product.product_variants || [])
                                .map(
                                    variant =>
                                        variant.color
                                )
                                .filter(Boolean)
                        )
                    ];


                /* =========================
                   TOTAL STOCK
                ========================= */

                const totalStock =
                    (product.product_variants || [])
                        .reduce(
                            (total, variant) => {

                                return total +
                                    Number(
                                        variant.stock || 0
                                    );

                            },
                            0
                        );


                return {

                    id:
                        Number(product.id),

                    name:
                        product.name || "",

                    price:
                        Number(product.price || 0),
                        salePrice:
    product.sale_price !== null &&
    product.sale_price !== undefined &&
    Number(product.sale_price) > 0 &&
    Number(product.sale_price) < Number(product.price)
        ? Number(product.sale_price)
        : null,

currentPrice:
    product.sale_price !== null &&
    product.sale_price !== undefined &&
    Number(product.sale_price) > 0 &&
    Number(product.sale_price) < Number(product.price)
        ? Number(product.sale_price)
        : Number(product.price || 0),

                    image:
                        image,

                    colors:
                        colors,

                    sales:
                        Number(
                            product.sales || 0
                        ),

                    stock:
                        totalStock

                };

            });


        renderProducts(
            getSortedProducts()
        );

    } catch (error) {

        console.error(
            "Unexpected error loading products:",
            error
        );

        grid.innerHTML = `
            <p class="products-error">
                Something went wrong while loading products.
            </p>
        `;

    }

}


/* =========================
   RENDER PRODUCTS
========================= */

function renderProducts(list) {

    if (!grid) {
        return;
    }


    grid.innerHTML = "";


    count.textContent =
        `${list.length} ${list.length === 1 ? "Product" : "Products"}`;


    if (list.length === 0) {

        grid.innerHTML = `
            <div class="products-empty">
                <h3>No products available</h3>
                <p>
                    Products added from the admin dashboard
                    will appear here.
                </p>
            </div>
        `;

        return;

    }


    list.forEach(product => {

        const card =
            document.createElement("article");


        card.className =
            "product-card";


        const favouriteActive =
            isFavourite(product.id);


        /* =========================
           IMAGE
        ========================= */

        let imageHTML = "";


        if (product.image) {

            imageHTML = `
                <img
                    src="${product.image}"
                    alt="${escapeHTML(product.name)}"
                    loading="lazy"
                >
            `;

        } else {

            imageHTML = `
                <div class="product-no-image">
                    No Image
                </div>
            `;

        }


        /* =========================
           COLORS
        ========================= */

        let colorsHTML = "";


        if (product.colors.length > 0) {

            colorsHTML =
                product.colors
                    .map(color => {

                        return `
                            <span
                                class="color"
                                title="${escapeHTML(color)}"
                                style="background-color:${escapeHTML(color)}">
                            </span>
                        `;

                    })
                    .join("");

        }


        /* =========================
           CARD HTML
        ========================= */

        card.innerHTML = `

            <div class="product-image">

                ${imageHTML}

                <button
                    class="favorite${favouriteActive ? " active" : ""}"
                    type="button"
                    aria-label="${
                        favouriteActive
                            ? "Remove from favourites"
                            : "Add to favourites"
                    }"
                >

                    <i
                        class="fa-${
                            favouriteActive
                                ? "solid"
                                : "regular"
                        } fa-heart"
                    ></i>

                </button>

            </div>


            <div class="product-info">

                <h3>
                    ${escapeHTML(product.name)}
                </h3>

<p class="product-prices">
    ${
        product.salePrice !== null
            ? `
                <del class="original-price">
                    EGP ${product.price.toLocaleString()}
                </del>

                <strong class="sale-price">
                    EGP ${product.salePrice.toLocaleString()}
                </strong>
            `
            : `
                EGP ${product.price.toLocaleString()}
            `
    }
</p>
                ${
                    colorsHTML
                    ?
                    `
                        <div class="colors">
                            ${colorsHTML}
                        </div>
                    `
                    :
                    ""
                }

            </div>

        `;


        /* =========================
           TOUCH EFFECT
        ========================= */

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


        /* =========================
           OPEN PRODUCT DETAILS
        ========================= */

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


        /* =========================
           FAVOURITE BUTTON
        ========================= */

        const favorite =
            card.querySelector(
                ".favorite"
            );


        if (favorite) {

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

                    } else {

                        icon.classList.remove(
                            "fa-solid"
                        );

                        icon.classList.add(
                            "fa-regular"
                        );

                    }

                }
            );

        }


        grid.appendChild(card);

    });

}


/* =========================
   ESCAPE HTML
========================= */

function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================
   SORT
========================= */

function getSortedProducts() {

    let list =
        [...products];


    if (!sort) {
        return list;
    }


    if (sort.value === "best") {

        list.sort(
            (a, b) =>
                b.sales - a.sales
        );

    }


    else if (sort.value === "low") {

        list.sort(
            (a, b) =>
                a.currentPrice - b.currentPrice
        );

    }


    else if (sort.value === "high") {

        list.sort(
            (a, b) =>
                b.currentPrice - a.currentPrice
        );

    }


    else if (sort.value === "name") {

        list.sort(
            (a, b) =>
                a.name.localeCompare(
                    b.name
                )
        );

    }


    return list;

}


/* =========================
   SORT EVENT
========================= */

if (sort) {

    sort.addEventListener(
        "change",
        () => {

            renderProducts(
                getSortedProducts()
            );

        }
    );

}


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

    } catch {

        return [];

    }

}


function updateCartCount() {

    const cart =
        getCart();


    const totalQuantity =
        cart.reduce(
            (total, item) => {

                return total +
                    Number(
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


/* =========================
   PAGE SHOW
========================= */

window.addEventListener(
    "pageshow",
    () => {

        if (products.length > 0) {

            renderProducts(
                getSortedProducts()
            );

        }

        updateCartCount();

    }
);


/* =========================
   STORAGE EVENT
========================= */

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

            if (products.length > 0) {

                renderProducts(
                    getSortedProducts()
                );

            }

        }

    }
);


/* =========================
   START
========================= */

async function initializeProductsPage() {

    await loadProducts();

    updateCartCount();

}


initializeProductsPage();