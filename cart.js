const CART_KEY = "avviamentoCart";

const FREE_DELIVERY_MINIMUM = 2000;

const DELIVERY_FEE = 100;



const cartItemsContainer =
    document.getElementById("cartItems");


const cartLayout =
    document.getElementById("cartLayout");


const emptyCart =
    document.getElementById("emptyCart");


const itemCountText =
    document.getElementById("itemCountText");


const bagSubtitle =
    document.getElementById("bagSubtitle");


const cartCount =
    document.getElementById("cartCount");


const subtotalElement =
    document.getElementById("subtotal");


const deliveryElement =
    document.getElementById("delivery");


const deliveryNote =
    document.getElementById("deliveryNote");


const totalElement =
    document.getElementById("total");


const promoCodeInput =
    document.getElementById("promoCode");


const promoMessage =
    document.getElementById("promoMessage");


const checkoutButton =
    document.getElementById("checkoutButton");


const toast =
    document.getElementById("toast");



let cart = getCart();

let discountRate = 0;

let toastTimer;



/* Get cart from localStorage */

function getCart() {

    try {

        const savedCart =
            JSON.parse(
                localStorage.getItem(CART_KEY)
            );


        return Array.isArray(savedCart)
            ? savedCart
            : [];

    }

    catch (error) {

        return [];

    }

}



/* Save cart */

function saveCart() {

    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );

}



/* Format price */

function formatPrice(value) {

    return `EGP ${Math.round(value)
        .toLocaleString("en-EG")}`;

}



/* Total number of products */

function getTotalQuantity() {

    return cart.reduce(

        (total, item) => {

            return total +
                Number(item.quantity || 0);

        },

        0
    );

}



/* Protect HTML */

function escapeHtml(value) {

    return String(value ?? "")

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}



/* Display cart */

function renderCart() {

    const totalQuantity =
        getTotalQuantity();


    cartCount.textContent =
        totalQuantity;


    cartCount.style.display =
        totalQuantity > 0
            ? "grid"
            : "none";


    itemCountText.textContent =
        `${totalQuantity} ${
            totalQuantity === 1
                ? "item"
                : "items"
        }`;


    bagSubtitle.textContent =
        totalQuantity > 0

            ? `${totalQuantity} ${
                totalQuantity === 1
                    ? "piece"
                    : "pieces"
            } selected for your wardrobe.`

            : "Your selected pieces will appear here.";



    /* Empty cart */

    if (cart.length === 0) {

        cartLayout.style.display =
            "none";


        emptyCart.classList.add(
            "show"
        );


        return;

    }


    cartLayout.style.display =
        "grid";


    emptyCart.classList.remove(
        "show"
    );


    cartItemsContainer.innerHTML =
        "";



    cart.forEach((item, index) => {

        const article =
            document.createElement("article");


        article.className =
            "cart-item";


        article.innerHTML = `

            <a
                class="item-image"
                href="product-details.html?id=${encodeURIComponent(item.id)}"
            >

                <img
                    src="${escapeHtml(item.image)}"
                    alt="${escapeHtml(item.name)}"
                >

            </a>


            <div class="item-info">

                <a href="product-details.html?id=${encodeURIComponent(item.id)}">

                    <h3>
                        ${escapeHtml(item.name)}
                    </h3>

                </a>


                <p class="item-variant">

                    Colour:
                    ${escapeHtml(item.colour)}

                </p>


                <p class="item-variant">

                    Size:
                    ${escapeHtml(item.size)}

                </p>


                <p class="item-price-mobile">

                    ${formatPrice(
                        item.price *
                        item.quantity
                    )}

                </p>


                <div
                    class="quantity-control"
                    aria-label="Quantity for ${escapeHtml(item.name)}"
                >

                    <button
                        type="button"
                        data-action="decrease"
                        data-index="${index}"
                        aria-label="Decrease quantity"
                    >
                        −
                    </button>


                    <span>
                        ${Number(item.quantity)}
                    </span>


                    <button
                        type="button"
                        data-action="increase"
                        data-index="${index}"
                        aria-label="Increase quantity"
                    >
                        +
                    </button>

                </div>

            </div>


            <div class="item-side">

                <p class="item-total">

                    ${formatPrice(
                        item.price *
                        item.quantity
                    )}

                </p>


                <button
                    class="remove-item"
                    type="button"
                    data-action="remove"
                    data-index="${index}"
                >
                    Remove
                </button>

            </div>
        `;


        cartItemsContainer.appendChild(
            article
        );

    });


    updateSummary();

}



/* Calculate prices */

function updateSummary() {

    const subtotal =
        cart.reduce(

            (total, item) => {

                return total +
                    Number(item.price) *
                    Number(item.quantity);

            },

            0
        );


    const discount =
        subtotal * discountRate;


    const delivery =
        subtotal >= FREE_DELIVERY_MINIMUM
            ? 0
            : DELIVERY_FEE;


    const total =
        subtotal - discount + delivery;


    subtotalElement.textContent =
        formatPrice(subtotal);


    deliveryElement.textContent =
        delivery === 0
            ? "Free"
            : formatPrice(delivery);


    totalElement.textContent =
        formatPrice(total);



    if (delivery === 0) {

        deliveryNote.textContent =
            "You have unlocked complimentary delivery.";

    }

    else {

        const remaining =
            FREE_DELIVERY_MINIMUM -
            subtotal;


        deliveryNote.textContent =
            `Add ${formatPrice(remaining)} more for free delivery.`;

    }

}



/* Quantity and remove buttons */

cartItemsContainer.addEventListener(
    "click",

    event => {

        const button =
            event.target.closest(
                "button[data-action]"
            );


        if (!button) {

            return;

        }


        const index =
            Number(button.dataset.index);


        const action =
            button.dataset.action;


        if (!cart[index]) {

            return;

        }



        /* Increase quantity */

        if (action === "increase") {

            cart[index].quantity =
                Number(
                    cart[index].quantity
                ) + 1;

        }



        /* Decrease quantity */

        if (action === "decrease") {

            cart[index].quantity =
                Math.max(

                    1,

                    Number(
                        cart[index].quantity
                    ) - 1

                );

        }



        /* Remove product */

        if (action === "remove") {

            const removedName =
                cart[index].name;


            cart.splice(index, 1);


            showToast(
                `${removedName} removed from your bag`
            );

        }


        saveCart();

        renderCart();

    }
);



/* Apply promo code */

document
    .getElementById("applyPromo")
    .addEventListener("click", () => {

        const enteredCode =
            promoCodeInput
                .value
                .trim()
                .toUpperCase();


        promoMessage.className =
            "promo-message";



        /*
        Test promo code:
        AVVIAMENTO10
        */

        if (
            enteredCode ===
            "AVVIAMENTO10"
        ) {

            discountRate = 0.10;


            promoMessage.textContent =
                "10% discount applied.";


            promoMessage.classList.add(
                "success"
            );


            updateSummary();


            return;

        }



        discountRate = 0;


        promoMessage.textContent =
            enteredCode

                ? "This promo code is not valid."

                : "Please enter a promo code.";


        promoMessage.classList.add(
            "error"
        );


        updateSummary();

    });



/* Checkout protection */

checkoutButton.addEventListener(
    "click",

    event => {

        if (cart.length === 0) {

            event.preventDefault();


            showToast(
                "Your bag is empty"
            );

        }

    }
);



/* Show notification */

function showToast(message) {

    clearTimeout(toastTimer);


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    toastTimer =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 2400);

}



/* Start cart */

renderCart();