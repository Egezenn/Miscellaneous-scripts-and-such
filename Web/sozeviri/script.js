const AUTOCOMPLETE_API_URL = "https://sozluk.gov.tr/autocomplete.json";
const WORD_SEARCH_API_URL = "https://sozluk.gov.tr/gts?ara=";
const FAILED_QUERIES_KEY = "failedQueries";

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
let wordSearchCache = JSON.parse(localStorage.getItem("wordSearchCache")) || {};
let translationCache = JSON.parse(localStorage.getItem("translationCache")) || {};
let currentFocus = -1;
let originalInputValue = "";
let lastSearchedWord = "";
let isSearching = false;
let blockAutocomplete = false;

let searchbar,
  searchButton,
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
  errorMessageElement;
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
  initialize();
});

function initialize() {
  updateWordSearchCacheStructure();
  setupEventListeners();
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
    localStorage.setItem("wordSearchCache", JSON.stringify(wordSearchCache));
  }
}

function saveFailedQuery(query) {
  const failedQueries = getFailedQueries();
  if (!failedQueries.includes(query)) {
    failedQueries.push(query);
    localStorage.setItem(FAILED_QUERIES_KEY, JSON.stringify(failedQueries));
  }
}

function getFailedQueries() {
  return JSON.parse(localStorage.getItem(FAILED_QUERIES_KEY)) || [];
}

function clearFailedQueries() {
  localStorage.removeItem(FAILED_QUERIES_KEY);
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
  settingsButton.addEventListener("click", () => {
    settingsModal.style.display = "block";
    closeButton.focus();
  });
  closeButton.addEventListener("click", () => (settingsModal.style.display = "none"));
  helpModalCloseButton.addEventListener("click", () => (helpModal.style.display = "none"));
  errorModalCloseButton.addEventListener("click", () => (errorModal.style.display = "none"));
  googleApiKeyInput.addEventListener("input", () => localStorage.setItem("googleApiKey", googleApiKeyInput.value));
  deeplApiKeyInput.addEventListener("input", () => localStorage.setItem("deeplApiKey", deeplApiKeyInput.value));
  libreApiKeyInput.addEventListener("input", () => localStorage.setItem("libreApiKey", libreApiKeyInput.value));
  secondaryLanguagesInput.addEventListener("input", () =>
    localStorage.setItem("secondaryLanguages", secondaryLanguagesInput.value)
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
      localStorage.setItem("wordSearchCache", JSON.stringify(wordSearchCache));
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
      localStorage.setItem("wordSearchCache", JSON.stringify(wordSearchCache));
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
    localStorage.setItem("wordSearchCache", JSON.stringify(wordSearchCache));
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
    localStorage.setItem("translationCache", JSON.stringify(translationCache));
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
    translationHeader.textContent = `${languageName}`; // e.g., "English Translation"
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
  localStorage.setItem("theme", theme);
  themeSelect.value = theme;
}

function loadTheme() {
  const savedTheme = localStorage.getItem("theme") || "dark";
  setTheme(savedTheme);
}

async function handleTranslateButtonClick() {
  const text = searchbar.value.trim();
  if (text) {
    const provider = translationProviderSelect.value;
    const targetLang = targetLanguageSelect.value;
    handleTranslation(provider, targetLang, text);
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
      handleTranslateButtonClick();
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
  if (!autocompleteSuggestions.contains(event.target) && event.target !== searchbar) {
    closeAllLists();
    if (originalInputValue !== "") {
      searchbar.value = originalInputValue;
      originalInputValue = "";
    }
  }
}

function loadApiKeys() {
  googleApiKeyInput.value = localStorage.getItem("googleApiKey") || "";
  deeplApiKeyInput.value = localStorage.getItem("deeplApiKey") || "";
  libreApiKeyInput.value = localStorage.getItem("libreApiKey") || "";
  secondaryLanguagesInput.value = localStorage.getItem("secondaryLanguages") || "";
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
    option.textContent = `${languages[code]} (${code})`;
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

async function handleTranslation(provider, targetLang, text) {
  let translatedText = "";

  try {
    if (provider === "google") {
      const useDefault = !googleApiKeyInput.value;
      const defaultKey = "AIzaSyDLEeFI5OtFBwYBIoK_jj5m32rZK5CkCXA";

      if (useDefault) {
        const apiKey = defaultKey;
        const url = `https://translate-pa.googleapis.com/v1/translate?params.client=gtx&dataTypes=TRANSLATION&key=${apiKey}&query.sourceLanguage=tr&query.targetLanguage=${targetLang}&query.text=${encodeURIComponent(
          text
        )}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
          console.error("Google Translate API error:", data.error.message || JSON.stringify(data.error));
          showErrorModal(`Google Translate Hatası: ${data.error.message || JSON.stringify(data.error)}`);
          return;
        }

        if (data.translation) {
          translatedText = data.translation;
        } else {
          console.error("Google Translate API: No translation returned.", data);
          showErrorModal("Google Translate: Çeviri bulunamadı.");
          return;
        }
      } else {
        const apiKey = localStorage.getItem("googleApiKey");
        if (!apiKey) {
          showErrorModal("Google API anahtarı eksik.");
          return;
        }
        const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}&q=${encodeURIComponent(
          text
        )}&target=${targetLang}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
          console.error("Google Translate API error:", data.error.message);
          showErrorModal(`Google Translate Hatası: ${data.error.message}`);
          return;
        }

        if (data.data && data.data.translations && data.data.translations.length > 0) {
          translatedText = data.data.translations[0].translatedText;
        } else {
          console.error("Google Translate API: No translation returned.", data);
          showErrorModal("Google Translate: Çeviri bulunamadı.");
          return;
        }
      }
    } else if (provider === "deepl") {
      const apiKey = localStorage.getItem("deeplApiKey");
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
        showErrorModal(`DeepL Hatası: ${data.message}`);
        return;
      }

      if (data.translations && data.translations.length > 0) {
        translatedText = data.translations[0].text;
      } else {
        console.error("DeepL API: No translation returned.", data);
        showErrorModal("DeepL: Çeviri bulunamadı.");
        return;
      }
    } else if (provider === "libre") {
      const apiKey = localStorage.getItem("libreApiKey");
      if (!apiKey) {
        window.open(
          `https://libretranslate.com/?q=${encodeURIComponent(text)}&source=tr&target=${targetLang}`,
          "_blank"
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
        showErrorModal(`LibreTranslate Hatası: ${data.error}`);
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
      localStorage.setItem("translationCache", JSON.stringify(translationCache));
      loadAndRenderSavedItems();
    } else {
      showErrorModal("Çeviri başarısız.");
    }

    // Handle secondary translations
    const secondaryLanguages = secondaryLanguagesInput.value
      .split(",")
      .map((lang) => lang.trim())
      .filter((lang) => lang !== "");

    for (const secondaryLang of secondaryLanguages) {
      if (secondaryLang === targetLang) continue; // Skip if it's the same as the primary target language
      await performSecondaryTranslation(provider, secondaryLang, text);
    }
  } catch (error) {
    console.error("Translation error:", error);
    showErrorModal("Çeviri sırasında bir hata oluştu: " + error.message);
  }
}

async function handleDocumentKeydown(e) {
  const isModalOpen =
    settingsModal.style.display === "block" ||
    helpModal.style.display === "block" ||
    errorModal.style.display === "block";

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
      const provider = translationProviderSelect.value;
      const targetLang = targetLanguageSelect.value;
      handleTranslation(provider, targetLang, selection);
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
          text
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
        const apiKey = localStorage.getItem("googleApiKey");
        if (!apiKey) {
          return;
        }
        const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}&q=${encodeURIComponent(
          text
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
      const apiKey = localStorage.getItem("deeplApiKey");
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
      const apiKey = localStorage.getItem("libreApiKey");
      if (!apiKey) {
        window.open(
          `https://libretranslate.com/?q=${encodeURIComponent(text)}&source=tr&target=${targetLang}`,
          "_blank"
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
      localStorage.setItem("translationCache", JSON.stringify(translationCache));
      loadAndRenderSavedItems(); // Re-render to show new translations
    }
  } catch (error) {
    console.error(`Secondary translation error for ${targetLang}:`, error);
  }
}
