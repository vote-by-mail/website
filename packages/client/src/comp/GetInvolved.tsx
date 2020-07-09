import React from 'react'
import styled from 'styled-components'

import bgImage from './img/get_involved_bg.jpeg'
import iconBadge from './img/gi_icon_badge.svg'
import iconGear from './img/gi_icon_gear.svg'
import { useAppHistory } from '../lib/path'
import { cssQuery } from './util/cssQuery'
import { FullscreenWrapper } from './util/FullscreenWrapper'
import { Container } from 'muicss/react'
import { UnderlineLink } from './util/UnderlineLink'

const bgGradient = 'linear-gradient(to left, rgba(0, 89, 186, 0.9), rgba(0, 89, 186, 0.9))'

const Wrapper = styled(FullscreenWrapper)`
  background: ${bgGradient}, url(${bgImage});
  background-size: cover;
  .mui-container {
    justify-content: center;
  }
`

const CardWrapper = styled.div`
  width: 100%;
  ${cssQuery.desktop.wide} { width: 80%; }
  padding: 0;
  margin: 0;
  display: flex;
  flex-flow: row wrap;
  align-items: stretch;
  justify-content: center;
  ${cssQuery.desktop.all} {
    justify-content: space-between;
  }
`

const Card = styled.div`
  background-color: white;
  width: 90%;
  ${cssQuery.mobile.wide} { width: 65%; }
  ${cssQuery.desktop.all} { width: 49%; }
  margin: 1em 0;
  padding: 2em;
  box-sizing: border-box;

  img {
    height: 25%;
  }

  p {
    margin: 2em 0;
    a {
      text-decoration: underline;
      color: #323232;
    }
  }

  b { color: #db002f; }
  em { font-family: 'Merriweather', serif; }

  /* Send "Contact US" to the bottom */
  position: relative;
  & > a {
    position: absolute;
    bottom: 1.5em;
  }
`

export const GetInvolved: React.FC = () => {
  const { pushStartSection } = useAppHistory()

  return <Wrapper>
    <Container>
      <CardWrapper>
        <Card>
          <div className="imgWrapper">
            <img src={iconBadge} alt="Election Official"/>
          </div>
          <h5>I am an <em>election <b>official</b></em></h5>
          <p>
            We collaborate closely with election officials to help streamline their workflows.
            {' '}
            <a href='https://docs.google.com/document/d/11twfdGrndTYE2l3xhNoUHHx4QZk0Q5iO5eLYrBdD3UA/edit?usp=sharing' rel='noopener noreferrer' target='_blank'>
              More Info...
            </a>
          </p>
          <UnderlineLink to='#contact' onClick={() => pushStartSection('contact')}>
            Contact us
          </UnderlineLink>
        </Card>
        <Card>
          <div className="imgWrapper">
            <img src={iconGear} alt="Election Organizer"/>
          </div>
          <h5>I am a <em>civic <b>organizer</b></em></h5>
          <p>
            We provide 100% free tools for organizers to mobilize voters and track signups through our platform.
            {'  '}
            <a href='https://docs.google.com/document/d/1341vB4gQin_dPyweDQc_rUSAzch85Q8ouQbAjokxBCo/edit?usp=sharing' rel='noopener noreferrer' target='_blank'>
              More Info...
            </a>
          </p>
          <UnderlineLink to='#contact' onClick={() => pushStartSection('contact')}>
            Contact us
          </UnderlineLink>
        </Card>
      </CardWrapper>
    </Container>
  </Wrapper>
}
