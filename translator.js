// I ve added some comments to make it easier to understand.hope it'll help

// This is the main function that starts everything.
// 'async' means it can perform tasks like loading files without freezing the page.
async function i18n_init() {
    try {

        // 'common' is for shared elements . make sur to use it guys
        // Each page can have its own namespace. We'll get the current page's namespace

        const pageNamespace = document.body.getAttribute('data-page-namespace') || 'home';

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
                supportedLngs: ['fr', 'en'],
                backend: {
                    // Path to our translation files.
                    // {{lng}} will be 'en' or 'fr'.
                    // {{ns}} will be 'common', 'home'......
                    loadPath: 'locales/{{lng}}/{{ns}}.json',
                }
            });

        // This connects i18next to jQuery (a library that makes it easy to manipulate HTML)
        jqueryI18next.init(i18next, $);

        // This command finds every element with a 'data-i18n' attribute
        // and replaces its content with the correct translation.
        $('body').localize();

        // This makes sure the button shows the correct text ("English" or "Français") when the page loads.
        updateLanguageSwitcherText();

        // Update SEO tags ---
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
    // It tells i18next to change the active language.
    await i18next.changeLanguage(lang);
    // It saves the user's choice in the browser's memory (local storage)
    localStorage.setItem('userLanguage', lang);

    // It runs the translation process again for the whole page.
    $('body').localize();

    // It updates the button text again.
    updateLanguageSwitcherText();

    // It updates the SEO tags as well.
    updateSEOTags();
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