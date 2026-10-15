
(() => {
    "use strict";

    const client = window.supabaseClient;

    const elements = {
        messagesBody: document.getElementById("messagesBody"),
        messagesNotice: document.getElementById("messagesNotice"),

        statusFilter: document.getElementById("statusFilter"),
        refreshMessages: document.getElementById("refreshMessages"),

        newCount: document.getElementById("newCount"),
        progressCount: document.getElementById("progressCount"),
        resolvedCount: document.getElementById("resolvedCount"),

        messageDetail: document.getElementById("messageDetail"),
        detailTitle: document.getElementById("detailTitle"),
        detailFields: document.getElementById("detailFields"),
        detailMessage: document.getElementById("detailMessage"),
        detailStatus: document.getElementById("detailStatus"),
        detailNotice: document.getElementById("detailNotice"),
        saveStatus: document.getElementById("saveStatus"),
        closeDetail: document.getElementById("closeDetail"),

        logoutBtn: document.getElementById("logoutBtn")
    };

    let allMessages = [];
    let selectedMessageId = null;
    let isSaving = false;

    function setNotice(message, type = "info") {
        elements.messagesNotice.textContent = message;
        elements.messagesNotice.dataset.type = type;
    }

    function setDetailNotice(message, type = "info") {
        elements.detailNotice.textContent = message;
        elements.detailNotice.dataset.type = type;
    }

    function formatDate(value) {
        if (!value) return "—";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) return "—";

        return date.toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    function formatStatus(status) {
        const labels = {
            new: "New",
            in_progress: "In Progress",
            resolved: "Resolved"
        };

        return labels[status] || status || "Unknown";
    }

    function updateStats(messages) {
        elements.newCount.textContent =
            messages.filter(message => message.status === "new").length;

        elements.progressCount.textContent =
            messages.filter(message => message.status === "in_progress").length;

        elements.resolvedCount.textContent =
            messages.filter(message => message.status === "resolved").length;
    }

    function createCell(value) {
        const cell = document.createElement("td");
        cell.textContent = value ?? "—";
        return cell;
    }

    function renderMessages() {
        const filter = elements.statusFilter.value;

        const messages = filter === "all"
            ? allMessages
            : allMessages.filter(message => message.status === filter);

        elements.messagesBody.replaceChildren();

        if (messages.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 6;
            cell.textContent = "No messages found.";

            row.appendChild(cell);
            elements.messagesBody.appendChild(row);
            return;
        }

        messages.forEach(message => {
            const row = document.createElement("tr");

            const customerCell = document.createElement("td");
            const customerName = document.createElement("strong");
            const customerEmail = document.createElement("small");

            customerName.textContent = message.full_name;
            customerEmail.textContent = message.email;

            customerCell.append(customerName, customerEmail);

            const reasonCell = createCell(message.reason);
            const orderCell = createCell(message.order_number || "—");
            const dateCell = createCell(formatDate(message.created_at));

            const statusCell = document.createElement("td");
            const statusBadge = document.createElement("span");

            statusBadge.className =
                `contact-status contact-status-${message.status}`;

            statusBadge.textContent = formatStatus(message.status);
            statusCell.appendChild(statusBadge);

            const detailsCell = document.createElement("td");
            const detailsButton = document.createElement("button");

            detailsButton.type = "button";
            detailsButton.className = "contact-view";
            detailsButton.textContent = "View";
            detailsButton.addEventListener("click", () => {
                openMessageDetails(message.id);
            });

            detailsCell.appendChild(detailsButton);

            row.append(
                customerCell,
                reasonCell,
                orderCell,
                dateCell,
                statusCell,
                detailsCell
            );

            elements.messagesBody.appendChild(row);
        });
    }

    async function loadMessages() {
        if (!client) {
            setNotice(
                "Supabase client not found. Check supabase.js loading order.",
                "error"
            );
            return;
        }

        elements.refreshMessages.disabled = true;
        setNotice("Loading contact messages...");

        try {
            const { data, error } = await client
                .from("contact_messages")
                .select(
                    "id, order_number, full_name, email, phone, reason, message, status, admin_notes, created_at, updated_at"
                )
                .order("created_at", { ascending: false });

            if (error) throw error;

            allMessages = data || [];

            updateStats(allMessages);
            renderMessages();

            setNotice(
                allMessages.length === 1
                    ? "1 message loaded."
                    : `${allMessages.length} messages loaded.`,
                "success"
            );

            if (selectedMessageId) {
                const updatedMessage = allMessages.find(
                    message => message.id === selectedMessageId
                );

                if (updatedMessage) {
                    showMessageDetails(updatedMessage);
                } else {
                    closeMessageDetails();
                }
            }
        } catch (error) {
            console.error("Contact messages loading error:", error);

            setNotice(
                error.message ||
                "Could not load messages. Check your Admin login and RLS policies.",
                "error"
            );
        } finally {
            elements.refreshMessages.disabled = false;
        }
    }

    function addDetailField(label, value) {
        const wrapper = document.createElement("div");
        wrapper.className = "contact-detail-field";

        const title = document.createElement("span");
        title.textContent = label;

        const content = document.createElement("strong");
        content.textContent = value || "—";

        wrapper.append(title, content);
        elements.detailFields.appendChild(wrapper);
    }

    function showMessageDetails(message) {
        selectedMessageId = message.id;

        elements.detailTitle.textContent =
            message.full_name || "Customer message";

        elements.detailFields.replaceChildren();

        addDetailField("Full name", message.full_name);
        addDetailField("Email", message.email);
        addDetailField("Phone", message.phone);
        addDetailField("Order number", message.order_number || "Not provided");
        addDetailField("Reason", message.reason);
        addDetailField("Received", formatDate(message.created_at));
        addDetailField("Last updated", formatDate(message.updated_at));

        elements.detailMessage.textContent = message.message || "";
        elements.detailStatus.value = message.status;

        setDetailNotice("");

        elements.messageDetail.hidden = false;
    }

    function openMessageDetails(messageId) {
        const message = allMessages.find(
            item => item.id === messageId
        );

        if (!message) {
            setNotice("Message not found. Refresh and try again.", "error");
            return;
        }

        showMessageDetails(message);

        elements.messageDetail.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    function closeMessageDetails() {
        selectedMessageId = null;
        elements.messageDetail.hidden = true;
        elements.detailFields.replaceChildren();
        elements.detailMessage.textContent = "";
        setDetailNotice("");
    }

    async function saveMessageStatus() {
        if (!selectedMessageId || isSaving) return;

        const message = allMessages.find(
            item => item.id === selectedMessageId
        );

        if (!message) {
            setDetailNotice("Message not found. Refresh and try again.", "error");
            return;
        }

        const newStatus = elements.detailStatus.value;

        if (!["new", "in_progress", "resolved"].includes(newStatus)) {
            setDetailNotice("Invalid status selected.", "error");
            return;
        }

        isSaving = true;
        elements.saveStatus.disabled = true;
        setDetailNotice("Saving changes...");

        try {
            const { data, error } = await client
                .from("contact_messages")
                .update({
                    status: newStatus,
                    updated_at: new Date().toISOString()
                })
                .eq("id", selectedMessageId)
                .select("id, status")
                .maybeSingle();

            if (error) throw error;

            if (!data) {
                throw new Error(
                    "No message was updated. Check your Admin permissions."
                );
            }

            setDetailNotice("Status updated successfully.", "success");

            await loadMessages();
        } catch (error) {
            console.error("Updating contact message failed:", error);

            setDetailNotice(
                error.message || "Could not update message status.",
                "error"
            );
        } finally {
            isSaving = false;
            elements.saveStatus.disabled = false;
        }
    }

    async function handleLogout() {
        if (!client) return;

        const confirmed = window.confirm("Are you sure you want to log out?");

        if (!confirmed) return;

        const { error } = await client.auth.signOut();

        if (error) {
            console.error("Logout failed:", error);
            window.alert("Could not log out. Please try again.");
            return;
        }

        window.location.href = "login.html";
    }

    elements.statusFilter.addEventListener("change", renderMessages);
    elements.refreshMessages.addEventListener("click", loadMessages);
    elements.closeDetail.addEventListener("click", closeMessageDetails);
    elements.saveStatus.addEventListener("click", saveMessageStatus);

    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener("click", handleLogout);
    }

    async function initialize() {
        if (!client) {
            setNotice("Supabase client not found.", "error");
            return;
        }

        const { data, error } = await client.auth.getSession();

        if (error || !data.session) {
            window.location.href = "login.html";
            return;
        }

        const { data: profile, error: profileError } = await client
            .from("profiles")
            .select("role")
            .eq("id", data.session.user.id)
            .maybeSingle();

        if (profileError || !profile || profile.role !== "admin") {
            setNotice("Access denied. Admin account required.", "error");
            return;
        }

        await loadMessages();
    }

    initialize();
})();
