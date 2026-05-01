// --------------------
// VARIABLES
// --------------------
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("search");

// --------------------
// URL CHECK
// --------------------
function isUrl(text) {
    return text.includes(".") && !text.includes(" ");
}

// --------------------
// SEARCH HANDLER
// --------------------
searchForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const input = searchInput.value.trim();

    if (!input) return;

    // URL directe
    if (isUrl(input)) {
        window.location.href = input.startsWith("http")
            ? input
            : "https://" + input;
        return;
    }

    // Recherche
    const query = encodeURIComponent(input).replace(/%20/g, "+");
    window.location.href = "https://duckduckgo.com/?q=" + query;
});