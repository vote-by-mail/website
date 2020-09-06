// To avoid serving big files, we minify this script using Google Closure
// Compiler: https://closure-compiler.appspot.com/home and save it as embed.min.js
// in this folder (the embedded iframe will always try to load the minimized file).

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

  showModal: false,
  /**
   * @param {string} url the initial destination of the modal
   */
  toggleModal(url) {
    this.showModal = !this.showModal;

    if (this.showModal) {
      // Creates a div (modalWrapper) that fills the entire screen and a
      // child for displaying the modal
      const modalWrapper = document.createElement('div');
      modalWrapper.id = 'vote-by-mail__modal';
      modalWrapper.className = 'vote-by-mail__modal';
      const modalContent = document.createElement('div');
      modalContent.innerHTML = this.makeModalContent(url);

      modalWrapper.appendChild(modalContent);
      document.body.prepend(modalWrapper);
    } else {
      document.getElementById('vote-by-mail__modal').remove();
    }
  },

  // Generates the raw HTML to be rendered by the modal, this is basically
  // the content generated for an iframe at embed.pug
  makeModalContent(targetUrl) {
    const appUrl = new URL(targetUrl).origin;
    return `<link rel="stylesheet" href="${appUrl}/embed.min.css"><div class="vote-by-mail__wrapper"><iframe id="vbm-iframe" src="${targetUrl}" style="flex: 1 1 0%; overflow: auto; min-height: 600px; min-width: 320px;" marginheight="0" frameborder="0" scrolling="yes"></iframe><div class="vote-by-mail__bottom-bar"><div class="vote-by-mail__branding"><img src="${appUrl}/favicon-32x32.png"></div><div class="vote-by-mail__actions"><button class="vote-by-mail__bottom-button" onclick="vbmUtils.toggleTranslationDropdown()"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="8" height="8" viewBox="0 0 448 448" style="margin-right: 2px;"><path class="vote-by-mail__chevron"></path></svg><svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="14" height="16" viewBox="0 0 384 448"><path class="vote-by-mail__globe"></path></svg></button><button class="vote-by-mail__bottom-button modal-close" style="display: none;" onclick="vbmUtils.toggleModal()">✖</button></div></div><div class="vote-by-mail__translation-dropdown dismissed" id="vbm-translation-dropdown"><button onclick="vbmUtils.translate('es', '${targetUrl}')">Español</button><button onclick="vbmUtils.translate('zh-CN', '${targetUrl}')">简体中文</button><button onclick="vbmUtils.translate('tl', '${targetUrl}')">Filipino</button><button onclick="vbmUtils.translate('vi', '${targetUrl}')">Tiếng Việt</button><button onclick="vbmUtils.translate('ar', '${targetUrl}')">العربية</button><button onclick="vbmUtils.translate('fr', '${targetUrl}')">Français</button><button onclick="vbmUtils.translate('ko', '${targetUrl}')">한국어</button><button onclick="vbmUtils.translate('ru', '${targetUrl}')">русский</button></div><script type="text/javascript" src="${appUrl}/embed.min.js"></script><script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/iframe-resizer/3.5.3/iframeResizer.min.js"></script><script>iFrameResize({checkOrigin: false,scrolling: true,minHeight: 600,minWidth: 320,id:'vbm-iframe'});</script><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&amp;display=swap"></div>`;
  }
}
