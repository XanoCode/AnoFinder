const inputField = document.getElementById('search');
let interval; // Declare interval outside the function

function animation() {
    let currentText = "";
    let targetText = "You can find any website !";
    let index = 0;

    inputField.value = "";

    interval = setInterval(() => {
        currentText += targetText[index];
        inputField.value = currentText;
        index++;

        if (index === targetText.length) {
            clearInterval(interval);
        }
    }, 100); // Ajouter une pause entre chaque caractère
}

let allowed = true;

animation()

inputField.addEventListener('click', () => {
    if(inputField.value === "You can find any website !") {
        clearInterval(interval); // Arrête l'animation au clic
        inputField.value = ""; // Efface le texte lorsque l'utilisateur clique dessus
    }
});
