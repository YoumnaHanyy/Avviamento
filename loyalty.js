/* =========================================================
   AVVIAMENTO - AV REWARDS
   CUSTOMER LOYALTY PAGE
========================================================= */

let loyaltyEmail = "";
let loyaltyCustomer = null;

let rewards = [];
let missions = [];
let levels = [];
let redemptions = [];


/* =========================================================
   STORAGE
========================================================= */

const LOYALTY_EMAIL_KEY =
    "avviamentoLoyaltyEmail";


function saveLoyaltyEmail(email) {

    sessionStorage.setItem(
        LOYALTY_EMAIL_KEY,
        email
    );

}


function getSavedLoyaltyEmail() {

    return (
        sessionStorage.getItem(
            LOYALTY_EMAIL_KEY
        ) || ""
    );

}


function clearSavedLoyaltyEmail() {

    sessionStorage.removeItem(
        LOYALTY_EMAIL_KEY
    );

}


/* =========================================================
   DOM
========================================================= */

const loginSection =
    document.getElementById("loginSection");

const loyaltyDashboard =
    document.getElementById("loyaltyDashboard");

const loadingState =
    document.getElementById("loadingState");

const loyaltyLoginForm =
    document.getElementById("loyaltyLoginForm");

const loyaltyEmailInput =
    document.getElementById("loyaltyEmail");

const loginError =
    document.getElementById("loginError");

const continueButton =
    document.getElementById("continueButton");

const customerEmail =
    document.getElementById("customerEmail");

const pointsValue =
    document.getElementById("pointsValue");

const levelName =
    document.getElementById("levelName");

const nextLevelText =
    document.getElementById("nextLevelText");

const currentLevelPoints =
    document.getElementById("currentLevelPoints");

const nextLevelPoints =
    document.getElementById("nextLevelPoints");

const progressFill =
    document.getElementById("progressFill");

const rewardsGrid =
    document.getElementById("rewardsGrid");

const missionsGrid =
    document.getElementById("missionsGrid");

const promoList =
    document.getElementById("promoList");

const logoutButton =
    document.getElementById("logoutButton");

const toast =
    document.getElementById("loyaltyToast");


/* =========================================================
   HELPERS
========================================================= */

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
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

    return Number(value || 0)
        .toLocaleString("en-US");

}


function showToast(message) {

    if (!toast) {
        return;
    }

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );

    setTimeout(() => {

        toast.classList.remove(
            "show"
        );

    }, 2500);

}


function showLoginError(message) {

    if (loginError) {

        loginError.textContent =
            message;

    }

}


function clearLoginError() {

    if (loginError) {

        loginError.textContent =
            "";

    }

}


/* =========================================================
   REWARD VALUE
========================================================= */

function getRewardValueText(reward) {

    const type =
        String(
            reward.reward_type || ""
        ).toLowerCase();

    const value =
        Number(
            reward.reward_value || 0
        );


    if (
        type.includes("percentage") ||
        type.includes("percent")
    ) {

        return `${value}% OFF`;

    }


    if (
        type.includes("fixed") ||
        type.includes("amount")
    ) {

        return `${formatNumber(value)} EGP OFF`;

    }


    if (
        type.includes("shipping")
    ) {

        return "FREE SHIPPING";

    }


    if (
        type.includes("gift")
    ) {

        return "SPECIAL GIFT";

    }


    if (
        type.includes("early")
    ) {

        return "EARLY ACCESS";

    }


    return "";

}


/* =========================================================
   LOAD CUSTOMER
========================================================= */


async function loadCustomer() {
    const { data, error } = await supabaseClient.rpc(
        "get_my_loyalty_profile"
    );

    if (error) {
        console.error("Customer error:", error);
        throw error;
    }

    if (!data) {
        throw new Error(
            "Could not load your AV Rewards profile."
        );
    }

    loyaltyCustomer = data;
}



/* =========================================================
   LOAD REWARDS
========================================================= */

async function loadRewards() {

    const {
        data,
        error
    } = await supabaseClient.rpc(
        "get_active_loyalty_rewards"
    );


    if (error) {

        console.error(
            "Rewards error:",
            error
        );

        throw error;

    }


    rewards =
        Array.isArray(data)
            ? data
            : [];

}


/* =========================================================
   LOAD MISSIONS
========================================================= */

async function loadMissions() {

    const {
        data,
        error
    } = await supabaseClient.rpc(
        "get_active_loyalty_missions"
    );


    if (error) {

        console.error(
            "Missions error:",
            error
        );

        throw error;

    }


    missions =
        Array.isArray(data)
            ? data
            : [];

}


/* =========================================================
   LOAD LEVELS
========================================================= */

async function loadLevels() {

    const {
        data,
        error
    } = await supabaseClient.rpc(
        "get_active_loyalty_levels"
    );


    if (error) {

        console.error(
            "Levels error:",
            error
        );

        throw error;

    }


    levels =
        Array.isArray(data)
            ? data
            : [];

}


/* =========================================================
   LOAD PROMO CODES
========================================================= */

async function loadRedemptions() {

    const {
        data,
        error
    } = await supabaseClient.rpc(
        "get_loyalty_redemptions_by_email",
        {
            p_email: loyaltyEmail
        }
    );


    if (error) {

        console.error(
            "Redemptions error:",
            error
        );

        throw error;

    }


    redemptions =
        Array.isArray(data)
            ? data
            : [];

}


/* =========================================================
   LOAD EVERYTHING
========================================================= */

async function loadLoyaltyData() {

    loadingState.hidden =
        false;

    loyaltyDashboard.hidden =
        true;


    try {

        await loadCustomer();


        await Promise.all([
            loadRewards(),
            loadMissions(),
            loadLevels(),
            loadRedemptions()
        ]);


        renderProfile();

        renderRewards();

        renderMissions();

        renderRedemptions();


        loginSection.hidden =
            true;

        loyaltyDashboard.hidden =
            false;


        window.scrollTo({
            top: 0,
            behavior: "instant"
        });


    }

    catch (error) {

        console.error(
            "Loyalty loading error:",
            error
        );


        /*
         * If the saved email is no longer
         * valid, remove it so the customer
         * can enter another email.
         */

        clearSavedLoyaltyEmail();

        loyaltyEmail =
            "";

        loyaltyCustomer =
            null;


        loginSection.hidden =
            false;

        loyaltyDashboard.hidden =
            true;


        showLoginError(
            error.message ||
            "Something went wrong. Please try again."
        );

    }

    finally {

        loadingState.hidden =
            true;

    }

}


/* =========================================================
   LEVEL
========================================================= */

function getCurrentLevel() {

    if (!levels.length) {

        return {
            name: "AV MEMBER",
            min_points: 0
        };

    }


    const lifetimePoints =
        Number(
            loyaltyCustomer?.lifetime_points || 0
        );


    let currentLevel =
        levels[0];


    levels.forEach(level => {

        if (
            lifetimePoints >=
            Number(
                level.min_points || 0
            )
        ) {

            currentLevel =
                level;

        }

    });


    return currentLevel;

}


function getNextLevel(currentLevel) {

    const currentMin =
        Number(
            currentLevel?.min_points || 0
        );


    return levels.find(level =>
        Number(
            level.min_points || 0
        ) > currentMin
    ) || null;

}


/* =========================================================
   PROFILE
========================================================= */

function renderProfile() {

    const points =
        Number(
            loyaltyCustomer?.points || 0
        );


    const lifetimePoints =
        Number(
            loyaltyCustomer?.lifetime_points || 0
        );


    const currentLevel =
        getCurrentLevel();


    const nextLevel =
        getNextLevel(
            currentLevel
        );


    customerEmail.textContent =
        loyaltyCustomer.email;


    pointsValue.textContent =
        formatNumber(points);


    levelName.textContent =
        currentLevel.name ||
        "AV MEMBER";


    currentLevelPoints.textContent =
        `${formatNumber(lifetimePoints)} points`;


    if (!nextLevel) {

        nextLevelText.textContent =
            "MAX LEVEL";

        nextLevelPoints.textContent =
            "Highest level unlocked";

        progressFill.style.width =
            "100%";

        return;

    }


    const currentMin =
        Number(
            currentLevel.min_points || 0
        );


    const nextMin =
        Number(
            nextLevel.min_points || 0
        );


    const range =
        nextMin -
        currentMin;


    const progress =
        range > 0
            ? (
                (
                    lifetimePoints -
                    currentMin
                ) /
                range
            ) * 100
            : 0;


    progressFill.style.width =
        `${Math.min(
            100,
            Math.max(
                0,
                progress
            )
        )}%`;


    const remaining =
        Math.max(
            0,
            nextMin -
            lifetimePoints
        );


    nextLevelText.textContent =
        `${formatNumber(
            remaining
        )} points to ${nextLevel.name}`;


    nextLevelPoints.textContent =
        `${formatNumber(
            nextMin
        )} points`;

}


/* =========================================================
   REWARDS
========================================================= */

function renderRewards() {

    rewardsGrid.innerHTML =
        "";


    if (!rewards.length) {

        rewardsGrid.innerHTML = `
            <div class="promo-empty">
                No rewards are available right now.
            </div>
        `;

        return;

    }


    const points =
        Number(
            loyaltyCustomer?.points || 0
        );


    rewards.forEach(
        reward => {

            const requiredPoints =
                Number(
                    reward.points_required || 0
                );


            const unlocked =
                points >=
                requiredPoints;


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                unlocked
                    ? "reward-card"
                    : "reward-card locked";


            const missingPoints =
                Math.max(
                    0,
                    requiredPoints -
                    points
                );


            card.innerHTML = `

                <div>

                    <div class="reward-top">

                        <div class="reward-icon">

                            <i class="fa-solid fa-gift"></i>

                        </div>

                        <span class="reward-points">

                            ${formatNumber(
                                requiredPoints
                            )} PTS

                        </span>

                    </div>


                    <h3>

                        ${escapeHtml(
                            reward.name
                        )}

                    </h3>


                    <p class="reward-description">

                        ${escapeHtml(
                            reward.description ||
                            ""
                        )}

                    </p>


                    <p class="reward-value">

                        ${escapeHtml(
                            getRewardValueText(
                                reward
                            )
                        )}

                    </p>

                </div>


                <button
                    type="button"
                    class="reward-action"
                    data-reward-id="${reward.id}"
                    ${unlocked ? "" : "disabled"}
                >

                    ${
                        unlocked
                            ? "REDEEM REWARD"
                            : `${formatNumber(
                                missingPoints
                            )} MORE POINTS`
                    }

                </button>

            `;


            rewardsGrid.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   MISSIONS
========================================================= */

function renderMissions() {

    missionsGrid.innerHTML =
        "";


    if (!missions.length) {

        missionsGrid.innerHTML = `
            <div class="promo-empty">
                No missions are available right now.
            </div>
        `;

        return;

    }


    missions.forEach(
        mission => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "mission-card";


            card.innerHTML = `

                <div class="mission-card-top">

                    <div class="mission-icon">

                        <i class="fa-solid fa-bullseye"></i>

                    </div>

                    <span class="mission-points">

                        +${formatNumber(
                            mission.reward_points
                        )} PTS

                    </span>

                </div>


                <h3>

                    ${escapeHtml(
                        mission.title
                    )}

                </h3>


                <p>

                    ${escapeHtml(
                        mission.description ||
                        ""
                    )}

                </p>


                <span class="mission-type">

                    ${escapeHtml(
                        mission.mission_type ||
                        "MISSION"
                    )}

                </span>

            `;


            missionsGrid.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   PROMO CODES
========================================================= */

function renderRedemptions() {

    promoList.innerHTML =
        "";


    const available =
        redemptions.filter(
            item =>
                item.status ===
                "active"
        );


    if (!available.length) {

        promoList.innerHTML = `
            <div class="promo-empty">

                Redeem one of your rewards
                to receive a one-time promo code.

            </div>
        `;

        return;

    }


    available.forEach(
        redemption => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "promo-card";


            card.innerHTML = `

                <div class="promo-left">

                    <div class="promo-code">

                        ${escapeHtml(
                            redemption.discount_code
                        )}

                    </div>


                    <div>

                        <div class="promo-name">

                            ${escapeHtml(
                                redemption.reward_name ||
                                "AV Reward"
                            )}

                        </div>

                        <div class="promo-status">

                            AVAILABLE

                        </div>

                    </div>

                </div>


                <button
                    type="button"
                    class="copy-promo-button"
                    data-code="${escapeHtml(
                        redemption.discount_code
                    )}"
                >

                    COPY CODE

                </button>

            `;


            promoList.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   REDEEM
========================================================= */

async function redeemReward(
    rewardId
) {

    const button =
        document.querySelector(
            `.reward-action[data-reward-id="${rewardId}"]`
        );


    if (button) {

        button.disabled =
            true;

        button.textContent =
            "REDEEMING...";

    }


    try {

        const { data, error } = await supabaseClient.rpc(
    "redeem_loyalty_reward",
    {
        p_reward_id: Number(rewardId)
    }
);


        if (error) {

            throw error;

        }


        if (
            !data ||
            !data.discount_code
        ) {

            throw new Error(
                "The reward could not be redeemed."
            );

        }


        showToast(
            `Reward unlocked: ${data.discount_code}`
        );


        await loadLoyaltyData();

    }

    catch (error) {

        console.error(
            "Redeem error:",
            error
        );


        showToast(
            error.message ||
            "Could not redeem this reward."
        );


        if (button) {

            button.disabled =
                false;

            button.textContent =
                "REDEEM REWARD";

        }

    }

}


/* =========================================================
   REWARD CLICK
========================================================= */

rewardsGrid.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".reward-action"
            );


        if (!button) {

            return;

        }


        const rewardId =
            button.dataset.rewardId;


        if (!rewardId) {

            return;

        }


        redeemReward(
            rewardId
        );

    }
);


/* =========================================================
   COPY PROMO CODE
========================================================= */

promoList.addEventListener(
    "click",
    async event => {

        const button =
            event.target.closest(
                ".copy-promo-button"
            );


        if (!button) {

            return;

        }


        const code =
            button.dataset.code;


        if (!code) {

            return;

        }


        try {

            await navigator.clipboard.writeText(
                code
            );


            button.textContent =
                "COPIED ✓";


            showToast(
                "Promo code copied."
            );


            setTimeout(() => {

                button.textContent =
                    "COPY CODE";

            }, 1800);

        }

        catch (error) {

            showToast(
                `Code: ${code}`
            );

        }

    }
);


/* =========================================================
   EMAIL LOGIN
========================================================= */

loyaltyLoginForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        clearLoginError();


        const email =
            loyaltyEmailInput.value
                .trim()
                .toLowerCase();


        if (!email) {

            showLoginError(
                "Please enter your email."
            );

            return;

        }


        if (
            !loyaltyEmailInput.checkValidity()
        ) {

            showLoginError(
                "Please enter a valid email address."
            );

            return;

        }


        loyaltyEmail =
            email;


        /*
         * Save the email for this browser tab.
         * This allows the loyalty page to survive
         * a refresh.
         */

        saveLoyaltyEmail(
            loyaltyEmail
        );


        continueButton.disabled =
            true;


        continueButton.innerHTML = `
            <span>LOADING...</span>
        `;


        try {

            await loadLoyaltyData();

        }

        catch (error) {

            console.error(
                error
            );

        }

        finally {

            continueButton.disabled =
                false;


            continueButton.innerHTML = `
                <span>CONTINUE</span>
                <span class="button-arrow">→</span>
            `;

        }

    }
);


/* =========================================================
   CHANGE EMAIL / LOGOUT
========================================================= */

logoutButton.addEventListener(
    "click",
    () => {

        /*
         * Clear the saved loyalty session
         * when the customer explicitly
         * chooses Change Email / Logout.
         */

        clearSavedLoyaltyEmail();


        loyaltyEmail =
            "";

        loyaltyCustomer =
            null;

        rewards = [];

        missions = [];

        levels = [];

        redemptions = [];


        loyaltyDashboard.hidden =
            true;

        loginSection.hidden =
            false;


        loyaltyEmailInput.value =
            "";


        clearLoginError();


        window.scrollTo({
            top: 0,
            behavior: "instant"
        });


        setTimeout(() => {

            loyaltyEmailInput.focus();

        }, 300);

    }
);


/* =========================================================
   INITIAL PAGE STATE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        /*
         * Restore the loyalty session after refresh.
         */

        const savedEmail =
            getSavedLoyaltyEmail();


        if (!savedEmail) {

            loyaltyEmail =
                "";

            loyaltyCustomer =
                null;

            rewards = [];

            missions = [];

            levels = [];

            redemptions = [];


            loginSection.hidden =
                false;

            loyaltyDashboard.hidden =
                true;

            loadingState.hidden =
                true;


            return;

        }


        /*
         * We found a previous loyalty session.
         * Load the customer automatically.
         */

        loyaltyEmail =
            savedEmail;


        loyaltyEmailInput.value =
            savedEmail;


        await loadLoyaltyData();

    }
);