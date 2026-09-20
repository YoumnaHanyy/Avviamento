const CART_KEY = "avviamentoCart";

const ORDER_KEY = "avviamentoLastOrder";

const FREE_DELIVERY_MINIMUM = 2000;

const STANDARD_DELIVERY_FEE = 100;

const EXPRESS_DELIVERY_FEE = 175;



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

        return [];

    }

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

    /*
    If cart is empty
    */

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


            <strong class="summary-product-price">

                ${formatPrice(
                    Number(item.price)
                    * Number(item.quantity)
                )}

            </strong>
        `;


        summaryProducts.appendChild(
            product
        );

    });


    updateTotals();

}



/* Update prices */

function updateTotals() {

    const subtotal =
        getSubtotal();


    const delivery =
        getDeliveryFee();


    const total =
        subtotal + delivery;


    subtotalElement.textContent =
        formatPrice(subtotal);


    deliveryElement.textContent =
        delivery === 0
            ? "Free"
            : formatPrice(delivery);


    totalElement.textContent =
        formatPrice(total);



    /*
    Update standard delivery text
    */

    if (
        subtotal >=
        FREE_DELIVERY_MINIMUM
    ) {

        standardDeliveryPrice.textContent =
            "Free";

    }

    else {

        standardDeliveryPrice.textContent =
            formatPrice(
                STANDARD_DELIVERY_FEE
            );

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


                        card.classList.toggle(
                            "selected",
                            radio.checked
                        );

                    });



                /*
                Update delivery total
                */

                if (
                    radioName ===
                    "deliveryMethod"
                ) {

                    updateTotals();

                }



                /*
                Show card payment notice
                */

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



    /*
    Egyptian mobile validation

    Accepted prefixes:
    010
    011
    012
    015
    */

    if (input.id === "phone") {

        let digits =
            input.value.replace(
                /\D/g,
                ""
            );


        /*
        Remove +20 or 20 if entered
        */

        if (
            digits.startsWith("20")
            && digits.length === 12
        ) {

            digits =
                digits.substring(2);

        }


        /*
        Remove first zero
        */

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



/* Place order */

checkoutForm.addEventListener(
    "submit",

    event => {

        event.preventDefault();



        if (cart.length === 0) {

            return;

        }



        /*
        Required form fields
        */

        const requiredFields = [

            ...checkoutForm
                .querySelectorAll(

                    ".field input[required], .field select[required]"

                )

        ];



        /*
        Validate all required fields
        */

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



        /*
        Stop if form contains errors
        */

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



        /*
        Read form information
        */

        const formData =
            new FormData(
                checkoutForm
            );



        /*
        Create order number
        */

        const orderNumber =
            `AV${Date.now()
                .toString()
                .slice(-8)}`;



        /*
        Calculate prices
        */

        const subtotal =
            getSubtotal();


        const deliveryFee =
            getDeliveryFee();


        const total =
            subtotal + deliveryFee;



        /*
        Format phone number
        */

        let phoneDigits =
            String(
                formData.get("phone")
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



        /*
        Create order object
        */

        const order = {

            orderNumber:
                orderNumber,


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
                    `+20${phoneDigits}`

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

        };



        /*
        Disable button while processing
        */

        placeOrderButton.disabled =
            true;


        placeOrderButton.innerHTML = `

            <i class="fa-solid fa-spinner fa-spin"></i>

            <span>
                Processing
            </span>
        `;



        /*
        Simulate order processing
        */

        setTimeout(() => {

            /*
            Save completed order
            */

            localStorage.setItem(

                ORDER_KEY,

                JSON.stringify(order)

            );


            /*
            Empty shopping cart
            */

            localStorage.removeItem(
                CART_KEY
            );


            /*
            Display confirmation details
            */

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
                    order.customer.email;


            /*
            Open success modal
            */

            orderModal.classList.add(
                "open"
            );


            orderModal.setAttribute(
                "aria-hidden",
                "false"
            );


            document.body.style.overflow =
                "hidden";


        }, 700);

    }
);



/* Start checkout page */

renderOrder();