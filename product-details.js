const products = {
    "1": {
        id: 1,
        name: "Linen Shirt",
        price: 1450,

        description:
            "A modern essential, crafted from breathable European linen for effortless refinement.",

        details:
            "Relaxed fit with a soft spread collar, button fastening and curved hem. Designed for an easy, polished silhouette.",

        care:
            "100% linen. Machine wash cold with similar colours. Do not bleach. Warm iron when needed.",

        images: [
            "images/henley.jpg"
        ],

        colours: [
            { name: "Ivory", value: "#eee9dc" },
            { name: "Sand", value: "#cbbda4" },
            { name: "Navy", value: "#132a44" },
            { name: "Black", value: "#222522" }
        ],

        sizes: ["S", "M", "L", "XL"]
    },


    "2": {
        id: 2,
        name: "Piqué Polo",
        price: 1250,

        description:
            "A refined piqué polo with a clean collar and a comfortable modern fit.",

        details:
            "Regular fit, two-button placket and neatly finished sleeves for an elevated everyday look.",

        care:
            "100% premium cotton. Machine wash cold. Wash dark colours separately. Do not tumble dry.",

        images: [
            "images/knitted.jpg"
        ],

        colours: [
            { name: "Navy", value: "#132a44" },
            { name: "Ivory", value: "#eee9dc" },
            { name: "Petrol", value: "#032d37" }
        ],

        sizes: ["S", "M", "L", "XL"]
    },


    "3": {
        id: 3,
        name: "Tailored Trousers",
        price: 1650,

        description:
            "Clean-cut tailored trousers designed to move effortlessly from day to evening.",

        details:
            "Straight leg, front pleats, side pockets and a concealed hook-and-zip fastening.",

        care:
            "Viscose blend. Gentle wash at 30°C or dry clean. Cool iron on reverse.",

        images: [
            "images/trousers.jpg"
        ],

        colours: [
            { name: "Stone", value: "#c9bea9" },
            { name: "Black", value: "#222522" },
            { name: "Charcoal", value: "#4b4d4b" }
        ],

        sizes: ["30", "32", "34", "36", "38"]
    },


    "4": {
        id: 4,
        name: "Overshirt",
        price: 1750,

        description:
            "A versatile structured layer with a relaxed fit and understated utility details.",

        details:
            "Point collar, button fastening, chest pockets and adjustable button cuffs.",

        care:
            "Cotton twill. Machine wash cold. Do not bleach. Hang to dry.",

        images: [
            "images/overshirt.jpg"
        ],

        colours: [
            { name: "Black", value: "#222522" },
            { name: "Olive", value: "#565b47" },
            { name: "Stone", value: "#c9bea9" }
        ],

        sizes: ["S", "M", "L", "XL"]
    }
};



/* Get product ID from URL */

const params =
    new URLSearchParams(
        window.location.search
    );

const requestedId =
    params.get("id") || "1";

const product =
    products[requestedId] ||
    products["1"];



/* Current product selections */

let activeImageIndex = 0;

let selectedColour =
    product.colours[0].name;

let selectedSize = null;

let quantity = 1;

let toastTimer;



/* HTML elements */

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



/* Format price */

function formatPrice(price) {

    return `EGP ${price.toLocaleString("en-EG")}`;

}



/* Get array from localStorage */

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



/* Show product information */

function renderProduct() {

    document.title =
        `${product.name} | Avviamento`;


    elements.productName.textContent =
        product.name;


    elements.productPrice.textContent =
        formatPrice(
            product.price
        );


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



/* Create colour buttons */

function renderColours() {

    elements.colourOptions.innerHTML = "";


    product.colours.forEach(
        (colour, index) => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                `colour-button${index === 0 ? " active" : ""}`;


            button.setAttribute(
                "aria-label",
                colour.name
            );


            button.title =
                colour.name;


            button.innerHTML = `
                <span
                    style="background-color: ${colour.value}">
                </span>
            `;


            button.addEventListener(
                "click",
                () => {

                    selectedColour =
                        colour.name;


                    elements.selectedColourName.textContent =
                        selectedColour;


                    document
                        .querySelectorAll(
                            ".colour-button"
                        )
                        .forEach(item => {

                            item.classList.remove(
                                "active"
                            );

                        });


                    button.classList.add(
                        "active"
                    );

                }
            );


            elements.colourOptions
                .appendChild(
                    button
                );

        }
    );

}



/* Create size buttons */

function renderSizes() {

    elements.sizeOptions.innerHTML = "";


    product.sizes.forEach(
        size => {

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


            button.addEventListener(
                "click",
                () => {

                    selectedSize =
                        size;


                    elements.selectedSizeName.textContent =
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
                        .forEach(item => {

                            item.classList.remove(
                                "active"
                            );

                        });


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



/* Create gallery dots */

function renderGalleryDots() {

    elements.galleryDots.innerHTML = "";


    product.images.forEach(
        (image, index) => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                `gallery-dot${index === 0 ? " active" : ""}`;


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



/* Display selected image */

function showImage(index) {

    activeImageIndex =
        (
            index +
            product.images.length
        )
        % product.images.length;


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
                `${product.name} - view ${activeImageIndex + 1}`;


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



/* If image is missing */

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



/* Previous image */

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



/* Next image */

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



/* Decrease quantity */

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



/* Increase quantity */

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



/* Accordion sections */

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



/* Update product favourite icon */

function updateFavouriteButton() {

    const favourites =
        getStoredArray(
            "avviamentoFavourites"
        );


    const isFavourite =
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
        <i class="fa-${isFavourite ? "solid" : "regular"} fa-heart"></i>
    `;


    elements.favouriteButton.setAttribute(
        "aria-label",
        isFavourite
            ? "Remove from favourites"
            : "Add to favourites"
    );

}



/* Update navbar favourite icon */

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



/* Favourite button */

elements.favouriteButton
    .addEventListener(
        "click",
        () => {

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



/* Add product to cart */

document
    .getElementById(
        "addToBag"
    )
    .addEventListener(
        "click",
        () => {

            if (
                !selectedSize
            ) {

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


            if (
                existingItem
            ) {

                existingItem.quantity +=
                    quantity;

            }

            else {

                cart.push({

                    id:
                        product.id,

                    name:
                        product.name,

                    price:
                        product.price,

                    image:
                        product.images[0],

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



/* Update cart number */

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



/* Notification message */

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



/* Open and close size guide */

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



/* Keyboard controls */

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



/* Mobile swipe */

let touchStartX = 0;

const gallery =
    document.querySelector(
        ".product-gallery"
    );


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



/* Refresh favourite state when returning to page */

window.addEventListener(
    "pageshow",
    () => {

        updateFavouriteButton();

        updateNavbarFavourite();

        updateCartCount();

    }
);



/* Sync if localStorage changes */

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



/* Start page */

renderProduct();