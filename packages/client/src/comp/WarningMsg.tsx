import React from 'react'

import { RedOutline } from './util/RedOutline'
import { sampleAddresses } from '../common/sampleAddresses'
import { ImplementedState, isImplementedState } from '../common'
import { useAppHistory, Path } from '../lib/path'
import { InitialDataContainer } from '../lib/unstated'
import { StateSelector, StateContainer } from './StateSelector'
import styled, { keyframes } from 'styled-components'
import { Button } from 'muicss/react'
import { StyledModal } from './util/StyledModal'
import { toast } from 'react-toastify'
import { createContainer } from 'unstated-next'
import { AddressInputPartContainer } from './Address'

const defaultState = (path: Path | null): ImplementedState => {
  switch(path?.type) {
    // if we have a state, use it
    case 'address':
    case 'state': {
      return isImplementedState(path.state) ? path.state : 'Florida'
    }
    // otherwise, use Florida
    default: {
      return 'Florida'
    }
  }
}

const FloatingButton = styled(Button)<{open: boolean}>`
  position: fixed;
  margin: 0;
  bottom: 0;
  right: 0;
  border-radius: 0;
  border-top-left-radius: 4px;
  /* One above the modal */
  z-index: 31;
  transition: width ease .2s;
  width: ${p => p.open ? 150 : 200}px;
`

const useVisibility = () => {
  // Since localStorage doesn't trigger re-renders, users visiting the
  // app for the first time might get the toast more than once if the virtual
  // DOM didn't catch the change.
  //
  // To avoid this we wrap a state on the storage item to ensure this issue
  // doesn't happen.
  const [ visited, setVisited ] = React.useState(localStorage.getItem('visited') !== null)
  const [ open, setOpen ] = React.useState(!visited)
  const toggleOpen = () => {
    if (!visited) {
      localStorage.setItem('visited', 'true')
      setVisited(true)
      if (open) {
        toast.info(
          'You can toggle this popup again by clicking on "Not Production" at the bottom right corner of the page.',
        )
      }
    }
    setOpen(!open)
  }

  return {
    open,
    toggleOpen,
  }
}

const VisibilityContainer = createContainer(useVisibility)

interface RawWarningProps {
  toggleOpen: () => void
}

const RawWarningMsg: React.FC<RawWarningProps> = ({ toggleOpen }) => {
  const { path } = useAppHistory()
  const { state } = StateContainer.useContainer()
  const { setField } = AddressInputPartContainer.useContainer()

  const addresses = sampleAddresses[state]

  const fillData = (address: string) => {
    return async () => {
      switch (path?.type) {
        case 'start': {
          const match = address.match(/(\d{5})$/)
          if (match) {
            // Strangely, document.getElementById will only work if we
            // use await setField (although it is not a async function)
            // If we don't do this, the click event triggers before setField
            // finishes.
            await setField('postcode', match[1])
            document.getElementById('start-submit')?.click()
          }

          break
        }
        case 'address': {
          const input = document.getElementById('addr-input') as HTMLInputElement
          input.value = address
          document.getElementById('addr-submit')?.click()
          break
        }
      }
      toggleOpen()
    }
  }

  return (<ul style={{marginTop: '1em'}}>
    {addresses
      .map((addrData, key) => <li key={key}>
        {addrData.address} ({addrData.city}, {addrData.county ?? '[No County]'}, {addrData.state})
        <button
          style={{marginLeft: '1em'}}
          onClick={fillData(addrData.address)}
        >
          Fill
        </button>
      </li>
    )}
  </ul>)
}

const openingAnimation = keyframes`
  from {
    transform: translate(100%, 100%);
    opacity: 0;
  }
  to {
    transform: translate(0, 0);
    opacity: 1;
  }
`

const dismissAnimation = keyframes`
  from {
    transform: translate(0, 0);
    opacity: 1;
  }
  to {
    transform: translate(100%, 100%);
    opacity: 0;
  }
`

const ContainerlessWarningMsg = () => {
  const { initialData } = InitialDataContainer.useContainer()
  const { path } = useAppHistory()
  const { open, toggleOpen } = VisibilityContainer.useContainer()

  if (initialData.emailFaxOfficials) return null

  return <>
    <FloatingButton
      color="danger"
      onClick={toggleOpen}
      open={open}
      data-testid='notProductionButton'
    >
      {
        open
        ? <><i className="fa fa-close" aria-hidden="true"/> Close</>
        : <><i className="fa fa-chevron-up" aria-hidden="true"/> Not Production</>
      }
    </FloatingButton>
    <StyledModal
      isOpen={open}
      onBackgroundClick={toggleOpen}
      onEscapeKeydown={toggleOpen}
      openingAnimation={openingAnimation}
      dismissAnimation={dismissAnimation}
      data-testid='notProductionModal'
    >
      <RedOutline>
        <h2>Warning: Not Production!</h2>
        <p>This is <b>not</b> a production build.
          In production, the application email is sent to both the local elections official and yourself.
          Since this is not production, the email is only sent to you.
          No email is sent to a local elections official so you can safely play with this demo.
        </p>
        <p>If you really want to submit a Vote by Mail signup do so on production: <a href='https://votebymail.io'>https://votebymail.io</a>.</p>
        <h2>Filling out the form:</h2>
        <p><b>Address:</b> You can fill this out with any address.  But to see it in action, you will want to use an address in a state we support.  Sample addresses are listed below.</p>
        <p><b>Email:</b> When prompted, please use your own email (so as to not spam others!)</p>
        <StateSelector initialState={defaultState(path)}>
          <RawWarningMsg toggleOpen={toggleOpen}/>
        </StateSelector>
      </RedOutline>
    </StyledModal>
  </>
}

export const WarningMsg = () => <VisibilityContainer.Provider>
  <ContainerlessWarningMsg/>
</VisibilityContainer.Provider>
