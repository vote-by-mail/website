import React from 'react'

import { RedOutline } from './util/RedOutline'
import { sampleAddresses } from '../common/sampleAddresses'
import { ImplementedState, isImplementedState } from '../common'
import { useAppHistory, Path } from '../lib/path'
import { FeatureFlagsContainer } from '../lib/unstated'
import { StateSelector, StateContainer } from './StateSelector'
import styled from 'styled-components'
import { Button } from 'muicss/react'
import { StyledModal } from './util/StyledModal'

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

const FloatingButton = styled(Button)`
  position: fixed;
  margin: 0;
  bottom: 0;
  right: 0;
  border-radius: 0;
  border-top-left-radius: 4px;
  /* One above the modal */
  z-index: 31;
`

interface RawWarningProps {
  setOpen: (_: boolean) => void
}

const RawWarningMsg: React.FC<RawWarningProps> = ({ setOpen }) => {
  const { path } = useAppHistory()
  const { state } = StateContainer.useContainer()

  const addresses = sampleAddresses[state]

  const fillData = (address: string) => {
    return () => {
      switch (path?.type) {
        case 'start': {
          const input = document.getElementById('start-zip') as HTMLInputElement
          const match = address.match(/(\d{5})$/)
          if (match) {
            input.value = match[1]
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
      setOpen(false)
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

export const WarningMsg = () => {
  const { featureFlags } = FeatureFlagsContainer.useContainer()
  const { path } = useAppHistory()
  const [ open, setOpen ] = React.useState(false)

  if (featureFlags?.emailFaxOfficials) return null

  return <>
    <FloatingButton color="danger" onClick={() => setOpen(!open)}>
      {
        open
        ? <><i className="fa fa-close" aria-hidden="true"/> Close</>
        : <><i className="fa fa-chevron-up" aria-hidden="true"/> Not Production</>
      }
    </FloatingButton>
    <StyledModal
      isOpen={open}
      onBackgroundClick={() => setOpen(false)}
      onEscapeKeydown={() => setOpen(false)}
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
          <RawWarningMsg setOpen={setOpen}/>
        </StateSelector>
      </RedOutline>
    </StyledModal>
  </>
}
