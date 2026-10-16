/* =========================
   GET PRODUCT ID FROM URL
========================= */

const params =
    new URLSearchParams(
        window.location.search
    );

const requestedId =
    params.get("id") || "1";


/* =========================
   CURRENT PRODUCT
========================= */

let product = null;


/* =========================
   CURRENT PRODUCT SELECTIONS
========================= */

let activeImageIndex = 0;

let selectedColour = null;

let selectedSize = null;

let quantity = 1;

let toastTimer;


/* =========================
   HTML ELEMENTS
========================= */

const elements = {

    productImage:
        document.getElementById(
            "productImage"
        ),

    imagePlaceholder:
        document.getElementById(
            "imagePlaceholder"
        ),

    galleryDots:
        document.getElementById(
            "galleryDots"
        ),

    productName:
        document.getElementById(
            "productName"
        ),

    productPrice:
        document.getElementById(
            "productPrice"
        ),

    productDescription:
        document.getElementById(
            "productDescription"
        ),

    productDetails:
        document.getElementById(
            "productDetails"
        ),

    fabricCare:
        document.getElementById(
            "fabricCare"
        ),

    colourOptions:
        document.getElementById(
            "colourOptions"
        ),

    sizeOptions:
        document.getElementById(
            "sizeOptions"
        ),

    selectedColourName:
        document.getElementById(
            "selectedColourName"
        ),

    selectedSizeName:
        document.getElementById(
            "selectedSizeName"
        ),

    sizeError:
        document.getElementById(
            "sizeError"
        ),

    quantity:
        document.getElementById(
            "quantity"
        ),

    favouriteButton:
        document.getElementById(
            "favouriteButton"
        ),

    navbarFavourite:
        document.getElementById(
            "navbarFavourite"
        ),

    cartCount:
        document.getElementById(
            "cartCount"
        ),

    toast:
        document.getElementById(
            "toast"
        ),

    sizeGuideModal:
        document.getElementById(
            "sizeGuideModal"
        )

};


/* =========================
   FORMAT PRICE
========================= */

function formatPrice(price) {

    return `EGP ${Number(price).toLocaleString("en-EG")}`;

}


/* =========================
   GET ARRAY FROM LOCALSTORAGE
========================= */

function getStoredArray(key) {

    try {

        const stored =
            JSON.parse(
                localStorage.getItem(key)
            );

        return Array.isArray(stored)
            ? stored
            : [];

    }

    catch (error) {

        return [];

    }

}


/* =========================
   COLOR VALUE
========================= */

function getColorValue(colorName) {

    const colors = {

        Ivory: "#eee9dc",

        Sand: "#cbbda4",

        Navy: "#132a44",

        Black: "#222522",

        Petrol: "#032d37",

        Stone: "#c9bea9",

        Charcoal: "#4b4d4b",

        Olive: "#565b47",

        White: "#ffffff",

        Red: "#b3261e",

        Blue: "#315a8a",

        Green: "#4d6b50"

    };


    return colors[colorName] ||
        colorName ||
        "#cccccc";

}


/* =========================
   LOAD PRODUCT FROM SUPABASE
========================= */

async function loadProduct() {

    try {

        const { data, error } =
            await supabaseClient

                .from("products")

                .select(`
                    id,
                    name,
                    price,
                    sale_price,
                    description,
                    details,
                    care,
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

                .eq(
                    "id",
                    requestedId
                )

                .eq(
                    "is_active",
                    true
                )

                .single();


        if (error) {

            console.error(
                "Error loading product:",
                error
            );

            showToast(
                "Unable to load product"
            );

            return;

        }


        if (!data) {

            showToast(
                "Product not found"
            );

            return;

        }


        /* =========================
           CONVERT DATABASE DATA
           TO FRONTEND FORMAT
        ========================= */

        product = {

            id:
                data.id,

            name:
                data.name,

           price: Number(data.price || 0),

salePrice:
    data.sale_price !== null &&
    data.sale_price !== undefined &&
    Number(data.sale_price) > 0 &&
    Number(data.sale_price) < Number(data.price)
        ? Number(data.sale_price)
        : null,

currentPrice:
    data.sale_price !== null &&
    data.sale_price !== undefined &&
    Number(data.sale_price) > 0 &&
    Number(data.sale_price) < Number(data.price)
        ? Number(data.sale_price)
        : Number(data.price || 0),

            description:
                data.description || "",

            details:
                data.details || "",

            care:
                data.care || "",

            images:
                data.product_images
                    ? data.product_images
                        .sort(
                            (a, b) =>
                                Number(
                                    b.is_primary
                                ) -
                                Number(
                                    a.is_primary
                                )
                        )
                        .map(
                            image =>
                                image.image_url
                        )
                    : [],

            variants:
                data.product_variants || []

        };


        /* =========================
           DEFAULT COLOUR
        ========================= */

        const firstVariant =
            product.variants[0];


        selectedColour =
            firstVariant
                ? firstVariant.color
                : null;


        renderProduct();

    }

    catch (error) {

        console.error(
            "Unexpected error loading product:",
            error
        );

        showToast(
            "Something went wrong"
        );

    }

}


/* =========================
   SHOW PRODUCT INFORMATION
========================= */

function renderProduct() {

    if (!product) {

        return;

    }


    document.title =
        `${product.name} | Avviamento`;


    elements.productName.textContent =
        product.name;


if (product.salePrice !== null) {
    elements.productPrice.innerHTML = `
        <del class="original-price">
            ${formatPrice(product.price)}
        </del>

        <strong class="sale-price">
            ${formatPrice(product.salePrice)}
        </strong>
    `;
} else {
    elements.productPrice.textContent =
        formatPrice(product.price);
}

    elements.productDescription.textContent =
        product.description;


    elements.productDetails.textContent =
        product.details;


    elements.fabricCare.textContent =
        product.care;


    renderColours();

    renderSizes();

    renderGalleryDots();

    showImage(0);

    updateFavouriteButton();

    updateNavbarFavourite();

    updateCartCount();

}


/* =========================
   CREATE COLOUR BUTTONS
========================= */

function renderColours() {

    elements.colourOptions.innerHTML = "";


    const colours = [
        ...new Set(
            product.variants.map(
                variant =>
                    variant.color
            )
        )
    ];


    if (colours.length === 0) {

        elements.selectedColourName.textContent =
            "No colours";

        return;

    }


    if (!selectedColour) {

        selectedColour =
            colours[0];

    }


    colours.forEach(
        colourName => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                `colour-button${
                    colourName === selectedColour
                        ? " active"
                        : ""
                }`;


            button.setAttribute(
                "aria-label",
                colourName
            );


            button.title =
                colourName;


            button.innerHTML = `
                <span
                    style="background-color: ${getColorValue(colourName)}">
                </span>
            `;


            button.addEventListener(
                "click",
                () => {

                    selectedColour =
                        colourName;


                    selectedSize =
                        null;


                    elements.selectedColourName
                        .textContent =
                        selectedColour;


                    elements.selectedSizeName
                        .textContent =
                        "Select size";


                    elements.sizeError
                        .classList
                        .remove(
                            "show"
                        );


                    document
                        .querySelectorAll(
                            ".colour-button"
                        )
                        .forEach(
                            item => {

                                item.classList
                                    .remove(
                                        "active"
                                    );

                            }
                        );


                    button.classList.add(
                        "active"
                    );


                    renderSizes();

                }
            );


            elements.colourOptions
                .appendChild(
                    button
                );

        }
    );


    elements.selectedColourName
        .textContent =
        selectedColour;

}


/* =========================
   CREATE SIZE BUTTONS
========================= */

function renderSizes() {

    elements.sizeOptions.innerHTML = "";


    const variantsForColour =
        product.variants.filter(
            variant =>
                variant.color ===
                selectedColour
        );


    const sizes = [
        ...new Set(
            variantsForColour.map(
                variant =>
                    variant.size
            )
        )
    ];


    if (sizes.length === 0) {

        elements.selectedSizeName.textContent =
            "No sizes";

        return;

    }


    sizes.forEach(
        size => {

            const variant =
                variantsForColour.find(
                    item =>
                        item.size ===
                        size
                );


            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "size-button";


            button.textContent =
                size;


            /* =========================
               OUT OF STOCK
            ========================= */

            if (
                !variant ||
                variant.stock <= 0
            ) {

                button.disabled =
                    true;

                button.classList.add(
                    "out-of-stock"
                );

            }


            button.addEventListener(
                "click",
                () => {

                    if (
                        !variant ||
                        variant.stock <= 0
                    ) {

                        return;

                    }


                    selectedSize =
                        size;


                    elements.selectedSizeName
                        .textContent =
                        size;


                    elements.sizeError
                        .classList
                        .remove(
                            "show"
                        );


                    document
                        .querySelectorAll(
                            ".size-button"
                        )
                        .forEach(
                            item => {

                                item.classList
                                    .remove(
                                        "active"
                                    );

                            }
                        );


                    button.classList.add(
                        "active"
                    );

                }
            );


            elements.sizeOptions
                .appendChild(
                    button
                );

        }
    );

}


/* =========================
   CREATE GALLERY DOTS
========================= */

function renderGalleryDots() {

    elements.galleryDots.innerHTML = "";


    if (
        !product.images ||
        product.images.length === 0
    ) {

        return;

    }


    product.images.forEach(
        (image, index) => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                `gallery-dot${
                    index === 0
                        ? " active"
                        : ""
                }`;


            button.setAttribute(
                "aria-label",
                `Show image ${index + 1}`
            );


            button.addEventListener(
                "click",
                () => {

                    showImage(
                        index
                    );

                }
            );


            elements.galleryDots
                .appendChild(
                    button
                );

        }
    );

}


/* =========================
   DISPLAY IMAGE
========================= */

function showImage(index) {

    if (
        !product ||
        !product.images ||
        product.images.length === 0
    ) {

        elements.productImage.style.display =
            "none";

        elements.imagePlaceholder.style.display =
            "flex";

        return;

    }


    activeImageIndex =
        (
            index +
            product.images.length
        )
        %
        product.images.length;


    elements.productImage.style.opacity =
        "0";

    elements.imagePlaceholder.style.display =
        "none";


    setTimeout(
        () => {

            elements.productImage.src =
                product.images[
                    activeImageIndex
                ];


            elements.productImage.alt =
                `${product.name} - view ${
                    activeImageIndex + 1
                }`;


            elements.productImage.style.opacity =
                "1";

        },
        120
    );


    document
        .querySelectorAll(
            ".gallery-dot"
        )
        .forEach(
            (dot, dotIndex) => {

                dot.classList.toggle(
                    "active",
                    dotIndex ===
                        activeImageIndex
                );

            }
        );

}


/* =========================
   IMAGE ERROR
========================= */

elements.productImage
    .addEventListener(
        "error",
        () => {

            elements.productImage.style.display =
                "none";

            elements.imagePlaceholder.style.display =
                "flex";

        }
    );


elements.productImage
    .addEventListener(
        "load",
        () => {

            elements.productImage.style.display =
                "block";

            elements.imagePlaceholder.style.display =
                "none";

        }
    );


/* =========================
   PREVIOUS IMAGE
========================= */

document
    .getElementById(
        "previousImage"
    )
    .addEventListener(
        "click",
        () => {

            showImage(
                activeImageIndex - 1
            );

        }
    );


/* =========================
   NEXT IMAGE
========================= */

document
    .getElementById(
        "nextImage"
    )
    .addEventListener(
        "click",
        () => {

            showImage(
                activeImageIndex + 1
            );

        }
    );


/* =========================
   DECREASE QUANTITY
========================= */

document
    .getElementById(
        "decreaseQuantity"
    )
    .addEventListener(
        "click",
        () => {

            quantity =
                Math.max(
                    1,
                    quantity - 1
                );


            elements.quantity.textContent =
                quantity;

        }
    );


/* =========================
   INCREASE QUANTITY
========================= */

document
    .getElementById(
        "increaseQuantity"
    )
    .addEventListener(
        "click",
        () => {

            quantity++;

            elements.quantity.textContent =
                quantity;

        }
    );


/* =========================
   ACCORDION
========================= */

document
    .querySelectorAll(
        ".accordion-button"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const item =
                        button.closest(
                            ".accordion-item"
                        );


                    const isOpen =
                        item.classList.toggle(
                            "open"
                        );


                    button.setAttribute(
                        "aria-expanded",
                        String(
                            isOpen
                        )
                    );

                }
            );

        }
    );


/* =========================
   UPDATE PRODUCT FAVOURITE
========================= */

function updateFavouriteButton() {

    const favourites =
        getStoredArray(
            "avviamentoFavourites"
        );


    const isFavourite =
        product &&
        favourites.includes(
            product.id
        );


    elements.favouriteButton
        .classList
        .toggle(
            "active",
            isFavourite
        );


    elements.favouriteButton.innerHTML = `
        <i class="fa-${
            isFavourite
                ? "solid"
                : "regular"
        } fa-heart"></i>
    `;


    elements.favouriteButton.setAttribute(
        "aria-label",
        isFavourite
            ? "Remove from favourites"
            : "Add to favourites"
    );

}


/* =========================
   UPDATE NAVBAR FAVOURITE
========================= */

function updateNavbarFavourite() {

    if (
        !elements.navbarFavourite
    ) {

        return;

    }


    const favourites =
        getStoredArray(
            "avviamentoFavourites"
        );


    const hasFavourites =
        favourites.length > 0;


    const icon =
        elements.navbarFavourite
            .querySelector(
                "i"
            );


    elements.navbarFavourite
        .classList
        .toggle(
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


/* =========================
   FAVOURITE BUTTON
========================= */

elements.favouriteButton
    .addEventListener(
        "click",
        () => {

            if (!product) {

                return;

            }


            const favourites =
                getStoredArray(
                    "avviamentoFavourites"
                );


            const itemIndex =
                favourites.indexOf(
                    product.id
                );


            if (
                itemIndex === -1
            ) {

                favourites.push(
                    product.id
                );


                showToast(
                    `${product.name} added to favourites`
                );

            }

            else {

                favourites.splice(
                    itemIndex,
                    1
                );


                showToast(
                    `${product.name} removed from favourites`
                );

            }


            localStorage.setItem(
                "avviamentoFavourites",
                JSON.stringify(
                    favourites
                )
            );


            updateFavouriteButton();

            updateNavbarFavourite();

        }
    );


/* =========================
   ADD PRODUCT TO CART
========================= */

document
    .getElementById(
        "addToBag"
    )
    .addEventListener(
        "click",
        () => {

            if (!product) {

                return;

            }


            if (!selectedSize) {

                elements.sizeError
                    .classList
                    .add(
                        "show"
                    );


                elements.sizeOptions
                    .scrollIntoView({

                        behavior:
                            "smooth",

                        block:
                            "center"

                    });


                return;

            }


            const selectedVariant =
                product.variants.find(
                    variant =>

                        variant.color ===
                            selectedColour &&

                        variant.size ===
                            selectedSize
                );


            if (
                !selectedVariant ||
                selectedVariant.stock <= 0
            ) {

                showToast(
                    "This size is out of stock"
                );

                return;

            }


            if (
                quantity >
                selectedVariant.stock
            ) {

                showToast(
                    `Only ${selectedVariant.stock} available`
                );

                return;

            }


            const cart =
                getStoredArray(
                    "avviamentoCart"
                );


            const existingItem =
                cart.find(
                    item =>

                        item.id ===
                            product.id &&

                        item.size ===
                            selectedSize &&

                        item.colour ===
                            selectedColour

                );


            if (existingItem) {

                const newQuantity =
                    existingItem.quantity +
                    quantity;


                if (
                    newQuantity >
                    selectedVariant.stock
                ) {

                    showToast(
                        `Only ${selectedVariant.stock} available`
                    );

                    return;

                }


                existingItem.quantity =
                    newQuantity;
existingItem.price = product.currentPrice;
existingItem.originalPrice = product.price;
existingItem.salePrice = product.salePrice;
            }

            else {

                cart.push({

                    id:
                        product.id,

                    name:
                        product.name,
price: product.currentPrice,

originalPrice: product.price,

salePrice: product.salePrice,
                    image:
                        product.images[0] || "",

                    colour:
                        selectedColour,

                    size:
                        selectedSize,

                    quantity:
                        quantity

                });

            }


            localStorage.setItem(
                "avviamentoCart",
                JSON.stringify(
                    cart
                )
            );


            updateCartCount();


            showToast(
                `${quantity} × ${product.name} added to your bag`
            );

        }
    );


/* =========================
   UPDATE CART COUNT
========================= */

function updateCartCount() {

    const cart =
        getStoredArray(
            "avviamentoCart"
        );


    const totalItems =
        cart.reduce(
            (total, item) => {

                return (
                    total +
                    Number(
                        item.quantity || 0
                    )
                );

            },
            0
        );


    elements.cartCount.textContent =
        totalItems;


    elements.cartCount.style.display =
        totalItems > 0
            ? "grid"
            : "none";

}


/* =========================
   TOAST
========================= */

function showToast(message) {

    clearTimeout(
        toastTimer
    );


    elements.toast.textContent =
        message;


    elements.toast
        .classList
        .add(
            "show"
        );


    toastTimer =
        setTimeout(
            () => {

                elements.toast
                    .classList
                    .remove(
                        "show"
                    );

            },
            2600
        );

}


/* =========================
   SIZE GUIDE MODAL
========================= */

function setModal(open) {

    elements.sizeGuideModal
        .classList
        .toggle(
            "open",
            open
        );


    elements.sizeGuideModal
        .setAttribute(
            "aria-hidden",
            String(
                !open
            )
        );


    document.body.style.overflow =
        open
            ? "hidden"
            : "";

}


document
    .getElementById(
        "openSizeGuide"
    )
    .addEventListener(
        "click",
        () => {

            setModal(
                true
            );

        }
    );


document
    .querySelectorAll(
        "[data-close-modal]"
    )
    .forEach(
        element => {

            element.addEventListener(
                "click",
                () => {

                    setModal(
                        false
                    );

                }
            );

        }
    );


/* =========================
   KEYBOARD CONTROLS
========================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Escape"
        ) {

            setModal(
                false
            );

        }


        if (
            event.key ===
            "ArrowLeft"
        ) {

            showImage(
                activeImageIndex - 1
            );

        }


        if (
            event.key ===
            "ArrowRight"
        ) {

            showImage(
                activeImageIndex + 1
            );

        }

    }
);


/* =========================
   MOBILE SWIPE
========================= */

let touchStartX = 0;


const gallery =
    document.querySelector(
        ".product-gallery"
    );


if (gallery) {

    gallery.addEventListener(
        "touchstart",

        event => {

            touchStartX =
                event.changedTouches[0]
                    .clientX;

        },

        {
            passive: true
        }
    );


    gallery.addEventListener(
        "touchend",

        event => {

            const difference =
                event.changedTouches[0]
                    .clientX
                - touchStartX;


            if (
                Math.abs(
                    difference
                ) < 45
            ) {

                return;

            }


            if (
                difference < 0
            ) {

                showImage(
                    activeImageIndex + 1
                );

            }

            else {

                showImage(
                    activeImageIndex - 1
                );

            }

        },

        {
            passive: true
        }
    );

}


/* =========================
   PAGE SHOW
========================= */

window.addEventListener(
    "pageshow",
    () => {

        updateFavouriteButton();

        updateNavbarFavourite();

        updateCartCount();

    }
);


/* =========================
   STORAGE SYNC
========================= */

window.addEventListener(
    "storage",
    event => {

        if (
            event.key ===
            "avviamentoFavourites"
        ) {

            updateFavouriteButton();

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


/* =========================
   START PAGE
========================= */

loadProduct();