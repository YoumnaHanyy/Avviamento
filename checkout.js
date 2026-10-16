const CART_KEY = "avviamentoCart";

const ORDER_KEY = "avviamentoLastOrder";

const CHECKOUT_TOKEN_KEY = "avviamentoCheckoutToken";

const FREE_DELIVERY_MINIMUM = 2000;

const STANDARD_DELIVERY_FEE = 100;

const EXPRESS_DELIVERY_FEE = 175;


const APPLIED_REWARD_KEY = "avviamentoAppliedLoyaltyCode";

let appliedDiscountCode = null;

try {
    appliedDiscountCode = JSON.parse(
        localStorage.getItem(APPLIED_REWARD_KEY)
    );
} catch (error) {
    appliedDiscountCode = null;
}

/* HTML Elements */

const checkoutForm =
    document.getElementById("checkoutForm");

const checkoutLayout =
    document.getElementById("checkoutLayout");

const emptyCheckout =
    document.getElementById("emptyCheckout");

const summaryProducts =
    document.getElementById("summaryProducts");

const subtotalElement =
    document.getElementById("subtotal");

const deliveryElement =
    document.getElementById("delivery");

const totalElement =
    document.getElementById("total");

const standardDeliveryPrice =
    document.getElementById(
        "standardDeliveryPrice"
    );

const terms =
    document.getElementById("terms");

const termsError =
    document.getElementById("termsError");

const placeOrderButton =
    document.getElementById(
        "placeOrderButton"
    );

const paymentDisclaimer =
    document.getElementById(
        "paymentDisclaimer"
    );

const orderModal =
    document.getElementById("orderModal");


/* Get shopping cart */

let cart = getCart();


function getCart() {

    try {

        const storedCart =
            JSON.parse(
                localStorage.getItem(CART_KEY)
            );

        return Array.isArray(storedCart)
            ? storedCart
            : [];

    }

    catch (error) {

        console.error(
            "Cart loading error:",
            error
        );

        return [];

    }

}


/* Get checkout token */

function getCheckoutToken() {

    let token =
        localStorage.getItem(
            CHECKOUT_TOKEN_KEY
        );


    if (!token) {

        token =
            crypto.randomUUID();

        localStorage.setItem(
            CHECKOUT_TOKEN_KEY,
            token
        );

    }


    return token;

}


/* Format price */

function formatPrice(value) {

    return `EGP ${Math
        .round(value)
        .toLocaleString("en-EG")}`;

}


/* Protect displayed HTML */

function escapeHtml(value) {

    return String(value ?? "")

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}


/* Calculate subtotal */

function getSubtotal() {

    return cart.reduce(

        (sum, item) => {

            return sum
                + Number(item.price)
                * Number(item.quantity);

        },

        0
    );

}


/* Get selected delivery method */

function getSelectedDelivery() {

    const selectedDelivery =
        checkoutForm.querySelector(
            'input[name="deliveryMethod"]:checked'
        );

    return selectedDelivery
        ? selectedDelivery.value
        : "standard";

}


/* Calculate delivery fees */

function getDeliveryFee() {

    const subtotal =
        getSubtotal();

    const deliveryMethod =
        getSelectedDelivery();


    if (
        deliveryMethod === "express"
    ) {

        return EXPRESS_DELIVERY_FEE;

    }


    if (
        subtotal >=
        FREE_DELIVERY_MINIMUM
    ) {

        return 0;

    }


    return STANDARD_DELIVERY_FEE;

}


/* Display order products */

function renderOrder() {

    if (cart.length === 0) {

        checkoutLayout.style.display =
            "none";

        emptyCheckout.classList.add(
            "show"
        );

        return;

    }


    checkoutLayout.style.display =
        "grid";

    emptyCheckout.classList.remove(
        "show"
    );


    summaryProducts.innerHTML =
        "";


    cart.forEach(item => {

        const product =
            document.createElement(
                "article"
            );


        product.className =
            "summary-product";


        product.innerHTML = `

            <div class="summary-image">

                <img
                    src="${escapeHtml(item.image)}"
                    alt="${escapeHtml(item.name)}"
                >

                <span class="summary-quantity">

                    ${Number(item.quantity)}

                </span>

            </div>


            <div class="summary-info">

                <h3>

                    ${escapeHtml(item.name)}

                </h3>


                <p>

                    Colour:
                    ${escapeHtml(item.colour)}

                </p>


                <p>

                    Size:
                    ${escapeHtml(item.size)}

                </p>

            </div>


<div class="summary-product-price">

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
        `;


        summaryProducts.appendChild(
            product
        );

    });


    updateTotals();

}


/* Update prices */


function updateTotals() {
    const subtotal = getSubtotal();
    const appliedCode = appliedDiscountCode;

    // Calculate loyalty percentage discount
    let discount = 0;

    if (
        appliedCode &&
        appliedCode.type === "percentage_discount"
    ) {
        const percentage = Number(appliedCode.value);

        if (percentage >= 0 && percentage <= 100) {
            discount = subtotal * percentage / 100;
        }
    }

    // Calculate delivery fee
    let delivery = getDeliveryFee();

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

    if (subtotal >= FREE_DELIVERY_MINIMUM) {
        standardDeliveryPrice.textContent = "Free";
    } else {
        standardDeliveryPrice.textContent =
            formatPrice(STANDARD_DELIVERY_FEE);
    }
}



/* Delivery and payment cards */

document
    .querySelectorAll(
        '.choice-card input[type="radio"]'
    )
    .forEach(input => {

        input.addEventListener(
            "change",

            () => {

                const radioName =
                    input.name;


                document
                    .querySelectorAll(
                        `input[name="${radioName}"]`
                    )
                    .forEach(radio => {

                        const card =
                            radio.closest(
                                ".choice-card"
                            );


                        if (card) {

                            card.classList.toggle(
                                "selected",
                                radio.checked
                            );

                        }

                    });


                if (
                    radioName ===
                    "deliveryMethod"
                ) {

                    updateTotals();

                }


                if (
                    radioName ===
                    "paymentMethod"
                ) {

                    paymentDisclaimer
                        .classList
                        .toggle(

                            "show",

                            input.value ===
                            "card"

                        );

                }

            }
        );

    });


/* Validate input */

function validateField(input) {

    const field =
        input.closest(".field");


    if (!field) {

        return true;

    }


    let isValid =
        input.checkValidity();


    if (input.id === "phone") {

        let digits =
            input.value.replace(
                /\D/g,
                ""
            );


        if (
            digits.startsWith("20")
            && digits.length === 12
        ) {

            digits =
                digits.substring(2);

        }


        if (
            digits.startsWith("0")
            && digits.length === 11
        ) {

            digits =
                digits.substring(1);

        }


        isValid =
            /^(10|11|12|15)\d{8}$/
                .test(digits);

    }


    field.classList.toggle(
        "invalid",
        !isValid
    );


    return isValid;

}


/* Validate fields while typing */

checkoutForm
    .querySelectorAll(
        "input, select, textarea"
    )
    .forEach(input => {

        if (
            input.type === "radio"
            || input.type === "checkbox"
        ) {

            return;

        }


        input.addEventListener(
            "blur",

            () => {

                validateField(input);

            }
        );


        input.addEventListener(
            "input",

            () => {

                const field =
                    input.closest(".field");


                if (
                    field
                    && field.classList.contains(
                        "invalid"
                    )
                ) {

                    validateField(input);

                }

            }
        );


        input.addEventListener(
            "change",

            () => {

                validateField(input);

            }
        );

    });


/* Terms checkbox */

terms.addEventListener(
    "change",

    () => {

        termsError.classList.toggle(
            "show",
            !terms.checked
        );

    }
);


/* Check stock before placing order */

async function validateCartStock() {

    try {

        for (
            const item of cart
        ) {

            const {
                data,
                error
            } =
                await supabaseClient
                    .from("product_variants")
                    .select(
                        "stock"
                    )
                    .eq(
                        "product_id",
                        item.id
                    )
                    .eq(
                        "color",
                        item.colour
                    )
                    .eq(
                        "size",
                        item.size
                    )
                    .maybeSingle();


            if (error) {

                console.error(
                    "Stock check error:",
                    error
                );

                return {
                    valid: false,
                    message:
                        "We couldn't check product availability right now. Please check your internet connection and try again."
                };

            }


            if (!data) {

                return {
                    valid: false,
                    message:
                        `${item.name} (${item.colour} / ${item.size}) is no longer available.`
                };

            }


            if (
                Number(data.stock) <= 0
            ) {

                return {
                    valid: false,
                    message:
                        `${item.name} (${item.colour} / ${item.size}) is currently out of stock.`
                };

            }


            if (
                Number(item.quantity)
                > Number(data.stock)
            ) {

                return {
                    valid: false,
                    message:
                        `Only ${data.stock} of ${item.name} (${item.colour} / ${item.size}) are available.`
                };

            }

        }


        return {
            valid: true,
            message: ""
        };

    }

    catch (error) {

        console.error(
            "Unexpected stock validation error:",
            error
        );

        return {
            valid: false,
            message:
                "We couldn't connect to the store right now. Please check your internet connection and try again."
        };

    }

}


/* Create order using Supabase function */

async function createGuestOrder(
    formData,
    subtotal,
    deliveryFee,
    total
) {

    try {

        const result =
            await supabaseClient.rpc(
                "create_guest_order",
                {

                    p_checkout_token:
                        getCheckoutToken(),
                        p_discount_code: appliedDiscountCode?.code || null,

                    p_email:
                        formData.get(
                            "email"
                        ),

                    p_payment_method:
                        formData.get(
                            "paymentMethod"
                        ),

                    p_subtotal:
                        subtotal,

                    p_shipping_cost:
                        deliveryFee,

                    p_total:
                        total,

                    p_full_name:
                        `${formData.get("firstName")} ${formData.get("lastName")}`,

                    p_phone:
                        formatPhone(
                            formData.get("phone")
                        ),

                    p_address:
                        `${formData.get("street")}, Building ${formData.get("building")}, Apartment ${formData.get("apartment")}`,

                    p_city:
                        `${formData.get("governorate")}, ${formData.get("city")}`,

                    p_notes:
                        formData.get("notes"),

                   
p_items: cart


                }
            );


        return result;

    }

    catch (error) {

        console.error(
            "Unexpected order creation error:",
            error
        );

        return {
            data: null,
            error
        };

    }

}


/* Format phone */

function formatPhone(
    phoneValue
) {

    let phoneDigits =
        String(
            phoneValue
        )
        .replace(
            /\D/g,
            ""
        );


    if (
        phoneDigits.startsWith("20")
        && phoneDigits.length === 12
    ) {

        phoneDigits =
            phoneDigits.substring(2);

    }


    if (
        phoneDigits.startsWith("0")
    ) {

        phoneDigits =
            phoneDigits.substring(1);

    }


    return `+20${phoneDigits}`;

}


/* Reset Place Order button */

function resetPlaceOrderButton() {

    placeOrderButton.disabled =
        false;


    placeOrderButton.innerHTML = `

        <span>
            Place Order
        </span>

        <i class="fa-solid fa-arrow-right"></i>

    `;

}


/* Place order */

checkoutForm.addEventListener(

    "submit",

    async event => {

        event.preventDefault();


        if (cart.length === 0) {

            return;

        }


        /* Prevent double submission */

        if (
            placeOrderButton.disabled
        ) {

            return;

        }


        /* Required fields */

        const requiredFields = [

            ...checkoutForm
                .querySelectorAll(
                    ".field input[required], .field select[required]"
                )

        ];


        const validationResults =
            requiredFields.map(
                input => validateField(input)
            );


        const fieldsValid =
            validationResults.every(
                result => result === true
            );


        const termsValid =
            terms.checked;


        termsError.classList.toggle(
            "show",
            !termsValid
        );


        if (
            !fieldsValid
            || !termsValid
        ) {

            const firstError =
                checkoutForm.querySelector(
                    ".field.invalid, .terms-error.show"
                );


            if (firstError) {

                firstError.scrollIntoView({

                    behavior: "smooth",

                    block: "center"

                });

            }


            return;

        }


        /* Final stock check */

        const stockResult =
            await validateCartStock();


        if (!stockResult.valid) {

            alert(
                stockResult.message
            );

            return;

        }


        /* Read form */

        const formData =
            new FormData(
                checkoutForm
            );


       
const subtotal = getSubtotal();

let deliveryFee = getDeliveryFee();
let discount = 0;

if (
    appliedDiscountCode &&
    appliedDiscountCode.type === "percentage_discount"
) {
    const percentage = Number(appliedDiscountCode.value);

    if (percentage >= 0 && percentage <= 100) {
        discount = subtotal * percentage / 100;
    }
}

if (
    appliedDiscountCode &&
    appliedDiscountCode.type === "free_shipping"
) {
    deliveryFee = 0;
}


const total = Math.max(0, subtotal - discount) + deliveryFee;


        /* Disable button */

        placeOrderButton.disabled =
            true;


        placeOrderButton.innerHTML = `

            <i class="fa-solid fa-spinner fa-spin"></i>

            <span>
                Processing
            </span>

        `;


        try {

            /* Create order */

            const {
                data: orderId,
                error: orderError
            } =
                await createGuestOrder(
                    formData,
                    subtotal,
                    deliveryFee,
                    total
                );


            /* Handle order error */

            if (orderError) {

                console.error(
                    "Order creation error:",
                    orderError
                );


                const errorMessage =
                    String(
                        orderError.message
                        || orderError.details
                        || ""
                    ).toLowerCase();


                if (
                    errorMessage.includes("not enough stock")
                    || errorMessage.includes("insufficient stock")
                    || errorMessage.includes("requested quantity")
                ) {

                    alert(
                        "Sorry, the requested quantity is no longer available. Please return to your bag and update the quantity."
                    );

                }

                else if (
                    errorMessage.includes("invalid, unavailable, or already-used loyalty code")
                    || errorMessage.includes("already used")
                    || errorMessage.includes("already-used")
                    || errorMessage.includes("invalid loyalty code")
                ) {
                    // Keep the code available if the order failed; remove it from this cart
                    // so the customer can enter a different valid code.
                    appliedDiscountCode = null;
                    localStorage.removeItem(APPLIED_REWARD_KEY);
                    updateTotals();
                    alert("This promo code is invalid or has already been used. Please apply another code.");
                }

                else if (
                    errorMessage.includes(
                        "variant not found"
                    )
                ) {

                    alert(
                        "Sorry, one of the selected product variants is no longer available. Please return to your bag and choose another option."
                    );

                }

                else if (
                    errorMessage.includes(
                        "checkout_token"
                    )
                ) {

                    alert(
                        "This checkout session is no longer valid. Please return to your bag and start checkout again."
                    );

                }

                else {

                    alert(
                        "We couldn't place your order right now. Please check your internet connection and try again."
                    );

                }


                resetPlaceOrderButton();

                return;

            }


            /* Create order number */

            const orderNumber =
                `AV${String(
                    orderId
                ).padStart(
                    6,
                    "0"
                )}`;


            /* Send order confirmation email */

            let emailFailed =
                false;


            try {

                const {
                    data: emailResult,
                    error: emailError
                } =
                    await supabaseClient.functions.invoke(
                        "hyper-worker",
                        {
                            body: {

                                email:
                                    formData.get(
                                        "email"
                                    ),

                                customerName:
                                    `${formData.get("firstName")} ${formData.get("lastName")}`,

                                orderNumber:
                                    orderNumber,

                                total:
                                    total,

                                items:
                                    cart,

                                subtotal:
                                    subtotal,

                                deliveryFee:
                                    deliveryFee,

                                deliveryMethod:
                                    formData.get(
                                        "deliveryMethod"
                                    ),

                                paymentMethod:
                                    formData.get(
                                        "paymentMethod"
                                    ),

                                phone:
                                    formatPhone(
                                        formData.get(
                                            "phone"
                                        )
                                    ),

                                address: {

                                    governorate:
                                        formData.get(
                                            "governorate"
                                        ),

                                    city:
                                        formData.get(
                                            "city"
                                        ),

                                    street:
                                        formData.get(
                                            "street"
                                        ),

                                    building:
                                        formData.get(
                                            "building"
                                        ),

                                    apartment:
                                        formData.get(
                                            "apartment"
                                        ),

                                    notes:
                                        formData.get(
                                            "notes"
                                        )

                                }

                            }
                        }
                    );


                if (emailError) {

                    emailFailed =
                        true;


                    console.error(
                        "Email sending error:",
                        emailError
                    );

                }

                else {

                    console.log(
                        "Confirmation email sent:",
                        emailResult
                    );

                }

            }

            catch (emailError) {

                emailFailed =
                    true;


                console.error(
                    "Unexpected email error:",
                    emailError
                );

            }


            /* Save last order locally */

            localStorage.setItem(

                ORDER_KEY,

                JSON.stringify({

                    orderNumber:
                        orderNumber,

                    orderId:
                        orderId,

                    createdAt:
                        new Date()
                            .toISOString(),

                    customer: {

                        email:
                            formData.get(
                                "email"
                            ),

                        firstName:
                            formData.get(
                                "firstName"
                            ),

                        lastName:
                            formData.get(
                                "lastName"
                            ),

                        phone:
                            formatPhone(
                                formData.get(
                                    "phone"
                                )
                            )

                    },

                    shippingAddress: {

                        governorate:
                            formData.get(
                                "governorate"
                            ),

                        city:
                            formData.get(
                                "city"
                            ),

                        street:
                            formData.get(
                                "street"
                            ),

                        building:
                            formData.get(
                                "building"
                            ),

                        apartment:
                            formData.get(
                                "apartment"
                            ),

                        notes:
                            formData.get(
                                "notes"
                            )

                    },

                    deliveryMethod:
                        formData.get(
                            "deliveryMethod"
                        ),

                    paymentMethod:
                        formData.get(
                            "paymentMethod"
                        ),

                    items:
                        cart,

                    subtotal:
                        subtotal,

                    deliveryFee:
                        deliveryFee,

                    total:
                        total,

                    status:
                        "confirmed"

                })

            );


            /* Empty cart */

            localStorage.removeItem(
                CART_KEY
            );

            localStorage.removeItem(
                CHECKOUT_TOKEN_KEY
            );

            // The server has successfully created the order and consumed this code.
            appliedDiscountCode = null;
            localStorage.removeItem(APPLIED_REWARD_KEY);


            /* Display confirmation */

            document
                .getElementById(
                    "orderNumber"
                )
                .textContent =
                    orderNumber;


            document
                .getElementById(
                    "confirmationEmail"
                )
                .textContent =
                    formData.get(
                        "email"
                    );


            /* Show email warning only if order succeeded */

            if (emailFailed) {

                alert(
                    `Your order ${orderNumber} was placed successfully, but we couldn't send the confirmation email. Please keep your order number for reference.`
                );

            }


            /* Open success modal */

            orderModal.classList.add(
                "open"
            );


            orderModal.setAttribute(
                "aria-hidden",
                "false"
            );


            document.body.style.overflow =
                "hidden";

        }

        catch (error) {

            console.error(
                "Unexpected checkout error:",
                error
            );


            alert(
                "Something went wrong while processing your order. Your order could not be completed. Please check your internet connection and try again."
            );


            resetPlaceOrderButton();

        }

    }

);


/* Start checkout page */

renderOrder();