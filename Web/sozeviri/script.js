const AUTOCOMPLETE_API_URL = "https://sozluk.gov.tr/autocomplete.json";
const WORD_SEARCH_API_URL = "https://sozluk.gov.tr/gts?ara=";

const languages = {
  af: "Afrikaans",
  sq: "Albanian",
  ar: "Arabic",
  hy: "Armenian",
  az: "Azerbaijani",
  be: "Belarusian",
  bn: "Bengali",
  bs: "Bosnian",
  bg: "Bulgarian",
  yue: "Cantonese",
  "zh-CN": "Chinese (Simplified)",
  "zh-TW": "Chinese (Traditional)",
  hr: "Croatian",
  cs: "Czech",
  da: "Danish",
  nl: "Dutch",
  en: "English",
  eo: "Esperanto",
  et: "Estonian",
  fa: "Persian",
  fil: "Filipino",
  fi: "Finnish",
  fj: "Fijian",
  fr: "French",
  ka: "Georgian",
  de: "German",
  el: "Greek",
  ht: "Haitian Creole",
  he: "Hebrew",
  hi: "Hindi",
  hu: "Hungarian",
  is: "Icelandic",
  id: "Indonesian",
  ga: "Irish",
  it: "Italian",
  ja: "Japanese",
  jam: "Jamaican Patois",
  jw: "Javanese",
  kk: "Kazakh",
  kmr: "Kurdish (Kurmanji)",
  ckb: "Kurdish (Sorani)",
  ko: "Korean",
  ky: "Kyrgyz",
  lo: "Lao",
  la: "Latin",
  lv: "Latvian",
  lt: "Lithuanian",
  mk: "Macedonian",
  ms: "Malay",
  ml: "Malayalam",
  mt: "Maltese",
  mr: "Marathi",
  mn: "Mongolian",
  ne: "Nepali",
  no: "Norwegian",
  pl: "Polish",
  "pt-BR": "Portuguese (Brazil)",
  "pt-PT": "Portuguese (Portugal)",
  qu: "Quechua",
  ro: "Romanian",
  rom: "Romani",
  ru: "Russian",
  sm: "Samoan",
  sa: "Sanskrit",
  sr: "Serbian",
  scn: "Sicilian",
  sk: "Slovak",
  sl: "Slovenian",
  so: "Somali",
  es: "Spanish",
  sv: "Swedish",
  tg: "Tajik",
  te: "Telugu",
  th: "Thai",
  bo: "Tibetan",
  tk: "Turkmen",
  uk: "Ukrainian",
  ur: "Urdu",
  uz: "Uzbek",
  vec: "Venetian",
  vi: "Vietnamese",
  cy: "Welsh",
};

const providers = {
  google: "Google",
  deepl: "DeepL",
  libre: "LibreTranslate",
};

let autocompleteCache = null;
let wordSearchCache = JSON.parse(localStorage.getItem("wordSearchCache")) || {};
let currentFocus = -1;
let originalInputValue = "";
let lastSearchedWord = "";
let isSearching = false;

// DOM Elements
let searchbar,
  searchButton,
  searchResults,
  autocompleteSuggestions,
  themeToggleButton,
  targetLanguageSelect,
  translationProviderSelect,
  selectionMenu,
  selectionSearchButton,
  selectionTranslateButton,
  helpButton;

document.addEventListener("DOMContentLoaded", function () {
  searchbar = document.getElementById("searchbar");
  searchButton = document.getElementById("searchButton");
  searchResults = document.getElementById("searchResults");
  autocompleteSuggestions = document.getElementById("autocompleteSuggestions");
  themeToggleButton = document.getElementById("themeToggleButton");
  targetLanguageSelect = document.getElementById("targetLanguageSelect");
  translationProviderSelect = document.getElementById("translationProviderSelect");
  selectionMenu = document.getElementById("selection-menu");
  selectionSearchButton = document.getElementById("selection-search-button");
  selectionTranslateButton = document.getElementById("selection-translate-button");
  helpButton = document.getElementById("helpButton");

  initialize();
});

function initialize() {
  updateWordSearchCacheStructure();
  setupEventListeners();
  loadTheme();
  loadAndRenderSavedQueries();
  populateLanguages();
  populateProviders();
  handleInitialQuery();
  fetchAutocompleteData();
  searchbar.focus();
}

function updateWordSearchCacheStructure() {
  let cacheNeedsUpdate = false;
  Object.keys(wordSearchCache).forEach((word) => {
    if (Array.isArray(wordSearchCache[word])) {
      cacheNeedsUpdate = true;
      wordSearchCache[word] = {
        data: wordSearchCache[word],
        timestamp: 0,
      };
    }
  });
  if (cacheNeedsUpdate) {
    localStorage.setItem("wordSearchCache", JSON.stringify(wordSearchCache));
  }
}

function setupEventListeners() {
  searchbar.addEventListener("input", displayAutocompleteSuggestions);
  searchButton.addEventListener("click", handleSearchButtonClick);
  themeToggleButton.addEventListener("click", toggleTheme);
  searchbar.addEventListener("keydown", handleSearchbarKeydown);
  document.addEventListener("click", handleDocumentClick);
  targetLanguageSelect.addEventListener("change", () =>
    localStorage.setItem("targetLanguage", targetLanguageSelect.value)
  );
  translationProviderSelect.addEventListener("change", () =>
    localStorage.setItem("translationProvider", translationProviderSelect.value)
  );
  document.addEventListener("keydown", handleDocumentKeydown);
  document.addEventListener("selectionchange", handleSelectionChange);
  selectionSearchButton.addEventListener("click", handleSelectionSearch);
  selectionTranslateButton.addEventListener("click", handleSelectionTranslate);
  helpButton.addEventListener("click", showHelp);
}

function showHelp() {
  alert(`Sözeviri - Egezenn
Hızlı ve efektif, sözlük ve çeviri!

Kısayollar:
- Arrow Down: Otomatik tamamlama listesinde aşağı in
- Arrow Up: Otomatik tamamlama listesinde yukarı çık
- Enter: Otomatik tamamlama seçimini ara
- Escape: Otomatik tamamlama listesini kapat
- Enter (metin seçili iken): Seçili metni arat
- Space (metin seçili iken): Seçili metni istenilen motorda çevirttirt`);
}

async function handleSearchButtonClick() {
  const originalValue = searchbar.value;
  const success = await searchWord();
  if (!success) {
    searchbar.value = originalValue;
  }
}

async function fetchAutocompleteData() {
  if (autocompleteCache) {
    return autocompleteCache;
  }

  const cachedData = JSON.parse(localStorage.getItem("autocompleteCache"));
  if (cachedData && cachedData.timestamp) {
    const now = new Date().getTime();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    if (now - cachedData.timestamp < thirtyDays) {
      autocompleteCache = cachedData.data;
      return autocompleteCache;
    }
  }

  try {
    const response = await fetch(AUTOCOMPLETE_API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    autocompleteCache = data;
    const cacheToStore = {
      data: data,
      timestamp: new Date().getTime(),
    };
    localStorage.setItem("autocompleteCache", JSON.stringify(cacheToStore));
    return data;
  } catch (error) {
    console.error("Error fetching autocomplete data:", error);
    return null;
  }
}

function addActive(x) {
  if (!x || x.length === 0) return;

  removeActive(x);

  if (currentFocus >= x.length) currentFocus = -1;
  if (currentFocus < -1) currentFocus = x.length - 1;

  if (currentFocus === -1) {
    searchbar.value = originalInputValue;
  } else {
    x[currentFocus].classList.add("autocomplete-active");
    searchbar.value = x[currentFocus].textContent;

    if (x.length > 5) {
      const itemHeight = x[currentFocus].offsetHeight;
      const container = autocompleteSuggestions;

      if (currentFocus > 1) {
        container.scrollTop = x[currentFocus].offsetTop - 2 * itemHeight;
      } else {
        container.scrollTop = 0;
      }
    } else {
      x[currentFocus].scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }
}

function removeActive(x) {
  for (let i = 0; i < x.length; i++) {
    x[i].classList.remove("autocomplete-active");
  }
}

function closeAllLists(elmnt) {
  const x = document.getElementsByClassName("autocomplete-suggestions");
  for (let i = 0; i < x.length; i++) {
    if (elmnt != x[i] && elmnt != searchbar) {
      x[i].style.display = "none";
      currentFocus = -1;
    }
  }
}

async function displayAutocompleteSuggestions() {
  const query = searchbar.value.toLowerCase();
  closeAllLists();
  autocompleteSuggestions.innerHTML = "";
  currentFocus = -1;

  if (query.length < 2) {
    autocompleteSuggestions.style.display = "none";
    originalInputValue = "";
    return;
  }

  if (originalInputValue === "") {
    originalInputValue = searchbar.value;
  }

  const data = await fetchAutocompleteData();
  if (!data || data.length === 0) {
    autocompleteSuggestions.style.display = "none";
    return;
  }

  const suggestions = data.filter((item) => item.madde.toLowerCase().startsWith(query)).map((item) => item.madde);

  if (suggestions.length > 0) {
    suggestions.forEach((suggestion) => {
      const div = document.createElement("div");
      div.textContent = suggestion;
      div.addEventListener("click", async () => {
        const originalValue = suggestion;
        searchbar.value = suggestion;
        autocompleteSuggestions.style.display = "none";
        const success = await searchWord();
        if (success) {
          searchbar.value = "";
        } else {
          searchbar.value = originalValue;
          await displayAutocompleteSuggestions();
        }
        originalInputValue = "";
      });
      autocompleteSuggestions.appendChild(div);
    });
    autocompleteSuggestions.style.display = "block";
  } else {
    autocompleteSuggestions.style.display = "none";
  }
}

async function searchWord() {
  if (isSearching) return false;
  isSearching = true;
  let success = false;

  try {
    const word = searchbar.value.trim();

    if (word === lastSearchedWord) {
      success = true;
    } else if (!word) {
      showInputError();
      success = false;
    } else if (wordSearchCache[word]) {
      wordSearchCache[word].timestamp = Date.now();
      localStorage.setItem("wordSearchCache", JSON.stringify(wordSearchCache));
      loadAndRenderSavedQueries();
      window.scrollTo(0, 0);
      lastSearchedWord = word;
      success = true;
    } else {
      success = await fetchAndProcessWord(word);
    }
  } finally {
    isSearching = false;
    searchbar.focus();
  }

  return success;
}

async function fetchAndProcessWord(word) {
  try {
    const encodedWord = encodeURI(word);
    const response = await fetch(`${WORD_SEARCH_API_URL}${encodedWord}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (data.error === "Sonuç bulunamadı" || (Array.isArray(data) && data.length === 0)) {
      showInputError();
      return false;
    } else {
      wordSearchCache[word] = {
        data: data,
        timestamp: Date.now(),
      };
      localStorage.setItem("wordSearchCache", JSON.stringify(wordSearchCache));
      displaySearchResults(data, word);
      lastSearchedWord = word;
      return true;
    }
  } catch (error) {
    console.error("Error fetching word data:", error);
    return false;
  }
}

function showInputError() {
  searchbar.classList.add("input-error");
  setTimeout(() => {
    searchbar.classList.remove("input-error");
  }, 2000);
}

function createSearchResultNode(data, cacheKey) {
  const resultWrapper = document.createElement("div");
  const word = data?.[0]?.madde;

  if (!word) {
    return resultWrapper;
  }

  const headerContainer = document.createElement("div");
  headerContainer.style.display = "flex";
  headerContainer.style.justifyContent = "space-between";
  headerContainer.style.alignItems = "center";

  const wordHeader = document.createElement("h2");
  wordHeader.textContent = word;
  headerContainer.appendChild(wordHeader);

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Sil";
  deleteButton.classList.add("delete-query-button");
  deleteButton.addEventListener("click", (e) => {
    e.stopPropagation();
    delete wordSearchCache[cacheKey];
    localStorage.setItem("wordSearchCache", JSON.stringify(wordSearchCache));
    loadAndRenderSavedQueries();
  });
  headerContainer.appendChild(deleteButton);
  resultWrapper.appendChild(headerContainer);

  data.forEach((entry) => {
    const wordEntryDiv = document.createElement("div");
    wordEntryDiv.classList.add("word-entry");

    if (entry.anlamlarListe) {
      entry.anlamlarListe.forEach((anlam) => {
        const meaningParagraph = document.createElement("p");
        meaningParagraph.innerHTML = `<strong>${anlam.anlam_sira}.</strong> ${anlam.anlam}`;
        wordEntryDiv.appendChild(meaningParagraph);

        if (anlam.orneklerListe) {
          anlam.orneklerListe.forEach((ornek) => {
            const exampleParagraph = document.createElement("p");
            exampleParagraph.innerHTML = `<em>Örnek:</em> ${ornek.ornek}`;
            wordEntryDiv.appendChild(exampleParagraph);
          });
        }
      });
    }
    resultWrapper.appendChild(wordEntryDiv);
  });

  return resultWrapper;
}

function displaySearchResults(data, word) {
  const searchResultNode = createSearchResultNode(data, word);
  if (searchResults.firstChild) {
    searchResults.insertBefore(document.createElement("hr"), searchResults.firstChild);
    searchResults.insertBefore(searchResultNode, searchResults.firstChild);
  } else {
    searchResults.appendChild(searchResultNode);
  }
}

function loadAndRenderSavedQueries() {
  searchResults.innerHTML = "";

  const sortedWords = Object.keys(wordSearchCache)
    .map((word) => ({
      word: word,
      timestamp: wordSearchCache[word].timestamp,
    }))
    .sort((a, b) => b.timestamp - a.timestamp);

  sortedWords.forEach(({ word }, index) => {
    const data = wordSearchCache[word].data;
    const searchResultNode = createSearchResultNode(data, word);

    if (index > 0) {
      searchResults.appendChild(document.createElement("hr"));
    }
    searchResults.appendChild(searchResultNode);
  });
}

function toggleTheme() {
  document.body.classList.toggle("dark-theme");
  localStorage.setItem("theme", document.body.classList.contains("dark-theme") ? "dark" : "light");
}

function loadTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark" || !savedTheme) {
    document.body.classList.add("dark-theme");
  }
}

async function handleSearchbarKeydown(e) {
  let x = autocompleteSuggestions.getElementsByTagName("div");

  if (e.keyCode == 40) {
    // Arrow Down
    e.preventDefault();
    if (currentFocus === -1) {
      originalInputValue = searchbar.value;
    }
    currentFocus++;
    addActive(x);
  } else if (e.keyCode == 38) {
    // Arrow Up
    e.preventDefault();
    currentFocus--;
    addActive(x);
  } else if (e.keyCode == 13) {
    // Enter
    e.preventDefault();
    if (currentFocus > -1 && x && x[currentFocus]) {
      x[currentFocus].click();
    } else {
      const originalValue = searchbar.value;
      const success = await searchWord();
      if (success) {
        searchbar.value = "";
        originalInputValue = "";
        closeAllLists();
      } else {
        searchbar.value = originalValue;
        await displayAutocompleteSuggestions();
      }
    }
  } else if (e.keyCode == 27) {
    // Escape
    closeAllLists();
    if (originalInputValue !== "") {
      searchbar.value = originalInputValue;
      originalInputValue = "";
    }
  }
}

function handleDocumentClick(event) {
  if (!autocompleteSuggestions.contains(event.target) && event.target !== searchbar) {
    closeAllLists();
    if (originalInputValue !== "") {
      searchbar.value = originalInputValue;
      originalInputValue = "";
    }
  }
}

function handleInitialQuery() {
  autocompleteSuggestions.style.display = "none";
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get("q");
  if (query) {
    searchbar.value = query;
    searchWord();
  }
}

function populateLanguages() {
  for (const code in languages) {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = languages[code];
    targetLanguageSelect.appendChild(option);
  }
  const savedLang = localStorage.getItem("targetLanguage") || "en";
  targetLanguageSelect.value = savedLang;
}

function populateProviders() {
  for (const code in providers) {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = providers[code];
    translationProviderSelect.appendChild(option);
  }
  const savedProvider = localStorage.getItem("translationProvider") || "google";
  translationProviderSelect.value = savedProvider;
}

function handleTranslation(provider, targetLang, text) {
  let url;
  if (provider === "google") {
    url = `https://translate.google.com/?sl=tr&tl=${targetLang}&text=${encodeURIComponent(text)}`;
  } else if (provider === "deepl") {
    url = `https://www.deepl.com/translator#tr/${targetLang.toUpperCase()}/${encodeURIComponent(text)}`;
  } else if (provider === "libre") {
    url = `https://libretranslate.com/?source=tr&target=${targetLang}&q=${encodeURIComponent(text)}`;
  }
  if (url) {
    window.open(url, "_blank");
  }
}

async function handleDocumentKeydown(e) {
  if (document.activeElement === searchbar) return;

  if (e.key === "h") {
    e.preventDefault();
    showHelp();
    return;
  }

  const selection = window.getSelection().toString().trim();
  if (selection.length > 0) {
    if (e.code === "Enter") {
      e.preventDefault();
      searchbar.value = selection;
      const success = await searchWord();
      if (success) {
        searchbar.value = "";
        originalInputValue = "";
      }
      window.getSelection().removeAllRanges();
    } else if (e.code === "Space") {
      e.preventDefault();
      const provider = translationProviderSelect.value;
      const targetLang = targetLanguageSelect.value;
      handleTranslation(provider, targetLang, selection);
      window.getSelection().removeAllRanges();
    }
  }
}

function handleSelectionChange() {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();

  if (selectedText.length > 0) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    selectionMenu.style.display = "block";
    selectionMenu.style.top = `calc(${rect.bottom + window.scrollY + 5}px + 3rem)`;
    selectionMenu.style.left = `${rect.left + window.scrollX + (rect.width - selectionMenu.offsetWidth) / 2}px`;
  } else {
    selectionMenu.style.display = "none";
  }
}

async function handleSelectionSearch() {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  if (selectedText.length > 0) {
    searchbar.value = selectedText;
    const success = await searchWord();
    if (success) {
      searchbar.value = "";
      originalInputValue = "";
    }
    window.getSelection().removeAllRanges();
    selectionMenu.style.display = "none";
  }
}

function handleSelectionTranslate() {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  if (selectedText.length > 0) {
    const provider = translationProviderSelect.value;
    const targetLang = targetLanguageSelect.value;
    handleTranslation(provider, targetLang, selectedText);
    window.getSelection().removeAllRanges();
    selectionMenu.style.display = "none";
  }
}
