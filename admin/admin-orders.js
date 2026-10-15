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

const ordersContainer =
    document.getElementById("ordersContainer");

const orderSearch =
    document.getElementById("orderSearch");

const statusFilter =
    document.getElementById("statusFilter");

const paymentFilter =
    document.getElementById("paymentFilter");

const orderModal =
    document.getElementById("orderModal");

const closeModalBtn =
    document.getElementById("closeModalBtn");

const saveStatusBtn =
    document.getElementById("saveStatusBtn");

let currentOrderId = null;



// ==========================================
// LOAD ORDERS
// ==========================================

async function loadOrders() {

    const search =
        orderSearch.value.trim().toLowerCase();

    const status =
        statusFilter.value;

    const payment =
        paymentFilter.value;


    const {
        data: orders,
        error
    } = await supabaseClient
        .from("orders")
        .select(`
            id,
            full_name,
            phone,
            address,
            city,
            total,
            status,
            payment_status,
            payment_method,
            shipping_cost,
            created_at
        `)
        .order("created_at", {
            ascending: false
        });


    if (error) {

        console.error(
            "Orders error:",
            error
        );

        ordersContainer.innerHTML = `
            <tr>
                <td colspan="7">
                    Failed to load orders.
                </td>
            </tr>
        `;

        return;
    }


    let filteredOrders =
        orders || [];


    if (search) {

        filteredOrders =
            filteredOrders.filter(order => {

                const orderNumber =
                    `AV${String(order.id).padStart(6, "0")}`
                    .toLowerCase();

                const name =
                    (order.full_name || "")
                    .toLowerCase();

                const phone =
                    (order.phone || "")
                    .toLowerCase();


                return (
                    orderNumber.includes(search) ||
                    name.includes(search) ||
                    phone.includes(search)
                );

            });

    }


    if (status) {

        filteredOrders =
            filteredOrders.filter(
                order =>
                    order.status === status
            );

    }


    if (payment) {

        filteredOrders =
            filteredOrders.filter(
                order =>
                    order.payment_status === payment
            );

    }


    if (filteredOrders.length === 0) {

        ordersContainer.innerHTML = `
            <tr>
                <td colspan="7">
                    No orders found.
                </td>
            </tr>
        `;

        return;
    }


    ordersContainer.innerHTML =
        filteredOrders.map(order => {

            const orderNumber =
                `AV${String(order.id).padStart(6, "0")}`;


            const date =
                new Date(
                    order.created_at
                ).toLocaleDateString();


            return `

                <tr>

                    <td>
                        <span class="order-number">
                            #${orderNumber}
                        </span>
                    </td>


                    <td>
                        ${escapeHtml(
                            order.full_name || "-"
                        )}
                    </td>


                    <td>
                        EGP
                        ${Number(
                            order.total || 0
                        ).toFixed(2)}
                    </td>


                    <td>

                        <span class="
                            status-badge
                            status-${order.status}
                        ">

                            ${escapeHtml(
                                order.status
                            )}

                        </span>

                    </td>


                    <td>

                        <span class="
                            payment-${order.payment_status}
                        ">

                            ${escapeHtml(
                                order.payment_status
                            )}

                        </span>

                    </td>


                    <td>

                        <span class="order-date">
                            ${date}
                        </span>

                    </td>


                    <td>

                        <button
                            class="view-btn"
                            onclick="viewOrder(${order.id})">

                            View

                        </button>


                        <button
                            class="delete-order-btn"
                            onclick="deleteOrder(${order.id})">

                            Delete

                        </button>

                    </td>

                </tr>

            `;

        }).join("");

}



// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHtml(value) {

    return String(value ?? "")

        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}



// ==========================================
// DELETE ORDER
// ==========================================

async function deleteOrder(orderId) {

    const orderNumber =
        `AV${String(orderId).padStart(6, "0")}`;


    const confirmed =
        confirm(
            `Are you sure you want to delete ${orderNumber}?\n\nThe stock will be restored automatically if needed.`
        );


    if (!confirmed) {
        return;
    }


    const {
        error
    } = await supabaseClient.rpc(
        "admin_delete_order",
        {
            p_order_id:
                orderId
        }
    );


    if (error) {

        console.error(
            "Delete order error:",
            error
        );

        alert(
            "Failed to delete order. Please try again."
        );

        return;
    }


    alert(
        `${orderNumber} deleted successfully.`
    );


    await loadOrders();

}



// ==========================================
// VIEW ORDER
// ==========================================

async function viewOrder(orderId) {

    currentOrderId =
        orderId;


    const {
        data: order,
        error
    } = await supabaseClient
        .from("orders")
        .select(`
            id,
            full_name,
            phone,
            address,
            city,
            total,
            subtotal,
            shipping_cost,
            status,
            payment_status,
            payment_method,
            created_at
        `)
        .eq("id", orderId)
        .single();


    if (error || !order) {

        alert(
            "Failed to load order."
        );

        return;
    }


    document.getElementById(
        "modalOrderNumber"
    ).textContent =
        `Order #AV${String(order.id).padStart(6, "0")}`;


    document.getElementById(
        "detailName"
    ).textContent =
        order.full_name || "-";


    document.getElementById(
        "detailPhone"
    ).textContent =
        order.phone || "-";


    document.getElementById(
        "detailCity"
    ).textContent =
        order.city || "-";


    document.getElementById(
        "detailAddress"
    ).textContent =
        order.address || "-";


    document.getElementById(
        "detailPaymentMethod"
    ).textContent =
        order.payment_method || "-";


    document.getElementById(
        "detailDelivery"
    ).textContent =
        order.shipping_cost > 0
            ? `EGP ${Number(
                order.shipping_cost
            ).toFixed(2)}`
            : "Free";


    document.getElementById(
        "orderStatus"
    ).value =
        order.status;


    document.getElementById(
        "paymentStatus"
    ).value =
        order.payment_status;


    document.getElementById(
        "detailTotal"
    ).textContent =
        `Total: EGP ${Number(
            order.total || 0
        ).toFixed(2)}`;


    await loadOrderItems(
        order.id
    );


    orderModal.classList.add(
        "show"
    );

}



// ==========================================
// LOAD ORDER ITEMS
// ==========================================

async function loadOrderItems(orderId) {

    const container =
        document.getElementById(
            "orderItems"
        );


    const {
        data: items,
        error
    } = await supabaseClient
        .from("order_items")
        .select(`
            quantity,
            unit_price,
            product_variants (
                color,
                size,
                products (
                    name
                )
            )
        `)
        .eq(
            "order_id",
            orderId
        );


    if (error) {

        console.error(
            "Order items error:",
            error
        );

        container.innerHTML =
            "<p>Failed to load items.</p>";

        return;
    }


    if (!items || items.length === 0) {

        container.innerHTML =
            "<p>No items found.</p>";

        return;
    }


    container.innerHTML =
        items.map(item => {

            const product =
                item.product_variants?.products;

            const variant =
                item.product_variants;


            return `

                <div class="order-item">

                    <div class="item-info">

                        <strong>
                            ${escapeHtml(
                                product?.name || "Product"
                            )}
                        </strong>

                        <span>
                            ${escapeHtml(
                                variant?.color || ""
                            )}
                            /
                            ${escapeHtml(
                                variant?.size || ""
                            )}
                        </span>

                        <span>
                            Quantity:
                            ${Number(
                                item.quantity
                            )}
                        </span>

                    </div>


                    <strong>
                        EGP
                        ${(
                            Number(
                                item.unit_price
                            ) *
                            Number(
                                item.quantity
                            )
                        ).toFixed(2)}
                    </strong>

                </div>

            `;

        }).join("");

}



// ==========================================
// SAVE STATUS
// ==========================================

saveStatusBtn.addEventListener(
    "click",
    async () => {

        if (!currentOrderId) {
            return;
        }


        const newStatus =
            document.getElementById(
                "orderStatus"
            ).value;


        const newPaymentStatus =
            document.getElementById(
                "paymentStatus"
            ).value;


        const {
            error
        } = await supabaseClient
            .from("orders")
            .update({

                status:
                    newStatus,

                payment_status:
                    newPaymentStatus,

                updated_at:
                    new Date().toISOString()

            })
            .eq(
                "id",
                currentOrderId
            );


        if (error) {

            console.error(error);

            alert(
                "Failed to update order."
            );

            return;
        }


        alert(
            "Order updated successfully."
        );


        closeModal();

        await loadOrders();

    }
);



// ==========================================
// CLOSE MODAL
// ==========================================

function closeModal() {

    orderModal.classList.remove(
        "show"
    );

    currentOrderId = null;

}


closeModalBtn.addEventListener(
    "click",
    closeModal
);



// ==========================================
// FILTERS
// ==========================================

orderSearch.addEventListener(
    "input",
    loadOrders
);


statusFilter.addEventListener(
    "change",
    loadOrders
);


paymentFilter.addEventListener(
    "change",
    loadOrders
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

async function initializeOrders() {

    const isAdmin =
        await checkAdmin();


    if (!isAdmin) {
        return;
    }


    await loadOrders();

}


initializeOrders();