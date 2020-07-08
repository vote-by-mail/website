import Modal from 'styled-react-modal'

export const StyledModal = Modal.styled`
  top: 50%;
  left: 50%;
  right: auto;
  bottom: auto;
  width: 50%;
  height: 100%;
  overflow: scroll;
  background-color: white;
  padding: 40px;
  @media only screen and (max-width: 544px) {
    padding: 20px;
    width: 80%;
  }
`
