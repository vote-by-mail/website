import React from 'react'
import styled from 'styled-components'

import bgImage from './img/get_involved_bg.jpeg'
import iconBadge from './img/gi_icon_badge.svg'
import iconGear from './img/gi_icon_gear.svg'
import { useAppHistory } from '../lib/path'
import { cssQuery } from './util/cssQuery'
import { MarketingWrapper } from './util/MarketingWrapper'
import { Container } from 'muicss/react'
import { UnderlineLink } from './util/UnderlineLink'

const bgGradient = 'linear-gradient(to left, rgba(0, 89, 186, 0.9), rgba(0, 89, 186, 0.9))'

const Wrapper = styled(MarketingWrapper)`
  background: ${bgGradient}, url(${bgImage});
  ${cssQuery.large} { padding: 150px 0; }
  background-size: cover;
  .mui-container {
    width: 100%;
    justify-content: center;
  }
`

const CardWrapper = styled.div`
  width: 100%;
  padding: 0;
  margin: 0;
  display: flex;
  flex-flow: row wrap;
  align-items: stretch;
  justify-content: center;
`

const Card = styled.div`
  background-color: white;
  width: 100%;
  padding: 25px 25px 50px;
  margin-bottom: 25px;
  box-sizing: border-box;
  ${cssQuery.onlyMedium} { width: 75%; }
  ${cssQuery.large} {
    padding: 50px 50px 75px;
    /* Its width subtracted by the first card margin (25px) */
    /* Since only one card has 25px to the right, we divide this value by 2 */
    width: calc(50% - 12.5px);
    margin-bottom: 0;
    &:nth-child(1) { margin-right: 25px; }
  }

  img {
    width: 25%;
    ${cssQuery.medium} {
      width: 20%;
    }
  }

  p {
    margin: 15px 0;
    a {
      text-decoration: underline;
      color: inherit;
    }
  }

  b { color: var(--danger); }

  /* Send "Contact US" to the bottom */
  position: relative;
  & > .bottom {
    position: absolute;
    bottom: 25px;
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
          <h4>I am an <em>election <b>official</b></em></h4>
          <p>
            We collaborate closely with election officials to help streamline their workflows.
            {' '}
            <a
              href="https://docs.google.com/document/d/11twfdGrndTYE2l3xhNoUHHx4QZk0Q5iO5eLYrBdD3UA/edit?usp=sharing"
              rel="noopener noreferrer"
              target="_blank"
            >
              More Info...
            </a>
          </p>
          <UnderlineLink
            className="bottom"
            to='#contact'
            onClick={() => pushStartSection('contact')}
          >
            Contact us
          </UnderlineLink>
        </Card>
        <Card>
          <div className="imgWrapper">
            <img src={iconGear} alt="Election Organizer"/>
          </div>
          <h4>I am a <em>civic <b>organizer</b></em></h4>
          <p>
            We provide 100% free tools for organizers to mobilize voters and track signups through our platform.
            {'  '}
            <a
              href="https://docs.google.com/document/d/1341vB4gQin_dPyweDQc_rUSAzch85Q8ouQbAjokxBCo/edit?usp=sharing"
              rel="noopener noreferrer"
              target="_blank"
            >
              More Info...
            </a>
          </p>
          <UnderlineLink
            className="bottom"
            to='#contact'
            onClick={() => pushStartSection('contact')}
          >
            Contact us
          </UnderlineLink>
        </Card>
      </CardWrapper>
    </Container>
  </Wrapper>
}
