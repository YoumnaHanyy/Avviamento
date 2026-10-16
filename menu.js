let menuItems = [

    {
        id: 1,
        label: "Home",
        url: "index.html",
        order: 1,
        active: true
    },

    {
        id: 2,
        label: "Shop",
        url: "products.html",
        order: 2,
        active: true
    },

    {
        id: 3,
        label: "New Arrivals",
        url: "products.html",
        order: 3,
        active: true
    },

    {
        id: 4,
        label: "AV Rewards",
        url: "loyalty.html",
        order: 4,
        active: true
    },

    {
        id: 5,
        label: "About Us",
        url: "about.html",
        order: 5,
        active: true
    },

    {
        id: 6,
        label: "Shipping Policy",
        url: "shipping-policy.html",
        order: 6,
        active: true
    },
{
    id: 7,
    label: "Return & Exchange",
    order: 7,
    active: true,
    children: [
        {
            label: "RETURN & EXCHANGE POLICY",
            url: "refund-policy.html"
        },
        {
            label: "RETURN & EXCHANGE FORM",
            url: "contact.html"
        }
    ]
}

];


const menuButton =
    document.getElementById(
        "menuButton"
    );


const closeMenu =
    document.getElementById(
        "closeMenu"
    );


const sideMenu =
    document.getElementById(
        "sideMenu"
    );


const menuOverlay =
    document.getElementById(
        "menuOverlay"
    );


const menuLinks =
    document.getElementById(
        "menuLinks"
    );
const desktopMenuLinks =
    document.getElementById("desktopMenuLinks");



function renderMenu() {
    const visibleItems = menuItems
        .filter(item => item.active)
        .sort((a, b) => a.order - b.order);

    function buildLinks(container, isDesktop) {
        if (!container) return;

        container.innerHTML = "";

        visibleItems.forEach(item => {
            if (item.children && item.children.length > 0) {
                const dropdown = document.createElement("div");
                dropdown.className = "menu-dropdown";

                const toggle = document.createElement("button");
                toggle.type = "button";
                toggle.className = "menu-dropdown-toggle";
                toggle.setAttribute("aria-expanded", "false");

                const label = document.createElement("span");
                label.textContent = item.label;

                const arrow = document.createElement("i");
                arrow.className = "fa-solid fa-chevron-down";

                toggle.append(label, arrow);

                const submenu = document.createElement("div");
                submenu.className = "menu-submenu";

                item.children.forEach(child => {
                    const link = document.createElement("a");
                    link.href = child.url;
                    link.textContent = child.label;
                    submenu.appendChild(link);
                });

                toggle.addEventListener("click", () => {
                    const isOpen = dropdown.classList.toggle("open");
                    toggle.setAttribute("aria-expanded", String(isOpen));
                });

                dropdown.append(toggle, submenu);
                container.appendChild(dropdown);
            } else {
                const link = document.createElement("a");
                link.href = item.url;
                link.textContent = item.label;
                container.appendChild(link);
            }
        });
    }

    buildLinks(menuLinks, false);
    buildLinks(desktopMenuLinks, true);
}



function openMenu() {

    if (!sideMenu || !menuOverlay) {
        return;
    }


    sideMenu.classList.add(
        "active"
    );


    menuOverlay.classList.add(
        "active"
    );


    document.body.classList.add(
        "menu-open"
    );

}


function hideMenu() {

    if (!sideMenu || !menuOverlay) {
        return;
    }


    sideMenu.classList.remove(
        "active"
    );


    menuOverlay.classList.remove(
        "active"
    );


    document.body.classList.remove(
        "menu-open"
    );

}


if (menuButton) {

    menuButton.addEventListener(
        "click",
        openMenu
    );

}


if (closeMenu) {

    closeMenu.addEventListener(
        "click",
        hideMenu
    );

}


if (menuOverlay) {

    menuOverlay.addEventListener(
        "click",
        hideMenu
    );

}


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            hideMenu();

        }

    }
);


renderMenu();