const AUTOCOMPLETE_API_URL = "https://sozluk.gov.tr/autocomplete.json";
const WORD_SEARCH_API_URL = "https://sozluk.gov.tr/gts?ara=";
const FAILED_QUERIES_KEY = "failedQueries";

const STORAGE_PREFIX = "sozeviri-";

function getStorageItem(key) {
  return localStorage.getItem(STORAGE_PREFIX + key);
}

function setStorageItem(key, value) {
  localStorage.setItem(STORAGE_PREFIX + key, value);
}

function removeStorageItem(key) {
  localStorage.removeItem(STORAGE_PREFIX + key);
}

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
  google: "Google Translate",
  deepl: "DeepL",
  libre: "LibreTranslate",
};

let autocompleteCache = null;
let wordSearchCache = JSON.parse(getStorageItem("wordSearchCache")) || {};
let translationCache = JSON.parse(getStorageItem("translationCache")) || {};
let currentFocus = -1;
let originalInputValue = "";
let lastSearchedWord = "";
let isSearching = false;
let blockAutocomplete = false;

let searchbar,
  searchButton,
  translateButton,
  searchResults,
  autocompleteSuggestions,
  themeSelect,
  targetLanguageSelect,
  translationProviderSelect,
  selectionMenu,
  selectionSearchButton,
  selectionTranslateButton,
  helpButton,
  settingsButton,
  settingsModal,
  closeButton,
  helpModal,
  helpModalCloseButton,
  googleApiKeyInput,
  deeplApiKeyInput,
  libreApiKeyInput,
  secondaryLanguagesInput,
  errorModal,
  errorModalCloseButton,
  errorMessageElement,
  reverseTranslateButton,
  selectionReverseTranslateButton,
  exportDataButton,
  importDataButton,
  clearDataButton,
  importFileInput;
document.addEventListener("DOMContentLoaded", function () {
  if ("serviceWorker" in navigator && (window.location.protocol === "http:" || window.location.protocol === "https:")) {
    navigator.serviceWorker
      .register("service-worker.js")
      .then((reg) => console.log("Service Worker Registered", reg))
      .catch((err) => console.error("Service Worker Error", err));
  }

  searchbar = document.getElementById("searchbar");
  searchButton = document.getElementById("searchButton");
  translateButton = document.getElementById("translateButton");
  searchResults = document.getElementById("searchResults");
  autocompleteSuggestions = document.getElementById("autocompleteSuggestions");
  themeSelect = document.getElementById("themeSelect");
  targetLanguageSelect = document.getElementById("targetLanguageSelect");
  translationProviderSelect = document.getElementById("translationProviderSelect");
  selectionMenu = document.getElementById("selection-menu");
  selectionSearchButton = document.getElementById("selection-search-button");
  selectionTranslateButton = document.getElementById("selection-translate-button");
  reverseTranslateButton = document.getElementById("reverseTranslateButton");
  selectionReverseTranslateButton = document.getElementById("selection-reverse-translate-button");
  helpButton = document.getElementById("helpButton");
  settingsButton = document.getElementById("settingsButton");
  settingsModal = document.getElementById("settingsModal");
  closeButton = document.querySelector(".close-button");
  helpModal = document.getElementById("helpModal");
  helpModalCloseButton = helpModal.querySelector(".close-button");
  googleApiKeyInput = document.getElementById("googleApiKey");
  deeplApiKeyInput = document.getElementById("deeplApiKey");
  libreApiKeyInput = document.getElementById("libreApiKey");
  secondaryLanguagesInput = document.getElementById("secondaryLanguagesInput");
  errorModal = document.getElementById("errorModal");
  errorModalCloseButton = errorModal.querySelector(".close-button");
  errorMessageElement = document.getElementById("errorMessage");
  exportDataButton = document.getElementById("exportDataButton");
  importDataButton = document.getElementById("importDataButton");
  clearDataButton = document.getElementById("clearDataButton");
  importFileInput = document.getElementById("importFileInput");
  initialize();
});

function initialize() {
  updateWordSearchCacheStructure();
  setupEventListeners();
  setupDataManagementListeners();
  loadTheme();
  loadAndRenderSavedItems();
  retryFailedQueries();
  populateLanguages();
  populateProviders();
  loadApiKeys();
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
    setStorageItem("wordSearchCache", JSON.stringify(wordSearchCache));
  }
}

function saveFailedQuery(query) {
  const failedQueries = getFailedQueries();
  if (!failedQueries.includes(query)) {
    failedQueries.push(query);
    setStorageItem(FAILED_QUERIES_KEY, JSON.stringify(failedQueries));
  }
}

function getFailedQueries() {
  return JSON.parse(getStorageItem(FAILED_QUERIES_KEY)) || [];
}

function clearFailedQueries() {
  removeStorageItem(FAILED_QUERIES_KEY);
}

async function retryFailedQueries() {
  const failedQueries = getFailedQueries();
  if (failedQueries.length > 0) {
    console.log("Retrying failed queries:", failedQueries);
    clearFailedQueries();
    for (const query of failedQueries) {
      await fetchAndProcessWord(query);
    }
  }
}

function setupEventListeners() {
  searchbar.addEventListener("input", displayAutocompleteSuggestions);
  searchButton.addEventListener("click", handleSearchButtonClick);
  translateButton.addEventListener("click", handleTranslateButtonClick);
  themeSelect.addEventListener("change", () => setTheme(themeSelect.value));
  searchbar.addEventListener("keydown", handleSearchbarKeydown);
  document.addEventListener("click", handleDocumentClick);
  targetLanguageSelect.addEventListener("change", () => setStorageItem("targetLanguage", targetLanguageSelect.value));
  translationProviderSelect.addEventListener("change", () =>
    setStorageItem("translationProvider", translationProviderSelect.value),
  );
  document.addEventListener("keydown", handleDocumentKeydown);
  document.addEventListener("selectionchange", handleSelectionChange);
  selectionSearchButton.addEventListener("click", handleSelectionSearch);
  selectionTranslateButton.addEventListener("click", handleSelectionTranslate);
  reverseTranslateButton.addEventListener("click", handleReverseTranslateButtonClick);
  selectionReverseTranslateButton.addEventListener("click", handleSelectionReverseTranslate);
  helpButton.addEventListener("click", showHelp);
  settingsButton.addEventListener("click", () => {
    settingsModal.style.display = "block";
    closeButton.focus();
  });
  closeButton.addEventListener("click", () => (settingsModal.style.display = "none"));
  helpModalCloseButton.addEventListener("click", () => (helpModal.style.display = "none"));
  errorModalCloseButton.addEventListener("click", () => (errorModal.style.display = "none"));
  googleApiKeyInput.addEventListener("input", () => setStorageItem("googleApiKey", googleApiKeyInput.value));
  deeplApiKeyInput.addEventListener("input", () => setStorageItem("deeplApiKey", deeplApiKeyInput.value));
  libreApiKeyInput.addEventListener("input", () => setStorageItem("libreApiKey", libreApiKeyInput.value));
  secondaryLanguagesInput.addEventListener("input", () =>
    setStorageItem("secondaryLanguages", secondaryLanguagesInput.value),
  );
  window.addEventListener("click", (event) => {
    if (event.target == settingsModal) {
      settingsModal.style.display = "none";
    } else if (event.target == helpModal) {
      helpModal.style.display = "none";
    } else if (event.target == errorModal) {
      errorModal.style.display = "none";
    }
  });
}

function showErrorModal(message) {
  errorMessageElement.textContent = message;
  errorModal.style.display = "block";
  errorModalCloseButton.focus();
}

function showHelp() {
  helpModal.style.display = "block";
  helpModalCloseButton.focus();
}

async function handleSearchButtonClick() {
  const originalValue = searchbar.value;
  const success = await searchWord();
  if (!success) {
    searchbar.value = originalValue;
  } else {
    searchbar.value = "";
    originalInputValue = "";
  }
}

async function fetchAutocompleteData() {
  if (autocompleteCache) {
    return autocompleteCache;
  }

  const cachedData = JSON.parse(getStorageItem("autocompleteCache"));
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
    setStorageItem("autocompleteCache", JSON.stringify(cacheToStore));
    return data;
  } catch (error) {
    console.error("Error fetching autocomplete data:", error);
    showErrorModal("Otomatik tamamlama verileri getirilirken bir hata oluştu: " + error.message);
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
  if (blockAutocomplete) {
    blockAutocomplete = false;
    return;
  }
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
      setStorageItem("wordSearchCache", JSON.stringify(wordSearchCache));
      loadAndRenderSavedItems();
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
      setStorageItem("wordSearchCache", JSON.stringify(wordSearchCache));
      displaySearchResults(data, word);
      lastSearchedWord = word;
      return true;
    }
  } catch (error) {
    console.error("Error fetching word data:", error);
    showErrorModal("Kelime verileri getirilirken bir hata oluştu: " + error.message);
    if (error.message.includes("NetworkError") || error.message.includes("Failed to fetch")) {
      saveFailedQuery(word);
    }
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
  resultWrapper.classList.add("search");
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
    const currentWord = cacheKey;
    if (lastSearchedWord === currentWord) {
      lastSearchedWord = "";
    }
    delete wordSearchCache[currentWord];
    setStorageItem("wordSearchCache", JSON.stringify(wordSearchCache));
    loadAndRenderSavedItems();
  });
  headerContainer.appendChild(deleteButton);
  resultWrapper.appendChild(headerContainer);

  data.forEach((entry) => {
    const wordEntryDiv = document.createElement("div");
    wordEntryDiv.classList.add("query-result");

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

function createTranslationGroupNode(originalText, translations) {
  const resultWrapper = document.createElement("div");
  resultWrapper.classList.add("search", "translation-group"); // Add a new class for styling if needed

  const headerContainer = document.createElement("div");
  headerContainer.style.display = "flex";
  headerContainer.style.justifyContent = "space-between";
  headerContainer.style.alignItems = "center";

  const originalHeader = document.createElement("h2");
  originalHeader.textContent = originalText; // Display the original text as the main header
  headerContainer.appendChild(originalHeader);

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Sil";
  deleteButton.classList.add("delete-query-button");
  deleteButton.addEventListener("click", (e) => {
    e.stopPropagation();
    delete translationCache[originalText]; // Delete the entire group
    setStorageItem("translationCache", JSON.stringify(translationCache));
    loadAndRenderSavedItems();
  });
  headerContainer.appendChild(deleteButton);
  resultWrapper.appendChild(headerContainer);

  // Iterate through all translations for this original text
  for (const targetLang in translations) {
    const translationData = translations[targetLang];
    const languageName = languages[targetLang] || targetLang; // Get full language name or use code

    const translationEntryDiv = document.createElement("div");
    translationEntryDiv.classList.add("query-result");
    translationEntryDiv.classList.add("translation-entry");

    const translationHeader = document.createElement("h3");

    if (targetLang.startsWith("tr-from-")) {
      const sourceLangCode = targetLang.replace("tr-from-", "");
      const sourceLangName = languages[sourceLangCode] || sourceLangCode;
      translationHeader.textContent = `${sourceLangName} -> Turkish`;
    } else {
      translationHeader.textContent = `${languageName}`;
    }

    translationEntryDiv.appendChild(translationHeader);

    const translatedParagraph = document.createElement("p");
    translatedParagraph.textContent = translationData.translatedText;
    translationEntryDiv.appendChild(translatedParagraph);

    resultWrapper.appendChild(translationEntryDiv);
  }

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

function loadAndRenderSavedItems() {
  searchResults.innerHTML = "";

  const sortedSearches = Object.keys(wordSearchCache).map((word) => ({
    type: "search",
    key: word,
    timestamp: wordSearchCache[word].timestamp,
    data: wordSearchCache[word].data,
  }));

  const sortedTranslations = Object.keys(translationCache).map((originalText) => ({
    type: "translation-group",
    key: originalText,
    timestamp: translationCache[originalText].timestamp,
    data: translationCache[originalText].translations,
  }));

  const sortedItems = [...sortedSearches, ...sortedTranslations].sort((a, b) => b.timestamp - a.timestamp);

  sortedItems.forEach(({ type, key, data }, index) => {
    let node;
    if (type === "search") {
      node = createSearchResultNode(data, key);
    } else if (type === "translation-group") {
      node = createTranslationGroupNode(key, data);
    }

    if (index > 0) {
      searchResults.appendChild(document.createElement("hr"));
    }
    searchResults.appendChild(node);
  });
}

function setTheme(theme) {
  document.body.classList.toggle("dark-theme", theme === "dark");
  setStorageItem("theme", theme);
  themeSelect.value = theme;
}

function loadTheme() {
  const savedTheme = getStorageItem("theme") || "dark";
  setTheme(savedTheme);
}

async function handleTranslateButtonClick() {
  const text = searchbar.value.trim();
  if (text) {
    const provider = translationProviderSelect.value;
    const targetLang = targetLanguageSelect.value;
    handleTranslation(provider, targetLang, text);
    searchbar.value = "";
    originalInputValue = "";
    closeAllLists();
    blockAutocomplete = true;
  }
}

async function handleSearchbarKeydown(e) {
  let x = autocompleteSuggestions.getElementsByTagName("div");

  if (e.keyCode == 40) {
    e.preventDefault();
    if (currentFocus === -1) {
      originalInputValue = searchbar.value;
    }
    currentFocus++;
    addActive(x);
  } else if (e.keyCode == 38) {
    e.preventDefault();
    currentFocus--;
    addActive(x);
  } else if (e.keyCode == 13) {
    if (e.ctrlKey) {
      e.preventDefault();
      if (e.shiftKey) {
        handleReverseTranslateButtonClick();
      } else {
        handleTranslateButtonClick();
      }
      return;
    }
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
    closeAllLists();
    if (originalInputValue !== "") {
      searchbar.value = originalInputValue;
      originalInputValue = "";
    }
  }
}

function handleDocumentClick(event) {
  if (
    !autocompleteSuggestions.contains(event.target) &&
    event.target !== searchbar &&
    event.target !== searchButton &&
    event.target !== translateButton &&
    event.target !== reverseTranslateButton
  ) {
    closeAllLists();
    if (originalInputValue !== "") {
      searchbar.value = originalInputValue;
      originalInputValue = "";
    }
  }
}

function loadApiKeys() {
  googleApiKeyInput.value = getStorageItem("googleApiKey") || "";
  deeplApiKeyInput.value = getStorageItem("deeplApiKey") || "";
  libreApiKeyInput.value = getStorageItem("libreApiKey") || "";
  secondaryLanguagesInput.value = getStorageItem("secondaryLanguages") || "";
}

function handleInitialQuery() {
  autocompleteSuggestions.style.display = "none";
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get("q") || urlParams.get("query");
  const type = urlParams.get("t") || "dict";

  if (query) {
    searchbar.value = query;
    if (type === "translate" || type === "t") {
      handleTranslateButtonClick();
    } else if (type === "revtranslate" || type === "rt") {
      handleReverseTranslateButtonClick();
    } else {
      searchWord();
    }
    // Strip URL parameters
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

function populateLanguages() {
  for (const code in languages) {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = `${languages[code]} (${code})`;
    targetLanguageSelect.appendChild(option);
  }
  const savedLang = getStorageItem("targetLanguage") || "en";
  targetLanguageSelect.value = savedLang;
}

function populateProviders() {
  for (const code in providers) {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = providers[code];
    translationProviderSelect.appendChild(option);
  }
  const savedProvider = getStorageItem("translationProvider") || "google";
  translationProviderSelect.value = savedProvider;
}

async function translateText(provider, sourceLang, targetLang, text) {
  let translatedText = "";

  try {
    if (provider === "google") {
      const useDefault = !googleApiKeyInput.value;
      const defaultKey = "AIzaSyDLEeFI5OtFBwYBIoK_jj5m32rZK5CkCXA";

      if (useDefault) {
        const apiKey = defaultKey;
        const url = `https://translate-pa.googleapis.com/v1/translate?params.client=gtx&dataTypes=TRANSLATION&key=${apiKey}&query.sourceLanguage=${sourceLang}&query.targetLanguage=${targetLang}&query.text=${encodeURIComponent(
          text,
        )}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
          console.error("Google Translate API error:", data.error.message || JSON.stringify(data.error));
          return null;
        }

        if (data.translation) {
          translatedText = data.translation;
        } else {
          console.error("Google Translate API: No translation returned.", data);
          return null;
        }
      } else {
        const apiKey = getStorageItem("googleApiKey");
        if (!apiKey) {
          showErrorModal("Google API anahtarı eksik.");
          return null;
        }
        const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}&q=${encodeURIComponent(
          text,
        )}&target=${targetLang}&source=${sourceLang}`; // Added source param
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
          console.error("Google Translate API error:", data.error.message);
          return null;
        }

        if (data.data && data.data.translations && data.data.translations.length > 0) {
          translatedText = data.data.translations[0].translatedText;
        } else {
          console.error("Google Translate API: No translation returned.", data);
          return null;
        }
      }
    } else if (provider === "deepl") {
      const apiKey = getStorageItem("deeplApiKey");
      if (!apiKey) {
        // For DeepL free opening, we can't easily do programmatic reverse without key
        if (!getStorageItem("deeplApiKey")) {
          window.open(
            `https://www.deepl.com/translator#${sourceLang}/${targetLang}/${encodeURIComponent(text)}`,
            "_blank",
          );
          return "OPENED_TAB"; // Signal that we opened a tab
        }
        return null;
      }
      const url = `https://api-free.deepl.com/v2/translate`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `auth_key=${apiKey}&text=${encodeURIComponent(text)}&target_lang=${targetLang.toUpperCase()}&source_lang=${sourceLang.toUpperCase()}`,
      });
      const data = await response.json();

      if (data.message) {
        console.error("DeepL API error:", data.message);
        return null;
      }

      if (data.translations && data.translations.length > 0) {
        translatedText = data.translations[0].text;
      } else {
        console.error("DeepL API: No translation returned.", data);
        return null;
      }
    } else if (provider === "libre") {
      const apiKey = getStorageItem("libreApiKey");
      if (!apiKey) {
        window.open(
          `https://libretranslate.com/?q=${encodeURIComponent(text)}&source=${sourceLang}&target=${targetLang}`,
          "_blank",
        );
        return "OPENED_TAB";
      }
      const url = `https://libretranslate.com/translate`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: text,
          source: sourceLang,
          target: targetLang,
          api_key: apiKey,
        }),
      });
      const data = await response.json();

      if (data.error) {
        console.error("LibreTranslate API error:", data.error);
        return null;
      }
      translatedText = data.translatedText;
    }
  } catch (error) {
    console.error("Translation error:", error);
    return null;
  }
  return translatedText;
}

async function handleTranslation(provider, targetLang, text) {
  const sourceLang = "tr";
  const translatedText = await translateText(provider, sourceLang, targetLang, text);

  if (translatedText === "OPENED_TAB") return;

  if (translatedText) {
    saveTranslation(text, targetLang, translatedText, provider);
  } else {
    showErrorModal("Çeviri başarısız.");
  }

  // Handle secondary translations
  const secondaryLanguages = secondaryLanguagesInput.value
    .split(",")
    .map((lang) => lang.trim())
    .filter((lang) => lang !== "");

  for (const secondaryLang of secondaryLanguages) {
    if (secondaryLang === targetLang) continue;
    const secTranslatedText = await translateText(provider, sourceLang, secondaryLang, text);
    if (secTranslatedText && secTranslatedText !== "OPENED_TAB") {
      saveTranslation(text, secondaryLang, secTranslatedText, provider);
    }
  }
}

function saveTranslation(originalText, targetCode, translatedText, provider) {
  if (!translationCache[originalText]) {
    translationCache[originalText] = {
      timestamp: Date.now(),
      translations: {},
    };
  }
  translationCache[originalText].translations[targetCode] = {
    translatedText: translatedText,
    originalText: originalText,
    provider: provider,
  };
  translationCache[originalText].timestamp = Date.now();
  setStorageItem("translationCache", JSON.stringify(translationCache));
  loadAndRenderSavedItems();
}

async function handleReverseTranslateButtonClick() {
  const text = searchbar.value.trim();
  if (text) {
    const provider = translationProviderSelect.value;
    const targetLang = targetLanguageSelect.value;
    const secondaryLanguages = secondaryLanguagesInput.value
      .split(",")
      .map((l) => l.trim())
      .filter((l) => l);

    await handleReverseTranslation(provider, [targetLang, ...secondaryLanguages], text);
    searchbar.value = "";
    originalInputValue = "";
    closeAllLists();
    blockAutocomplete = true;
  }
}

async function handleSelectionReverseTranslate() {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  if (selectedText.length > 0) {
    const provider = translationProviderSelect.value;
    const targetLang = targetLanguageSelect.value;
    const secondaryLanguages = secondaryLanguagesInput.value
      .split(",")
      .map((l) => l.trim())
      .filter((l) => l);

    await handleReverseTranslation(provider, [targetLang, ...secondaryLanguages], selectedText);

    window.getSelection().removeAllRanges();
    selectionMenu.style.display = "none";
  }
}

async function handleReverseTranslation(provider, possibleSourceLangs, text) {
  const targetCode = "tr";

  // De-duplicate languages
  const candidateLangs = [...new Set(possibleSourceLangs)];
  const results = [];

  for (const sourceLang of candidateLangs) {
    const translation = await translateText(provider, sourceLang, targetCode, text);

    if (translation && translation !== "OPENED_TAB" && translation.toLowerCase() !== text.toLowerCase()) {
      results.push({ sourceLang, translation });
    }
  }

  if (results.length === 0) return;

  const firstTranslation = results[0].translation;
  const allSame = results.length > 1 && results.every(r => r.translation === firstTranslation);

  if (allSame) {
    saveTranslation(text, "tr-from-?", firstTranslation, provider);
  } else {
    for (const r of results) {
      saveTranslation(text, `tr-from-${r.sourceLang}`, r.translation, provider);
    }
  }
}

async function handleDocumentKeydown(e) {
  const isModalOpen =
    settingsModal.style.display === "block" ||
    helpModal.style.display === "block" ||
    errorModal.style.display === "block";

  if (e.ctrlKey && e.key === "k") {
    e.preventDefault();
    searchbar.focus();
    return;
  }

  if (isModalOpen) {
    if (e.key === "Escape") {
      if (settingsModal.style.display === "block") {
        settingsModal.style.display = "none";
      } else if (helpModal.style.display === "block") {
        helpModal.style.display = "none";
      } else if (errorModal.style.display === "block") {
        errorModal.style.display = "none";
      }
      e.preventDefault();
      return;
    } else {
      return;
    }
  }
  if (document.activeElement === searchbar) return;

  if (e.key === "h") {
    e.preventDefault();
    showHelp();
    return;
  }

  if (e.key === "Escape") {
    if (settingsModal.style.display === "block") {
      settingsModal.style.display = "none";
    } else if (helpModal.style.display === "block") {
      helpModal.style.display = "none";
    } else if (errorModal.style.display === "block") {
      errorModal.style.display = "none";
    }
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
      if (e.shiftKey) {
        // Reverse Translate Selection
        const provider = translationProviderSelect.value;
        const targetLang = targetLanguageSelect.value;
        const secondaryLanguages = secondaryLanguagesInput.value
          .split(",")
          .map((l) => l.trim())
          .filter((l) => l);
        await handleReverseTranslation(provider, [targetLang, ...secondaryLanguages], selection);
      } else {
        // Normal Translate Selection
        const provider = translationProviderSelect.value;
        const targetLang = targetLanguageSelect.value;
        handleTranslation(provider, targetLang, selection);
      }
      window.getSelection().removeAllRanges();
    }
  } else if (e.key === "s") {
    settingsModal.style.display = "block";
    closeButton.focus();
  }
}

function handleSelectionChange() {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();

  if (selectedText.length > 0 && searchResults.contains(selection.anchorNode)) {
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

async function handleSelectionTranslate() {
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

async function performSecondaryTranslation(provider, targetLang, text) {
  let translatedText = "";
  try {
    if (provider === "google") {
      const useDefault = !googleApiKeyInput.value;
      const defaultKey = "AIzaSyDLEeFI5OtFBwYBIoK_jj5m32rZK5CkCXA";

      if (useDefault) {
        const apiKey = defaultKey;
        const url = `https://translate-pa.googleapis.com/v1/translate?params.client=gtx&dataTypes=TRANSLATION&key=${apiKey}&query.sourceLanguage=tr&query.targetLanguage=${targetLang}&query.text=${encodeURIComponent(
          text,
        )}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
          console.error("Google Translate API error:", data.error.message || JSON.stringify(data.error));
          return;
        }

        if (data.translation) {
          translatedText = data.translation;
        } else {
          console.error("Google Translate API: No translation returned.", data);
          return;
        }
      } else {
        const apiKey = getStorageItem("googleApiKey");
        if (!apiKey) {
          return;
        }
        const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}&q=${encodeURIComponent(
          text,
        )}&target=${targetLang}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
          console.error("Google Translate API error:", data.error.message);
          return;
        }

        if (data.data && data.data.translations && data.data.translations.length > 0) {
          translatedText = data.data.translations[0].translatedText;
        } else {
          console.error("Google Translate API: No translation returned.", data);
          return;
        }
      }
    } else if (provider === "deepl") {
      const apiKey = getStorageItem("deeplApiKey");
      if (!apiKey) {
        window.open(`https://www.deepl.com/translator#tr/${targetLang}/${encodeURIComponent(text)}`, "_blank");
        return;
      }
      const url = `https://api-free.deepl.com/v2/translate`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `auth_key=${apiKey}&text=${encodeURIComponent(text)}&target_lang=${targetLang.toUpperCase()}`,
      });
      const data = await response.json();

      if (data.message) {
        console.error("DeepL API error:", data.message);
        return;
      }

      if (data.translations && data.translations.length > 0) {
        translatedText = data.translations[0].text;
      } else {
        console.error("DeepL API: No translation returned.", data);
        return;
      }
    } else if (provider === "libre") {
      const apiKey = getStorageItem("libreApiKey");
      if (!apiKey) {
        window.open(
          `https://libretranslate.com/?q=${encodeURIComponent(text)}&source=tr&target=${targetLang}`,
          "_blank",
        );
        return;
      }
      const url = `https://libretranslate.com/translate`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: text,
          source: "tr",
          target: targetLang,
          api_key: apiKey,
        }),
      });
      const data = await response.json();

      if (data.error) {
        console.error("LibreTranslate API error:", data.error);
        return;
      }
      translatedText = data.translatedText;
    }

    if (translatedText) {
      if (!translationCache[text]) {
        translationCache[text] = {
          timestamp: Date.now(),
          translations: {},
        };
      }
      translationCache[text].translations[targetLang] = {
        translatedText: translatedText,
        originalText: text,
        provider: provider,
      };
      translationCache[text].timestamp = Date.now(); // Update timestamp on any new translation
      setStorageItem("translationCache", JSON.stringify(translationCache));
      loadAndRenderSavedItems(); // Re-render to show new translations
    }
  } catch (error) {
    console.error(`Secondary translation error for ${targetLang}:`, error);
  }
}


function handleExportData() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(STORAGE_PREFIX) && !key.includes("autocompleteCache")) {
      data[key] = localStorage.getItem(key);
    }
  }

  const dataStr = JSON.stringify(data, null, 2);
  const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

  const exportFileDefaultName = "sozeviri-data-" + new Date().toISOString().slice(0, 10) + ".json";

  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileDefaultName);
  linkElement.click();
}

function handleImportData() {
  importFileInput.click();
}

function handleClearData() {
  if (confirm("Tüm verileri temizlemek istediğinize emin misiniz? Bu işlem geri alınamaz.")) {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
    location.reload();
  }
}

function setupDataManagementListeners() {
  exportDataButton.addEventListener("click", handleExportData);
  importDataButton.addEventListener("click", handleImportData);
  clearDataButton.addEventListener("click", handleClearData);

  importFileInput.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const data = JSON.parse(e.target.result);
        if (typeof data !== "object" || data === null) {
          throw new Error("Invalid JSON format");
        }

        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key.startsWith(STORAGE_PREFIX) && !key.includes("autocompleteCache")) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((key) => localStorage.removeItem(key));

        for (const key in data) {
          if (key.startsWith(STORAGE_PREFIX)) {
            localStorage.setItem(key, data[key]);
          }
        }

        alert("Veriler başarıyla içe aktarıldı.");
        location.reload();
      } catch (error) {
        console.error("Import Error:", error);
        alert("Veri içe aktarılırken hata oluştu: " + error.message);
      }
      importFileInput.value = "";
    };
    reader.readAsText(file);
  });
}
