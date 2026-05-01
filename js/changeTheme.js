// Variables
const body = document.body;
const logoWhite = document.getElementById("logo-white");
const logoBlack = document.getElementById("logo-black");
const themeButton = document.getElementById("change-theme");

// Thèmes
const themes = {
    light: {
        "--bg-color": "#ffffff",
        "--font-color": "#141414",
        "--border-color": "#00ffff",
        "--transparent-color": "#969696"
    },
    dark: {
        "--bg-color": "#141414",
        "--font-color": "#ffffff",
        "--border-color": "#00ffff",
        "--transparent-color": "#969696"
    }
};

// Appliquer un thème
function applyTheme(themeName) {
    const theme = themes[themeName];

    for (const variable in theme) {
        document.documentElement.style.setProperty(variable, theme[variable]);
    }

    body.setAttribute("data-theme", themeName);
}

// Thème sauvegardé
const savedTheme = localStorage.getItem("theme") || "dark";

// Bloque les transitions au chargement (évite le flash)
body.classList.add("no-transition");

// Initialise le thème
applyTheme(savedTheme);

// Réactive les transitions après rendu initial
requestAnimationFrame(() => {
    body.classList.remove("no-transition");
});

// Toggle thème
themeButton.addEventListener("click", function () {

    const newTheme =
        body.getAttribute("data-theme") === "light"
            ? "dark"
            : "light";

    applyTheme(newTheme);

    localStorage.setItem("theme", newTheme);
});