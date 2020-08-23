/** Returns true if this instance of VoteByMail is inside an iframe */
export const isEmbedded = () => window.location !== window.parent.location
