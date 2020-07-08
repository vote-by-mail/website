import React from 'react'
import styled from 'styled-components'

import { useAppHistory } from '../lib/path'
import { cssQuery } from './util/cssQuery'
import { FullscreenWrapper } from './util/FullscreenWrapper'
import { UnderlineAnchor } from './util/UnderlineAnchor'
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

const Wrapper = styled(FullscreenWrapper)`
  .mui-container > p, .mui-container > h4 {
    ${cssQuery.desktop.all} { width: 65%; }
    ${cssQuery.mobile.landscape.all} { width: 75%; }
    ${cssQuery.mobile.wide} { width: 75%; }
  }

  /*
    The default h1 padding-top as the first child of a FullscreenWrapper
    is going to produce a lot of padding.
  */
  h1 { padding-top: 0; }
`

const PeopleWrapper = styled.div`
  width: 90%;
  ${cssQuery.desktop.all} { width: 70%; }
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  margin-top: 1.8em;
`

const PersonStyle = styled.div`
  width: 50%;
  ${cssQuery.desktop.all} { width: 33.33333%; }
  ${cssQuery.mobile.wide} { width: 33.33333%; }
  padding: 0 2.5%;
  box-sizing: border-box;
  margin-bottom: 2em;

  display: flex;
  flex-direction: column;
  align-items: center;

  img {
    display: block;
    width: 80%;
    ${cssQuery.desktop.all} { width: 60%; }
    ${cssQuery.mobile.wide} { width: 60%; }
    border-radius: 15vw;
    object-fit: contain;
    background-color: #0002;
  }

  .title {
    font-size: 0.9em;
    font-weight: bold;
    line-height: 1.15;
    margin: 1em 0;
    text-transform: uppercase;
  }

  p {
    font-size: 0.7em;
    ${cssQuery.desktop.all} {
      width: 80%;
    }
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
      :hover, :focus { color: #2596f2; text-decoration: none; }
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
          linkedin='tianhuil'
        />
        <Person
          img={brettClarke}
          name='Brett Clarke'
          description='Finishing up my second year of Teach For America. I currently teach high school biology on the south side of chicago. '
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
          description="I'm a Pre-K teacher in a CPS school. I graduated from Northwestern University in 2019 with a BA in Neuroscience. I graduated from Northwestern University in 2019 with a BA in Neuroscience."
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
          description="I've has spent over a decade in development and design, including three years explicitly working on visual design across startups and agencies."
          linkedin='louisreiduk'
          twitter='louisreid'
        />
        <Person
          img={sophieHodge}
          name='Sophie Hodge'
          description="I'm a UX Designer in London, UK, with a background in psychology and mental health. I'm motivated by affecting social good and helping my community at large."
          linkedin='sophie-hodge-ux'
        />
      </PeopleWrapper>

      <h4>
        Interested in volunteering with VoteByMail? We&apos;d love to hear from you even if you&apos;re unsure how you could help!
      </h4>
      <UnderlineAnchor href="#getInvolved" onClick={() => pushStartSection('contact')}>
        How to get involved
      </UnderlineAnchor>
    </Container>
  </Wrapper>
}
