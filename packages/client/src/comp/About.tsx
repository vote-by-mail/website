import React from 'react'
import styled from 'styled-components'

import img1 from './img/about_pic1.jpg'
import img2 from './img/about_pic2.jpeg'
import { cssQuery } from './util/cssQuery'
import { MarketingWrapper } from './util/MarketingWrapper'
import { Container } from 'muicss/react'
import { VbmNoun, VbmAdjective } from './util/VbmWord'
import { StyledModal } from './util/StyledModal'
import { RoundedButton } from './util/Button'
import { processEnvOrThrow } from '../common'
import { toast } from 'react-toastify'

const Wrapper = styled(MarketingWrapper)`
  background-color: #fafafa;
  box-shadow: 0 12px 14px -10px rgba(0, 0, 0, 0.25) inset;

  .mui-container {
    ${cssQuery.onlyMedium} {
      align-items: center;
    }
    ${cssQuery.large} {
      flex-direction: row-reverse;
      align-items: flex-start;
      justify-content: space-between;
    }
  }
`

const Headline = styled.div`
  width: 100%;
  text-align: left;
  h1 { padding-top: 0; }

  /* 60 characters per line */
  ${cssQuery.onlyMedium} { width: 75%; }

  ${cssQuery.large} {
    width: 60%;
    p {
      margin-right: 75px;
    }
  }
`

const Images = styled.div`
  --imageHeight: 250px;

  width: 100%;
  height: calc(var(--imageHeight) * 2);
  margin-bottom: 50px;
  ${cssQuery.medium} {
    height: calc(var(--imageHeight) * 2.2);
    margin-bottom: 100px;
  }
  ${cssQuery.large} {
    position: relative;
    width: 40%;
    height: calc(var(--imageHeight) * 1.8);
    margin-bottom: 0;
  }

  img {
    max-width: 90%;
    height: var(--imageHeight);
    ${cssQuery.medium} { height: calc(var(--imageHeight) * 1.4); }
    ${cssQuery.large} { height: var(--imageHeight); }

    object-fit: cover;
    position: absolute;

    box-shadow: 0 0 10px rgba(0, 0, 0, 0.25);

    &.first {
      margin-top: 0;
      left: 0;
      z-index: 2;
      ${cssQuery.large} {
        margin-top: calc(var(--imageHeight) * -0.15);
      }
    }
    &.second {
      margin-top: calc(var(--imageHeight) * 0.95);
      right: 0;
      ${cssQuery.large} {
        margin-top: calc(var(--imageHeight) * 0.7);
      }
    }
  }
`

// Mimics the behavior of an anchor element (<a/>)
const AnchorP = styled.p`
  color: var(--primary);
  :hover {
    text-decoration: underline;
    cursor: pointer;
  }
`

const Code = styled.textarea`
  padding: 10px;
  margin: 25px 0;
  background-color: #fafafa;
  border-radius: 4px;
  box-sizing: border-box;
  display: block;
  width: 100%;
  color: var(--danger);
  resize: none;
`

export const About: React.FC = () => {
  const [ isOpen, setOpen ] = React.useState(false)
  const codeRef = React.useRef<HTMLTextAreaElement>(null)
  const copyIframe = () => {
    codeRef?.current?.select()
    document.execCommand('copy')
    toast('Copied code to the clipboard', { type: 'info' })
  }

  return <>
    <Wrapper columnChildContent={true}>
      <Container>
        <Images>
          <img src={img2} className="first" alt="Voters"/>
          <img src={img1} className="second" alt="Election Stickers"/>
        </Images>
        <Headline>
          <h1>
            About us
          </h1>
          <p>
            COVID-19 has catalyzed interest in <VbmNoun/>. VoteByMail.io streamlines government <VbmAdjective/> applications by digitizing the voter&apos;s signup process.
          </p>
          <p>
            <a href="https://votebymail.io" target="_blank" rel="noopener noreferrer">VoteByMail</a> is a Civex Inc project. We are a non-partisan Organization that empowers voters, letting them decide when, how and where they vote.
          </p>
          {/* Not using an <a/> since this is not really a link */}
          <AnchorP onClick={() => setOpen(true)}>
            Learn how to embed this website.
          </AnchorP>
          <a href="https://give.cornerstone.cc/votebymail" target="_blank" rel="noopener noreferrer">
            <RoundedButton
              color='primary'
              variant='raised'
            >Donate</RoundedButton>
          </a>
        </Headline>
      </Container>
    </Wrapper>
    <StyledModal isOpen={isOpen} onBackgroundClick={() => setOpen(false)}>
      <h3>Add VoteByMail.io to your website</h3>
      <p>
        Copy the below code and insert it into your HTML to embed VoteByMail.io to your website.
      </p>
      <p>
        For more options, see <a href='https://docs.google.com/document/d/1341vB4gQin_dPyweDQc_rUSAzch85Q8ouQbAjokxBCo/edit' target="_blank" rel="noopener noreferrer">our organizer docs</a>
      </p>
      <Code
        ref={codeRef}
        value={`<iframe id="vbm-iframe" src="${processEnvOrThrow('REACT_APP_URL')}" width="100%" height="100%" marginheight="0" frameborder="0" scrolling="yes" style="overflow: auto; min-height: 640px; min-width: 340px;"></iframe><script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/iframe-resizer/3.5.3/iframeResizer.min.js"></script><script>iFrameResize({checkOrigin: false,scrolling: true,minHeight: 640,minWidth: 340,id: 'vbm-iframe'})</script>`}
      />
      <RoundedButton color='primary' onClick={copyIframe}>
        Copy
      </RoundedButton>
      <RoundedButton onClick={() => setOpen(false)}>
        Close
      </RoundedButton>
    </StyledModal>
  </>
}
