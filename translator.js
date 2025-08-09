// translator.js

// This is the main function that starts everything.
// 'async' means it can perform tasks like loading files without freezing the page.
async function i18n_init() {
    try {
        // --- Step 1: We define namespaces for each page ---
        // 'common' is for shared elements like the navbar and footer.
        // Each page can have its own namespace. We'll get the current page's namespace
        // from a data attribute on the body tag.
        const pageNamespace = document.body.getAttribute('data-page-namespace') || 'home';

        // --- Step 2: Configure i18next with namespaces ---
        await i18next
            .use(i18nextHttpBackend) // Use the backend to load files
            .init({
                lng: localStorage.getItem('userLanguage') || 'fr',
                fallbackLng: 'fr',
                debug: true,
                // Define the namespaces to load. We always load 'common'.
                ns: ['common', pageNamespace],
                // Set the default namespace. If a key doesn't specify a namespace,
                // it will look in the page's namespace first, then fall back to common.
                defaultNS: [pageNamespace, 'common'],
                // Supported languages
                supportedLngs: ['fr', 'en'],
                backend: {
                    // Path to our translation files.
                    // {{lng}} will be 'en' or 'fr'.
                    // {{ns}} will be 'common', 'home', etc.
                    loadPath: 'locales/{{lng}}/{{ns}}.json',
                }
            });

        // --- Step 3: Translate the page ---
        // This connects i18next to jQuery, a library that makes it easy to manipulate HTML.
        jqueryI18next.init(i18next, $);

        // This is the magic command. It finds every element with a 'data-i18n' attribute
        // and replaces its content with the correct translation.
        $('body').localize();

        // This makes sure the button shows the correct text ("English" or "Français") when the page loads.
        updateLanguageSwitcherText();

        // --- Step 4: Update SEO tags ---
        updateSEOTags();

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
            currentLangText = 'English';
            currentFlag = 'assets/images/icons/en-us.png';
    }

    // Update all language switcher dropdowns
    $('.switcher-language .has-child-menu > a').each(function () {
        $(this).find('.left-image').attr('src', currentFlag);
        $(this).find('.menu-item').text(currentLangText);
    });
}

// This new function updates the crucial SEO meta tags.
function updateSEOTags() {
    // Get the translated title and description from our JSON files.
    const pageTitle = i18next.t('meta.title');
    const metaDescription = i18next.t('meta.description');

    // Update the <title> tag of the page.
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
        currentLangUrl = baseUrl; // French is default
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

// This function is called when you click the language switcher button.
async function changeLang(lang) {
    // It tells i18next to change the active language.
    await i18next.changeLanguage(lang);
    // It saves the user's choice in the browser's memory, so it's remembered on the next visit.
    localStorage.setItem('userLanguage', lang);

    // It runs the translation process again for the whole page.
    $('body').localize();

    // It updates the button text again.
    updateLanguageSwitcherText();

    // It updates the SEO tags as well.
    updateSEOTags();
}

// --- This part sets up the dropdown click events ---
// It waits for the HTML document to be fully loaded before running any code.
document.addEventListener('DOMContentLoaded', () => {
    // Handle clicks on language dropdown items
    $(document).on('click', '.switcher-language .sub-menu a', function (e) {
        e.preventDefault(); // This stops the link from trying to navigate to a new page.
        const newLang = $(this).data('language'); // Get the language from data attribute
        if (newLang) {
            changeLang(newLang); // Calls the function to change the language.

            // Close the dropdown after language selection
            const dropdownParent = $(this).closest('.has-child-menu');
            if (dropdownParent.length) {
                // Temporarily hide the sub-menu and show it again after a short delay
                const subMenu = dropdownParent.find('.sub-menu');
                subMenu.hide();

                // Show the sub-menu again after 100ms so it can be used again
                setTimeout(() => {
                    subMenu.show();
                }, 100);

                // Also close any mobile menu if open
                $('.popup-mobile-menu').removeClass('menu-open');
            }
        }
    });

    // This starts the entire process when the page is ready.
    i18n_init();
});