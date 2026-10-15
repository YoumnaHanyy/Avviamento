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
        profileError
        || !profile
        || profile.role !== "admin"
    ) {

        await supabaseClient.auth.signOut();

        window.location.href =
            "login.html";

        return false;

    }


    return true;

}



// ==========================================
// LOAD DASHBOARD STATISTICS
// ==========================================

async function loadDashboard() {

    // --------------------------------------
    // PRODUCTS
    // --------------------------------------

    const {
        count: productsCount,
        error: productsError
    } = await supabaseClient
        .from("products")
        .select("*", {
            count: "exact",
            head: true
        })
        .eq("is_active", true);


    if (productsError) {

        console.error(
            "Products error:",
            productsError
        );

    }



    // --------------------------------------
    // ORDERS
    // --------------------------------------

    const {
        data: allOrders,
        error: ordersError
    } = await supabaseClient
        .from("orders")
        .select(
            "id, email, total, status"
        );


    if (ordersError) {

        console.error(
            "Orders error:",
            ordersError
        );

    }


    const orders =
        allOrders || [];


    // Only real active orders
    const activeOrders =
        orders.filter(
            order =>
                order.status !== "cancelled"
        );


    const ordersCount =
        activeOrders.length;



    // --------------------------------------
    // CUSTOMERS
    // --------------------------------------

    /*
        Customers use Guest Checkout.

        So we count unique customer emails
        from orders instead of profiles.
    */

    const customerEmails =
        new Set();


    activeOrders.forEach(order => {

        if (
            order.email
            && String(order.email).trim()
        ) {

            customerEmails.add(
                String(
                    order.email
                )
                .trim()
                .toLowerCase()
            );

        }

    });


    const customersCount =
        customerEmails.size;



    // --------------------------------------
    // LOYALTY MEMBERS
    // --------------------------------------

    const {
        count: loyaltyMembersCount,
        error: loyaltyMembersError
    } = await supabaseClient
        .from("loyalty_customers")
        .select("*", {
            count: "exact",
            head: true
        });


    if (loyaltyMembersError) {

        console.error(
            "Loyalty members error:",
            loyaltyMembersError
        );

    }



    // --------------------------------------
    // SALES
    // --------------------------------------

    /*
        Sales include:

        confirmed
        processing
        shipped
        delivered

        Cancelled orders are excluded.
    */

    const salesStatuses = [
        "confirmed",
        "processing",
        "shipped",
        "delivered"
    ];


    let totalSales = 0;


    activeOrders.forEach(order => {

        if (
            salesStatuses.includes(
                order.status
            )
        ) {

            totalSales += Number(
                order.total || 0
            );

        }

    });



    // --------------------------------------
    // UPDATE DASHBOARD
    // --------------------------------------

    const totalSalesElement =
        document.getElementById(
            "totalSales"
        );


    const totalOrdersElement =
        document.getElementById(
            "totalOrders"
        );


    const totalProductsElement =
        document.getElementById(
            "totalProducts"
        );


    const totalCustomersElement =
        document.getElementById(
            "totalCustomers"
        );


    const totalLoyaltyMembersElement =
        document.getElementById(
            "totalLoyaltyMembers"
        );


    if (totalSalesElement) {

        totalSalesElement.textContent =
            `EGP ${totalSales.toFixed(2)}`;

    }


    if (totalOrdersElement) {

        totalOrdersElement.textContent =
            ordersCount;

    }


    if (totalProductsElement) {

        totalProductsElement.textContent =
            productsCount || 0;

    }


    if (totalCustomersElement) {

        totalCustomersElement.textContent =
            customersCount;

    }


    if (totalLoyaltyMembersElement) {

        totalLoyaltyMembersElement.textContent =
            loyaltyMembersCount || 0;

    }

}



// ==========================================
// RECENT ORDERS
// ==========================================

async function loadRecentOrders() {

    const {
        data: orders,
        error
    } = await supabaseClient
        .from("orders")
        .select(`
            id,
            full_name,
            total,
            status,
            created_at
        `)
        .neq(
            "status",
            "cancelled"
        )
        .order("created_at", {
            ascending: false
        })
        .limit(5);


    const container =
        document.getElementById(
            "recentOrders"
        );


    if (!container) {
        return;
    }


    if (error) {

        console.error(
            "Recent orders error:",
            error
        );

        container.innerHTML = `
            <p class="loading-text">
                Failed to load orders.
            </p>
        `;

        return;

    }


    if (
        !orders
        || orders.length === 0
    ) {

        container.innerHTML = `
            <p class="loading-text">
                No orders yet.
            </p>
        `;

        return;

    }


    container.innerHTML =
        orders.map(order => {

            const orderNumber =
                `AV${String(
                    order.id
                ).padStart(
                    6,
                    "0"
                )}`;


            const date =
                new Date(
                    order.created_at
                ).toLocaleDateString();


            return `

                <div class="order-row">

                    <div class="order-info">

                        <span class="order-number">
                            #${orderNumber}
                        </span>

                        <span>
                            ${escapeHtml(
                                order.full_name || "-"
                            )}
                        </span>

                        <span class="order-date">
                            ${date}
                        </span>

                    </div>


                    <div class="order-total">

                        EGP
                        ${Number(
                            order.total || 0
                        ).toFixed(2)}

                    </div>


                    <div>

                        ${escapeHtml(
                            order.status
                        )}

                    </div>

                </div>

            `;

        }).join("");

}



// ==========================================
// LOW STOCK PRODUCTS
// ==========================================

async function loadLowStockProducts() {

    const {
        data: variants,
        error
    } = await supabaseClient
        .from("product_variants")
        .select(`
            stock,
            color,
            size,
            products (
                name
            )
        `)
        .lte(
            "stock",
            5
        )
        .order("stock", {
            ascending: true
        })
        .limit(10);


    const container =
        document.getElementById(
            "lowStockProducts"
        );


    if (!container) {
        return;
    }


    if (error) {

        console.error(
            "Low stock error:",
            error
        );

        container.innerHTML = `
            <p class="loading-text">
                Failed to load products.
            </p>
        `;

        return;

    }


    if (
        !variants
        || variants.length === 0
    ) {

        container.innerHTML = `
            <p class="loading-text">
                No low-stock products.
            </p>
        `;

        return;

    }


    container.innerHTML =
        variants.map(variant => {

            const productName =
                variant.products?.name
                || "Product";


            return `

                <div class="stock-row">

                    <div class="stock-info">

                        <strong>
                            ${escapeHtml(
                                productName
                            )}
                        </strong>

                        <span>

                            ${escapeHtml(
                                variant.color
                            )}

                            /

                            ${escapeHtml(
                                variant.size
                            )}

                        </span>

                    </div>


                    <span class="stock-warning">

                        ${Number(
                            variant.stock
                        )}
                        left

                    </span>

                </div>

            `;

        }).join("");

}



// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHtml(value) {

    return String(value ?? "")

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
// INITIALIZE
// ==========================================

async function initializeDashboard() {

    const isAdmin =
        await checkAdmin();


    if (!isAdmin) {
        return;
    }


    await loadDashboard();

    await loadRecentOrders();

    await loadLowStockProducts();

}


initializeDashboard();