import React from 'react'
import styled, { keyframes, css } from 'styled-components'

import logo from './img/logo.png'
import { Button } from 'muicss/react'
import { Link } from 'react-router-dom'
import { useAppHistory, StartSectionPath } from '../lib/path'
import { cssQuery } from './util/cssQuery'
import { processEnvOrThrow } from '../common'


interface NavExpanded {
  expanded: boolean
}

const fadeIn = keyframes`
  from { opacity: 0 }
  to { opacity: 1 }
`

const slideUp = keyframes`
  from {
    transform: translateY(calc(var(--height) * 0));
  }
  to {
    transform: translateY(calc(var(--height) * -1));
  }
`

const slideDown = keyframes`
  from {
    transform: translateY(calc(var(--height) * -1));
  }
  to {
    transform: translateY(calc(var(--height) * 0));
  }
`

const Wrapper = styled.div<NavExpanded & { visible: boolean }>`
  /*
    We store these variables to reuse them when setting the icon size, etc.
    This helps us have some capabilities, such as perfect round ripple
    effects on the Toggle Button, etc.
  */
  --height: 65px;
  --expandedHeight: 265px;
  --verticalPad: 10px;
  /* The height inside the padded area */
  --contentHeight: calc(var(--height) - var(--verticalPad) - var(--verticalPad));
  ${cssQuery.medium} {
    --expandedHeight: 130px;
  }
  ${cssQuery.large} {
    --height: 102px;
    --expandedHeight: var(--height);
  }

  width: 100%;
  height: var(${p => p.expanded ? '--expandedHeight' : '--height'});
  padding: var(--verticalPad) 5%;
  ${cssQuery.large} { padding: var(--verticalPad) 10%; }
  box-sizing: border-box;

  position: fixed;
  top: 0;

  background-color: #fff;
  box-shadow: 0px 4px 2px rgba(0, 0, 0, 0.05);

  z-index: 10;

  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  align-content: flex-start;
  justify-content: space-between;
  ${cssQuery.large} {
    align-items: center;
    justify-content: flex-end;
  }

  animation: ${
    p => p.visible
      ? css`${slideDown} ease .25s both`
      : css`${slideUp} ease .25s both`
  };
  opacity: ${p => p.visible ? '1' : '0'};

  transition: height ease .45s, opacity ease .2s;
`

const Logo = styled(Link)`
  height: var(--contentHeight);
  /* Total space - NavToggle size - LocaleToggle size */
  width: calc(90% - var(--contentHeight) - var(--contentHeight));
  ${cssQuery.large} {
    width: unset;
    position: absolute;
    left: 10%;
  }

  /* Centers image on the padded, non-expanded area */
  display: flex;
  align-items: center;

  img {
    height: 50%;
  }
`

const NavToggleButton = styled(Button)<Partial<NavExpanded>>`
  --color: ${p => p.expanded ? '#f44336' : '#2196f3'};
  --iconRotation: ${p => p.expanded ? '-90deg' : '0'};
  --wrapperSize: var(--contentHeight);
  --iconSize: calc(var(--wrapperSize) * 0.35);
  ${cssQuery.large} {
    --wrapperSize: calc(var(--contentHeight) * 0.7);
    --iconSize: calc(var(--wrapperSize) * 0.4);
  }

  /* In order to make the Material Ripple a perfect circle */
  width: var(--wrapperSize);
  height: var(--wrapperSize);
  border-radius: var(--wrapperSize);
  margin: 0;

  /* The Material Ripple already indicates interaction */
  :hover, :focus { background-color: #fff !important; }

  /* Centers icon */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0; margin: 0;
  i {
    font-size: var(--iconSize);
    color: var(--color);
    transform: rotate(var(--iconRotation));
    transition: color ease .3s, transform ease .15s;
  }
`

const NavLinksToggle = styled(NavToggleButton)<NavExpanded>`
  ${cssQuery.large} { display: none; }
`

const LocaleToggle = styled.div<NavExpanded>`
  --rowWidth: 170px;
  --rowHeight: 50px;
  overflow: visible;

  /* Keeps as the last item on Navbar */
  ${cssQuery.large} { order: 2; }

  /* Clears Toggle animation */
  button i {
    color: #2196f3 !important;
    transform: none !important;
  }

  .picker {
    width: var(--rowWidth);

    position: fixed;
    /* Creates the effect that the dropdown is touching/merged with the navbar */
    top: calc(var(--height) * 0.97);
    margin-left: calc(var(--rowWidth) / -2.78);
    ${cssQuery.large} { margin-left: calc(var(--rowWidth) / -3); }

    background-color: #fff;
    box-shadow: 0 6px 7px rgba(0, 0, 0, 0.05);
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;

    transform: scaleY(${p => p.expanded ? 1 : 0});
    transform-origin: top;
    opacity: ${p => p.expanded ? '1' : '0'};
    transition: opacity ease .15s, transform ease .2s;
    pointer-events: ${p => p.expanded ? 'initial' : 'none'};

    button {
      width: 100%;
      height: var(--rowHeight);
      /* MuiCSS Buttons have predefined margins/paddings */
      padding: 0; margin: 0;

      font-size: 12px;
      font-weight: bold;

      box-sizing: border-box;
      border-bottom: 1px solid #0001;
    }
    a:nth-last-child(1) {
      button { border-bottom: none; }
    }
  }
`

const DismissDropdown = styled.div<NavExpanded>`
  display: ${p => p.expanded ? 'block' : 'none'};
  position: absolute;
  width: 100%;
  /* So users can still click on the navbar links */
  height: calc(100vh - var(--height));
  top: var(--height);
  left: 0;
  z-index: -2;
`

const NavLinks = styled.div<NavExpanded>`
  /* The parent has horizontal padding, this ensures NavLinks is full-width */
  width: 120%;
  height: calc(
    var(--expandedHeight) - var(--contentHeight) - var(--verticalPad) - var(--verticalPad)
  );

  font-size: 12px;
  line-height: 16px;
  box-shadow: 0 4px 3px rgba(0, 0, 0, 0.05) inset;
  /* Makes the shadow (of the navlinks) ignore the Wrapper horizontal padding */
  margin: 0 -10%;
  ${cssQuery.small} { margin-top: 4px; }
  animation: ${fadeIn} ease .5s .3s both;

  /* When animating, doesn't let the content be drawn on top of the logo/toggle button */
  z-index: -1;

  display: ${p => p.expanded ? 'flex' : 'none'};
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  /* Without this 5px on top the links are going to be offsetted upwards */
  padding-top: 5px;

  /*
    These devices have enough space to show all the links in one single row.
  */
  ${cssQuery.medium} {
    flex-direction: row;
    padding: 5px 10% 0;
  }

  ${cssQuery.large} {
    display: flex;
    width: unset;
    height: 100%;
    padding: 0;
    margin: 0;
    box-shadow: none;
  }

  a {
    color: inherit;
    font-weight: bold;
    text-transform: uppercase;
    ${cssQuery.large} {
      margin-right: 25px;
    }

    &.register, :hover, :focus, :active {
      color: #2196f3;
      text-decoration: none;
    }

    transition: color ease .2s;
  }
`

export const Navbar = () => {
  const { pushStartSection } = useAppHistory()
  const [linksExpanded, setLinksExpanded] = React.useState(false)
  const [localesExpanded, setLocalesExpanded] = React.useState(false)
  const [visible, setVisibility] = React.useState(true)
  const [scrollY, setScrollY] = React.useState(window.pageYOffset)

  // Handles the visibility of the navbar
  React.useLayoutEffect(() => {
    window.onscroll = () => {
      if (visible === false) {
        if (window.pageYOffset < scrollY) {
          setVisibility(true)
        }
      } else {
        if (window.pageYOffset > scrollY) {
          if ((localesExpanded || linksExpanded) === false) {
            setVisibility(false)
          }
        }
      }
      setScrollY(window.pageYOffset)
    }
  }, [visible, scrollY, localesExpanded, linksExpanded])

  const toggleLinksExpanded = () => {
    setLocalesExpanded(false)
    setLinksExpanded(!linksExpanded)
  }
  const toggleLocalesExpanded = () => {
    setLinksExpanded(false)
    setLocalesExpanded(!localesExpanded)
  }

  // Collapses navbar links when users click on them
  const pushAndClose = (section: StartSectionPath['type']) => {
    pushStartSection(section)
    if (linksExpanded) toggleLinksExpanded()
  }

  const url = encodeURI(processEnvOrThrow('REACT_APP_URL'))

  // We use \u below instead of typing the raw characters so all editors
  // can safely render the content of this file (some people on the team
  // might not have the appropriate fonts for all these locales).
  return <Wrapper expanded={linksExpanded} visible={visible}>
    <Logo to='#' onClick={() => pushAndClose('start')}>
        <img src={logo} alt='VoteByMail'/>
    </Logo>
    <LocaleToggle expanded={localesExpanded}>
      <DismissDropdown expanded={localesExpanded} onClick={toggleLocalesExpanded}/>
      <NavToggleButton onClick={toggleLocalesExpanded} expanded={localesExpanded} variant='flat'>
        <i className='fa fa-globe'/>
      </NavToggleButton>
      {/* Top 5 non-English languages, in order https://en.wikipedia.org/wiki/Languages_of_the_United_States#Most_common_languages */}
      <div className='picker mui--z0' onClick={toggleLocalesExpanded}>
        <a href={`https://translate.google.com/translate?hl=&sl=en&tl=es&u=${url}`}>
          <Button translate='no' variant='flat'>Espa&ntilde;ol</Button>
        </a>
        <a href={`https://translate.google.com/translate?hl=&sl=en&tl=zh-CN&u=${url}`}>
          <Button translate='no' variant='flat'>{'\u7b80\u4f53\u4e2d\u6587'}</Button>
        </a>
        <a href={`https://translate.google.com/translate?hl=&sl=en&tl=tl&u=${url}`}>
          <Button translate='no' variant='flat'>Filipino</Button>
        </a>
        <a href={`https://translate.google.com/translate?sl=en&tl=vi&u=${url}`}>
          <Button translate='no' variant='flat'>Ti{'\u1ebf'}ng Vi{'\u1ec7'}t</Button>
        </a>
        <a href={`https://translate.google.com/translate?hl=&sl=en&tl=ar&u=${url}`}>
          <Button translate='no' variant='flat'>
            {'\u0627\u0644\u0639\u0631\u0628\u064a\u0629'}
          </Button>
        </a>
      </div>
    </LocaleToggle>
    <NavLinksToggle onClick={toggleLinksExpanded} expanded={linksExpanded} variant='flat'>
      <i className={`fa ${linksExpanded ? 'fa-close' : 'fa-navicon'}`}/>
    </NavLinksToggle>
    <NavLinks expanded={linksExpanded}>
      <Link to='#start' onClick={() => pushAndClose('start')}>
        Sign Up
      </Link>
      <Link to='#howItWorks' onClick={() => pushAndClose('howItWorks')}>
        How does it work?
      </Link>
      <Link to='#getInvolved' onClick={() => pushAndClose('getInvolved')}>
        Get Involved
      </Link>
      <Link to='#team' onClick={() => pushAndClose('team')}>
        Team
      </Link>
      <Link to='#contact' onClick={() => pushAndClose('contact')}>
        Contact Us
      </Link>
    </NavLinks>
  </Wrapper>
}
