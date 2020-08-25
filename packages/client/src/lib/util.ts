/** Returns true if this instance of VoteByMail is inside an iframe */
export const isIframeEmbedded = () => window.location !== window.parent.location
