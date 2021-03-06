import React from 'react'
import styled from 'styled-components'

import { useAppHistory } from '../lib/path'
import { cssQuery } from './util/cssQuery'
import { MarketingWrapper } from './util/MarketingWrapper'
import { UnderlineLink } from './util/UnderlineLink'
import { Container } from 'muicss/react'

import michaelLi from './img/avatars/michaelLi.png'
import brettClarke from './img/avatars/brettClarke.png'
import longTonThat from './img/avatars/longTonThat.jpg'
import louisReid from './img/avatars/louisReid.png'
import lucaLoncar from './img/avatars/lucaLoncar.png'
import maryPenckofer from './img/avatars/maryPenckofer.png'
import sophieHodge from './img/avatars/sophieHodge.png'
import tristanWagner from './img/avatars/tristanWagner.png'
import leahTaubitz from './img/avatars/leahTaubitz.png'
import marcoCarvalho from './img/avatars/marcoCarvalho.jpg'
import lukasDanin from './img/avatars/lukasDanin.png'

const Wrapper = styled(MarketingWrapper)`
  .mui-container {
    width: 100%;
    & > p, & > h5 {
      width: 75%;
      ${cssQuery.large} { width: 65%; }
    }
    & > h5 {
      font-family: 'Merriweather', serif;
    }
  }

  /*
    The default h1 padding-top as the first child of a FullscreenWrapper
    is going to produce a lot of padding.
  */
  h1 {
    padding-top: 0;
  }
`

const PeopleWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  /*
    Decrease 25px from margin-bottom due to each Person having
    margin-bottom: 25px
  */
  margin: 50px 0 25px;
  ${cssQuery.large} { margin: 125px 0 100px; }
`

const PersonStyle = styled.div`
  width: 50%;
  ${cssQuery.medium} { width: 40%; }
  ${cssQuery.large} { width: 33.33333%; }
  padding: 0 2.5%;
  box-sizing: border-box;
  margin-bottom: 50px;

  display: flex;
  flex-direction: column;
  align-items: center;

  img {
    display: block;
    width: 80%;
    ${cssQuery.large} { width: 60%; }
    border-radius: 1000px;
    object-fit: contain;
  }

  p, .title {
    font-size: 12px;
    line-height: 16px;
    width: 90%;
    ${cssQuery.medium} { width: 80%; }
    ${cssQuery.large} { width: 60%; }
  }

  .title {
    font-weight: bold;
    margin: 1em 0;
    text-transform: uppercase;
  }

  .social {
    display: flex;
    width: 50%;
    flex-direction: row;
    justify-content: center;

    a {
      color: inherit;
      transition: color ease .2s;
      width: 25%;
      display: flex;
      justify-content: center;
      margin-right: 0.5em;
      :hover, :focus { color: var(--primary); text-decoration: none; }
      &:nth-last-child(1) { margin-right: 0; }
    }
  }
`

interface PersonProps {
  /**
   * For the best looking results, ensure the image is in a square proportion,
   * e.g. 150x150, 250x250
   */
  img: string
  name: string
  description: string
  /** Pass only the username and not full url through this prop */
  twitter?: string
  /** Pass only the username and not full url through this prop */
  github?: string
  /** Pass only the username and not full url through this prop */
  linkedin?: string
}
const Person: React.FC<PersonProps> = ({
  img, name, description,
  twitter, github, linkedin,
}) => {
  return <PersonStyle>
    <img src={img} alt={name}/>
    <div className="title">{name}</div>
    <p>{description}</p>
    <div className="social">
      {twitter && <a href={`https://twitter.com/${twitter}`} target="_blank" rel="noopener noreferrer"><i className="fa fa-twitter"/></a>}
      {linkedin && <a href={`https://www.linkedin.com/in/${linkedin}`} target="_blank" rel="noopener noreferrer"><i className="fa fa-linkedin"/></a>}
      {github && <a href={`https://github.com/${github}`} target="_blank" rel="noopener noreferrer"><i className="fa fa-github"/></a>}
    </div>
  </PersonStyle>
}

export const Team: React.FC = () => {
  const { pushStartSection } = useAppHistory()

  return <Wrapper columnChildContent={true} centerChildContent={true}>
    <Container>
      <h1>Team</h1>
      <p>
        <a href='https://votebymail.io'>VoteByMail.io</a> is a Civex Inc project developed by a team of enthusiastic volunteer technologists.
      </p>

      <PeopleWrapper>
        <Person
          img={michaelLi}
          name='Michael Li'
          description="I’m a data scientist, software engineer, and entrepreneur turned democracy advocate. I grew up voting by mail and want to help support it in other states."
          twitter='tianhuil'
          github='tianhuil'
          linkedin='tianhuili'
        />
        <Person
          img={brettClarke}
          name='Brett Clarke'
          description="I am a Teach For America Alum turned entrepreneur. I believe that increasing voter turnout benefits our entire society."
          linkedin='brett-clarke-a89200198'
        />
        <Person
          img={lucaLoncar}
          name='Luca Loncar'
          description="I'm a Google software engineer with 2 years of experience, looking for the best way to use the skills I've developed for a cause I believe in!"
          github='Luca409'
          linkedin='luca-loncar'
        />
        <Person
          img={leahTaubitz}
          name='Leah Taubitz'
          description="I'm a second year special education teacher in a low-income community on the South Side of Chicago. I graduated from the University of Michigan in 2018 with a BA in Political Science."
          linkedin='leah-taubitz-614355117'
        />
        <Person
          img={maryPenckofer}
          name='Mary Penckofer'
          description="I'm a Pre-K teacher in a CPS school. I graduated from Northwestern University in 2019 with a BA in Neuroscience."
          linkedin='mary-penckofer-4b3472178'
        />
        <Person
          img={tristanWagner}
          name='Tristan Wagner'
          description="Data scientist with a background in operations research, electronics manufacturing, and engineering management. Due to Oregon's long vote-by-mail history, it's the only way I've ever voted!
          "
          github='twagner000'
          linkedin='tristanwagner'
        />
        <Person
          img={longTonThat}
          name='Long Ton-That'
          description="I'm a lead software engineer at Nike.  I'm from Portland Oregon, where we've been voting by mail for a long time now, so I'm very excited to make it more accessible to people from other states!"
          github='longtonthat'
          linkedin='longtonthat'
        />
        <Person
          img={louisReid}
          name='Louis Reid'
          description="I've spent over a decade in development and design, including three years explicitly working on visual design across startups and agencies."
          linkedin='louisreiduk'
          twitter='louisreid'
        />
        <Person
          img={sophieHodge}
          name='Sophie Hodge'
          description="I'm a UX Designer in London, UK, with a background in psychology and mental health. I'm motivated by affecting social good and helping my community at large."
          linkedin='sophie-hodge-ux'
        />
        <Person
          img={marcoCarvalho}
          name="Marco Carvalho"
          description="I'm an IT expert with a Bachelor's degree in Computer Science from NYU, an equally accomplished leader of several tech startups. I had previously led projects for multinational clients, including the largest health co-op in the world."
          linkedin='marco-aur%C3%A9lio-carvalho-filho-bb70b867'
          github='marcoacfilho'
        />
        <Person
          img={lukasDanin}
          name="Lukas Danin"
          description="I'm a full-stack web developer with experience in design and embedded systems, happy to take part in a project which helps people exercise their rights while remaining safe."
          github='ludanin'
        />
      </PeopleWrapper>

      <h5>
        Interested in volunteering with VoteByMail.io?
      </h5>
      <UnderlineLink to="#contact" onClick={() => pushStartSection('contact')}>
        Get involved
      </UnderlineLink>
    </Container>
  </Wrapper>
}
