import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

const VBar = () => <span style={{margin: '0 0.5rem'}}>|</span>

const FooterWrapper  = styled.div`
  text-align: center;
  margin: 2rem 0;
  color: rgba(0,0,0,0.5);
  a {
    color: rgba(0,0,0,0.5);
  }
  font-size: 12px;
  line-height: 18px;
`

export const Footer = () => <FooterWrapper>
  <a href='https://votebymail.io/'>VoteByMail.io</a>
  <VBar/>
  <Link to='/about'>About Us</Link>
  <VBar/>
  <Link to='/privacy-policy'>Privacy Policy</Link>

  {/*
    These are temporary social links, since the home page, including the
    Footer are subject to a redesign.
   */}
  <VBar/>
  <a href='https://www.facebook.com/Votebymailio-109972600781831/' rel='noopener noreferrer' target='_blank'>
    <i className='fa fa-facebook'/>
  </a>
  <VBar/>
  <a href='https://twitter.com/votebymailio?ref_src=twsrc%5Etfw' rel='noopener noreferrer' target='_blank'>
    <i className='fa fa-twitter'/>
  </a>
  <VBar/>
  <a href='https://www.instagram.com/votebymail.io'>
    <i className='fa fa-instagram'/>
  </a>
</FooterWrapper>
