// ==========================================
// ADMIN CHECK
// ==========================================

async function checkAdmin() {

    const {
        data: {
            user
        },
        error: authError
    } = await supabaseClient.auth.getUser();


    if (authError || !user) {

        window.location.href =
            "login.html";

        return false;

    }


    const {
        data: profile,
        error: profileError
    } = await supabaseClient
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();


    if (
        profileError ||
        !profile ||
        profile.role !== "admin"
    ) {

        await supabaseClient.auth.signOut();

        window.location.href =
            "login.html";

        return false;

    }


    return true;

}



// ==========================================
// ELEMENTS
// ==========================================

const customersContainer =
    document.getElementById(
        "customersContainer"
    );

const searchInput =
    document.getElementById(
        "customerSearch"
    );



// ==========================================
// LOAD CUSTOMERS
// ==========================================

async function loadCustomers() {

    const {
        data: orders,
        error
    } = await supabaseClient
        .from("orders")
        .select(`
            email,
            full_name,
            phone,
            total,
            created_at,
            status
        `)
        .not(
            "email",
            "is",
            null
        )
        .neq(
            "status",
            "cancelled"
        )
        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            "Customers error:",
            error
        );

        customersContainer.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="no-customers">

                    Failed to load customers.

                </td>
            </tr>
        `;

        return;
    }


    if (
        !orders ||
        orders.length === 0
    ) {

        customersContainer.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="no-customers">

                    No customers found.

                </td>
            </tr>
        `;

        return;
    }



    // ======================================
    // GROUP ORDERS BY EMAIL
    // ======================================

    const customerMap =
        new Map();


    orders.forEach(order => {

        const email =
            String(
                order.email || ""
            )
            .trim()
            .toLowerCase();


        if (!email) {

            return;

        }


        if (
            !customerMap.has(email)
        ) {

            customerMap.set(
                email,
                {

                    email:
                        email,

                    full_name:
                        order.full_name ||
                        "Customer",

                    phone:
                        order.phone ||
                        "-",

                    ordersCount:
                        0,

                    totalSpent:
                        0,

                    lastOrder:
                        order

                }
            );

        }


        const customer =
            customerMap.get(
                email
            );


        customer.ordersCount += 1;


        customer.totalSpent +=
            Number(
                order.total || 0
            );


        if (
            !customer.phone ||
            customer.phone === "-"
        ) {

            customer.phone =
                order.phone ||
                "-";

        }


        if (
            !customer.full_name ||
            customer.full_name === "Customer"
        ) {

            customer.full_name =
                order.full_name ||
                "Customer";

        }


        if (
            new Date(
                order.created_at
            )
            >
            new Date(
                customer.lastOrder.created_at
            )
        ) {

            customer.lastOrder =
                order;

            customer.full_name =
                order.full_name ||
                customer.full_name;

            customer.phone =
                order.phone ||
                customer.phone;

        }

    });



    // ======================================
    // CONVERT MAP TO ARRAY
    // ======================================

    const customerData =
        Array.from(
            customerMap.values()
        );



    // ======================================
    // SORT BY LAST ORDER
    // ======================================

    customerData.sort(
        (
            a,
            b
        ) =>
            new Date(
                b.lastOrder.created_at
            ) -
            new Date(
                a.lastOrder.created_at
            )
    );


    renderCustomers(
        customerData
    );

}



// ==========================================
// RENDER CUSTOMERS
// ==========================================

function renderCustomers(
    customers
) {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    let filtered =
        customers;


    if (search) {

        filtered =
            customers.filter(
                customer => {

                    const name =
                        String(
                            customer.full_name ||
                            ""
                        )
                        .toLowerCase();


                    const email =
                        String(
                            customer.email ||
                            ""
                        )
                        .toLowerCase();


                    const phone =
                        String(
                            customer.phone ||
                            ""
                        )
                        .toLowerCase();


                    return (

                        name.includes(
                            search
                        )

                        ||

                        email.includes(
                            search
                        )

                        ||

                        phone.includes(
                            search
                        )

                    );

                }
            );

    }



    // ======================================
    // NO RESULTS
    // ======================================

    if (
        filtered.length === 0
    ) {

        customersContainer.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="no-customers">

                    No customers found.

                </td>
            </tr>
        `;

        return;
    }



    // ======================================
    // RENDER
    // ======================================

    customersContainer.innerHTML =
        filtered.map(
            customer => {

                const lastOrderDate =
                    customer.lastOrder
                    ?
                    new Date(
                        customer
                            .lastOrder
                            .created_at
                    ).toLocaleDateString(
                        "en-GB"
                    )
                    :
                    "-";


                return `

                    <tr>

                        <td>

                            <span
                                class="customer-name">

                                ${
                                    escapeHtml(
                                        customer.full_name ||
                                        "Customer"
                                    )
                                }

                            </span>

                        </td>


                        <td>

                            <span
                                class="customer-email">

                                ${
                                    escapeHtml(
                                        customer.email
                                    )
                                }

                            </span>

                        </td>


                        <td>

                            <span
                                class="customer-phone">

                                ${
                                    escapeHtml(
                                        customer.phone ||
                                        "-"
                                    )
                                }

                            </span>

                        </td>


                        <td>

                            <span
                                class="customer-orders">

                                ${
                                    customer.ordersCount
                                }

                            </span>

                        </td>


                        <td>

                            <span
                                class="customer-spent">

                                EGP
                                ${
                                    customer.totalSpent
                                        .toFixed(2)
                                }

                            </span>

                        </td>


                        <td>

                            ${
                                lastOrderDate
                            }

                        </td>

                    </tr>

                `;

            }
        ).join("");

}



// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}



// ==========================================
// SEARCH
// ==========================================

searchInput.addEventListener(
    "input",
    loadCustomers
);



// ==========================================
// LOGOUT
// ==========================================

document
    .getElementById("logoutBtn")
    .addEventListener(
        "click",
        async () => {

            await supabaseClient.auth.signOut();

            window.location.href =
                "login.html";

        }
    );



// ==========================================
// INITIAL LOAD
// ==========================================

async function initializeCustomers() {

    const isAdmin =
        await checkAdmin();


    if (!isAdmin) {
        return;
    }


    await loadCustomers();

}


initializeCustomers();