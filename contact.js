
(() => {
    const form = document.getElementById("contactForm");
    if (!form) return;
    const client = window.supabaseClient || supabaseClient;
    const feedback = document.getElementById("contactFeedback");
    const submitButton = document.getElementById("contactSubmit");
    const messageInput = document.getElementById("message");
    const messageCount = document.getElementById("messageCount");

    messageInput.addEventListener("input", () => {
        messageCount.textContent = String(messageInput.value.length);
    });

    function showFeedback(message, type) {
        feedback.textContent = message;
        feedback.className =
            `contact-feedback is-visible ${
                type === "success" ? "is-success" : "is-error"
            }`;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        feedback.className = "contact-feedback";

        if (!form.reportValidity()) return;

        // Use the same Supabase client initialized in supabase.js.
        const client = window.supabaseClient || (
            typeof supabaseClient !== "undefined" ? supabaseClient : null
        );

        if (!client) {
            showFeedback(
                "We could not connect to customer care. Please try again later.",
                "error"
            );
            return;
        }

        const data = new FormData(form);

        const payload = {
            order_number: String(data.get("orderNumber") || "").trim() || null,
            full_name: String(data.get("fullName") || "").trim(),
            email: String(data.get("email") || "").trim().toLowerCase(),
            phone: String(data.get("phone") || "").trim(),
            reason: String(data.get("reason") || ""),
            message: String(data.get("message") || "").trim()
        };

        if (
            !payload.full_name ||
            !payload.email ||
            !payload.phone ||
            !payload.reason ||
            !payload.message
        ) {
            showFeedback("Please complete all required fields.", "error");
            return;
        }

        if (
            payload.full_name.length > 120 ||
            payload.email.length > 254 ||
            payload.phone.length > 30 ||
            payload.message.length > 3000 ||
            (payload.order_number && payload.order_number.length > 80)
        ) {
            showFeedback("One or more fields exceed the allowed length.", "error");
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = "Sending...";

        try {
            // Save the message first. The database generates its ID and status.
            const { error: insertError } = await client
                .from("contact_messages")
                .insert([payload]);

            if (insertError) throw insertError;

            form.reset();
            messageCount.textContent = "0";

            // Notify the Admin separately. A notification failure must not
            // make a successfully saved message appear to have failed.
            const { error: notificationError } =
                await client.functions.invoke("contact-notification", {
                    body: payload
                });

            if (notificationError) {
                console.error(
                    "Admin notification failed:",
                    notificationError
                );

                showFeedback(
                    "Your message has been saved, but the email notification could not be sent. Our team can still view it in Contact Messages.",
                    "success"
                );
            } else {
                showFeedback(
                    "Thank you for contacting Avviamento. Your message has been sent.",
                    "success"
                );
            }
        } catch (error) {
            console.error("Contact form submission failed:", error);

            showFeedback(
                "We could not save your message. Please try again later.",
                "error"
            );
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML =
                'Submit message <span aria-hidden="true">↗</span>';
        }
    });
})();
