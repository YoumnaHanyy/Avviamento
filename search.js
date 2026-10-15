/* =================================
   Avviamento - Global Search
   Supabase Version
================================= */


/* Search Button */

const searchButton =
    document.getElementById(
        "searchButton"
    );


/* Only run if search button exists */

if (searchButton) {


    /* =================================
       Create Search Overlay
    ================================= */

    const searchOverlay =
        document.createElement("div");


    searchOverlay.className =
        "search-overlay";


    searchOverlay.id =
        "globalSearchOverlay";



    /* =================================
       Create Search Panel
    ================================= */

    const searchPanel =
        document.createElement("div");


    searchPanel.className =
        "search-panel";


    searchPanel.id =
        "globalSearchPanel";


    searchPanel.innerHTML = `

        <div class="search-panel-header">

            <h2>
                Search
            </h2>


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



    /* =================================
       Get Elements
    ================================= */

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



    /* =================================
       Products
    ================================= */

    let searchableProducts = [];



    /* =================================
       Load Products from Supabase
    ================================= */

    async function loadSearchProducts() {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("products")
                .select(`
                    id,
                    name,
                    price,
                    product_images (
                        image_url,
                        is_primary
                    )
                `)
                .eq(
                    "is_active",
                    true
                );


        if (error) {

            console.error(
                "Search products error:",
                error
            );


            searchableProducts = [];


            return;

        }


        searchableProducts =
            data || [];

    }



    /* =================================
       Get Product Image
    ================================= */

    function getProductImage(
        product
    ) {

        const images =
            product.product_images || [];


        const primaryImage =
            images.find(
                image =>
                    image.is_primary === true
            );


        if (
            primaryImage
            && primaryImage.image_url
        ) {

            return primaryImage.image_url;

        }


        if (
            images.length > 0
            && images[0].image_url
        ) {

            return images[0].image_url;

        }


        /*
        Fallback images
        */

        const fallbackImages = {

            1:
                "images/henley.jpg",

            2:
                "images/knitted.jpg",

            3:
                "images/trousers.jpg",

            4:
                "images/overshirt.jpg"

        };


        return (
            fallbackImages[product.id]
            || "images/placeholder.jpg"
        );

    }



    /* =================================
       Open Search
    ================================= */

    async function openSearch() {

        searchOverlay.classList.add(
            "active"
        );


        searchPanel.classList.add(
            "active"
        );


        document.body.classList.add(
            "search-open"
        );


        /*
        Load products
        */

        await loadSearchProducts();


        setTimeout(() => {

            searchInput.focus();

        }, 200);

    }



    /* =================================
       Close Search
    ================================= */

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



    /* =================================
       Clear Search
    ================================= */

    function clearResults() {

        searchInput.value = "";


        searchResults.innerHTML =
            "";


        searchStatus.textContent =
            "Start typing to search products.";


        searchClear.classList.remove(
            "show"
        );


        searchInput.focus();

    }



    /* =================================
       Render Search Results
    ================================= */

    function renderSearchResults(
        list
    ) {

        searchResults.innerHTML =
            "";


        if (
            list.length === 0
        ) {

            searchResults.innerHTML = `

                <div class="search-no-results">

                    <i class="fa-solid fa-magnifying-glass"></i>


                    <h3>
                        No products found
                    </h3>


                    <p>
                        Try searching with another product name.
                    </p>

                </div>

            `;


            return;

        }



        list.forEach(
            product => {

                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "search-result-card";


                const image =
                    getProductImage(
                        product
                    );


                card.innerHTML = `

                    <div class="search-result-image">

                        <img
                            src="${image}"
                            alt="${product.name}"
                        >

                    </div>


                    <div class="search-result-info">

                        <h3>

                            ${product.name}

                        </h3>


                        <p>

                            EGP ${
                                Number(
                                    product.price
                                )
                                .toLocaleString(
                                    "en-EG"
                                )
                            }

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

            }
        );

    }



    /* =================================
       Search Products
    ================================= */

    function searchProducts() {

        const query =
            searchInput.value
                .trim()
                .toLowerCase();


        if (
            query === ""
        ) {

            searchResults.innerHTML =
                "";


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
                        String(
                            product.name || ""
                        )
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

            `${filteredProducts.length} result${
                filteredProducts.length !== 1
                    ? "s"
                    : ""
            } for "${searchInput.value.trim()}"`;


        renderSearchResults(
            filteredProducts
        );

    }



    /* =================================
       Events
    ================================= */

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
                event.key === "Escape"
                &&
                searchPanel.classList.contains(
                    "active"
                )
            ) {

                closeSearch();

            }

        }
    );

}