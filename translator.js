// I ve added some comments to make it easier to understand.hope it'll help

// Global flag to prevent multiple initializations
let i18nInitialized = false;
let persistentLanguage = null;

// This is the main function that starts everything.
// 'async' means it can perform tasks like loading files without freezing the page.
async function i18n_init() {
    // Prevent multiple initializations
    if (i18nInitialized) {
        console.log('i18n already initialized, skipping...');
        return;
    }

    i18nInitialized = true;
    try {

        // 'common' is for shared elements . make sur to use it guys
        // Each page can have its own namespace. We'll get the current page's namespace

        const pageNamespace = document.body.getAttribute('data-page-namespace') || 'home';

        // Determine the initial language
        let initialLang = 'fr'; // Default to French

        // Check if we have a persistent language set
        if (persistentLanguage && ['fr', 'en'].includes(persistentLanguage)) {
            initialLang = persistentLanguage;
            console.log('Language set from persistent state:', persistentLanguage);
        } else {
            // Check URL parameters first
            const urlParams = new URLSearchParams(window.location.search);
            const urlLang = urlParams.get('lang');
            if (urlLang && ['fr', 'en'].includes(urlLang)) {
                initialLang = urlLang;
                console.log('Language set from URL parameter:', urlLang);
            } else {
                // Check localStorage if no URL parameter
                const storedLang = localStorage.getItem('userLanguage');
                console.log('Stored language from localStorage:', storedLang);
                if (storedLang && ['fr', 'en'].includes(storedLang)) {
                    initialLang = storedLang;
                    console.log('Language set from localStorage:', storedLang);
                } else {
                    console.log('No valid stored language, using default French');
                }
            }
        }

        // Store the language persistently
        persistentLanguage = initialLang;
        console.log('Final initial language:', initialLang);

        await i18next
            .use(i18nextHttpBackend) // Use the backend to load files
            .init({
                lng: initialLang,
                fallbackLng: initialLang, // Use the same language as fallback to prevent switching
                debug: true,
                preload: ['fr', 'en'],
                // Define the namespaces to load. We always load 'common' + page namespace
                ns: ['common', pageNamespace],
                // Use the page namespace as default; shared keys are referenced as 'common:...'
                defaultNS: pageNamespace,
                supportedLngs: ['fr', 'en'],
                backend: {
                    // Path to our translation files.
                    // {{lng}} will be 'en' or 'fr'.
                    // {{ns}} will be 'common', 'home'......
                    loadPath: 'locales/{{lng}}/{{ns}}.json',
                }
            });

        // Helpful logs for diagnosing missing/failed loads
        i18next.on('failedLoading', function (lng, ns, msg) {
            console.error('i18next failed loading', { lng, ns, msg });
        });
        i18next.on('loaded', function (loaded) {
            console.log('i18next loaded resources:', loaded);
        });

        // This connects i18next to jQuery (a library that makes it easy to manipulate HTML)
        jqueryI18next.init(i18next, $);

        // This command finds every element with a 'data-i18n' attribute
        // and replaces its content with the correct translation.
        $('body').localize();
        translateSelectOptions();
        reinitSelects();

        // This makes sure the button shows the correct text ("English" or "Français") when the page loads.
        updateLanguageSwitcherText();
        highlightActiveLanguage();

        // Update SEO tags ---
        updateSEOTags();
        syncUrlWithLanguage();

        // Update HTML lang attribute
        updateHTMLLangAttribute();

        // Store the current language to prevent it from being overridden
        const currentLang = i18next.language;
        console.log('Initialization complete. Current language set to:', currentLang);

        // Add a small delay and verify the language hasn't changed
        setTimeout(() => {
            if (i18next.language !== currentLang) {
                console.warn('Language was changed after initialization! Restoring to:', currentLang);
                i18next.changeLanguage(currentLang);
                $('body').localize();
                translateSelectOptions();
                reinitSelects();
                updateLanguageSwitcherText();
                highlightActiveLanguage();
                updateSEOTags();
                syncUrlWithLanguage();
                updateHTMLLangAttribute();
            }
        }, 100);

        // Set up a more persistent language protection
        setInterval(() => {
            if (persistentLanguage && i18next.language !== persistentLanguage) {
                console.warn('Language was changed by external script! Restoring to:', persistentLanguage);
                i18next.changeLanguage(persistentLanguage);
                $('body').localize();
                translateSelectOptions();
                reinitSelects();
                updateLanguageSwitcherText();
                highlightActiveLanguage();
                updateSEOTags();
                syncUrlWithLanguage();
                updateHTMLLangAttribute();
            }
        }, 1000); // Check every second

    } catch (err) {
        console.error("Error during i18n initialization:", err);
    }
}

// This function updates the language switcher dropdown to show the current language
function updateLanguageSwitcherText() {
    const currentLang = i18next.language;
    let currentLangText, currentFlag;

    // Set the current language text and flag
    switch (currentLang) {
        case 'fr':
            currentLangText = 'Français';
            currentFlag = 'assets/images/icons/fr.png';
            break;
        case 'en':
            currentLangText = 'English';
            currentFlag = 'assets/images/icons/en-us.png';
            break;
        default:
            currentLangText = 'French';
            currentFlag = 'assets/images/icons/fr.png';
    }

    // Update all language switcher dropdowns
    $('.switcher-language .has-child-menu > a').each(function () {
        $(this).find('.left-image').attr('src', currentFlag);
        $(this).find('.menu-item').text(currentLangText);
    });
}

// This new function updates the SEO meta tags.
function updateSEOTags() {
    // Get the translated title and description from our JSON files.
    const pageTitle = i18next.t('meta.title');
    const metaDescription = i18next.t('meta.description');

    if (pageTitle) {
        document.title = pageTitle;
    }

    // Find the <meta name="description"> tag and update its content.
    const descriptionElement = document.querySelector('meta[name="description"]');
    if (descriptionElement && metaDescription) {
        descriptionElement.setAttribute('content', metaDescription);
    }

    // --- Hreflang and Canonical Links for Google ---
    const baseUrl = window.location.origin + window.location.pathname;

    // Find or create the canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
    }
    let currentLangUrl;
    if (i18next.language === 'en') {
        currentLangUrl = `${baseUrl}?lang=en`;
    } else {
        currentLangUrl = baseUrl;
    }
    canonicalLink.setAttribute('href', currentLangUrl);

    // Find or create hreflang links
    let hreflangEn = document.querySelector('link[hreflang="en"]');
    if (!hreflangEn) {
        hreflangEn = document.createElement('link');
        hreflangEn.setAttribute('rel', 'alternate');
        hreflangEn.setAttribute('hreflang', 'en');
        document.head.appendChild(hreflangEn);
    }
    hreflangEn.setAttribute('href', `${baseUrl}?lang=en`);

    let hreflangFr = document.querySelector('link[hreflang="fr"]');
    if (!hreflangFr) {
        hreflangFr = document.createElement('link');
        hreflangFr.setAttribute('rel', 'alternate');
        hreflangFr.setAttribute('hreflang', 'fr');
        document.head.appendChild(hreflangFr);
    }
    hreflangFr.setAttribute('href', baseUrl);


}

// This function is called when we click the language switcher button.
async function changeLang(lang) {
    // Validate the language
    if (!['fr', 'en'].includes(lang)) {
        console.warn('Invalid language:', lang);
        return;
    }

    console.log('Changing language to:', lang);

    // It tells i18next to change the active language and ensure namespaces are loaded
    await i18next.changeLanguage(lang);
    try {
        const pageNamespace = document.body.getAttribute('data-page-namespace') || 'home';
        await i18next.loadNamespaces(['common', pageNamespace]);
    } catch (e) {
        console.warn('loadNamespaces error:', e);
    }

    // It saves the user's choice in the browser's memory (local storage)
    localStorage.setItem('userLanguage', lang);
    persistentLanguage = lang; // Also save to persistent state
    console.log('Language saved to localStorage:', lang);
    console.log('Language saved to persistent state:', lang);
    console.log('Verification - localStorage now contains:', localStorage.getItem('userLanguage'));

    // It runs the translation process again for the whole page.
    $('body').localize();
    translateSelectOptions();
    reinitSelects();

    // It updates the button text again.
    updateLanguageSwitcherText();
    highlightActiveLanguage();

    // It updates the SEO tags as well.
    updateSEOTags();
    syncUrlWithLanguage();

    // Update HTML lang attribute
    updateHTMLLangAttribute();
}

// Function to update the HTML lang attribute
function updateHTMLLangAttribute() {
    const currentLang = i18next.language;
    const htmlElement = document.documentElement;
    if (htmlElement) {
        htmlElement.setAttribute('lang', currentLang);
        console.log('HTML lang attribute updated to:', currentLang);
    }
}

// Keep the visible URL in sync with selected language (optional but helps UX)
function syncUrlWithLanguage() {
    try {
        const baseUrl = window.location.origin + window.location.pathname;
        const lang = i18next.language;
        const newUrl = lang === 'en' ? `${baseUrl}?lang=en` : baseUrl;
        if (window.location.href !== newUrl) {
            history.replaceState(null, '', newUrl);
        }
    } catch (e) {
        console.warn('syncUrlWithLanguage error:', e);
    }
}

// Localize <select> option elements with data-i18n keys
function translateSelectOptions() {
    try {
        document.querySelectorAll('select option[data-i18n]').forEach((opt) => {
            const key = opt.getAttribute('data-i18n');
            if (!key) return;
            const translated = i18next.t(key);
            if (translated && typeof translated === 'string') {
                opt.textContent = translated;
            }
        });
    } catch (e) {
        console.warn('translateSelectOptions error:', e);
    }
}

// Highlight active language in the dropdown with a green check
function highlightActiveLanguage() {
    const lang = i18next.language;
    document.querySelectorAll('.switcher-language .sub-menu a').forEach((a) => {
        if (a.getAttribute('data-language') === lang) {
            a.classList.add('active-language');
        } else {
            a.classList.remove('active-language');
        }
    });

    if (!document.getElementById('i18n-active-lang-style')) {
        const style = document.createElement('style');
        style.id = 'i18n-active-lang-style';
        style.textContent = `.switcher-language .sub-menu a.active-language{color:#16a34a;font-weight:600}.switcher-language .sub-menu a.active-language .menu-item::after{content:" \\2713";margin-left:6px}`;
        document.head.appendChild(style);
    }
}

// --- This part sets up the dropdown click events ---
document.addEventListener('DOMContentLoaded', () => {
    $(document).on('click', '.switcher-language .sub-menu a', function (e) {
        e.preventDefault(); // This stops the link from trying to navigate to a new page.
        const newLang = $(this).data('language');
        if (newLang) {
            changeLang(newLang); // Calls the function to change the language.

            // Close the dropdown after language selection
            const dropdownParent = $(this).closest('.has-child-menu');
            if (dropdownParent.length) {
                const subMenu = dropdownParent.find('.sub-menu');
                subMenu.hide();

                setTimeout(() => {
                    subMenu.show();
                }, 100);

                $('.popup-mobile-menu').removeClass('menu-open');
            }
        }
    });

    i18n_init();
});

// Rebuild custom select widgets (bootstrap-select) so they reflect updated option texts
function reinitSelects() {
    try {
        if (window.jQuery && $.fn.selectpicker) {
            $('select').each(function () {
                const $sel = $(this);
                if ($sel.data('selectpicker')) {
                    $sel.selectpicker('destroy');
                }
                $sel.selectpicker();
            });
        }
    } catch (e) {
        console.warn('reinitSelects error:', e);
    }
}