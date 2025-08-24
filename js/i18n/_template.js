
/* 

    This is a template language file if you want to translate One Trillion Free Draws
    to your language.
    
    TO ADD A LANGUAGE:
    - Copy this file,
    - Change the `code` in `i18nStrings.code` to a different one to avoid conflicts.
      This should be the ISO language code of your language.
    - Add the file to index.html for the game to register the language file: 
      <script src="js/i18n/name_of_this_file.js"></script>

    SOME THINGS TO NOTE:
    - You can call the `checkMissingStrings(code)` function in the game's developer 
      console to check for missing strings.
    - Some objects are special, such as `verbs`. Check the comments in _default.js to
      learn more about them.
    - You can use your IDE or text editor's JSDoc support to learn more about some
      special objects and to quickly find missing strings as you type.

*/

/** @type {typeof i18nDefault} */
/* Change this to your language code
            VVVV */
i18nStrings.code = {
    name: "Hodor",
    notation: "hodor",
    primaryVerb: "hodor",

    verbs: {
    },

    common: {
    },

    format: {
    },

    tabs: {
    },

    popups: {
    },

    notifs: {
    },

    currencies: {
    },

    cards: {
    },

    filters: {
    },

    stats: {
    },

    badges: {
    },

    slideshows: {
    },
}