import React from 'react'
import styled from 'styled-components'

import img1 from './img/about_pic1.jpg'
import img2 from './img/about_pic2.jpeg'
import { cssQuery } from './util/cssQuery'
import { MarketingWrapper } from './util/MarketingWrapper'
import { Container } from 'muicss/react'
import { VbmNoun, VbmAdjective } from './util/VbmWord'

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

export const About: React.FC = () => {
  return <Wrapper columnChildContent={true}>
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
        <p>
          We&apos;re open for donations: <a href="https://give.cornerstone.cc/votebymail" target="_blank" rel="noopener noreferrer">click here for more information.</a>
        </p>
      </Headline>
    </Container>
  </Wrapper>
}
