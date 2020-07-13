import React from 'react'
import styled, { keyframes, css } from 'styled-components'

import logo from './img/logo.png'
import { Button } from 'muicss/react'
import { Link } from 'react-router-dom'
import { useAppHistory, StartSectionPath } from '../lib/path'
import { cssQuery } from './util/cssQuery'


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
          if (linksExpanded === false) {
            setVisibility(false)
          }
        }
      }
      setScrollY(window.pageYOffset)
    }
  }, [visible, scrollY, linksExpanded])

  const toggleLinksExpanded = () => {
    setLinksExpanded(!linksExpanded)
  }

  /** Pushes page section and closes the navbar */
  const pushAndClose = (section: StartSectionPath['type']) => {
    pushStartSection(section)
    if (linksExpanded) toggleLinksExpanded()
  }

  return <Wrapper expanded={linksExpanded} visible={visible}>
    <Logo to='#' onClick={() => pushAndClose('start')}>
        <img src={logo} alt='VoteByMail'/>
    </Logo>
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
