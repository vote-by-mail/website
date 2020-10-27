import React from 'react'
import styled from 'styled-components'
import { EnterZip } from './util/EnterZip'
import { Row, Col, Container } from 'muicss/react'

import iconDigital from './img/hiw_icon_digital.svg'
import iconArmchair from './img/hiw_icon_armchair.svg'
import iconBallot from './img/hiw_icon_ballot.svg'
import { cssQuery } from './util/cssQuery'
import { MarketingWrapper } from './util/MarketingWrapper'
import { VbmBallot, VbmAdjective } from './util/VbmWord'

const Wrapper = styled(MarketingWrapper)`
  background-color: #fafafa;
`

const signUpDisabled = !!process.env.REACT_APP_DISABLE_SIGNUP

const Headline = styled.div`
  text-align: center;
  h4 { margin-top: 0; }
  p { margin: 1em 0; }
  ${cssQuery.medium} { width: 75%; }
  ${cssQuery.large} { width: 55%; }
`

const Steps = styled(Row)`
  width: 100%;
  margin: 0 0 50px;
  ${cssQuery.medium} { margin: 50px 0; }

  h5 {
    font-family: 'Merriweather', serif;
  }

  & > [class*='mui-col'] {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    p { width: 80%; }

    & > .imgWrapper {
      width: 100%;
      box-sizing: border-box;

      display: flex;
      align-items: center;
      justify-content: center;
    }

    img {
      width: 30%;
      margin: 10% 0;
      ${cssQuery.small} { width: 50%; }
      ${cssQuery.short} {
        width: 40%;
        ${cssQuery.medium} {
          width: 50%;
        }
      }
      object-fit: contain;
    }
  }
`

const CallToAction = styled.div<{ disabled?: boolean }>`
  display: ${p => p.disabled ? 'none' : 'flex' };
  flex-direction: column;
  align-items: center;
  ${cssQuery.onlyMedium} { width: 75%; }

  h5 {
    margin: 25px 0;
    ${cssQuery.small} {
      margin-top: 0;
    }
  }

  form {
    margin: 25px 0 50px;
  }
`

export const HowItWorks: React.FC = () => {
  return <Wrapper centerChildContent={true} columnChildContent={true}>
    <Container>
      <Headline>
        <h4>How does it work?</h4>
        <h5>
          VoteByMail.io simplifies the state <VbmAdjective/> signup process.
        </h5>
      </Headline>


      <Steps>
        <Col md={4} sm={12}>
          <div className="imgWrapper">
            <img src={iconDigital} alt="Sign Up"/>
          </div>
          <h5>1. Sign up</h5>
          <p>Sign up below for <VbmBallot/>.  The application is sent to your election official.</p>
        </Col>
        <Col md={4} sm={12}>
          <div className="imgWrapper">
            <img src={iconArmchair} alt="We do the work"/>
          </div>
          <h5>2. Relax</h5>
          <p>Sit back.  Your ballot arrives in the mail a few weeks before election day.</p>
        </Col>
        <Col md={4} sm={12}>
          <div className="imgWrapper">
            <img src={iconBallot} alt="Vote"/>
          </div>
          <h5>3. Vote</h5>
          <p>Fill out your ballot from the comfort of your home and mail it back.</p>
        </Col>
      </Steps>
      <CallToAction disabled={signUpDisabled}>
        <h5>
          Enter your voter registration ZIP code to get started.
        </h5>
        <EnterZip/>
        <p><small>
          <i style={{color:'var(--danger)'}} className="fa fa-hourglass-half"/> State deadlines approaching
        </small></p>
        <p><small>
          <i style={{color:'var(--danger)'}} className="fa fa-clock-o"/> Takes 2 minutes
        </small></p>
      </CallToAction>
    </Container>
  </Wrapper>
}
