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
        label: "About Us",
        url: "about.html",
        order: 4,
        active: true
    },

    {
        id: 5,
        label: "Shipping Policy",
        url: "shipping-policy.html",
        order: 5,
        active: true
    },
        {
        id: 5,
        label: "Refund & Exchange Policy",
        url: "refund-policy.html",
        order: 5,
        active: true
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


function renderMenu() {

    menuLinks.innerHTML = "";


    const visibleItems =
        menuItems
            .filter(
                item =>
                    item.active
            )
            .sort(
                (a, b) =>
                    a.order - b.order
            );


    visibleItems.forEach(
        item => {

            const link =
                document.createElement(
                    "a"
                );


            link.href =
                item.url;


            link.textContent =
                item.label;


            menuLinks.appendChild(
                link
            );

        }
    );

}


function openMenu() {

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