const form = document.getElementById("adminLoginForm");
const errorMessage = document.getElementById("errorMessage");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    errorMessage.textContent = "";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

    if (error) {
        errorMessage.textContent = "Invalid email or password.";
        return;
    }

    // Check if this user is actually an admin
    const { data: profile, error: profileError } =
        await supabaseClient
            .from("profiles")
            .select("role")
            .eq("id", data.user.id)
            .single();

    if (profileError || profile.role !== "admin") {
        await supabaseClient.auth.signOut();

        errorMessage.textContent =
            "You are not authorized to access the admin panel.";

        return;
    }

    window.location.href = "dashboard.html";
});