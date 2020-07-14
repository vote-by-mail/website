import React from 'react'
import styled from 'styled-components'
import { cssQuery } from './util/cssQuery'
import { MarketingWrapper } from './util/MarketingWrapper'
import { Container, Button } from 'muicss/react'
import { client } from '../lib/trpc'
import { FetchingDataContainer } from '../lib/unstated'
import { toast } from 'react-toastify'

const Wrapper = styled(MarketingWrapper)`
  /*
    Since the content (Team) above Contact shares the same background color
    repeating the padding will give users the impression that there's too
    much space between them (although it is the same than the one between
    Team and GetInvolved)
  */
  padding-top: 0 !important;
  min-height: unset;

  .mui-container {
    flex-direction: column;
    ${cssQuery.onlyMedium} {
      align-items: center;
    }
    ${cssQuery.large} {
      flex-direction: row;
    }
  }
`

const Headline = styled.div`
  h1 {
    margin-top: 0; padding-top: 0;
  }

  /* 60 characters per line */
  ${cssQuery.onlyMedium} { width: 75%; }

  ${cssQuery.large} {
    width: 35%;
    margin-right: 5%;
    text-align: left;
  }
`

const Form = styled.form`
  width: 100%;
  ${cssQuery.onlyMedium} { width: 75%; }
  ${cssQuery.large} { width: 55%; margin-left: 5%; }
  display: flex;
  flex-direction: column;

  label {
    margin: 1em 0 0.5em;
    font-weight: bold;
    text-align: left;
    text-transform: uppercase;
    font-size: 12px;
    line-height: 16px;

    ${cssQuery.large} {
      &:nth-of-type(1) { margin-top: 0; }
    }
  }

  input, textarea {
    width: 100%;
    min-height: 40px;
    box-sizing: border-box;
    border: none;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.15);

    &:focus {
      outline: none;
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.1), 0 -2px var(--primary) inset;
    }
  }

  textarea {
    padding: 1em;
  }

  button {
    margin-top: 25px;
    width: 40%;
    margin-left: 30%;
  }
`

export const Contact: React.FC = () => {
  const { setFetchingData } = FetchingDataContainer.useContainer()
  const emailRef = React.useRef<HTMLInputElement>(null)
  const nameRef = React.useRef<HTMLInputElement>(null)
  const textRef = React.useRef<HTMLTextAreaElement>(null)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.persist()  // allow async function call
    e.preventDefault()
    setFetchingData(true)
    try {
      await client.contactUs(
        emailRef.current?.value ?? '',
        nameRef.current?.value ?? '',
        textRef.current?.value ?? '',
      )

      toast(
        'Your email has successfully been sent to our support team. Expect to hear from us soon.',
        {type: 'success'}
      )
    } catch(e) {
      toast(
        'Failed to send contact email',
        {type: 'error'}
      )
    }
    setFetchingData(false)
  }

  return <Wrapper centerContent={false}>
    <Container>
      <Headline>
        <h1>Contact us</h1>
        <p>
          Questions about our process, our team, or anything else? Get in touch!
        </p>
      </Headline>

      <Form action="contact_us" onSubmit={onSubmit}>
        <label htmlFor="name">Name</label>
        <input type="text" name="name" required={true} ref={nameRef}/>

        <label htmlFor="email">Email</label>
        <input type="email" name="email" required={true} ref={emailRef}/>

        <label htmlFor="message">Your Message</label>
        <textarea
          name="message"
          cols={30}
          rows={10}
          required={true}
          ref={textRef}
        />
        <Button color='primary'>Submit</Button>
      </Form>
    </Container>
  </Wrapper>
}
