import React from 'react'
import Modal, { ModalProps } from 'styled-react-modal'
import styled, { keyframes, css, Keyframes } from 'styled-components'

const animationDurationMS = 350

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`
/**
 * Delays displaying content until the modal is in its appropriate position
 */
export const AfterModalAnimation = styled.div`
  animation: ${fadeIn} ease .2s 550ms both;
`


interface Props {
  hiding: boolean
  openingAnimation?: Keyframes
  dismissAnimation?: Keyframes
}

const openingAnimation = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`

const dismissAnimation = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(100%);
    opacity: 0;
  }
`

// We do this ugly hack here because Modal.style does not accept props,
// also styled(Modal) doesn't seem to be of any effect too.
const RawStyledModal = styled(Modal.styled``)<Props>`
  top: 50%;
  left: 50%;
  right: auto;
  bottom: auto;

  width: 50%;
  min-height: 200px;
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

  animation: ${p => p.hiding === false
    ? css`${p.openingAnimation ?? openingAnimation}`
    : css`${p.dismissAnimation ?? dismissAnimation}`
  } ease ${animationDurationMS}ms both;
`

export const StyledModal: React.FC<ModalProps & Omit<Props, 'hiding'>> = (props) => {
  const [hiding, setHiding] = React.useState(false)

  const beforeClose = () => new Promise(resolve => {
    setHiding(true)
    setTimeout(
      () => {
        setHiding(false)
        resolve(true)
      },
      animationDurationMS,
    )
  })

  return <RawStyledModal {...props} beforeClose={beforeClose} hiding={hiding}/>
}
