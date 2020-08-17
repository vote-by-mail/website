import React from 'react'
import styled from 'styled-components'
import { HashRouter } from 'react-router-dom'
import { Slide, ToastContainer } from "react-toastify"
import { ModalProvider } from 'styled-react-modal'
import { AddressContainer, ContactContainer, VoterContainer, FetchingDataContainer, InitialDataContainer } from '../lib/unstated'
import { AddressInputPartContainer } from './Address'
import { LoadingOverlay } from './util/LoadingOverlay'

import 'react-toastify/dist/ReactToastify.css'

const CustomToastContainer = styled(ToastContainer)`
  @media screen and (min-width: 592px) {
    & .Toastify__toast {
      border-radius: 4px;
      text-align: center;
      white-space: pre-wrap;
    }
  }
`

// export for testing purposes
export const UnstatedContainer: React.FC<{}> = ({ children }) => (<HashRouter>
  <AddressContainer.Provider>
    <ContactContainer.Provider>
      <InitialDataContainer.Provider>
        <VoterContainer.Provider>
          <ModalProvider>
            <AddressInputPartContainer.Provider>
              <FetchingDataContainer.Provider>
                {children}
                <LoadingOverlay/>
                <CustomToastContainer
                  position="top-right"
                  autoClose={3000}
                  hideProgressBar={true}
                  newestOnTop={true}
                  closeOnClick={true}
                  rtl={false}
                  limit={2}
                  pauseOnFocusLoss={true}
                  pauseOnHover={true}
                  transition={Slide}
                />
              </FetchingDataContainer.Provider>
            </AddressInputPartContainer.Provider>
          </ModalProvider>
        </VoterContainer.Provider>
      </InitialDataContainer.Provider>
    </ContactContainer.Provider>
  </AddressContainer.Provider>
</HashRouter>)
