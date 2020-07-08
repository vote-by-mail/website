import React from 'react'
import styled from 'styled-components'
import { EnterZip } from './util/EnterZip'
import { Row, Col, Container } from 'muicss/react'

import iconPen from './img/hiw_icon_pen.svg'
import iconBallot from './img/hiw_icon_ballot.svg'
import iconPlane from './img/hiw_icon_plane.svg'
import { cssQuery } from './util/cssQuery'
import { FullscreenWrapper } from './util/FullscreenWrapper'

const Wrapper = styled(FullscreenWrapper)`
  background-color: #fafafa;
`

const Headline = styled.div`
  text-align: center;
  p { margin: 1em 0; }
  ${cssQuery.desktop.all} {
    width: 55%;
  }
`

const Steps = styled(Row)`
  width: 100%;
  margin: 0;

  ${cssQuery.desktop.all} {
    width: 70%;
  }

  & > [class*='mui-col'] {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    p { width: 80%; }

    & > .imgWrapper {
      width: 100%;
      height: 30vh;
      ${cssQuery.desktop.all} { height: 15vh; }
      ${cssQuery.desktop.short} { height: 19vh; }
      ${cssQuery.mobile.landscape.all} { height: 30vh; }
      ${cssQuery.mobile.wide} { height: 16vh; }
      box-sizing: border-box;

      display: flex;
      align-items: center;
      justify-content: center;
    }

    img {
      width: 45%;
      ${cssQuery.mobile.narrow} { width: 50%; }
      ${cssQuery.mobile.landscape.all} { width: 25%; }
      object-fit: contain;
    }
  }
`

const CallToAction = styled.div`
  h5 {
    font-weight: normal;
    margin: 2em 0 1em;
  }

  form {
    margin: 1.5em 0;
  }
`

export const HowItWorks: React.FC = () => {
  return <Wrapper centerChildContent={true} columnChildContent={true}>
    <Container>
      <Headline>
        <h4>How does it work?</h4>
        <p>
          VoteByMail.io simplifies the state vote-by-mail signup process.
        </p>
      </Headline>


      <Steps>
        <Col md={4} sm={12}>
          <div className="imgWrapper">
            <img src={iconPen} alt="Sign Up"/>
          </div>
          <h5>1. You sign up</h5>
          <p>Sign up below for vote by mail.  The aplication is sent to your election official.</p>
        </Col>
        <Col md={4} sm={12}>
          <div className="imgWrapper">
            <img src={iconBallot} alt="We do the work"/>
          </div>
          <h5>2. Relax</h5>
          <p>Sit back.  Your ballot arrives in the mail a few weeks before election day.</p>
        </Col>
        <Col md={4} sm={12}>
          <div className="imgWrapper">
            <img src={iconPlane} alt="Vote"/>
          </div>
          <h5>3. Vote</h5>
          <p>Fill out your ballot from the comfort of your home and mail it back.</p>
        </Col>
      </Steps>
      <CallToAction>
        <h5>
          Enter your voter registration ZIP code to get started.
        </h5>
        <p><small>
          <i style={{color:'rgb(220, 14, 82)'}} className="fa fa-clock-o"/> Takes 2 minutes
        </small>
        </p>
        <p><small>
          <i style={{color:'rgb(220, 14, 82)'}} className="fa fa-hourglass-half"/> State deadlines approaching
        </small></p>
      </CallToAction>
      <EnterZip/>
    </Container>
  </Wrapper>
}
