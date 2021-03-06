import React from 'react'
import styled from 'styled-components'
import { Button } from 'muicss/react'

interface Props {
  // Form Submit & button label
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  buttonLabel: string
  buttonTestId?: string
  // Input
  type?: React.InputHTMLAttributes<HTMLInputElement>['type']
  /**
   * The onClick method that happens when the user click on the **input**
   * area.
   */
  onClick?: (e: React.MouseEvent<HTMLInputElement>) => void
  placeholder?: string
  id?: string
  dataTestId?: string
  pattern?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  defaultValue?: string
}

interface StyleProps {
  buttonColor?: string
  buttonBackground?: string
  className?: string
}

const Wrapper = styled.form<StyleProps>`
  --inputButton__width: 230px;
  --inputButton__height: 40px;

  width: var(--inputButton__width);
  height: var(--inputButton__height);
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.15);

  display: flex;

  & > button {
    flex: 2;
    height: 100%;
    margin: 0;
    padding: 0;

    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;

    background-color: ${p => p.buttonBackground ?? 'var(--primary)'};
    color: ${p => p.buttonColor ?? '#fff'};
    border-radius: 0;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  & > input {
    min-width: 0;
    flex: 3;
    height: 100%;
    margin: 0;
    padding: 0.3em;
    padding-left: 0.7em;
    box-sizing: border-box;
    font-size: 0.9em;

    border: 1px solid #0002;
    border-right: none;
    border-radius: 0;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;

    ::placeholder { color: #ccc; }

    /* Normalizes webkit autofill customizations */
    :-webkit-autofill,
    :-webkit-autofill:hover,
    :-webkit-autofill:focus {
      font-size: 0.9em;
      /* Using background-color won't work here */
      box-shadow: 0 0 0px 100px #fff inset;
    }

    /* Hides increment/decrement arrows on webkit */
    ::-webkit-inner-spin-button,
    ::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    /* Hides increment/decrement arrows on Firefox */
    -moz-appearance: textfield;

    :focus {
      outline: none;
      border-color: ${p => p.buttonBackground ?? 'var(--primary)'};
    }
  }
`

/**
 * Wraps in a HTML form a input followed by a Material Button.
 *
 * Because it is impossible to pass custom widths/heights with props that
 * respects media queries, in order to overwrite InputButton's dimensions
 * create a styled copy of it (`styled(InputButton)`) and reassign the
 * BEM named variables `--inputButton__width` and `--inputButton__height`
 *
 * Example:
 * ```
 * const LargeInputButton = styled(InputButton)`
 *   --inputButton__width: 900px;
 *   @media screen and ... {
 *     --inputButton_width: 200px;
 *   }
 * `
 * ```
 */
export const InputButton = React.forwardRef<HTMLInputElement, Props & StyleProps>((
  {
    // Button
    onSubmit,
    buttonLabel,
    buttonTestId,
    // Input
    onClick,
    type,
    placeholder,
    id,
    pattern,
    value,
    onChange,
    defaultValue,
    dataTestId,
    // Styling
    buttonColor, buttonBackground,
    className,
  },
  ref,
) => {
  return <Wrapper
    buttonColor={buttonColor}
    buttonBackground={buttonBackground}
    onSubmit={onSubmit}
    className={className}
  >
    <input
      type={type ?? 'text'}
      onClick={onClick}
      placeholder={placeholder}
      data-testid={dataTestId}
      id={id}
      pattern={pattern}
      value={value}
      onChange={onChange}
      // eslint will complain if we use `value && !onChange`
      readOnly={value ? (value !== undefined) && !onChange : undefined}
      defaultValue={defaultValue}
      ref={ref}
    />
    <Button color='primary' data-testid={buttonTestId} id={buttonTestId}>
      {buttonLabel}
    </Button>
  </Wrapper>
})

// ESLint will complain if this is not set, and React will not have a proper
// displayName when debugging this application.
InputButton.displayName = 'InputButton'
