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
    width: 60%;
    border-radius: 15vw;
    object-fit: contain;
    ${cssQuery.desktop.all} {
      width: 60%;
    }
    ${cssQuery.mobile.wide} {
      width: 60%;
    }
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
      <h1>Who are we?</h1>
      <p>
        VoteByMail.io is a Civex Inc project developed by a team of enthusiastic volunteer technologists.
      </p>

      <PeopleWrapper>
        <Person
          img={michaelLi}
          name='Michael Li'
          description='I’m a data scientist, software engineer, and entrepreneur turned democracy advocate.'
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
          description="I'm a software engineer with 2 years of experience, looking for the best way to use the skills I've developed for a cause I believe in!"
          github='Luca409'
          linkedin='luca-loncar'
        />
        <Person
          img={leahTaubitz}
          name='Leah Taubitz'
          description="I'm a second year special education teacher in a low-income community on the South Side of Chicago. I graduated from the University of Michigan in 2018 with a BA in Political Science, and just earned a MA in Teaching Exceptional Learners from Relay GSE last month."
          linkedin='leah-taubitz-614355117'
        />
        <Person
          img={maryPenckofer}
          name='Mary Penckofer'
          description="I'm a Pre-K teacher in a CPS school. I graduated from Northwestern University in 2019 with a BA in Neuroscience. I am working on my MA in Early Childhood Educaiton from National Louis University."
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
          description="I'm from Portland Oregon, where we've been voting by mail for a long time now, so I'm very excited to make it more accessible to people from other states!  I'm a Software Engineer that focuses on Java backends, but passionate about front-end technologies."
          github='longtonthat'
          linkedin='longtonthat'
        />
        <Person
          img={louisReid}
          name='Louis Reid'
          description="Louis has spent over a decade in development and design, including three years explicitly working on visual design across startups and agencies. He brings design thinking to product, brand and public services and is keenly interested and believes in the catalysing potential of business to drive positive social change."
          linkedin='louisreiduk'
          twitter='louisreid'
        />
        <Person
          img={sophieHodge}
          name='Sophie Hodge'
          description="Sophie is a UX Designer in London, UK, with a background in psychology and mental health. She's motivated by affecting social good and helping her community at large. In her spare time she illustrates a webcomic about sharks."
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
