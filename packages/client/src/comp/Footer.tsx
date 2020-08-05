import React from 'react'
import styled from 'styled-components'

import logo from './img/logo.png'
import { cssQuery } from './util/cssQuery'
import { InputButton } from './util/InputButton'
import { Container, Button } from 'muicss/react'
import { MarketingWrapper } from './util/MarketingWrapper'
import { FetchingDataContainer } from '../lib/unstated'
import { toast } from 'react-toastify'
import { client } from '../lib/trpc'

const FooterWrapper  = styled(MarketingWrapper)`
  box-shadow: 0 12px 14px -10px rgba(0, 0, 0, 0.15) inset;

  box-sizing: border-box;
  padding: 50px 0;
  ${cssQuery.large} { padding: 75px 0; }
  display: flex;
  justify-content: center;

  .mui-container {
    display: flex;
    flex-direction: column;
    position: relative;
    ${cssQuery.medium} {
      flex-direction: row;
      justify-content: flex-end;
    }
  }
`

const Logo = styled.div`
  width: 35%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  ${cssQuery.medium} {
    margin-top: 5px;
    /* justify-self is not supported on flexboxes */
    position: absolute;
    left: 15px;
  }

  img {
    max-width: 190px;
    width: 100%;
    ${cssQuery.medium} { width: 40%; }
  }

  /* Styles privacy policy link */
  a {
    color: unset;
    font-size: 10px;
    padding-top: 0.2em;
    border-top: 1px solid #0001;
    margin-top: 0.5em;
    text-decoration: underline;
    &:hover {
      color: var(--primary);
    }
  }
`

const VBar = () => <span style={{margin: '0 0.5rem'}}>|</span>

const ParagraphStyling = styled.div`
  p {
    font-size: 10px;
    line-height: 14px;
    margin-top: 0;
    ${cssQuery.medium} { width: 95%; }
  }

  .title {
    text-transform: uppercase;
    margin: 0 0 6px;
  }
`

const Section = styled(ParagraphStyling)`
  display: flex;
  flex-direction: column;

  width: 220px;
  text-align: left;
  align-items: flex-start;
  margin-top: 25px;
  ${cssQuery.medium} { margin-top: 0; }
  ${cssQuery.large} { margin-top: 0; }

  --section__buttonHeight: 24px;

  .links {
    width: 100%;
    display: flex;
    justify-content: flex-start;

    button {
      width: var(--section__buttonHeight);
      height: var(--section__buttonHeight);
      box-sizing: border-box;
      padding: 0;
      border-radius: 4px;
      margin: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 10px;
    }

    a {
      margin-right: 10px;
      &:nth-last-child(1) { margin-right: 0; }
      &:hover {
        text-decoration: none;
      }
    }
  }
`

const StyledInputButton = styled(InputButton)`
  --inputButton__width: 200px;
  ${cssQuery.medium} { --inputButton__width: 140px; }
  --inputButton__height: var(--section__buttonHeight);
  input {
    padding-left: 3px;
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
    font-size: 10px;
    line-height: 14px;
  }
  button {
    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
    font-size: 10px;
  }
`

const Form: React.FC = () => {
  const { setFetchingData } = FetchingDataContainer.useContainer()
  const emailRef = React.useRef<HTMLInputElement>(null)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.persist()
    setFetchingData(true)
    if (emailRef.current) {
      try {
        await client.subscribe(emailRef?.current?.value)
        emailRef.current.value = ''
        toast(
          'You are now subscribed to our newsletter.',
          { type: 'success' },
        )
      } catch(e) {
        toast(
          'Failed to subscribe to our newsletter.  Please try again.',
          { type: 'error' },
        )
      }
    }
    setFetchingData(false)
  }

  return <>
    <p className="title">Keep up to date</p>
    <p>
      Track our progress by signing up for our newsletter
    </p>
    <StyledInputButton
      type="email"
      placeholder="Enter your email"
      onSubmit={onSubmit}
      buttonLabel="Enter"
      ref={emailRef}
    />
  </>
}

const privacyPolicyUrl = process.env.REACT_APP_SERVER + 'PrivacyPolicy.pdf'
const termsOfUseUrl = process.env.REACT_APP_SERVER + 'TermsOfUse.pdf'

export const Footer = () => {

  return <FooterWrapper centerContent={false}>
    <Container>
      <Logo>
        <img src={logo} alt="VoteByMail"/>
        <a href={termsOfUseUrl}>
          Terms of Use
        </a>
        <VBar/>
        <a href={privacyPolicyUrl}>
          Privacy Policy
        </a>
      </Logo>
      <Section>
        <Form/>
      </Section>
      <Section>
        <p className="title">Social</p>
        <p>
          Keep up with the latest developments by following us on social
        </p>
        <div className="links">
          <a href="https://twitter.com/votebymailio" target="_blank" rel="noopener noreferrer">
            <Button color='primary' style={{ backgroundColor: '#00acee' }}>
              <i className="fa fa-twitter"/>
            </Button>
          </a>
          <a href="https://www.facebook.com/Votebymailio-109972600781831/" target="_blank" rel="noopener noreferrer">
            <Button color='primary' style={{ backgroundColor: '#3b5998' }}>
              <i className="fa fa-facebook"/>
            </Button>
          </a>
          <a href="https://www.instagram.com/votebymail.io" target="_blank" rel="noopener noreferrer">
            <Button
              color='primary'
              style={{
                backgroundImage: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)',
                filter: 'brightness(1.05)',
              }}
            >
              <i className="fa fa-instagram"/>
            </Button>
          </a>
        </div>
      </Section>
    </Container>
  </FooterWrapper>
}
