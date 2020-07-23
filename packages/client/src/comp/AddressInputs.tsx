import React, { RefObject } from "react"

import { BaseInput } from "./util/Input"
import styled from "styled-components"
import { cssQuery } from "./util/cssQuery"
import { InputId, InputData } from "./states/BaseContainer"
import Dropdown from 'muicss/lib/react/dropdown'
import DropdownItem from 'muicss/lib/react/dropdown-item'
import { Input } from "muicss/react"
import { AddressInputId } from "./states/AddressFormContainer"
import { allStates } from "../common"

const FlexBox = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  flex-wrap: wrap;
  align-items: center;
  margin: 1em -0.5em;
`

const FlexGrow = styled.div`
  margin: 0 0.5em;
`

const FlexGrowFull = styled.div`
  margin: 0 0.5em;
  flex: 0.5;
  ${cssQuery.small} {
    flex: 1;
  }
`

const FlexGrowHalf = styled.div`
  margin: 0 0.5em;
  flex: 0.25;
  ${cssQuery.small} {
    flex: 0.5;
  }
`

interface Props {
  streetAddressRef?: RefObject<Input>
  defaultState?: string
  defaultZip?: string
  fields: Record<InputId, InputData> | Record<AddressInputId, InputData>
  updateField?: (id: InputId, value: string) => void
  updateInput?: (id: AddressInputId, value: string) => void
}

export const AddressInputs: React.FC<Props> = ({
  streetAddressRef,
  defaultState,
  defaultZip,
  fields,
  updateField,
  updateInput
}) => {
  const updateValue = updateField ? updateField : updateInput
  return (
    <>
      <FlexBox id='mailing'>
        <FlexGrow style={{ flex: 0.75 }}>
          <BaseInput
            id="street-address" // This id is used for Warning Box to fill form quickly
            label="Street address"
            ref={streetAddressRef || null}
            required
            value={fields.street.value}
            translate="no"
            onChange={e => updateValue && updateValue('street', e.currentTarget.value)}
            lang="en"
          />
        </FlexGrow>
        <FlexGrow style={{ flex: 0.25 }}>
          <BaseInput
            id="apt-input" // This id is used for Warning Box to fill form quickly
            label="Apartment"
            translate="no"
            onChange={e => updateValue && updateValue('apt', e.currentTarget.value)}
            value={fields.apt.value}
            lang="en"
          />
        </FlexGrow>
      </FlexBox>
      <FlexBox>
        <FlexGrowFull>
          <BaseInput
            id="city-input" // This id is used for Warning Box to fill form quickly
            label="City"
            required
            translate="no"
            onChange={e => updateValue && updateValue('city', e.currentTarget.value)}
            value={fields.city.value}
            lang="en"
          />
        </FlexGrowFull>
        <FlexGrowHalf>
          <Dropdown
            id="state-input" // This id is used for Warning Box to fill form quickly
            label={fields.state.value || "State"}
            color='primary'
            defaultValue={defaultState || ""}
            translate="no"
            lang="en"
            >
            {
              [...allStates].sort().map((state, key) => {
                return <DropdownItem
                  key={key}
                  onClick={() => updateValue && updateValue('state', state)}
                  translate="no" 
                  lang="en"
                >
                  {state}
                </DropdownItem>
              })
            }
          </Dropdown>
        </FlexGrowHalf>
        <FlexGrowHalf>
          <BaseInput
            id="zip-input" // This id is used for Warning Box to fill form quickly
            label="ZIP code"
            defaultValue={defaultZip || ""}
            required
            translate="no"
            onChange={e => updateValue && updateValue('zip', e.currentTarget.value)}
            value={fields.zip.value}
            lang="en"
          />
        </FlexGrowHalf>
      </FlexBox>
    </>
  )
}
