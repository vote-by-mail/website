import styled from 'styled-components'
import { cssQuery } from './cssQuery'

interface Props {
  /**
   * Centers the content of this Wrapper, vertically and horizontally.
   *
   * By default is true
   */
  centerContent?: boolean
  /**
   * Centers the content of immediate divs (e.g. `& > div`) of this Wrapper
   *
   * By default is false
   */
  centerChildContent?: boolean
  /**
   * Lays the content of immediate divs (e.g. `& > div`) of this Wrapper
   * in Flex-columns
   *
   * By default is false
   */
  columnChildContent?: boolean
}

export const MarketingWrapper = styled.div<Props>`
  width: 100%;
  padding: 75px 0;
  ${cssQuery.large} { padding: 125px 0; }
  box-sizing: border-box;
  .mui-container {
    width: 100%;
    ${cssQuery.small} {
      /*
        MuiCSS margins are narrower on mobile than the ones found on the
        original design
      */
      padding-left: 7%;
      padding-right: 7%;
    }
    ${cssQuery.large} {
      /* Closest value to the original design on wide screens */
      max-width: 960px;
    }
  }

  display: flex;
  align-items: ${
    p => (p.centerContent ?? true)
      ? 'center'
      : 'flex-start'
  };
  justify-content: ${
    p => (p.centerContent ?? true)
      ? 'center'
      : 'flex-start'
  };

  & > div {
    display: flex;
    text-align: ${
      p => p.centerChildContent
        ? 'center'
        : 'left'
    };
    flex-direction: ${
      p => p.columnChildContent
        ? 'column'
        : 'row'
    };
    align-items: ${
      p => p.centerChildContent
        ? 'center'
        : 'flex-start'
    };
    justify-content: ${
      p => p.centerChildContent
        ? 'center'
        : 'flex-start'
    };
  }

  p {
    font-size: 18px;
    line-height: 25px;
    small {
      font-size: 12px;
      line-height: 16px;
    }
  }

  h1 {
    font-size: 48px !important;
  }
`
