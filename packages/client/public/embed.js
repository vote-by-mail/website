// To avoid serving big files, we minify this script using Google Closure
// Compiler: https://closure-compiler.appspot.com/home and save it as embed.min.js
// in this folder (the embedded iframe will always try to load the minimized file).

/**
 * Adds a second class to the translation dropdown, without replacing the
 * default one. The appended class is replaced if this function is called
 * again.
 */
const vbmToggleTranslationDropdown = (function (){
  let isOpen = false;
  const dropdown = document.getElementById('vbm-translation-dropdown');

  return function() {
    isOpen = !isOpen;
    dropdown.className = `vote-by-mail__translation-dropdown ${isOpen ? 'opening' : 'dismiss'}`;
  }
})()

/**
 * Allows the iframe to change its language bypassing Google Translate
 * limitations
 * @param {string} lng a valid language for translating the website
 * @param {string} url the website base URL (to avoid translating a translated page)
 * and allow this script to be refactored and used by every organization
 */
function vbmTranslate(lng, url) {
  vbmToggleTranslationDropdown();
  const iframe = document.getElementById('vbm-iframe');
  iframe.src = '';

  setTimeout(
    function() {
      iframe.src = `https://translate.google.com/translate?sl=en&tl=${lng}&u=${url}`;
    },
    100,
  );
}
