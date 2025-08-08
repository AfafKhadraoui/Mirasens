// This function initializes i18next and translates the page
async function i18n_init() {
    try {
        // --- Step 1: Fetch translation files (Your excellent async/await style) ---
        const en_translations = await fetch('locales/en.json').then(res => res.json());
        const fr_translations = await fetch('locales/fr.json').then(res => res.json());

        // --- Step 2: Initialize i18next (Your core logic) ---
        await i18next.init({
            lng: localStorage.getItem('userLanguage') || 'fr', // Default to French
            debug: true,
            fallbackLng: 'fr',
            supportedLngs: ['fr', 'en'],
            resources: {
                en: en_translations,
                fr: fr_translations
            },
            interpolation: {
                escapeValue: false // Not needed for jQuery
            }


        });

        // --- Step 3: Update content USING jquery-i18next (The safe way) ---
        // This connects i18next to jQuery
        jqueryI18next.init(i18next, $, { useOptionsAttr: true });

        // This is the magic part. It translates everything safely, without breaking icons.
        $('body').localize();

        // Also update the buttons on load
        updateLanguageSwitcherText();

    } catch (err) {
        console.error("Error during i18n initialization:", err);
    }
}

// This function updates the text on our switcher buttons
function updateLanguageSwitcherText() {
    const newLangText = i18next.language === 'fr' ? 'English' : 'Français';
    // Use jQuery to find all elements with the class and set their text
    $('.language-text').text(newLangText);
}


// This is the function that your buttons will call
async function changeLang(lang) {
    await i18next.changeLanguage(lang);
    localStorage.setItem('userLanguage', lang);

    // Re-translate the entire page safely
    $('body').localize();

    // Update the button text after changing the language
    updateLanguageSwitcherText();
}

// --- Event Listeners (No onclick in HTML) ---
// It's better practice to add listeners from JavaScript.
document.addEventListener('DOMContentLoaded', () => {
    // This attaches the click event to ALL elements with the .language-switcher class
    $(document).on('click', '.language-switcher', function (e) {
        e.preventDefault(); // Prevents the link from navigating
        const newLang = i18next.language === 'fr' ? 'en' : 'fr';
        changeLang(newLang);
    });

    // Start the whole process
    i18n_init();
});