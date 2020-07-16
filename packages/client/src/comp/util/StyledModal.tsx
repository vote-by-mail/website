import Modal from 'styled-react-modal'
import { keyframes } from 'styled-components'

const slideAndFade = keyframes`
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`

export const StyledModal = Modal.styled`
  top: 50%;
  left: 50%;
  right: auto;
  bottom: auto;

  width: 50%;
  min-height: 500px;
  max-height: 60vh;
  /* Hides unnecessary scrollbars */
  overflow: auto;
  background-color: white;
  border-radius: 4px;
  padding: 40px;

  @media only screen and (max-width: 544px) {
    padding: 20px;
    width: 80%;
  }

  animation: ${slideAndFade} ease .4s both;
`
