const searchableProducts = [
    {
        id: 1,
        name: "Linen Shirt",
        price: 1450,
        image: "images/henley.jpg"
    },

    {
        id: 2,
        name: "Piqué Polo",
        price: 1250,
        image: "images/knitted.jpg"
    },

    {
        id: 3,
        name: "Tailored Trousers",
        price: 1650,
        image: "images/trousers.jpg"
    },

    {
        id: 4,
        name: "Overshirt",
        price: 1750,
        image: "images/overshirt.jpg"
    }
];


const searchButton =
    document.getElementById("searchButton");


if (searchButton) {

    const searchOverlay =
        document.createElement("div");

    searchOverlay.className =
        "search-overlay";

    searchOverlay.id =
        "globalSearchOverlay";


    const searchPanel =
        document.createElement("div");

    searchPanel.className =
        "search-panel";

    searchPanel.id =
        "globalSearchPanel";


    searchPanel.innerHTML = `
        <div class="search-panel-header">

            <h2>Search</h2>

            <button
                class="search-close"
                id="globalSearchClose"
                type="button"
                aria-label="Close search"
            >
                <i class="fa-solid fa-xmark"></i>
            </button>

        </div>


        <div class="search-input-box">

            <i class="fa-solid fa-magnifying-glass"></i>

            <input
                type="search"
                id="globalSearchInput"
                placeholder="Search Polo, Shirt, Trousers..."
                autocomplete="off"
            >

            <button
                class="clear-search"
                id="globalSearchClear"
                type="button"
                aria-label="Clear search"
            >
                <i class="fa-solid fa-xmark"></i>
            </button>

        </div>


        <p
            class="search-status"
            id="globalSearchStatus"
        >
            Start typing to search products.
        </p>


        <div
            class="search-results-overlay"
            id="globalSearchResults"
        ></div>
    `;


    document.body.appendChild(
        searchOverlay
    );

    document.body.appendChild(
        searchPanel
    );


    const searchClose =
        document.getElementById(
            "globalSearchClose"
        );

    const searchInput =
        document.getElementById(
            "globalSearchInput"
        );

    const searchClear =
        document.getElementById(
            "globalSearchClear"
        );

    const searchStatus =
        document.getElementById(
            "globalSearchStatus"
        );

    const searchResults =
        document.getElementById(
            "globalSearchResults"
        );


    function openSearch() {

        searchOverlay.classList.add(
            "active"
        );

        searchPanel.classList.add(
            "active"
        );

        document.body.classList.add(
            "search-open"
        );


        setTimeout(() => {

            searchInput.focus();

        }, 200);

    }


    function closeSearch() {

        searchOverlay.classList.remove(
            "active"
        );

        searchPanel.classList.remove(
            "active"
        );

        document.body.classList.remove(
            "search-open"
        );

    }


    function clearResults() {

        searchInput.value = "";

        searchResults.innerHTML = "";

        searchStatus.textContent =
            "Start typing to search products.";

        searchClear.classList.remove(
            "show"
        );

        searchInput.focus();

    }


    function renderSearchResults(list) {

        searchResults.innerHTML = "";


        if (list.length === 0) {

            searchResults.innerHTML = `
                <div class="search-no-results">

                    <i class="fa-solid fa-magnifying-glass"></i>

                    <h3>No products found</h3>

                    <p>
                        Try searching with another product name.
                    </p>

                </div>
            `;

            return;

        }


        list.forEach(product => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "search-result-card";


            card.innerHTML = `
                <div class="search-result-image">

                    <img
                        src="${product.image}"
                        alt="${product.name}"
                    >

                </div>

                <div class="search-result-info">

                    <h3>
                        ${product.name}
                    </h3>

                    <p>
                        EGP ${product.price.toLocaleString()}
                    </p>

                </div>
            `;


            card.addEventListener(
                "click",
                () => {

                    window.location.href =
                        `product-details.html?id=${product.id}`;

                }
            );


            searchResults.appendChild(
                card
            );

        });

    }


    function searchProducts() {

        const query =
            searchInput.value
                .trim()
                .toLowerCase();


        if (query === "") {

            searchResults.innerHTML = "";

            searchStatus.textContent =
                "Start typing to search products.";

            searchClear.classList.remove(
                "show"
            );

            return;

        }


        searchClear.classList.add(
            "show"
        );


        const words =
            query
                .split(/\s+/)
                .filter(Boolean);


        const filteredProducts =
            searchableProducts.filter(
                product => {

                    const productName =
                        product.name
                            .toLowerCase();


                    return words.every(
                        word =>
                            productName.includes(
                                word
                            )
                    );

                }
            );


        searchStatus.textContent =
            `${filteredProducts.length} result${filteredProducts.length !== 1 ? "s" : ""} for "${searchInput.value.trim()}"`;


        renderSearchResults(
            filteredProducts
        );

    }


    searchButton.addEventListener(
        "click",
        openSearch
    );


    searchClose.addEventListener(
        "click",
        closeSearch
    );


    searchOverlay.addEventListener(
        "click",
        closeSearch
    );


    searchClear.addEventListener(
        "click",
        clearResults
    );


    searchInput.addEventListener(
        "input",
        searchProducts
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                searchPanel.classList.contains(
                    "active"
                )
            ) {

                closeSearch();

            }

        }
    );

}