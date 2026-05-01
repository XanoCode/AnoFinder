// Variables
const search = document.getElementById("search");
const finding = document.getElementById("finding");
const btn = document.getElementById("button");
let index = {};

// Avoir la recherche effectuer + nettoyer le lien
const request = new URLSearchParams(window.location.search).get("request")
window.history.replaceState({}, document.title, window.location.pathname);
let allowed = true;

// Fonctions
function pathToFileName(url) {
    let path = url.replace(/\//g, "_");
    return `/data/${path[0]}/${path}.json`;
}

function calculRelevance(words, data) {
    let score = 0;

    words.forEach(word => {
        if (data["url"].toLowerCase().includes(word.toLowerCase())) score += 50;
    });

    words.forEach(word => {
        if (data["name"].toLowerCase().includes(word.toLowerCase())) score += 25;
    });
    
    words.forEach(word => {
        data["titles"].forEach(title => {
            if (title.toLowerCase().includes(word.toLowerCase())) score += 10;
        });
    });

    words.forEach(word => {
        data["texts"].forEach(text => {
            if (text.toLowerCase().includes(word.toLowerCase())) score += 3;
        });
    });

    return score;
}

function getSnippet(texts, searchWords) {
    if(!texts || texts.length == 0) return null;

    for (let text of texts) {
        let index = text.toLowerCase().indexOf(searchWords[0].toLowerCase());
        
        if (index !== -1) {
            let start = text.lastIndexOf(". ", index) + 2;
            start = (start === -1) ? 0 : start + 2; // À comprendre
            
            let end = text.indexOf(". ", index);
            if(end === -1) end = start + 185;
            
            let snippet = text.substring(start, end);
            if(snippet.length > 185) snippet = snippet.substring(0, 185) + " ..."

            searchWords.forEach(word => {
                snippet = snippet.replace(new RegExp(`(${word})`, "gi"), '<b style="color: #fff">$1</b>');
            });

            return snippet;
        }
    }

    return null;
}

function normalizeWord(word) {
    return word.toLowerCase()
        .replace(/s$/, "").replace(/es$/, "")
        .replace(/é$/, "e").replace(/er$/, "e");
}

async function startSearch(event) {
    if(event) event.preventDefault(); // Empêche la page de recharger si c’est un submit
    
    let searchValue = search.value.toLowerCase().split(" ").map(normalizeWord);


    if(allowed) {
        if(request) {
            search.value = request;
            searchValue = request.toLowerCase().split(" ").map(normalizeWord);
            delete request;
        }

        allowed = false;
    }

    const results = [];
    finding.innerHTML = "";  // Vide la liste des résultats précédents
    let count = 0;

    let fetchPromises = [];

    // Cherche dans les mots clés de l'index
    for (let word of searchValue) {
        if (index.hasOwnProperty(word)) {
            for (let url of index[word]) {
                if(count === 50) break; // Limite le nombre de résultats à 50

                let fetchPromise = fetch(pathToFileName(url))
                    .then(response => {
                        if (!response.ok) throw new Error(`Fichier JSON introuvable pour ${url}`);
                        return response.json();
                    })
                    .then(data => {
                        const relevance = calculRelevance(searchValue, data);
                        const snippet = getSnippet(data["texts"], searchValue);

                        let isDuplicate = false;
                        for(let result of results) {
                            if(data.url === result.data.url) {
                                isDuplicate = true;
                                break;
                            }
                        }

                        if(!isDuplicate) {
                            results.push({
                                "url": url,
                                "score": relevance,
                                "data": data,
                                "snippet": snippet
                            });
                        }
                    })
                    .catch(error => {
                        console.warn(error.message);
                    });

                fetchPromises.push(fetchPromise);
                count += 1;
            }
        }
    }

    // Attendre que toutes les requêtes de fichiers JSON soient terminées
    await Promise.all(fetchPromises);

    results.sort((a, b) => b.score - a.score); // Trie les résultats par score décroissant
    results.forEach(result => {
        let a = document.createElement("a");
        a.href = result.data.url;
        a.innerHTML = `<strong>${result.data.name}</strong>`;
        a.target = "_blank";

        let url = document.createElement("small");
        url.textContent = result.data.url;
        url.className = "url";

        let div = document.createElement("div");
        div.className = "site";

        let logoNameDiv = document.createElement("div");
        logoNameDiv.className = "favicon-name";

        // Chercher si le site a une icône
        if(result.data.favicon) {
            let favicon = document.createElement("img");
            favicon.src = result.data.favicon;

            favicon.onerror = function() {
                favicon.remove();

                let fallIcon = document.createElement("i");
                fallIcon.classList.add("fa-solid", "fa-globe");

                logoNameDiv.appendChild(fallIcon);
                logoNameDiv.appendChild(a);
                div.appendChild(logoNameDiv);
                div.appendChild(url);
        
                // Afficher la description si elle existe
                if (result.snippet) {
                    let description = document.createElement("p");
                    description.innerHTML = result.snippet;
                    description.className = "description";
                    div.appendChild(description);
                }
            };

            favicon.onload = function() {
                logoNameDiv.appendChild(favicon);
                logoNameDiv.appendChild(a);
                div.appendChild(logoNameDiv);
                div.appendChild(url);

                // Afficher la description si elle existe
                if (result.snippet) {
                    let description = document.createElement("p");
                    description.innerHTML = result.snippet;
                    description.className = "description";
                    div.appendChild(description);
                }
            };
        }
        else {
            let fallIcon = document.createElement("i");
            fallIcon.classList.add("fa-solid", "fa-globe");

            logoNameDiv.appendChild(fallIcon);
            logoNameDiv.appendChild(a);
            div.appendChild(logoNameDiv);
            div.appendChild(url);

            // Afficher la description si elle existe
            if (result.snippet) {
                let description = document.createElement("p");
                description.innerHTML = result.snippet;
                description.className = "description";
                div.appendChild(description);
            }
        }

        finding.appendChild(div);
    });
};

// Lire le fichier index.json
fetch("/data/index.json")
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur de réseau : ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        index = data;
        startSearch();
    })
    .catch(error => {
        console.error('Problème avec la récupération de index.json:', error);
    });

// Quand une recherche est effectuer
document.getElementById("searchForm").addEventListener("submit", startSearch); // Btn + Entrée
