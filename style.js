// ==========================================
// AVVIAMENTO HOME
// PRODUCTS + FAVOURITES + CART
// ==========================================


let homeProducts = [];



// ==========================================
// GET FAVOURITES
// ==========================================

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



// ==========================================
// SAVE FAVOURITES
// ==========================================

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



// ==========================================
// UPDATE NAVBAR FAVOURITE
// ==========================================

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



// ==========================================
// UPDATE HOME FAVOURITE BUTTONS
// ==========================================

function updateHomeFavouriteButtons() {

    const favourites =
        getFavourites();


    const productCards =
        document.querySelectorAll(
            ".new-arrivals .product-card"
        );


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



// ==========================================
// RENDER HOME PRODUCTS
// ==========================================

function renderHomeProducts(
    products
) {

    const container =
        document.getElementById(
            "newArrivalsContainer"
        );


    if (!container) {
        return;
    }


    if (
        !products ||
        products.length === 0
    ) {

        container.innerHTML = `
            <p>
                No products available.
            </p>
        `;

        return;
    }


    container.innerHTML =
        products.map(
            product => {

                const primaryImage =
                    product.product_images?.find(
                        image =>
                            image.is_primary === true
                    ) ||
                    product.product_images?.[0];


                const imageUrl =
                    primaryImage?.image_url ||
                    "images/placeholder.jpg";

const originalPrice = Number(product.price || 0);
const salePrice = Number(product.sale_price || 0);

const hasSale =
    product.sale_price !== null &&
    product.sale_price !== undefined &&
    salePrice > 0 &&
    salePrice < originalPrice;

const formatPrice = value =>
    Number(value).toLocaleString("en-EG", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });

const priceHTML = hasSale
    ? `
        <p class="product-price">
            <del class="original-price">
                EGP ${formatPrice(originalPrice)}
            </del>
            <strong class="sale-price">
                EGP ${formatPrice(salePrice)}
            </strong>
        </p>
    `
    : `
        <p class="product-price">
            EGP ${formatPrice(originalPrice)}
        </p>
    `;


                return `

                    <article
                        class="product-card"
                        data-product-id="${product.id}"
                    >

                        <a
                            href="product-details.html?id=${product.id}"
                        >

                            <img
                                src="${imageUrl}"
                                alt="${product.name}"
                                loading="lazy"
                            >

                        </a>


                        <div class="product-details">

                            <div>

                                <h3>
                                    ${product.name}
                                </h3>


                                <p>
                                  ${priceHTML}
                                </p>

                            </div>


                            <button
                                class="favorite-button"
                                type="button"
                                data-product-id="${product.id}"
                                aria-label="Add ${product.name} to favourites"
                            >

                                <i
                                    class="fa-regular fa-heart"
                                ></i>

                            </button>

                        </div>

                    </article>

                `;

            }
        ).join("");


    setupHomeProductEvents();

    updateHomeFavouriteButtons();

}



// ==========================================
// LOAD PRODUCTS FROM SUPABASE
// ==========================================

async function loadHomeProducts() {

    const container =
        document.getElementById(
            "newArrivalsContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `
        <p>
            Loading products...
        </p>
    `;


    const {
        data: products,
        error
    } = await supabaseClient
        .from("products")
        .select(`
            id,
            name,
            price,
            sale_price,
            is_active,
            created_at,

            product_images (
                id,
                image_url,
                is_primary
            )
        `)
        .eq(
            "is_active",
            true
        )
        .order(
            "created_at",
            {
                ascending: false
            }
        )
        .limit(2);


    if (error) {

        console.error(
            "Home products error:",
            error
        );


        container.innerHTML = `
            <p>
                Unable to load products.
            </p>
        `;

        return;
    }


    homeProducts =
        products || [];


    renderHomeProducts(
        homeProducts
    );

}



// ==========================================
// HOME PRODUCT EVENTS
// ==========================================

function setupHomeProductEvents() {

    const productCards =
        document.querySelectorAll(
            ".new-arrivals .product-card"
        );


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


            // ==================================
            // CARD CLICK
            // ==================================

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


            // ==================================
            // FAVOURITE BUTTON
            // ==================================

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

}



// ==========================================
// CART
// ==========================================

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



// ==========================================
// UPDATE CART COUNT
// ==========================================

function updateCartCount() {

    const cart =
        getCart();


    const totalQuantity =
        cart.reduce(
            (
                total,
                item
            ) => {

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



// ==========================================
// INITIAL LOAD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await loadHomeProducts();

        updateHomeFavouriteButtons();

        updateNavbarFavourite();

        updateCartCount();

    }
);



// ==========================================
// PAGE SHOW
// ==========================================

window.addEventListener(
    "pageshow",
    () => {

        updateHomeFavouriteButtons();

        updateNavbarFavourite();

        updateCartCount();

    }
);



// ==========================================
// STORAGE CHANGES
// ==========================================

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


        if (
            event.key ===
            "avviamentoCart"
        ) {

            updateCartCount();

        }

    }
);