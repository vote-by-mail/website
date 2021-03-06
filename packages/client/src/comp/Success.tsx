import React from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'

import { SocialShare } from './SocialShare'
import { RoundedButton } from './util/Button'
import { useAppHistory } from '../lib/path'
import { StyledPanel } from './util/Panel'
import { Center } from './util/Util'
import { SocialFollow } from './SocialFollow'
import { cssQuery } from './util/cssQuery'
import { Container } from 'muicss/react'
import { VbmAdjective } from './util/VbmWord'

const BlueH2 = styled.h2`
  color: var(--primary);
  margin-top: 0;
`

const CenterSocial = styled(Container)`
  display: flex;
  flex-flow: row wrap;
  h5 {
    /* So it is not wrapped along the flex flow */
    width: 100%;
    text-align: center;
  }
  padding: 0;
  ${cssQuery.medium} { padding: 0 20%; }
  ${cssQuery.short} { padding: 0 10%; }
  ${cssQuery.large} { padding: 0 20%; }
`

export const Success: React.FC = () => {
  const { pushStartSection } = useAppHistory()
  const { id } = useParams()

  return <div>
    <h1>Success!</h1>
    <p>You have successfully sent your <VbmAdjective/> signup to your local election official.  We emailed you a copy as well.</p>
    {id && <p>Your Confirmation ID is <b>{id}</b>.</p>}
    <CenterSocial>
      <h5>Share</h5>
      <SocialShare/>
      <h5>Follow</h5>
      <SocialFollow/>
    </CenterSocial>
    <StyledPanel>
      <BlueH2>One Last Step ...</BlueH2>
      <p>Check your inbox for the signup email and <b>Reply All</b> with &ldquo;<i>I confirm this request.</i>&rdquo;  (This is not strictly necessary but election officials appreciate the confirmation.)</p>
    </StyledPanel>
    <Center>
      <RoundedButton
        color='primary'
        variant='raised'
        onClick={() => pushStartSection('start')}
      >
        Start Over
      </RoundedButton>
    </Center>
  </div>
}
