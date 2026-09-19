const products = [
    {
        id: 1,
        name: "Linen Shirt",
        price: 1450,
        image: "images/henley.jpg",
        colors: ["#eee6d8", "#032d37", "#222222"],
        sales: 85
    },

    {
        id: 2,
        name: "Piqué Polo",
        price: 1250,
        image: "images/knitted.jpg",
        colors: ["#032d37", "#cbb99d"],
        sales: 120
    },

    {
        id: 3,
        name: "Tailored Trousers",
        price: 1650,
        image: "images/trousers.jpg",
        colors: ["#c9b89c", "#444444"],
        sales: 60
    },

    {
        id: 4,
        name: "Overshirt",
        price: 1750,
        image: "images/overshirt.jpg",
        colors: ["#111111", "#e2ceb5"],
        sales: 45
    }
];


const grid = document.getElementById("productsGrid");
const count = document.getElementById("productCount");
const sort = document.getElementById("sortProducts");


function renderProducts(list) {

    grid.innerHTML = "";

    count.textContent = `${list.length} Products`;


    list.forEach(product => {

        const card = document.createElement("article");

        card.className = "product-card";


        card.innerHTML = `
            <div class="product-image">

                <img
                    src="${product.image}"
                    alt="${product.name}"
                >

                <button
                    class="favorite"
                    aria-label="Add to favourites"
                >
                    <i class="fa-regular fa-heart"></i>
                </button>

            </div>

            <div class="product-info">

                <h3>
                    ${product.name}
                </h3>

                <p>
                    EGP ${product.price.toLocaleString()}
                </p>

                <div class="colors">

                    ${product.colors
                        .map(color =>
                            `<span
                                class="color"
                                style="background:${color}">
                            </span>`
                        )
                        .join("")}

                </div>

            </div>
        `;


        card.addEventListener("click", () => {

           window.location.href =
    `product-details.html?id=${product.id}`;

        });


        const favorite =
            card.querySelector(".favorite");


        favorite.addEventListener("click", event => {

            event.stopPropagation();


            favorite.classList.toggle("active");


            const icon =
                favorite.querySelector("i");


            if (favorite.classList.contains("active")) {

                icon.classList.remove("fa-regular");

                icon.classList.add("fa-solid");

            }

            else {

                icon.classList.remove("fa-solid");

                icon.classList.add("fa-regular");

            }

        });


        grid.appendChild(card);

    });

}


sort.addEventListener("change", () => {

    let list = [...products];


    if (sort.value === "best") {

        list.sort(
            (a, b) => b.sales - a.sales
        );

    }


    else if (sort.value === "low") {

        list.sort(
            (a, b) => a.price - b.price
        );

    }


    else if (sort.value === "high") {

        list.sort(
            (a, b) => b.price - a.price
        );

    }


    else if (sort.value === "name") {

        list.sort(
            (a, b) =>
                a.name.localeCompare(b.name)
        );

    }


    renderProducts(list);

});


renderProducts(products);