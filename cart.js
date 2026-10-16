const CART_KEY = "avviamentoCart";

const FREE_DELIVERY_MINIMUM = 2000;

const DELIVERY_FEE = 100;


const APPLIED_REWARD_KEY = "avviamentoAppliedLoyaltyCode";


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

window.appliedLoyaltyCode = null;

// Restore the applied loyalty code when the cart page opens.
try {
    const savedReward = JSON.parse(
        localStorage.getItem(APPLIED_REWARD_KEY)
    );

    if (
        savedReward &&
        savedReward.code &&
        savedReward.type
    ) {
        window.appliedLoyaltyCode = savedReward;

        if (savedReward.type === "percentage_discount") {
            const percentage = Number(savedReward.value);

            if (percentage >= 0 && percentage <= 100) {
                discountRate = percentage / 100;
            } else {
                window.appliedLoyaltyCode = null;
            }
        }

        if (promoCodeInput) {
            promoCodeInput.value = savedReward.code;
        }
    }
} catch (error) {
    console.error("Could not restore loyalty code:", error);
}



/* =================================
   Get cart from localStorage
================================= */

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



/* =================================
   Save cart
================================= */

function saveCart() {

    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );

}



/* =================================
   Format price
================================= */

function formatPrice(value) {

    return `EGP ${Math.round(value)
        .toLocaleString("en-EG")}`;

}



/* =================================
   Total number of products
================================= */

function getTotalQuantity() {

    return cart.reduce(

        (total, item) => {

            return total +
                Number(item.quantity || 0);

        },

        0
    );

}



/* =================================
   Protect HTML
================================= */

function escapeHtml(value) {

    return String(value ?? "")

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}



/* =================================
   Get stock from Supabase
================================= */

async function getVariantStock(
    productId,
    colour,
    size
) {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("product_variants")
            .select(`
                stock
            `)
            .eq(
                "product_id",
                productId
            )
            .eq(
                "color",
                colour
            )
            .eq(
                "size",
                size
            )
            .maybeSingle();


    if (error) {

        console.error(
            "Error checking stock:",
            error
        );

        return null;

    }


    if (!data) {

        return 0;

    }


    return Number(
        data.stock || 0
    );

}



/* =================================
   Check all cart stock
================================= */

async function validateCartStock() {

    for (
        const item of cart
    ) {

        const stock =
            await getVariantStock(
                item.id,
                item.colour,
                item.size
            );


        if (
            stock === null
        ) {

            continue;

        }


        if (
            stock <= 0
        ) {

            showToast(
                `${item.name} (${item.colour} / ${item.size}) is currently out of stock.`
            );

            return false;

        }


        if (
            Number(item.quantity) >
            stock
        ) {

            item.quantity =
                stock;


            showToast(
                `Only ${stock} of ${item.name} (${item.colour} / ${item.size}) are available.`
            );

            saveCart();

            return false;

        }

    }


    return true;

}



/* =================================
   Display cart
================================= */

async function renderCart() {

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

    if (
        cart.length === 0
    ) {

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


    /* =================================
       Render each cart item
    ================================= */

    cart.forEach(
        (item, index) => {

            const article =
                document.createElement(
                    "article"
                );


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

                    <a
                        href="product-details.html?id=${encodeURIComponent(item.id)}"
                    >

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
    ${
        item.salePrice !== null &&
        item.salePrice !== undefined &&
        Number(item.salePrice) > 0 &&
        Number(item.salePrice) < Number(item.originalPrice)
            ? `
                <del class="original-price">
                    ${formatPrice(
                        Number(item.originalPrice) *
                        Number(item.quantity)
                    )}
                </del>

                <strong class="sale-price">
                    ${formatPrice(
                        Number(item.price) *
                        Number(item.quantity)
                    )}
                </strong>
            `
            : `
                ${formatPrice(
                    Number(item.price) *
                    Number(item.quantity)
                )}
            `
    }
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
<div class="item-total">
    ${
        item.salePrice !== null &&
        item.salePrice !== undefined &&
        Number(item.salePrice) > 0 &&
        Number(item.salePrice) < Number(item.originalPrice)
            ? `
                <del class="original-price">
                    ${formatPrice(
                        Number(item.originalPrice) *
                        Number(item.quantity)
                    )}
                </del>

                <strong class="sale-price">
                    ${formatPrice(
                        Number(item.price) *
                        Number(item.quantity)
                    )}
                </strong>
            `
            : `
                <strong>
                    ${formatPrice(
                        Number(item.price) *
                        Number(item.quantity)
                    )}
                </strong>
            `
    }
</div>

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

        }
    );


    updateSummary();

}



/* =================================
   Calculate prices
================================= */


function updateSummary() {
    const subtotal = cart.reduce((total, item) => {
        return total + Number(item.price) * Number(item.quantity);
    }, 0);

    const appliedCode = window.appliedLoyaltyCode;

    // Calculate percentage discount
    const discount = subtotal * discountRate;

    // Calculate delivery fee
    let delivery = subtotal >= FREE_DELIVERY_MINIMUM
        ? 0
        : DELIVERY_FEE;

    // Apply free shipping reward
    if (
        appliedCode &&
        appliedCode.type === "free_shipping"
    ) {
        delivery = 0;
    }

    const total = Math.max(0, subtotal - discount) + delivery;

    subtotalElement.textContent = formatPrice(subtotal);

    deliveryElement.textContent = delivery === 0
        ? "Free"
        : formatPrice(delivery);

    totalElement.textContent = formatPrice(total);

    if (
        appliedCode &&
        appliedCode.type === "free_shipping"
    ) {
        deliveryNote.textContent =
            "Free shipping reward applied.";
    } else if (delivery === 0) {
        deliveryNote.textContent =
            "You have unlocked complimentary delivery.";
    } else {
        const remaining = FREE_DELIVERY_MINIMUM - subtotal;

        deliveryNote.textContent =
            `Add ${formatPrice(remaining)} more for free delivery.`;
    }
}




/* =================================
   Quantity and remove buttons
================================= */

cartItemsContainer.addEventListener(
    "click",

    async event => {

        const button =
            event.target.closest(
                "button[data-action]"
            );


        if (!button) {

            return;

        }


        const index =
            Number(
                button.dataset.index
            );


        const action =
            button.dataset.action;


        if (
            !cart[index]
        ) {

            return;

        }



        /* =================================
           Increase quantity
        ================================= */

        if (
            action === "increase"
        ) {

            const item =
                cart[index];


            const stock =
                await getVariantStock(
                    item.id,
                    item.colour,
                    item.size
                );


            if (
                stock === null
            ) {

                showToast(
                    "Unable to check stock right now."
                );

                return;

            }


            const currentQuantity =
                Number(
                    item.quantity
                );


            if (
                stock <= 0
            ) {

                showToast(
                    `${item.name} is currently out of stock.`
                );

                return;

            }


            if (
                currentQuantity >=
                stock
            ) {

                showToast(
                    `Only ${stock} available for ${item.name}.`
                );

                return;

            }


            item.quantity =
                currentQuantity + 1;

        }



        /* =================================
           Decrease quantity
        ================================= */

        if (
            action === "decrease"
        ) {

            cart[index].quantity =
                Math.max(

                    1,

                    Number(
                        cart[index].quantity
                    ) - 1

                );

        }



        /* =================================
           Remove product
        ================================= */

        if (
            action === "remove"
        ) {

            const removedName =
                cart[index].name;


            cart.splice(
                index,
                1
            );


            showToast(
                `${removedName} removed from your bag`
            );

        }


        saveCart();


        await renderCart();

    }
);



/* =================================
   Apply promo code
================================= */


/* Apply promo code */

document
    .getElementById("applyPromo")
    .addEventListener("click", async () => {
        const enteredCode = promoCodeInput.value
            .trim()
            .toUpperCase();

        promoMessage.className = "promo-message";

        // A cart/order can have only ONE loyalty promo code.
        // Remove the previously applied code before checking a replacement.
        discountRate = 0;
        window.appliedLoyaltyCode = null;
        localStorage.removeItem(APPLIED_REWARD_KEY);
        updateSummary();

        if (!enteredCode) {
            promoMessage.textContent = "Please enter a promo code.";
            promoMessage.classList.add("error");
            updateSummary();
            return;
        }

        const applyButton = document.getElementById("applyPromo");
        applyButton.disabled = true;
        applyButton.textContent = "CHECKING...";

        try {
            const { data, error } = await supabaseClient.rpc(
                "validate_loyalty_discount_code",
                { p_discount_code: enteredCode }
            );

            if (error) throw error;

            if (!data || data.length === 0 || !data[0].valid) {
                discountRate = 0;
                window.appliedLoyaltyCode = null;
                localStorage.removeItem(APPLIED_REWARD_KEY);

                promoMessage.textContent =
                    "Invalid, expired, or already used code.";
                promoMessage.classList.add("error");
                updateSummary();
                return;
            }

            const reward = data[0];

            if (reward.reward_type === "percentage_discount") {
                discountRate = Number(reward.reward_value) / 100;

                promoMessage.textContent =
                    `${reward.reward_value}% discount applied.`;
            } else if (reward.reward_type === "free_shipping") {
                discountRate = 0;

                // Free shipping is handled separately below.
                window.appliedLoyaltyCode = {
                    code: reward.discount_code,
                    type: reward.reward_type,
                    value: Number(reward.reward_value)
                };

                promoMessage.textContent = "Free shipping applied.";
            } else {
                discountRate = 0;
                promoMessage.textContent =
                    "This reward type is not supported yet.";
                promoMessage.classList.add("error");
                updateSummary();
                return;
            }

            window.appliedLoyaltyCode = {
                
                code: reward.discount_code,
                type: reward.reward_type,
                value: Number(reward.reward_value)
                
            };
            localStorage.setItem(
    APPLIED_REWARD_KEY,
    JSON.stringify(window.appliedLoyaltyCode)
);
        

            promoMessage.classList.add("success");
            updateSummary();

        } catch (error) {
            console.error("Promo validation error:", error);

            discountRate = 0;
            window.appliedLoyaltyCode = null;
            localStorage.removeItem(APPLIED_REWARD_KEY);
            updateSummary();

            promoMessage.textContent =
                "Unable to validate the code. Please try again.";
            promoMessage.classList.add("error");
        } finally {
            applyButton.disabled = false;
            applyButton.textContent = "APPLY";
        }
    });


/* =================================
   Checkout protection
================================= */

checkoutButton.addEventListener(
    "click",

    async event => {

        if (
            cart.length === 0
        ) {

            event.preventDefault();


            showToast(
                "Your bag is empty"
            );


            return;

        }


        /*
           Check real stock before
           going to checkout.
        */

        const stockValid =
            await validateCartStock();


        if (
            !stockValid
        ) {

            event.preventDefault();


            await renderCart();

        }

    }
);



/* =================================
   Show notification
================================= */

function showToast(
    message
) {

    clearTimeout(
        toastTimer
    );


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2400
        );

}



/* =================================
   Start cart
================================= */

renderCart();