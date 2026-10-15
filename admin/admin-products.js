// ==========================================
// ADMIN CHECK
// ==========================================

async function checkAdmin() {

    const {
        data: {
            user
        },
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


// ==========================================
// ELEMENTS
// ==========================================

const productsContainer =
    document.getElementById("productsContainer");

const searchInput =
    document.getElementById("productSearch");

const addProductBtn =
    document.getElementById("addProductBtn");

const productModal =
    document.getElementById("productModal");

const closeModalBtn =
    document.getElementById("closeModalBtn");

const cancelBtn =
    document.getElementById("cancelBtn");

const productForm =
    document.getElementById("productForm");

const variantsContainer =
    document.getElementById("variantsContainer");

const addVariantBtn =
    document.getElementById("addVariantBtn");

const formError =
    document.getElementById("formError");

const productImages =
    document.getElementById("productImages");

const existingImages =
    document.getElementById("existingImages");

const newImagesPreview =
    document.getElementById("newImagesPreview");


// ==========================================
// LOAD CATEGORIES
// ==========================================

async function loadCategories() {

    const {
        data: categories,
        error
    } = await supabaseClient
        .from("categories")
        .select("id, name")
        .eq("is_active", true)
        .order("name");

    if (error) {

        console.error(
            "Categories error:",
            error
        );

        return;
    }

    const select =
        document.getElementById("productCategory");

    select.innerHTML = `
        <option value="">
            Select Category
        </option>
    `;

    categories.forEach(category => {

        select.innerHTML += `
            <option value="${category.id}">
                ${escapeHtml(category.name)}
            </option>
        `;

    });
}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ==========================================
// LOAD PRODUCTS
// ==========================================

async function loadProducts(search = "") {

    let query = supabaseClient
        .from("products")
        .select(`
            id,
            name,
            price,
            description,
            details,
            care,
            category_id,
            is_active,
            created_at,

            product_images (
                id,
                image_url,
                is_primary
            ),

            product_variants (
                id,
                color,
                size,
                stock
            )
        `)
        .order("created_at", {
            ascending: false
        });

    if (search) {

        query = query.ilike(
            "name",
            `%${search}%`
        );
    }

    const {
        data: products,
        error
    } = await query;

    if (error) {

        console.error(
            "Products error:",
            error
        );

        productsContainer.innerHTML = `
            <p class="loading-text">
                Failed to load products.
            </p>
        `;

        return;
    }

    if (
        !products ||
        products.length === 0
    ) {

        productsContainer.innerHTML = `
            <div class="empty-state">
                <p>
                    No products found.
                </p>
            </div>
        `;

        return;
    }

    productsContainer.innerHTML =
        products.map(product => {

            const primaryImage =
                product.product_images?.find(
                    image =>
                        image.is_primary
                ) ||
                product.product_images?.[0];

            const totalStock =
                (product.product_variants || [])
                    .reduce(
                        (sum, variant) =>
                            sum +
                            Number(
                                variant.stock || 0
                            ),
                        0
                    );

            return `

                <div class="product-row">

                    <div class="product-image">

                        ${
                            primaryImage
                            ?
                            `
                                <img
                                    src="${escapeHtml(primaryImage.image_url)}"
                                    alt="${escapeHtml(product.name)}"
                                >
                            `
                            :
                            `
                                <div class="no-image">
                                    No Image
                                </div>
                            `
                        }

                    </div>


                    <div class="product-info">

                        <h3>
                            ${escapeHtml(product.name)}
                        </h3>

                        <p>
                            EGP
                            ${Number(
                                product.price
                            ).toFixed(2)}
                        </p>

                        <span class="product-stock">

                            Stock:
                            ${totalStock}

                        </span>

                    </div>


                    <div>

                        ${
                            product.is_active
                            ?
                            `
                                <span class="active-badge">
                                    Active
                                </span>
                            `
                            :
                            `
                                <span class="inactive-badge">
                                    Inactive
                                </span>
                            `
                        }

                    </div>


                    <div class="product-actions">

                        <button
                            type="button"
                            onclick="editProduct(${product.id})">

                            Edit

                        </button>


                        ${
                            product.is_active
                            ?
                            `
                                <button
                                    type="button"
                                    onclick="deactivateProduct(${product.id})">

                                    Deactivate

                                </button>
                            `
                            :
                            `
                                <button
                                    type="button"
                                    onclick="activateProduct(${product.id})">

                                    Activate

                                </button>
                            `
                        }


                        <button
                            type="button"
                            class="delete-product-btn"
                            onclick="deleteProduct(${product.id})">

                            Delete

                        </button>

                    </div>

                </div>

            `;

        }).join("");
}


// ==========================================
// OPEN ADD MODAL
// ==========================================

function openAddProduct() {

    productForm.reset();

    document.getElementById(
        "productId"
    ).value = "";

    document.getElementById(
        "modalTitle"
    ).textContent =
        "Add Product";

    variantsContainer.innerHTML = "";

    existingImages.innerHTML = `
        <div class="no-existing-images">
            No images added yet.
        </div>
    `;

    newImagesPreview.innerHTML = "";

    addVariantRow();

    formError.textContent = "";

    productModal.classList.add("show");
}


// ==========================================
// OPEN EDIT MODAL
// ==========================================

async function editProduct(id) {

    formError.textContent = "";

    const {
        data: product,
        error
    } = await supabaseClient
        .from("products")
        .select(`
            id,
            name,
            price,
            description,
            details,
            care,
            category_id,
            is_active,

            product_images (
                id,
                image_url,
                is_primary
            ),

            product_variants (
                id,
                color,
                size,
                stock
            )
        `)
        .eq("id", id)
        .single();

    if (error || !product) {

        alert(
            "Failed to load product."
        );

        return;
    }

    document.getElementById(
        "productId"
    ).value = product.id;

    document.getElementById(
        "modalTitle"
    ).textContent =
        "Edit Product";

    document.getElementById(
        "productName"
    ).value =
        product.name || "";

    document.getElementById(
        "productPrice"
    ).value =
        product.price || "";

    document.getElementById(
        "productCategory"
    ).value =
        product.category_id || "";

    document.getElementById(
        "productDescription"
    ).value =
        product.description || "";

    document.getElementById(
        "productDetails"
    ).value =
        product.details || "";

    document.getElementById(
        "productCare"
    ).value =
        product.care || "";

    variantsContainer.innerHTML = "";

    if (
        product.product_variants &&
        product.product_variants.length > 0
    ) {

        product.product_variants.forEach(
            variant => {

                addVariantRow(
                    variant.color,
                    variant.size,
                    variant.stock,
                    variant.id
                );

            }
        );

    } else {

        addVariantRow();

    }

    renderExistingImages(
        product.product_images || []
    );

    productImages.value = "";

    newImagesPreview.innerHTML = "";

    productModal.classList.add(
        "show"
    );
}


// ==========================================
// RENDER EXISTING IMAGES
// ==========================================

function renderExistingImages(images) {

    if (
        !images ||
        images.length === 0
    ) {

        existingImages.innerHTML = `
            <div class="no-existing-images">
                No images added yet.
            </div>
        `;

        return;
    }

    existingImages.innerHTML =
        images.map(image => {

            return `

                <div
                    class="image-card"
                    data-image-id="${image.id}">

                    <img
                        src="${escapeHtml(image.image_url)}"
                        alt="Product image"
                    >

                    <div class="image-card-info">

                        ${
                            image.is_primary
                            ?
                            `
                                <span class="image-primary">
                                    PRIMARY
                                </span>
                            `
                            :
                            ""
                        }

                        <div class="image-card-actions">

                            ${
                                image.is_primary
                                ?
                                ""
                                :
                                `
                                    <button
                                        type="button"
                                        class="set-primary-btn"
                                        onclick="setPrimaryImage(${image.id})">

                                        Set Primary

                                    </button>
                                `
                            }

                            <button
                                type="button"
                                class="delete-image-btn"
                                onclick="deleteProductImage(${image.id})">

                                Delete

                            </button>

                        </div>

                    </div>

                </div>

            `;

        }).join("");
}


// ==========================================
// SET PRIMARY IMAGE
// ==========================================

async function setPrimaryImage(imageId) {

    const imageCard =
        document.querySelector(
            `.image-card[data-image-id="${imageId}"]`
        );

    if (!imageCard) {
        return;
    }

    const productId =
        document.getElementById(
            "productId"
        ).value;

    if (!productId) {
        return;
    }

    const {
        error: resetError
    } = await supabaseClient
        .from("product_images")
        .update({
            is_primary: false
        })
        .eq(
            "product_id",
            productId
        );

    if (resetError) {

        alert(
            "Failed to update primary image."
        );

        console.error(resetError);

        return;
    }

    const {
        error
    } = await supabaseClient
        .from("product_images")
        .update({
            is_primary: true
        })
        .eq(
            "id",
            imageId
        );

    if (error) {

        alert(
            "Failed to set primary image."
        );

        console.error(error);

        return;
    }

    await refreshImagesForCurrentProduct();
}


// ==========================================
// DELETE PRODUCT IMAGE
// ==========================================

async function deleteProductImage(imageId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this image?"
        );

    if (!confirmed) {
        return;
    }

    const {
        data: image,
        error: fetchError
    } = await supabaseClient
        .from("product_images")
        .select(`
            id,
            product_id,
            image_url,
            is_primary
        `)
        .eq("id", imageId)
        .single();

    if (fetchError || !image) {

        alert(
            "Could not find this image."
        );

        console.error(fetchError);

        return;
    }

    const {
        error
    } = await supabaseClient
        .from("product_images")
        .delete()
        .eq(
            "id",
            imageId
        );

    if (error) {

        alert(
            "Failed to delete image."
        );

        console.error(error);

        return;
    }

    /*
       If the deleted image was the primary image,
       make another existing image primary.
    */

    if (image.is_primary) {

        const {
            data: remainingImages
        } = await supabaseClient
            .from("product_images")
            .select("id")
            .eq(
                "product_id",
                image.product_id
            )
            .order(
                "id",
                {
                    ascending: true
                }
            )
            .limit(1);

        if (
            remainingImages &&
            remainingImages.length > 0
        ) {

            await supabaseClient
                .from("product_images")
                .update({
                    is_primary: true
                })
                .eq(
                    "id",
                    remainingImages[0].id
                );

        }
    }

    await refreshImagesForCurrentProduct();
}


// ==========================================
// REFRESH CURRENT PRODUCT IMAGES
// ==========================================

async function refreshImagesForCurrentProduct() {

    const productId =
        document.getElementById(
            "productId"
        ).value;

    if (!productId) {
        return;
    }

    const {
        data: images,
        error
    } = await supabaseClient
        .from("product_images")
        .select(`
            id,
            image_url,
            is_primary
        `)
        .eq(
            "product_id",
            productId
        )
        .order(
            "id",
            {
                ascending: true
            }
        );

    if (error) {

        console.error(error);

        return;
    }

    renderExistingImages(
        images || []
    );

    await loadProducts(
        searchInput.value.trim()
    );
}


// ==========================================
// NEW IMAGE PREVIEW
// ==========================================

productImages.addEventListener(
    "change",
    () => {

        newImagesPreview.innerHTML = "";

        const files =
            Array.from(
                productImages.files || []
            );

        files.forEach(file => {

            if (
                !file.type.startsWith("image/")
            ) {
                return;
            }

            const reader =
                new FileReader();

            reader.onload =
                event => {

                    const card =
                        document.createElement(
                            "div"
                        );

                    card.className =
                        "new-image-preview-card";

                    card.innerHTML = `

                        <img
                            src="${event.target.result}"
                            alt="New product image"
                        >

                        <div class="new-image-preview-name">
                            ${escapeHtml(file.name)}
                        </div>

                    `;

                    newImagesPreview.appendChild(
                        card
                    );
                };

            reader.readAsDataURL(file);

        });
    }
);


// ==========================================
// ADD VARIANT ROW
// ==========================================

function addVariantRow(
    color = "",
    size = "",
    stock = 0,
    id = ""
) {

    const row =
        document.createElement("div");

    row.className =
        "variant-row";

    row.innerHTML = `

        <input
            type="hidden"
            class="variant-id"
            value="${escapeHtml(id)}"
        >

        <input
            type="text"
            class="variant-color"
            placeholder="Color"
            value="${escapeHtml(color)}"
            required
        >

        <input
            type="text"
            class="variant-size"
            placeholder="Size"
            value="${escapeHtml(size)}"
            required
        >

        <input
            type="number"
            class="variant-stock"
            placeholder="Stock"
            min="0"
            value="${Number(stock)}"
            required
        >

        <button
            type="button"
            class="remove-variant">

            ×

        </button>

    `;

    row
        .querySelector(
            ".remove-variant"
        )
        .addEventListener(
            "click",
            () => {

                row.remove();

            }
        );

    variantsContainer.appendChild(
        row
    );
}


// ==========================================
// UPLOAD IMAGE
// ==========================================

async function uploadProductImage(
    productId,
    file
) {

    const extension =
        file.name
            .split(".")
            .pop()
            .toLowerCase();

    const filePath =
        `${productId}/${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 8)}.${extension}`;

    const {
        error: uploadError
    } = await supabaseClient
        .storage
        .from("product-images")
        .upload(
            filePath,
            file,
            {
                upsert: false
            }
        );

    if (uploadError) {

        throw uploadError;

    }

    const {
        data
    } = supabaseClient
        .storage
        .from("product-images")
        .getPublicUrl(
            filePath
        );

    return data.publicUrl;
}


// ==========================================
// SAVE PRODUCT
// ==========================================

productForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        formError.textContent = "";

        const productId =
            document.getElementById(
                "productId"
            ).value;

        const name =
            document.getElementById(
                "productName"
            ).value.trim();

        const price =
            Number(
                document.getElementById(
                    "productPrice"
                ).value
            );

        const categoryId =
            document.getElementById(
                "productCategory"
            ).value;

        const description =
            document.getElementById(
                "productDescription"
            ).value.trim();

        const details =
            document.getElementById(
                "productDetails"
            ).value.trim();

        const care =
            document.getElementById(
                "productCare"
            ).value.trim();


        if (
            !name ||
            Number.isNaN(price) ||
            price < 0
        ) {

            formError.textContent =
                "Please enter valid product information.";

            return;
        }


        // ==========================================
        // VARIANTS
        // ==========================================

        const variantRows =
            document.querySelectorAll(
                ".variant-row"
            );

        const variants = [];

        for (
            const row of variantRows
        ) {

            const color =
                row
                    .querySelector(
                        ".variant-color"
                    )
                    .value
                    .trim();

            const size =
                row
                    .querySelector(
                        ".variant-size"
                    )
                    .value
                    .trim();

            const stock =
                Number(
                    row
                        .querySelector(
                            ".variant-stock"
                        )
                        .value
                );

            if (
                !color ||
                !size ||
                stock < 0
            ) {

                formError.textContent =
                    "Please complete all variants correctly.";

                return;
            }

            variants.push({

                id:
                    row
                        .querySelector(
                            ".variant-id"
                        )
                        .value ||
                    null,

                color,

                size,

                stock

            });
        }


        if (
            variants.length === 0
        ) {

            formError.textContent =
                "Add at least one variant.";

            return;
        }


        let savedProduct;


        // ==========================================
        // UPDATE PRODUCT
        // ==========================================

        if (productId) {

            const {
                data,
                error
            } = await supabaseClient
                .from("products")
                .update({

                    name,

                    price,

                    category_id:
                        categoryId
                        ?
                        Number(categoryId)
                        :
                        null,

                    description,

                    details,

                    care,

                    updated_at:
                        new Date()
                            .toISOString()

                })
                .eq(
                    "id",
                    productId
                )
                .select()
                .single();


            if (error) {

                console.error(error);

                formError.textContent =
                    "Failed to update product.";

                return;
            }

            savedProduct = data;

        }

        // ==========================================
        // CREATE PRODUCT
        // ==========================================

        else {

            const {
                data,
                error
            } = await supabaseClient
                .from("products")
                .insert({

                    name,

                    price,

                    category_id:
                        categoryId
                        ?
                        Number(categoryId)
                        :
                        null,

                    description,

                    details,

                    care,

                    is_active: true

                })
                .select()
                .single();


            if (error) {

                console.error(error);

                formError.textContent =
                    "Failed to create product.";

                return;
            }

            savedProduct = data;
        }


        // ==========================================
        // SAVE VARIANTS
        // ==========================================

        for (
            const variant of variants
        ) {

            if (variant.id) {

                const {
                    error
                } = await supabaseClient
                    .from("product_variants")
                    .update({

                        color:
                            variant.color,

                        size:
                            variant.size,

                        stock:
                            variant.stock

                    })
                    .eq(
                        "id",
                        variant.id
                    );

                if (error) {

                    console.error(error);

                    formError.textContent =
                        "Failed to update variants.";

                    return;
                }

            }

            else {

                const {
                    error
                } = await supabaseClient
                    .from("product_variants")
                    .insert({

                        product_id:
                            savedProduct.id,

                        color:
                            variant.color,

                        size:
                            variant.size,

                        stock:
                            variant.stock

                    });

                if (error) {

                    console.error(error);

                    formError.textContent =
                        "Failed to add variants.";

                    return;
                }
            }
        }


        // ==========================================
        // UPLOAD MULTIPLE IMAGES
        // ==========================================

        const imageFiles =
            Array.from(
                productImages.files || []
            );


        if (
            imageFiles.length > 0
        ) {

            try {

                const {
                    data: currentImages
                } = await supabaseClient
                    .from("product_images")
                    .select("id")
                    .eq(
                        "product_id",
                        savedProduct.id
                    );


                let shouldCreatePrimary =
                    !currentImages ||
                    currentImages.length === 0;


                for (
                    const file of imageFiles
                ) {

                    const imageUrl =
                        await uploadProductImage(
                            savedProduct.id,
                            file
                        );


                    const {
                        error: imageError
                    } = await supabaseClient
                        .from("product_images")
                        .insert({

                            product_id:
                                savedProduct.id,

                            image_url:
                                imageUrl,

                            is_primary:
                                shouldCreatePrimary

                        });


                    if (imageError) {

                        console.error(
                            imageError
                        );

                        throw imageError;
                    }


                    /*
                       Only the first uploaded image
                       becomes primary when there are
                       no existing images.
                    */

                    if (
                        shouldCreatePrimary
                    ) {
                        shouldCreatePrimary = false;
                    }
                }

            }

            catch (error) {

                console.error(
                    "Image upload error:",
                    error
                );

                formError.textContent =
                    "Product saved, but one or more images failed to upload.";

                await loadProducts(
                    searchInput.value.trim()
                );

                return;
            }
        }


        // ==========================================
        // SUCCESS
        // ==========================================

        alert(
            productId
                ?
                "Product updated successfully."
                :
                "Product added successfully."
        );


        closeModal();

        await loadProducts(
            searchInput.value.trim()
        );

    }
);


// ==========================================
// DELETE PRODUCT
// ==========================================

async function deleteProduct(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this product?\n\nThis will permanently delete the product, its variants and its image records."
        );

    if (!confirmed) {
        return;
    }


    const {
        error
    } = await supabaseClient
        .from("products")
        .delete()
        .eq(
            "id",
            id
        );


    if (error) {

        console.error(
            "Delete product error:",
            error
        );

        alert(
            "Could not delete this product.\n\nIf this product has already been used in an order, it cannot be deleted. Deactivate it instead."
        );

        return;
    }


    alert(
        "Product deleted successfully."
    );


    await loadProducts(
        searchInput.value.trim()
    );
}


// ==========================================
// DEACTIVATE PRODUCT
// ==========================================

async function deactivateProduct(id) {

    const confirmed =
        confirm(
            "Are you sure you want to deactivate this product?"
        );

    if (!confirmed) {
        return;
    }

    const {
        error
    } = await supabaseClient
        .from("products")
        .update({
            is_active: false
        })
        .eq(
            "id",
            id
        );

    if (error) {

        alert(
            "Failed to deactivate product."
        );

        console.error(error);

        return;
    }

    await loadProducts(
        searchInput.value.trim()
    );
}


// ==========================================
// ACTIVATE PRODUCT
// ==========================================

async function activateProduct(id) {

    const {
        error
    } = await supabaseClient
        .from("products")
        .update({
            is_active: true
        })
        .eq(
            "id",
            id
        );

    if (error) {

        alert(
            "Failed to activate product."
        );

        console.error(error);

        return;
    }

    await loadProducts(
        searchInput.value.trim()
    );
}


// ==========================================
// CLOSE MODAL
// ==========================================

function closeModal() {

    productModal.classList.remove(
        "show"
    );

    productForm.reset();

    variantsContainer.innerHTML = "";

    existingImages.innerHTML = "";

    newImagesPreview.innerHTML = "";

    formError.textContent = "";
}


closeModalBtn.addEventListener(
    "click",
    closeModal
);


cancelBtn.addEventListener(
    "click",
    closeModal
);


// ==========================================
// ADD PRODUCT
// ==========================================

addProductBtn.addEventListener(
    "click",
    openAddProduct
);


// ==========================================
// ADD VARIANT
// ==========================================

addVariantBtn.addEventListener(
    "click",
    () => {

        addVariantRow();

    }
);


// ==========================================
// SEARCH
// ==========================================

searchInput.addEventListener(
    "input",
    () => {

        loadProducts(
            searchInput.value.trim()
        );

    }
);


// ==========================================
// LOGOUT
// ==========================================

document
    .getElementById("logoutBtn")
    .addEventListener(
        "click",
        async () => {

            await supabaseClient.auth.signOut();

            window.location.href =
                "login.html";

        }
    );


// ==========================================
// INITIAL LOAD
// ==========================================

async function initializeProducts() {

    const isAdmin =
        await checkAdmin();

    if (!isAdmin) {
        return;
    }

    await loadCategories();

    await loadProducts();
}


initializeProducts();