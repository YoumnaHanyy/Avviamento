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

        window.location.href =
            "login.html";

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

        window.location.href =
            "login.html";

        return false;
    }

    return true;
}


// ==========================================
// ELEMENTS
// ==========================================

const categoriesContainer =
    document.getElementById(
        "categoriesContainer"
    );

const searchInput =
    document.getElementById(
        "categorySearch"
    );

const addCategoryBtn =
    document.getElementById(
        "addCategoryBtn"
    );

const categoryModal =
    document.getElementById(
        "categoryModal"
    );

const closeModalBtn =
    document.getElementById(
        "closeModalBtn"
    );

const cancelBtn =
    document.getElementById(
        "cancelBtn"
    );

const categoryForm =
    document.getElementById(
        "categoryForm"
    );

const categoryImage =
    document.getElementById(
        "categoryImage"
    );

const imagePreview =
    document.getElementById(
        "imagePreview"
    );

const currentImageContainer =
    document.getElementById(
        "currentImageContainer"
    );

const formError =
    document.getElementById(
        "formError"
    );


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
// LOAD CATEGORIES
// ==========================================

async function loadCategories(search = "") {

    let query = supabaseClient
        .from("categories")
        .select(`
            id,
            name,
            description,
            image_url,
            is_active,
            created_at
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
        data: categories,
        error
    } = await query;

    if (error) {

        console.error(
            "Categories error:",
            error
        );

        categoriesContainer.innerHTML = `
            <p class="loading-text">
                Failed to load categories.
            </p>
        `;

        return;
    }

    if (
        !categories ||
        categories.length === 0
    ) {

        categoriesContainer.innerHTML = `
            <div class="empty-state">
                <p>
                    No categories found.
                </p>
            </div>
        `;

        return;
    }

    categoriesContainer.innerHTML =
        categories.map(category => {

            return `

                <div class="category-row">

                    <div class="category-image">

                        ${
                            category.image_url
                            ?
                            `
                                <img
                                    src="${escapeHtml(category.image_url)}"
                                    alt="${escapeHtml(category.name)}"
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


                    <div class="category-info">

                        <h3>
                            ${escapeHtml(category.name)}
                        </h3>

                        <p>
                            ${
                                escapeHtml(
                                    category.description ||
                                    "No description"
                                )
                            }
                        </p>

                    </div>


                    <div>

                        ${
                            category.is_active
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


                    <div class="category-actions">

                        <button
                            type="button"
                            onclick="editCategory(${category.id})">

                            Edit

                        </button>


                        ${
                            category.is_active
                            ?
                            `
                                <button
                                    type="button"
                                    onclick="deactivateCategory(${category.id})">

                                    Deactivate

                                </button>
                            `
                            :
                            `
                                <button
                                    type="button"
                                    onclick="activateCategory(${category.id})">

                                    Activate

                                </button>
                            `
                        }


                        <button
                            type="button"
                            class="delete-category-btn"
                            onclick="deleteCategory(${category.id})">

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

function openAddCategory() {

    categoryForm.reset();

    document.getElementById(
        "categoryId"
    ).value = "";

    document.getElementById(
        "modalTitle"
    ).textContent =
        "Add Category";

    currentImageContainer.innerHTML = `
        <div class="no-current-image">
            No image added yet.
        </div>
    `;

    imagePreview.src = "";

    imagePreview.style.display =
        "none";

    formError.textContent = "";

    categoryModal.classList.add(
        "show"
    );
}


// ==========================================
// EDIT CATEGORY
// ==========================================

async function editCategory(id) {

    formError.textContent = "";

    const {
        data: category,
        error
    } = await supabaseClient
        .from("categories")
        .select(`
            id,
            name,
            description,
            image_url
        `)
        .eq("id", id)
        .single();

    if (error || !category) {

        alert(
            "Failed to load category."
        );

        return;
    }

    document.getElementById(
        "categoryId"
    ).value =
        category.id;

    document.getElementById(
        "modalTitle"
    ).textContent =
        "Edit Category";

    document.getElementById(
        "categoryName"
    ).value =
        category.name || "";

    document.getElementById(
        "categoryDescription"
    ).value =
        category.description || "";

    renderCurrentImage(
        category.id,
        category.image_url
    );

    categoryImage.value = "";

    imagePreview.src = "";

    imagePreview.style.display =
        "none";

    categoryModal.classList.add(
        "show"
    );
}


// ==========================================
// RENDER CURRENT IMAGE
// ==========================================

function renderCurrentImage(
    categoryId,
    imageUrl
) {

    if (!imageUrl) {

        currentImageContainer.innerHTML = `
            <div class="no-current-image">
                No image added yet.
            </div>
        `;

        return;
    }

    currentImageContainer.innerHTML = `

        <div class="current-category-image">

            <img
                src="${escapeHtml(imageUrl)}"
                alt="Category image"
            >

            <div class="current-image-actions">

                <button
                    type="button"
                    class="delete-category-image-btn"
                    onclick="deleteCategoryImage(${categoryId})">

                    Delete Image

                </button>

            </div>

        </div>

    `;
}


// ==========================================
// DELETE CATEGORY IMAGE
// ==========================================

async function deleteCategoryImage(
    categoryId
) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this category image?"
        );

    if (!confirmed) {
        return;
    }

    const {
        error
    } = await supabaseClient
        .from("categories")
        .update({
            image_url: null,
            updated_at:
                new Date().toISOString()
        })
        .eq(
            "id",
            categoryId
        );

    if (error) {

        console.error(
            "Delete category image error:",
            error
        );

        alert(
            "Failed to delete category image."
        );

        return;
    }

    currentImageContainer.innerHTML = `
        <div class="no-current-image">
            No image added yet.
        </div>
    `;

    await loadCategories(
        searchInput.value.trim()
    );
}


// ==========================================
// NEW IMAGE PREVIEW
// ==========================================

categoryImage.addEventListener(
    "change",
    () => {

        const file =
            categoryImage.files[0];

        if (!file) {

            imagePreview.src = "";

            imagePreview.style.display =
                "none";

            return;
        }

        if (
            !file.type.startsWith("image/")
        ) {

            alert(
                "Please choose an image file."
            );

            categoryImage.value = "";

            return;
        }

        const reader =
            new FileReader();

        reader.onload =
            event => {

                imagePreview.src =
                    event.target.result;

                imagePreview.style.display =
                    "block";

            };

        reader.readAsDataURL(
            file
        );
    }
);


// ==========================================
// UPLOAD IMAGE
// ==========================================

async function uploadCategoryImage(
    categoryId,
    file
) {

    const extension =
        file.name
            .split(".")
            .pop()
            .toLowerCase();

    const filePath =
        `categories/${categoryId}/${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 8)}.${extension}`;

    const {
        error
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

    if (error) {

        throw error;
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
// SAVE CATEGORY
// ==========================================

categoryForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        formError.textContent = "";

        const categoryId =
            document.getElementById(
                "categoryId"
            ).value;

        const name =
            document.getElementById(
                "categoryName"
            ).value.trim();

        const description =
            document.getElementById(
                "categoryDescription"
            ).value.trim();

        if (!name) {

            formError.textContent =
                "Category name is required.";

            return;
        }

        let savedCategory;


        // ==========================================
        // UPDATE
        // ==========================================

        if (categoryId) {

            const {
                data,
                error
            } = await supabaseClient
                .from("categories")
                .update({

                    name,

                    description,

                    updated_at:
                        new Date()
                            .toISOString()

                })
                .eq(
                    "id",
                    categoryId
                )
                .select()
                .single();

            if (error) {

                console.error(error);

                formError.textContent =
                    "Failed to update category.";

                return;
            }

            savedCategory = data;

        }


        // ==========================================
        // CREATE
        // ==========================================

        else {

            const {
                data,
                error
            } = await supabaseClient
                .from("categories")
                .insert({

                    name,

                    description,

                    is_active: true

                })
                .select()
                .single();

            if (error) {

                console.error(error);

                formError.textContent =
                    "Failed to create category.";

                return;
            }

            savedCategory = data;
        }


        // ==========================================
        // IMAGE
        // ==========================================

        const imageFile =
            categoryImage.files[0];

        if (imageFile) {

            try {

                const imageUrl =
                    await uploadCategoryImage(
                        savedCategory.id,
                        imageFile
                    );

                const {
                    error: imageError
                } = await supabaseClient
                    .from("categories")
                    .update({

                        image_url:
                            imageUrl,

                        updated_at:
                            new Date()
                                .toISOString()

                    })
                    .eq(
                        "id",
                        savedCategory.id
                    );

                if (imageError) {

                    console.error(
                        imageError
                    );

                    formError.textContent =
                        "Category saved, but image could not be saved.";

                    return;
                }

            }

            catch (error) {

                console.error(
                    "Image upload error:",
                    error
                );

                formError.textContent =
                    "Category saved, but image upload failed.";

                return;
            }
        }


        alert(
            categoryId
                ?
                "Category updated successfully."
                :
                "Category added successfully."
        );


        closeModal();


        await loadCategories(
            searchInput.value.trim()
        );

    }
);


// ==========================================
// DELETE CATEGORY
// ==========================================

async function deleteCategory(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this category?\n\nProducts using this category will not be deleted."
        );

    if (!confirmed) {
        return;
    }


    const {
        error
    } = await supabaseClient
        .from("categories")
        .delete()
        .eq(
            "id",
            id
        );


    if (error) {

        console.error(
            "Delete category error:",
            error
        );

        alert(
            "Could not delete this category."
        );

        return;
    }


    alert(
        "Category deleted successfully."
    );


    await loadCategories(
        searchInput.value.trim()
    );
}


// ==========================================
// DEACTIVATE
// ==========================================

async function deactivateCategory(id) {

    const confirmed =
        confirm(
            "Are you sure you want to deactivate this category?"
        );

    if (!confirmed) {
        return;
    }

    const {
        error
    } = await supabaseClient
        .from("categories")
        .update({
            is_active: false
        })
        .eq(
            "id",
            id
        );

    if (error) {

        alert(
            "Failed to deactivate category."
        );

        console.error(error);

        return;
    }

    await loadCategories(
        searchInput.value.trim()
    );
}


// ==========================================
// ACTIVATE
// ==========================================

async function activateCategory(id) {

    const {
        error
    } = await supabaseClient
        .from("categories")
        .update({
            is_active: true
        })
        .eq(
            "id",
            id
        );

    if (error) {

        alert(
            "Failed to activate category."
        );

        console.error(error);

        return;
    }

    await loadCategories(
        searchInput.value.trim()
    );
}


// ==========================================
// CLOSE MODAL
// ==========================================

function closeModal() {

    categoryModal.classList.remove(
        "show"
    );

    categoryForm.reset();

    document.getElementById(
        "categoryId"
    ).value = "";

    currentImageContainer.innerHTML =
        "";

    imagePreview.src = "";

    imagePreview.style.display =
        "none";

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
// ADD CATEGORY
// ==========================================

addCategoryBtn.addEventListener(
    "click",
    openAddCategory
);


// ==========================================
// SEARCH
// ==========================================

searchInput.addEventListener(
    "input",
    () => {

        loadCategories(
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

async function initializeCategories() {

    const isAdmin =
        await checkAdmin();

    if (!isAdmin) {
        return;
    }

    await loadCategories();
}


initializeCategories();