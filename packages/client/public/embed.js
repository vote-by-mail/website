// This file's purpose is to hold all embed related functionalities in one
// place.
//
// This file is automatically minified after gulp finishes task 'build'

const vbmUtils = {
  modalVisible: false,
  /**
   * @param {string} url the initial destination of the modal
   */
  toggleModal(url) {
    this.modalVisible = !this.modalVisible;

    if (this.modalVisible) {
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

  // Generates the raw HTML to be rendered by the modal, this is the same as
  // the content generated for an iframe at embed.pug
  makeModalContent(targetUrl) {
    const appUrl = new URL(targetUrl).origin;
    return `<link rel="stylesheet" href="${appUrl}/embed.css"><div class="vote-by-mail__wrapper"><iframe id="vbm-iframe" src="${targetUrl}" style="flex: 1 1 0%; overflow: auto; min-height: 600px; min-width: 320px;" marginheight="0" frameborder="0" scrolling="yes"></iframe><div class="vote-by-mail__bottom-bar"><div class="vote-by-mail__branding"><img src="${appUrl}/favicon-32x32.png"></div><div class="vote-by-mail__actions"><button class="vote-by-mail__bottom-button modal-close" style="display: none;" onclick="vbmUtils.toggleModal()">✖</button></div></div><script type="text/javascript" src="${appUrl}/embed.js"></script><script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/iframe-resizer/3.5.3/iframeResizer.min.js"></script><script>iFrameResize({checkOrigin: false,scrolling: true,minHeight: 600,minWidth: 320,id:'vbm-iframe'});</script><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&amp;display=swap"></div>`;
  }
}
