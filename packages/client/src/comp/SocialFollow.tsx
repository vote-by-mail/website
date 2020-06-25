import React from 'react'
import { SocialButtonWrapper, openInNewWindow } from './SocialShare'
import { Button } from 'muicss/react'

const FollowTwitter: React.FC = () => {
  const href = 'https://twitter.com/intent/follow?screen_name=votebymailio'
  return <SocialButtonWrapper
    title="Follow @VoteByMail on Twitter"
    onClick={() => openInNewWindow(href)}
  >
    <Button color='primary' style={{ backgroundColor: '#00acee' }}>
      <i className="fa fa-twitter"/>
      <span>Follow</span>
    </Button>
  </SocialButtonWrapper>
}

const FollowInstagram: React.FC = () => {
  const href = 'https://www.instagram.com/votebymail.io'

  return <SocialButtonWrapper title="Follow @VoteByMail on Instagram">
    <Button
      onClick={() => openInNewWindow(href)}
      style={{
        backgroundImage: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)',
        color: 'white',
        filter: 'brightness(1.1)',
      }}
    >
      <i className="fa fa-instagram"/>
      <span>Follow</span>
    </Button>
  </SocialButtonWrapper>
}

const FollowFacebook: React.FC = () => {
  const href = 'https://www.facebook.com/Votebymailio-109972600781831/'
  return <SocialButtonWrapper
    title="Follow @VoteByMail on Facebook"
    onClick={() => openInNewWindow(href, 1024)}
  >
    <Button color='primary' style={{ backgroundColor: '#3b5998' }}>
      <i className="fa fa-facebook"/>
      <span>Follow</span>
    </Button>
  </SocialButtonWrapper>
}

export const SocialFollow: React.FC = () => {
  return <>
    <FollowFacebook/>
    <FollowTwitter/>
    <FollowInstagram/>
  </>
}
