import React from 'react'
import styled from 'styled-components'
import { Container } from 'muicss/react'
import { cssQuery } from './util/cssQuery'

import img1k from './img/blurb_bg_max_width_1k.jpg'
import img2k from './img/blurb_bg_max_width_2k.jpg'
import img6k from './img/blurb_bg_max_width_6k.jpg'
import { EnterZip } from './util/EnterZip'
import { MarketingWrapper } from './util/MarketingWrapper'

const bgGradient = 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.6))'
const signUpDisabled = !!process.env.REACT_APP_DISABLE_SIGNUP

const Wrapper = styled(MarketingWrapper)`
  position: relative;
  min-height: 100vh;
  z-index: 9;
  box-shadow: 0 0 14px #0003;

  /*
    Loads the background image according to the device's screen dimensions
    We use manual queries here since these are mostly based on the dimensions
    of the pictures used as background.
  */
  @media screen and (max-width: 640px) {
    background-image: ${bgGradient}, url(${img1k});
  }
  @media screen and (min-width: 641px) {
    background-image: ${bgGradient}, url(${img1k});
  }
  @media screen and (min-width: 1281px) {
    background-image: ${bgGradient}, url(${img2k});
  }
  @media screen and (min-width: 1920px) {
    background-image: ${bgGradient}, url(${img6k});
  }

  /* Device Adjustments */
  background-size: 450%;
  background-position: 55% 70%;
  ${cssQuery.short} {
    background-size: 170%;
    background-position-y: 97%;
  }
  ${cssQuery.medium} {
    background-size: 210%;
    ${cssQuery.portrait} {
      background-size: 255%;
    }
    background-position-y: 89%;
  }
  ${cssQuery.large} {
    background-size: 140%;
    background-position: 40% 84%;
    ${cssQuery.xlarge} {
      background-size: 125%;
      background-position: 74% 95%;
    }
    ${cssQuery.portrait} {
      background-size: 235%;
      background-position: 26% 90%;
    }
  }

  /*
    On CSS margin-top is always relative to the width of the parent,
    since the image is resized according to the width of the screen
    this feature is handy in positioning our text.
  */
  h4 {
    margin-top: 60%;
    ${cssQuery.medium} {
      width: 60%;
      margin-top: 25%;
    }
    ${cssQuery.short} {
      width: 70%;
      margin-top: 20%;
    }
    ${cssQuery.large} {
      width: 55%;
      font-size: 26px;
      margin-top: 35%;
      ${cssQuery.xlarge} {
        margin-top: 25%;
      }
    }
  }

  h5 {
    font-weight: normal;
    margin: 40px 0;
  }
`

export const Blurb: React.FC = () => {
  // We don't directly return a Container here since setting the BG feels
  // hacky (if we use Fluid Containers we'd need to tweak the max-width/padding
  // manually).
  return <Wrapper columnChildContent={true} centerChildContent={true}>
    <Container>
      {
        !signUpDisabled
        ? <>
          <h4>
            Sign up online for Vote by Mail in 2 minutes
          </h4>
          <h5 data-testid='blurb-call-to-action'>
            Enter your voter registration ZIP code to get started.
          </h5>
          <EnterZip/>
        </>
        : <>
          <h4>
            We&apos;re done for this election, go out and vote!
          </h4>
          <h5>
            Support for this election has ended, thanks for using our tool.
          </h5>
        </>
      }
    </Container>
  </Wrapper>
}
