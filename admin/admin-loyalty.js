/* =========================================================

   AVVIAMENTO LOYALTY ADMIN

   ========================================================= */

let rewards = [];

let missions = [];

let levels = [];

let missionProducts = [];

let missionCategories = [];

/* =========================================================

   ADMIN CHECK

   ========================================================= */

async function checkAdmin() {

    const {

        data: { user },

        error: authError

    } = await supabaseClient.auth.getUser();

    if (authError || !user) {

        window.location.href = "login.html";

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

        window.location.href = "login.html";

        return false;

    }

    return true;

}

/* =========================================================

   HELPERS

   ========================================================= */

function escapeHtml(value) {

    if (value === null || value === undefined) {

        return "";

    }

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}

function formatNumber(value) {

    const number = Number(value || 0);

    return number.toLocaleString("en-US");

}

function formatDate(value) {

    if (!value) {

        return "No date";

    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {

        return "No date";

    }

    return date.toLocaleDateString("en-GB", {

        day: "2-digit",

        month: "short",

        year: "numeric"

    });

}

function formatDateTime(value) {

    if (!value) {

        return "No date";

    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {

        return "No date";

    }

    return date.toLocaleString("en-GB", {

        day: "2-digit",

        month: "short",

        year: "numeric",

        hour: "2-digit",

        minute: "2-digit"

    });

}

function formatRewardType(type) {

    const types = {

        percentage_discount: "Percentage Discount",

        fixed_discount: "Fixed Discount",

        free_shipping: "Free Shipping",

        special_gift: "Special Gift",

        early_access: "Early Access"

    };

    return types[type] || type || "Reward";

}

function formatMissionType(type) {

    const types = {

        spend_money: "Spend Money",

        number_of_orders: "Number of Orders",

        buy_quantity: "Buy Quantity",

        specific_product: "Specific Product",

        specific_category: "Specific Category",

        first_order: "First Order",

        referral: "Referral"

    };

    return types[type] || type || "Mission";

}

function formatRewardValue(reward) {

    const type = reward.reward_type;

    const value = Number(reward.reward_value || 0);

    if (type === "percentage_discount") {

        return `${value}% OFF`;

    }

    if (type === "fixed_discount") {

        return `${value.toLocaleString("en-US")} EGP OFF`;

    }

    if (type === "free_shipping") {

        return "Free Shipping";

    }

    if (type === "special_gift") {

        return reward.reward_value

            ? String(reward.reward_value)

            : "Special Gift";

    }

    if (type === "early_access") {

        return "Early Access";

    }

    return value || "-";

}

function toDateTimeLocal(value) {

    if (!value) {

        return "";

    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {

        return "";

    }

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    const hours = String(date.getHours()).padStart(2, "0");

    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;

}

function showError(message) {

    console.error(message);

    alert(message);

}

/* =========================================================

   TABS

   ========================================================= */

function openTab(tabName) {

    const tabButtons = document.querySelectorAll(".loyalty-tab");

    tabButtons.forEach(button => {

        button.classList.toggle(

            "active",

            button.dataset.tab === tabName

        );

    });

    const tabs = {

        overview: "overviewTab",

        rewards: "rewardsTab",

        missions: "missionsTab",

        levels: "levelsTab",

        settings: "settingsTab"

    };

    Object.values(tabs).forEach(id => {

        const element = document.getElementById(id);

        if (!element) {

            return;

        }

        element.style.display = "none";

    });

    const activeTab = document.getElementById(tabs[tabName]);

    if (activeTab) {

        activeTab.style.display = "block";

    }

    if (tabName === "rewards") {

        loadRewards();

    }

    if (tabName === "missions") {

        loadMissions();

    }

    if (tabName === "levels") {

        loadLevels();

    }

    if (tabName === "settings") {

        loadLoyaltySettings();

    }

}

/* =========================================================

   OVERVIEW

   ========================================================= */


async function loadOverview() {
    try {
        const { data, error } = await supabaseClient.rpc(
            "get_admin_loyalty_overview"
        );

        if (error) {
            throw error;
        }

        const overview = data || {};

        const values = {
            loyaltyMembersCount: overview.members_count,
            pointsIssued: overview.points_issued,
            pointsRedeemed: overview.points_redeemed,
            activeRewardsCount: overview.active_rewards,
            activeMissionsCount: overview.active_missions,
            activeLevelsCount: overview.active_levels
        };

        Object.entries(values).forEach(([id, value]) => {
            const element = document.getElementById(id);

            if (element) {
                element.textContent = formatNumber(value);
            }
        });
    } catch (error) {
        console.error("Overview error:", error);

        showError(
            "Could not load loyalty overview.\n\n" +
            (error.message || "Unknown error")
        );
    }
}


/* =========================================================

   REWARDS

   ========================================================= */

async function loadRewards() {

    const container =

        document.getElementById("rewardsList");

    if (!container) {

        return;

    }

    container.innerHTML = `

        <div class="loyalty-loading">

            Loading rewards...

        </div>

    `;

    const {

        data,

        error

    } = await supabaseClient

        .from("loyalty_rewards")

        .select("*")

        .order("points_required", {

            ascending: true

        });

    if (error) {

        console.error("Rewards error:", error);

        container.innerHTML = `

            <div class="loyalty-empty">

                <strong>Could not load rewards</strong>

                ${escapeHtml(error.message)}

            </div>

        `;

        return;

    }

    rewards = data || [];

    if (rewards.length === 0) {

        container.innerHTML = `

            <div class="loyalty-empty">

                <strong>No rewards yet</strong>

                Create your first reward using the button above.

            </div>

        `;

        return;

    }

    container.innerHTML = rewards.map(reward => {

        const statusClass =

            reward.is_active

                ? "active"

                : "inactive";

        const statusText =

            reward.is_active

                ? "Active"

                : "Inactive";

        return `

            <div class="loyalty-item">

                <div class="loyalty-item-top">

                    <div>

                        <h3 class="loyalty-item-title">

                            ${escapeHtml(reward.name)}

                        </h3>

                        <p class="loyalty-item-description">

                            ${escapeHtml(

                                reward.description ||

                                "No description provided."

                            )}

                        </p>

                    </div>

                    <span class="loyalty-status ${statusClass}">

                        ${statusText}

                    </span>

                </div>

                <div class="loyalty-item-details">

                    <div class="loyalty-detail">

                        <strong>Type:</strong>

                        ${escapeHtml(

                            formatRewardType(

                                reward.reward_type

                            )

                        )}

                    </div>

                    <div class="loyalty-detail">

                        <strong>Reward:</strong>

                        ${escapeHtml(

                            formatRewardValue(reward)

                        )}

                    </div>

                    <div class="loyalty-detail">

                        <strong>Points:</strong>

                        ${formatNumber(

                            reward.points_required

                        )}

                    </div>

                    <div class="loyalty-detail">

                        <strong>Start:</strong>

                        ${formatDate(reward.start_date)}

                    </div>

                    <div class="loyalty-detail">

                        <strong>End:</strong>

                        ${formatDate(reward.end_date)}

                    </div>

                </div>

                <div class="loyalty-item-actions">

                    <button

                        class="loyalty-secondary-btn"

                        data-action="edit-reward"

                        data-id="${reward.id}">

                        Edit

                    </button>

                    <button

                        class="loyalty-secondary-btn"

                        data-action="toggle-reward"

                        data-id="${reward.id}">

                        ${reward.is_active ? "Deactivate" : "Activate"}

                    </button>

                    <button

                        class="loyalty-danger-btn"

                        data-action="delete-reward"

                        data-id="${reward.id}">

                        Delete

                    </button>

                </div>

            </div>

        `;

    }).join("");

}

/* =========================================================

   REWARD MODAL

   ========================================================= */

function resetRewardForm() {

    const form =

        document.getElementById("rewardForm");

    if (!form) {

        return;

    }

    form.reset();

    document.getElementById("rewardId").value = "";

    document.getElementById("rewardActive").checked = true;

    document.getElementById("rewardModalTitle").textContent =

        "Add Reward";

}

function openRewardModal(reward = null) {

    resetRewardForm();

    if (reward) {

        document.getElementById("rewardModalTitle").textContent =

            "Edit Reward";

        document.getElementById("rewardId").value =

            reward.id;

        document.getElementById("rewardName").value =

            reward.name || "";

        document.getElementById("rewardDescription").value =

            reward.description || "";

        document.getElementById("rewardType").value =

            reward.reward_type || "percentage_discount";

        document.getElementById("rewardValue").value =

            reward.reward_value ?? "";

        document.getElementById("rewardPoints").value =

            reward.points_required ?? "";

        document.getElementById("rewardStartDate").value =

            toDateTimeLocal(reward.start_date);

        document.getElementById("rewardEndDate").value =

            toDateTimeLocal(reward.end_date);

        document.getElementById("rewardActive").checked =

            reward.is_active !== false;

    }

    const modal =

        document.getElementById("rewardModal");

    modal.classList.add("show");

    document.body.style.overflow = "hidden";

}

async function saveReward(event) {

    event.preventDefault();

    const id =

        document.getElementById("rewardId").value;

    const name =

        document.getElementById("rewardName").value.trim();

    const description =

        document.getElementById("rewardDescription").value.trim();

    const rewardType =

        document.getElementById("rewardType").value;

    const rewardValue =

        document.getElementById("rewardValue").value;

    const pointsRequired =

        document.getElementById("rewardPoints").value;

    const startDate =

        document.getElementById("rewardStartDate").value;

    const endDate =

        document.getElementById("rewardEndDate").value;

    const isActive =

        document.getElementById("rewardActive").checked;

    if (!name) {

        alert("Please enter a reward name.");

        return;

    }

    if (!pointsRequired || Number(pointsRequired) <= 0) {

        alert("Please enter valid points required.");

        return;

    }

    const payload = {

        name: name,

        description: description || null,

        reward_type: rewardType,

        reward_value:

            rewardValue === ""

                ? null

                : Number(rewardValue),

        points_required: Number(pointsRequired),

        is_active: isActive,

        start_date:

            startDate

                ? new Date(startDate).toISOString()

                : null,

        end_date:

            endDate

                ? new Date(endDate).toISOString()

                : null

    };

    const button =

        document.querySelector(

            '#rewardForm button[type="submit"]'

        );

    if (button) {

        button.disabled = true;

        button.textContent = "Saving...";

    }

    try {

        let result;

        if (id) {

            result = await supabaseClient

                .from("loyalty_rewards")

                .update(payload)

                .eq("id", Number(id));

        } else {

            result = await supabaseClient

                .from("loyalty_rewards")

                .insert(payload);

        }

        if (result.error) {

            throw result.error;

        }

        closeModal("rewardModal");

        await loadRewards();

        await loadOverview();

        alert(

            id

                ? "Reward updated successfully."

                : "Reward created successfully."

        );

    } catch (error) {

        console.error("Save reward error:", error);

        showError(

            "Could not save reward.\n\n" +

            error.message

        );

    } finally {

        if (button) {

            button.disabled = false;

            button.textContent = "Save Reward";

        }

    }

}

/* =========================================================

   REWARD ACTIONS

   ========================================================= */

function editReward(id) {

    const reward =

        rewards.find(

            item => Number(item.id) === Number(id)

        );

    if (!reward) {

        alert("Reward not found.");

        return;

    }

    openRewardModal(reward);

}

async function toggleReward(id) {

    const reward =

        rewards.find(

            item => Number(item.id) === Number(id)

        );

    if (!reward) {

        return;

    }

    const {

        error

    } = await supabaseClient

        .from("loyalty_rewards")

        .update({

            is_active: !reward.is_active

        })

        .eq("id", Number(id));

    if (error) {

        showError(

            "Could not update reward.\n\n" +

            error.message

        );

        return;

    }

    await loadRewards();

    await loadOverview();

}

async function deleteReward(id) {

    const reward =

        rewards.find(

            item => Number(item.id) === Number(id)

        );

    if (!reward) {

        return;

    }

    const confirmed =

        confirm(

            `Delete "${reward.name}"?\n\nThis cannot be undone.`

        );

    if (!confirmed) {

        return;

    }

    const {

        error

    } = await supabaseClient

        .from("loyalty_rewards")

        .delete()

        .eq("id", Number(id));

    if (error) {

        showError(

            "Could not delete reward.\n\n" +

            error.message

        );

        return;

    }

    await loadRewards();

    await loadOverview();

}

/* =========================================================

   MISSIONS

   ========================================================= */

async function loadMissions() {

    const container =

        document.getElementById("missionsList");

    if (!container) {

        return;

    }

    container.innerHTML = `

        <div class="loyalty-loading">

            Loading missions...

        </div>

    `;

    const {

        data,

        error

    } = await supabaseClient

        .from("loyalty_missions")

        .select(`

            *,

            product:products!goal_product_id(

                id,

                name

            ),

            category:categories!goal_category_id(

                id,

                name

            )

        `)

        .order("reward_points", {

            ascending: true

        });

    if (error) {

        console.error("Missions error:", error);

        container.innerHTML = `

            <div class="loyalty-empty">

                <strong>Could not load missions</strong>

                ${escapeHtml(error.message)}

            </div>

        `;

        return;

    }

    missions = data || [];

    if (missions.length === 0) {

        container.innerHTML = `

            <div class="loyalty-empty">

                <strong>No missions yet</strong>

                Create your first mission using the button above.

            </div>

        `;

        return;

    }

    container.innerHTML = missions.map(mission => {

        let target = "-";

        if (

            mission.mission_type === "specific_product" &&

            mission.product

        ) {

            target = mission.product.name;

        }

        if (

            mission.mission_type === "specific_category" &&

            mission.category

        ) {

            target = mission.category.name;

        }

        if (

            mission.goal_value !== null &&

            mission.goal_value !== undefined &&

            mission.mission_type !== "first_order" &&

            mission.mission_type !== "referral"

        ) {

            target = formatNumber(mission.goal_value);

        }

        const statusClass =

            mission.is_active

                ? "active"

                : "inactive";

        const statusText =

            mission.is_active

                ? "Active"

                : "Inactive";

        return `

            <div class="loyalty-item">

                <div class="loyalty-item-top">

                    <div>

                        <h3 class="loyalty-item-title">

                            ${escapeHtml(mission.title)}

                        </h3>

                        <p class="loyalty-item-description">

                            ${escapeHtml(

                                mission.description ||

                                "No description provided."

                            )}

                        </p>

                    </div>

                    <span class="loyalty-status ${statusClass}">

                        ${statusText}

                    </span>

                </div>

                <div class="loyalty-item-details">

                    <div class="loyalty-detail">

                        <strong>Type:</strong>

                        ${escapeHtml(

                            formatMissionType(

                                mission.mission_type

                            )

                        )}

                    </div>

                    <div class="loyalty-detail">

                        <strong>Goal:</strong>

                        ${escapeHtml(target)}

                    </div>

                    <div class="loyalty-detail">

                        <strong>Reward:</strong>

                        ${formatNumber(

                            mission.reward_points

                        )} pts

                    </div>

                    <div class="loyalty-detail">

                        <strong>Start:</strong>

                        ${formatDate(mission.start_date)}

                    </div>

                    <div class="loyalty-detail">

                        <strong>End:</strong>

                        ${formatDate(mission.end_date)}

                    </div>

                </div>

                <div class="loyalty-item-actions">

                    <button

                        class="loyalty-secondary-btn"

                        data-action="edit-mission"

                        data-id="${mission.id}">

                        Edit

                    </button>

                    <button

                        class="loyalty-secondary-btn"

                        data-action="toggle-mission"

                        data-id="${mission.id}">

                        ${mission.is_active ? "Deactivate" : "Activate"}

                    </button>

                    <button

                        class="loyalty-danger-btn"

                        data-action="delete-mission"

                        data-id="${mission.id}">

                        Delete

                    </button>

                </div>

            </div>

        `;

    }).join("");

}

/* =========================================================

   MISSION PRODUCTS / CATEGORIES

   ========================================================= */

async function loadMissionProducts() {

    const {

        data,

        error

    } = await supabaseClient

        .from("products")

        .select("id, name")

        .order("name", {

            ascending: true

        });

    if (error) {

        console.error(

            "Mission products error:",

            error

        );

        return;

    }

    missionProducts = data || [];

    const select =

        document.getElementById("missionProduct");

    if (!select) {

        return;

    }

    select.innerHTML = `

        <option value="">

            Select Product

        </option>

    `;

    missionProducts.forEach(product => {

        const option =

            document.createElement("option");

        option.value = product.id;

        option.textContent = product.name;

        select.appendChild(option);

    });

}

async function loadMissionCategories() {

    const {

        data,

        error

    } = await supabaseClient

        .from("categories")

        .select("id, name")

        .order("name", {

            ascending: true

        });

    if (error) {

        console.error(

            "Mission categories error:",

            error

        );

        return;

    }

    missionCategories = data || [];

    const select =

        document.getElementById("missionCategory");

    if (!select) {

        return;

    }

    select.innerHTML = `

        <option value="">

            Select Category

        </option>

    `;

    missionCategories.forEach(category => {

        const option =

            document.createElement("option");

        option.value = category.id;

        option.textContent = category.name;

        select.appendChild(option);

    });

}

/* =========================================================

   MISSION FORM

   ========================================================= */

function resetMissionForm() {

    const form =

        document.getElementById("missionForm");

    if (!form) {

        return;

    }

    form.reset();

    document.getElementById("missionId").value = "";

    document.getElementById("missionActive").checked = true;

    document.getElementById("missionModalTitle").textContent =

        "Add Mission";

    updateMissionFields();

}

function updateMissionFields() {

    const type =

        document.getElementById("missionType").value;

    const goalField =

        document.getElementById("missionGoalValueField");

    const productField =

        document.getElementById("missionProductField");

    const categoryField =

        document.getElementById("missionCategoryField");

    if (

        type === "specific_product"

    ) {

        goalField.style.display = "none";

        productField.style.display = "flex";

        categoryField.style.display = "none";

        return;

    }

    if (

        type === "specific_category"

    ) {

        goalField.style.display = "none";

        productField.style.display = "none";

        categoryField.style.display = "flex";

        return;

    }

    if (

        type === "first_order" ||

        type === "referral"

    ) {

        goalField.style.display = "none";

        productField.style.display = "none";

        categoryField.style.display = "none";

        return;

    }

    goalField.style.display = "flex";

    productField.style.display = "none";

    categoryField.style.display = "none";

}

function openMissionModal(mission = null) {

    resetMissionForm();

    if (mission) {

        document.getElementById("missionModalTitle").textContent =

            "Edit Mission";

        document.getElementById("missionId").value =

            mission.id;

        document.getElementById("missionTitle").value =

            mission.title || "";

        document.getElementById("missionDescription").value =

            mission.description || "";

        document.getElementById("missionType").value =

            mission.mission_type || "spend_money";

        document.getElementById("missionGoalValue").value =

            mission.goal_value ?? "";

        document.getElementById("missionProduct").value =

            mission.goal_product_id ?? "";

        document.getElementById("missionCategory").value =

            mission.goal_category_id ?? "";

        document.getElementById("missionRewardPoints").value =

            mission.reward_points ?? "";

        document.getElementById("missionStartDate").value =

            toDateTimeLocal(mission.start_date);

        document.getElementById("missionEndDate").value =

            toDateTimeLocal(mission.end_date);

        document.getElementById("missionActive").checked =

            mission.is_active !== false;

        updateMissionFields();

    }

    const modal =

        document.getElementById("missionModal");

    modal.classList.add("show");

    document.body.style.overflow = "hidden";

}

async function saveMission(event) {

    event.preventDefault();

    const id =

        document.getElementById("missionId").value;

    const title =

        document.getElementById("missionTitle").value.trim();

    const description =

        document.getElementById("missionDescription").value.trim();

    const missionType =

        document.getElementById("missionType").value;

    const goalValue =

        document.getElementById("missionGoalValue").value;

    const productId =

        document.getElementById("missionProduct").value;

    const categoryId =

        document.getElementById("missionCategory").value;

    const rewardPoints =

        document.getElementById("missionRewardPoints").value;

    const startDate =

        document.getElementById("missionStartDate").value;

    const endDate =

        document.getElementById("missionEndDate").value;

    const isActive =

        document.getElementById("missionActive").checked;

    if (!title) {

        alert("Please enter a mission title.");

        return;

    }

    if (!rewardPoints || Number(rewardPoints) <= 0) {

        alert("Please enter valid reward points.");

        return;

    }

    if (

        missionType !== "first_order" &&

        missionType !== "referral" &&

        missionType !== "specific_product" &&

        missionType !== "specific_category"

    ) {

        if (!goalValue || Number(goalValue) <= 0) {

            alert("Please enter a valid goal value.");

            return;

        }

    }

    if (

        missionType === "specific_product" &&

        !productId

    ) {

        alert("Please select a product.");

        return;

    }

    if (

        missionType === "specific_category" &&

        !categoryId

    ) {

        alert("Please select a category.");

        return;

    }

    const payload = {

        title: title,

        description:

            description || null,

        mission_type:

            missionType,

        goal_value:

            (

                missionType === "specific_product" ||

                missionType === "specific_category" ||

                missionType === "first_order" ||

                missionType === "referral"

            )

                ? null

                : Number(goalValue),

        goal_product_id:

            missionType === "specific_product"

                ? Number(productId)

                : null,

        goal_category_id:

            missionType === "specific_category"

                ? Number(categoryId)

                : null,

        reward_points:

            Number(rewardPoints),

        is_active:

            isActive,

        start_date:

            startDate

                ? new Date(startDate).toISOString()

                : null,

        end_date:

            endDate

                ? new Date(endDate).toISOString()

                : null

    };

    const button =

        document.querySelector(

            '#missionForm button[type="submit"]'

        );

    if (button) {

        button.disabled = true;

        button.textContent = "Saving...";

    }

    try {

        let result;

        if (id) {

            result = await supabaseClient

                .from("loyalty_missions")

                .update(payload)

                .eq("id", Number(id));

        } else {

            result = await supabaseClient

                .from("loyalty_missions")

                .insert(payload);

        }

        if (result.error) {

            throw result.error;

        }

        closeModal("missionModal");

        await loadMissions();

        await loadOverview();

        alert(

            id

                ? "Mission updated successfully."

                : "Mission created successfully."

        );

    } catch (error) {

        console.error(

            "Save mission error:",

            error

        );

        showError(

            "Could not save mission.\n\n" +

            error.message

        );

    } finally {

        if (button) {

            button.disabled = false;

            button.textContent = "Save Mission";

        }

    }

}

/* =========================================================

   MISSION ACTIONS

   ========================================================= */

function editMission(id) {

    const mission =

        missions.find(

            item => Number(item.id) === Number(id)

        );

    if (!mission) {

        alert("Mission not found.");

        return;

    }

    openMissionModal(mission);

}

async function toggleMission(id) {

    const mission =

        missions.find(

            item => Number(item.id) === Number(id)

        );

    if (!mission) {

        return;

    }

    const {

        error

    } = await supabaseClient

        .from("loyalty_missions")

        .update({

            is_active: !mission.is_active

        })

        .eq("id", Number(id));

    if (error) {

        showError(

            "Could not update mission.\n\n" +

            error.message

        );

        return;

    }

    await loadMissions();

    await loadOverview();

}

async function deleteMission(id) {

    const mission =

        missions.find(

            item => Number(item.id) === Number(id)

        );

    if (!mission) {

        return;

    }

    const confirmed =

        confirm(

            `Delete "${mission.title}"?\n\nThis cannot be undone.`

        );

    if (!confirmed) {

        return;

    }

    const {

        error

    } = await supabaseClient

        .from("loyalty_missions")

        .delete()

        .eq("id", Number(id));

    if (error) {

        showError(

            "Could not delete mission.\n\n" +

            error.message

        );

        return;

    }

    await loadMissions();

    await loadOverview();

}

/* =========================================================

   LEVELS

   ========================================================= */

async function loadLevels() {

    const container =

        document.getElementById("levelsList");

    if (!container) {

        return;

    }

    container.innerHTML = `

        <div class="loyalty-loading">

            Loading levels...

        </div>

    `;

    const {

        data,

        error

    } = await supabaseClient

        .from("loyalty_levels")

        .select("*")

        .order("min_points", {

            ascending: true

        });

    if (error) {

        console.error(

            "Levels error:",

            error

        );

        container.innerHTML = `

            <div class="loyalty-empty">

                <strong>Could not load levels</strong>

                ${escapeHtml(error.message)}

            </div>

        `;

        return;

    }

    levels = data || [];

    if (levels.length === 0) {

        container.innerHTML = `

            <div class="loyalty-empty">

                <strong>No levels yet</strong>

                Create your first loyalty level using the button above.

            </div>

        `;

        return;

    }

    container.innerHTML = levels.map(level => {

        const statusClass =

            level.is_active

                ? "active"

                : "inactive";

        const statusText =

            level.is_active

                ? "Active"

                : "Inactive";

        return `

            <div class="loyalty-item">

                <div class="loyalty-item-top">

                    <div>

                        <h3 class="loyalty-item-title">

                            ${escapeHtml(level.name)}

                        </h3>

                        <p class="loyalty-item-description">

                            ${escapeHtml(

                                level.description ||

                                "No description provided."

                            )}

                        </p>

                    </div>

                    <span class="loyalty-status ${statusClass}">

                        ${statusText}

                    </span>

                </div>

                <div class="loyalty-item-details">

                    <div class="loyalty-detail">

                        <strong>Minimum Points:</strong>

                        ${formatNumber(level.min_points)}

                    </div>

                    <div class="loyalty-detail">

                        <strong>Benefits:</strong>

                        ${escapeHtml(

                            level.benefits ||

                            "No benefits specified"

                        )}

                    </div>

                </div>

                <div class="loyalty-item-actions">

                    <button

                        class="loyalty-secondary-btn"

                        data-action="edit-level"

                        data-id="${level.id}">

                        Edit

                    </button>

                    <button

                        class="loyalty-secondary-btn"

                        data-action="toggle-level"

                        data-id="${level.id}">

                        ${level.is_active ? "Deactivate" : "Activate"}

                    </button>

                    <button

                        class="loyalty-danger-btn"

                        data-action="delete-level"

                        data-id="${level.id}">

                        Delete

                    </button>

                </div>

            </div>

        `;

    }).join("");

}

/* =========================================================

   LEVEL MODAL

   ========================================================= */

function resetLevelForm() {

    const form =

        document.getElementById("levelForm");

    if (!form) {

        return;

    }

    form.reset();

    document.getElementById("levelId").value = "";

    document.getElementById("levelActive").checked = true;

    document.getElementById("levelModalTitle").textContent =

        "Add Level";

}

function openLevelModal(level = null) {

    resetLevelForm();

    if (level) {

        document.getElementById("levelModalTitle").textContent =

            "Edit Level";

        document.getElementById("levelId").value =

            level.id;

        document.getElementById("levelName").value =

            level.name || "";

        document.getElementById("levelMinPoints").value =

            level.min_points ?? "";

        document.getElementById("levelDescription").value =

            level.description || "";

        document.getElementById("levelBenefits").value =

            level.benefits || "";

        document.getElementById("levelActive").checked =

            level.is_active !== false;

    }

    const modal =

        document.getElementById("levelModal");

    modal.classList.add("show");

    document.body.style.overflow = "hidden";

}

async function saveLevel(event) {

    event.preventDefault();

    const id =

        document.getElementById("levelId").value;

    const name =

        document.getElementById("levelName").value.trim();

    const minPoints =

        document.getElementById("levelMinPoints").value;

    const description =

        document.getElementById("levelDescription").value.trim();

    const benefits =

        document.getElementById("levelBenefits").value.trim();

    const isActive =

        document.getElementById("levelActive").checked;

    if (!name) {

        alert("Please enter a level name.");

        return;

    }

    if (

        minPoints === "" ||

        Number(minPoints) < 0

    ) {

        alert("Please enter valid minimum points.");

        return;

    }

    const payload = {

        name: name,

        min_points:

            Number(minPoints),

        description:

            description || null,

        benefits:

            benefits || null,

        is_active:

            isActive

    };

    const button =

        document.querySelector(

            '#levelForm button[type="submit"]'

        );

    if (button) {

        button.disabled = true;

        button.textContent = "Saving...";

    }

    try {

        let result;

        if (id) {

            result = await supabaseClient

                .from("loyalty_levels")

                .update(payload)

                .eq("id", Number(id));

        } else {

            result = await supabaseClient

                .from("loyalty_levels")

                .insert(payload);

        }

        if (result.error) {

            throw result.error;

        }

        closeModal("levelModal");

        await loadLevels();

        await loadOverview();

        alert(

            id

                ? "Level updated successfully."

                : "Level created successfully."

        );

    } catch (error) {

        console.error(

            "Save level error:",

            error

        );

        showError(

            "Could not save level.\n\n" +

            error.message

        );

    } finally {

        if (button) {

            button.disabled = false;

            button.textContent = "Save Level";

        }

    }

}

/* =========================================================

   LEVEL ACTIONS

   ========================================================= */

function editLevel(id) {

    const level =

        levels.find(

            item => Number(item.id) === Number(id)

        );

    if (!level) {

        alert("Level not found.");

        return;

    }

    openLevelModal(level);

}

async function toggleLevel(id) {

    const level =

        levels.find(

            item => Number(item.id) === Number(id)

        );

    if (!level) {

        return;

    }

    const {

        error

    } = await supabaseClient

        .from("loyalty_levels")

        .update({

            is_active: !level.is_active

        })

        .eq("id", Number(id));

    if (error) {

        showError(

            "Could not update level.\n\n" +

            error.message

        );

        return;

    }

    await loadLevels();

    await loadOverview();

}

async function deleteLevel(id) {

    const level =

        levels.find(

            item => Number(item.id) === Number(id)

        );

    if (!level) {

        return;

    }

    const confirmed =

        confirm(

            `Delete "${level.name}"?\n\nThis cannot be undone.`

        );

    if (!confirmed) {

        return;

    }

    const {

        error

    } = await supabaseClient

        .from("loyalty_levels")

        .delete()

        .eq("id", Number(id));

    if (error) {

        showError(

            "Could not delete level.\n\n" +

            error.message

        );

        return;

    }

    await loadLevels();

    await loadOverview();

}

/* =========================================================

   MODAL CLOSE

   ========================================================= */

function closeModal(modalId) {

    const modal =

        document.getElementById(modalId);

    if (!modal) {

        return;

    }

    modal.classList.remove("show");

    document.body.style.overflow = "";

}

/* =========================================================

   LOYALTY SETTINGS

   ========================================================= */

async function loadLoyaltySettings() {

    const message = document.getElementById("loyaltySettingsMessage");

    if (message) { message.textContent = "Loading settings..."; message.classList.remove("error"); }

    try {

        const { data, error } = await supabaseClient.from("loyalty_settings")

            .select("id, is_enabled, amount_per_points, points_per_amount, minimum_order_amount, award_on_status")

            .eq("id", 1).maybeSingle();

        if (error) throw error;

        // Show sensible defaults if the singleton row has not been created yet.

        // Saving the form will create/update id = 1 through upsert.

        const settings = data || {

            is_enabled: false,

            amount_per_points: 100,

            points_per_amount: 10,

            minimum_order_amount: 0,

            award_on_status: "delivered"

        };

        document.getElementById("loyaltyEnabled").checked = settings.is_enabled === true;

        document.getElementById("amountPerPoints").value = settings.amount_per_points ?? 100;

        document.getElementById("pointsPerAmount").value = settings.points_per_amount ?? 10;

        document.getElementById("minimumOrderAmount").value = settings.minimum_order_amount ?? 0;

        document.getElementById("awardOnStatus").value = settings.award_on_status || "delivered";

        if (message) message.textContent = data ? "Settings loaded." : "Default settings shown. Save to create the settings row.";

    } catch (error) {

        console.error("Load loyalty settings error:", error);

        if (message) { message.textContent = "Could not load settings: " + error.message; message.classList.add("error"); }

    }

}

async function saveLoyaltySettings(event) {

    event.preventDefault();

    const enabled = document.getElementById("loyaltyEnabled").checked;

    const amountPerPoints = Number(document.getElementById("amountPerPoints").value);

    const pointsPerAmount = Number(document.getElementById("pointsPerAmount").value);

    const minimumOrderAmount = Number(document.getElementById("minimumOrderAmount").value);

    const awardOnStatus = document.getElementById("awardOnStatus").value;

    const button = document.getElementById("saveLoyaltySettingsBtn");

    const message = document.getElementById("loyaltySettingsMessage");

    if (!Number.isFinite(amountPerPoints) || amountPerPoints <= 0 || !Number.isInteger(pointsPerAmount) || pointsPerAmount <= 0 || !Number.isFinite(minimumOrderAmount) || minimumOrderAmount < 0) {

        if (message) { message.textContent = "Enter valid earning values and a minimum order of zero or more."; message.classList.add("error"); }

        return;

    }

    const payload = { id: 1, is_enabled: enabled, amount_per_points: amountPerPoints, points_per_amount: pointsPerAmount, minimum_order_amount: minimumOrderAmount, award_on_status: awardOnStatus, updated_at: new Date().toISOString() };

    if (button) { button.disabled = true; button.textContent = "Saving..."; }

    if (message) { message.textContent = ""; message.classList.remove("error"); }

    try {

        const { error } = await supabaseClient.from("loyalty_settings").upsert(payload, { onConflict: "id" });

        if (error) throw error;

        if (message) message.textContent = "Settings saved successfully.";

    } catch (error) {

        console.error("Save loyalty settings error:", error);

        if (message) { message.textContent = "Could not save settings: " + error.message; message.classList.add("error"); }

    } finally {

        if (button) { button.disabled = false; button.textContent = "Save Settings"; }

    }

}

/* =========================================================

   EVENT LISTENERS

   ========================================================= */

function setupEventListeners() {

    /* ---------------- TABS ---------------- */

    document

        .querySelectorAll(".loyalty-tab")

        .forEach(button => {

            button.addEventListener(

                "click",

                () => {

                    openTab(button.dataset.tab);

                }

            );

        });

    /* ---------------- MANAGEMENT CARDS ---------------- */

    document

        .querySelectorAll("[data-open-tab]")

        .forEach(button => {

            button.addEventListener(

                "click",

                () => {

                    openTab(

                        button.dataset.openTab

                    );

                }

            );

        });

    /* ---------------- LOYALTY SETTINGS ---------------- */

    const settingsForm = document.getElementById("loyaltySettingsForm");

    if (settingsForm) settingsForm.addEventListener("submit", saveLoyaltySettings);

    /* ---------------- ADD REWARD ---------------- */

    const addRewardBtn =

        document.getElementById("addRewardBtn");

    if (addRewardBtn) {

        addRewardBtn.addEventListener(

            "click",

            () => openRewardModal()

        );

    }

    /* ---------------- ADD MISSION ---------------- */

    const addMissionBtn =

        document.getElementById("addMissionBtn");

    if (addMissionBtn) {

        addMissionBtn.addEventListener(

            "click",

            async () => {

                await loadMissionProducts();

                await loadMissionCategories();

                openMissionModal();

            }

        );

    }

    /* ---------------- ADD LEVEL ---------------- */

    const addLevelBtn =

        document.getElementById("addLevelBtn");

    if (addLevelBtn) {

        addLevelBtn.addEventListener(

            "click",

            () => openLevelModal()

        );

    }

    /* ---------------- CLOSE MODALS ---------------- */

    document

        .querySelectorAll("[data-close-modal]")

        .forEach(button => {

            button.addEventListener(

                "click",

                () => {

                    closeModal(

                        button.dataset.closeModal

                    );

                }

            );

        });

    /* ---------------- MODAL BACKDROP ---------------- */

    document

        .querySelectorAll(".loyalty-modal")

        .forEach(modal => {

            modal.addEventListener(

                "click",

                event => {

                    if (event.target === modal) {

                        closeModal(modal.id);

                    }

                }

            );

        });

    /* ---------------- ESCAPE KEY ---------------- */

    document.addEventListener(

        "keydown",

        event => {

            if (event.key !== "Escape") {

                return;

            }

            document

                .querySelectorAll(".loyalty-modal.show")

                .forEach(modal => {

                    closeModal(modal.id);

                });

        }

    );

    /* ---------------- REWARD FORM ---------------- */

    const rewardForm =

        document.getElementById("rewardForm");

    if (rewardForm) {

        rewardForm.addEventListener(

            "submit",

            saveReward

        );

    }

    /* ---------------- MISSION FORM ---------------- */

    const missionForm =

        document.getElementById("missionForm");

    if (missionForm) {

        missionForm.addEventListener(

            "submit",

            saveMission

        );

    }

    /* ---------------- LEVEL FORM ---------------- */

    const levelForm =

        document.getElementById("levelForm");

    if (levelForm) {

        levelForm.addEventListener(

            "submit",

            saveLevel

        );

    }

    /* ---------------- MISSION TYPE ---------------- */

    const missionType =

        document.getElementById("missionType");

    if (missionType) {

        missionType.addEventListener(

            "change",

            updateMissionFields

        );

    }

    /* ---------------- REWARD / MISSION / LEVEL ACTIONS ---------------- */

    document.addEventListener(

        "click",

        async event => {

            const button =

                event.target.closest(

                    "[data-action]"

                );

            if (!button) {

                return;

            }

            const action =

                button.dataset.action;

            const id =

                button.dataset.id;

            if (action === "edit-reward") {

                editReward(id);

            }

            if (action === "toggle-reward") {

                await toggleReward(id);

            }

            if (action === "delete-reward") {

                await deleteReward(id);

            }

            if (action === "edit-mission") {

                editMission(id);

            }

            if (action === "toggle-mission") {

                await toggleMission(id);

            }

            if (action === "delete-mission") {

                await deleteMission(id);

            }

            if (action === "edit-level") {

                editLevel(id);

            }

            if (action === "toggle-level") {

                await toggleLevel(id);

            }

            if (action === "delete-level") {

                await deleteLevel(id);

            }

        }

    );

    /* ---------------- LOGOUT ---------------- */

    const logoutBtn =

        document.getElementById("logoutBtn");

    if (logoutBtn) {

        logoutBtn.addEventListener(

            "click",

            async () => {

                await supabaseClient.auth.signOut();

                window.location.href =

                    "login.html";

            }

        );

    }

}

/* =========================================================

   INITIALIZE

   ========================================================= */

async function initializeLoyalty() {

    const isAdmin =

        await checkAdmin();

    if (!isAdmin) {

        return;

    }

    setupEventListeners();

    try {

        await Promise.all([

            loadOverview(),

            loadRewards(),

            loadMissions(),

            loadLevels(),

            loadMissionProducts(),

            loadMissionCategories(),

            loadLoyaltySettings()

        ]);

    } catch (error) {

        console.error(

            "Loyalty initialization error:",

            error

        );

    }

}

/* =========================================================

   START

   ========================================================= */

document.addEventListener(

    "DOMContentLoaded",

    initializeLoyalty

);