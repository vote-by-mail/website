import React from 'react'
import styled, { keyframes, css } from 'styled-components'

import logo from './img/logo.png'
import { Button } from 'muicss/react'
import { Link } from 'react-router-dom'
import { useAppHistory, StartSectionPath } from '../lib/path'
import { cssQuery } from './util/cssQuery'
import { processEnvOrThrow } from '../common'


interface NavExpanded {
  expanded: 'translation' | 'links' | null
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
  height: var(${p => p.expanded === 'links' ? '--expandedHeight' : '--height'});
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
  justify-content: flex-end;
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
  position: absolute;
  left: 5%;
  ${cssQuery.large} {
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
  --wrapperSize: var(--contentHeight);
  --iconSize: calc(var(--wrapperSize) * 0.35);
  ${cssQuery.large} {
    --wrapperSize: 28px;
    --iconSize: 16px;
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
    color: inherit;
    transition: color ease .3s;
  }
`

const NavLinksToggle = styled(NavToggleButton)<NavExpanded>`
  ${cssQuery.large} { display: none; }
  i {
    color: ${p => p.expanded === 'links' ? 'var(--primary)' : 'inherit'};
  }
`

const LocaleToggle = styled.div<NavExpanded>`
  --rowWidth: 170px;
  --rowHeight: 50px;
  overflow: visible;

  /* Keeps as the last item on Navbar */
  ${cssQuery.large} { order: 2; }

  /* Decreases chevron size */
  button i {
    color: ${p => p.expanded === 'translation' ? 'var(--primary)' : 'inherit'};
    &.fa-chevron-down {
      font-size: 8px;
      margin-left: 2px;
      transform: rotate(${p => p.expanded === 'translation' ? '-180deg' : '0'});
      transition: color ease .3s, transform ease .2s;
    }
  }

  .picker {
    width: var(--rowWidth);

    position: fixed;
    /* Creates the effect that the dropdown is touching/merged with the navbar */
    top: calc(var(--height) * 0.97);
    margin-left: calc(var(--rowWidth) / -2.6);
    ${cssQuery.large} { margin-left: calc(var(--rowWidth) / -2.35); }

    background-color: #fff;
    box-shadow: 0 6px 7px rgba(0, 0, 0, 0.05);
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;

    transform: scaleY(${p => p.expanded === 'translation' ? 1 : 0});
    transform-origin: top;
    opacity: ${p => p.expanded === 'translation' ? '1' : '0'};
    transition: opacity ease .15s, transform ease .2s;
    pointer-events: ${p => p.expanded === 'translation' ? 'initial' : 'none'};

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
  height: calc(100vh - ${
    p => p.expanded === 'links' ? 'var(--expandedHeight)' : 'var(--height)'
  });
  top: ${p => p.expanded === 'links' ? 'var(--expandedHeight)' : 'var(--height)'};
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
  animation: ${fadeIn} ease .5s .3s both;

  /* When animating, doesn't let the content be drawn on top of the logo/toggle button */
  z-index: -1;

  display: ${p => p.expanded === 'links' ? 'flex' : 'none'};
  flex-direction: column;
  justify-content: space-around;
  align-items: center;

  /* Fixes offsetted links */
  margin: 6px -10% 0;
  ${cssQuery.large} { margin-top: 0; }
  padding-top: 2px;

  /*
    These devices have enough space to show all the links in one single row.
  */
  ${cssQuery.medium} {
    flex-direction: row;
    padding: 2px 10% 0;
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

    :hover, :focus, :active {
      color: var(--primary);
      text-decoration: none;
    }

    transition: color ease .2s;
  }
`

export const Navbar = () => {
  const { pushStartSection } = useAppHistory()
  const [expanded, setExpanded] = React.useState<NavExpanded['expanded']>(null)
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
          setVisibility(false)
          if (expanded) {
            setExpanded(null)
          }
        }
      }
      setScrollY(window.pageYOffset)
    }
  }, [visible, scrollY, expanded])

  const toggleExpanded = (target: 'links' | 'translation') => {
    if (expanded === target) {
      setExpanded(null)
    } else {
      setExpanded(target)
    }
  }

  // Pushes content to the top of the page and collapses navbar when users
  // clicks on a link
  const pushAndClose = (section: StartSectionPath['type']) => {
    pushStartSection(section)
    if (expanded) setExpanded(null)
  }

  const url = encodeURI(processEnvOrThrow('REACT_APP_URL'))

  // We use \u below instead of typing the raw characters so all editors
  // can safely render the content of this file (some people on the team
  // might not have the appropriate fonts for all these locales).
  return <Wrapper expanded={expanded} visible={visible}>
    <Logo to='#' onClick={() => pushAndClose('start')}>
      <img src={logo} alt='VoteByMail'/>
    </Logo>
    <DismissDropdown
      expanded={expanded}
      onClick={() => setExpanded(null)}
    />
    <LocaleToggle expanded={expanded}>
      <NavToggleButton
        onClick={() => toggleExpanded('translation')}
        expanded={expanded}
        variant='flat'
      >
        <i className="fa fa-globe"/>
        <i className="fa fa-chevron-down"/>
      </NavToggleButton>
      {/* Top 5 non-English languages, in order https://en.wikipedia.org/wiki/Languages_of_the_United_States#Most_common_languages */}
      <div className='picker' onClick={() => toggleExpanded('translation')}>
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
    <NavLinksToggle
      onClick={() => toggleExpanded('links')}
      expanded={expanded}
      variant='flat'
    >
      <i className={`fa fa-navicon`}/>
    </NavLinksToggle>
    <NavLinks expanded={expanded}>
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
