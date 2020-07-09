import React from 'react'
import styled from 'styled-components'

import logo from './img/logo.png'
import { cssQuery } from './util/cssQuery'
import { InputButton } from './util/InputButton'
import { Container, Button } from 'muicss/react'
import { Link } from 'react-router-dom'

const FooterWrapper  = styled.div`
  width: 100%;
  box-shadow: 0 12px 14px -10px rgba(0, 0, 0, 0.15) inset;

  box-sizing: border-box;
  padding: 2em 0;
  display: flex;
  justify-content: center;

  .mui-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    ${cssQuery.mobile.all} {
      flex-direction: column;
    }
    ${cssQuery.mobile.landscape.all} {
      padding: 0;
      width: 100%;
    }
  }
`

const Newsletter = styled.div`
  width: 30%;
  ${cssQuery.mobile.all} {
    width: 60%;
    display: flex;
    flex-direction: column;
    text-align: center;
    align-items: center;
  }

  img {
    width: 50%;
  }
`

const ParagraphStyling = styled.div`
  p {
    font-size: 0.65em;
    line-height: 1.2;
    margin-top: 0;
    ${cssQuery.desktop.all} {
      width: 65%;
    }
  }

  h5 {
    text-transform: uppercase;
    /*
      An uppercased h5 on the footer might call too much attention, so we
      decrease its size
    */
    font-size: 18px;
    ${cssQuery.desktop.all} { margin-top: 0; }
  }
`

const SocialSection = styled(ParagraphStyling)`
  display: flex;
  flex-direction: column;

  width: 25%;
  ${cssQuery.mobile.all} { width: 70%; }
  text-align: center;
  align-items: center;

  .links {
    width: 100%;
    display: flex;
    justify-content: center;

    button {
      width: 3em;
      height: 3em;
      box-sizing: border-box;
      padding: 0;
      border-radius: 4px;
    }

    a {
      margin-right: 1em;
      &:nth-last-child(1) { margin-right: 0; }
    }
  }

  /* Styles privacy policy link */
  > a {
    color: unset;
    font-size: 0.7em;
    padding-top: 0.2em;
    border-top: 1px solid #0001;
    margin-top: 0.5em;
    text-decoration: underline;
    &:hover {
      color: #2196f3;
    }
  }
`

const Form: React.FC = () => {
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // TODO subscribe users to our newsletter
    console.log(e)
  }

  return <>
    <h5>Keep Up-to-date</h5>
    <p>
      Discover news and ways you can get involved by signing up to our newsletter below,
    </p>
    <InputButton
      type="email"
      placeholder="Enter your email"
      onSubmit={onSubmit}
      buttonLabel="Enter"
    />
  </>
}

export const Footer = () => {
  // Since there's no page reload when clicking on links, the user might
  // think nothing really happened. A good way to indicate feedback is
  // scrolling to the top of the page.
  const scrollToTop = () => {
    window.scrollTo({top: 0, behavior: 'smooth'})
  }

  return <FooterWrapper>
    <Container>
      <Newsletter>
        <img src={logo} alt="VoteByMail"/>
        <Form/>
      </Newsletter>
      <SocialSection>
        <h5>Socials</h5>
        <p>
          Keep up-to-date with all that we do at VoteByMail. We&apos;ll be sharing out crowdsourced platform via social channels.
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
        <Link to='/privacy-policy' onClick={scrollToTop}>
          Privacy Policy
        </Link>
      </SocialSection>
    </Container>
  </FooterWrapper>
}
