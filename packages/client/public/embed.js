// This file's purpose is to hold all embed related functionalities in one
// place.
//
// This file is automatically minified after gulp finishes task 'build'

const vbmUtils = {
  // Tracks if the translation dropdown is being shown or not
  showTranslationDropdown: false,
  toggleTranslationDropdown() {
    const dropdown = document.getElementById('vbm-translation-dropdown');
    this.showTranslationDropdown = !this.showTranslationDropdown;
    const isOpen = this.showTranslationDropdown;
    dropdown.className = `vote-by-mail__translation-dropdown ${isOpen ? 'opening' : 'dismiss'}`;
  },
  /**
   * Allows the iframe to change its language bypassing Google Translate
   * limitations
   *
   * @param {string} lng a valid language abbreviation
   */
  translate(lng, url) {
    // According to https://stackoverflow.com/questions/22936421/google-translate-iframe-workaround
    // we might make google translate work on iframe if we change their
    // .src externally. This workaround seems to work on mobile devices
    // but the same behavior cannot be replicated on a desktop computer,
    // which is why we perform a media query, if the width seems to be of
    // a smartphone we do this trick, otherwise open the translated version
    // on a new window.
    this.toggleTranslationDropdown();
    const iframe = document.getElementById('vbm-iframe');

    if (window.matchMedia('(max-width: 425px)').matches) {
      iframe.src = '';
      setTimeout(
        function() {
          iframe.src = `https://translate.google.com/translate?sl=en&tl=${lng}&u=${url}`;
        },
        100,
      );
    } else {
      window.open(`https://translate.google.com/translate?sl=en&tl=${lng}&u=${url}`);
    }
  },
}
