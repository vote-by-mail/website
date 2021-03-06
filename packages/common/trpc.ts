import { IRpc, RpcRet } from '@tianhuil/simple-trpc/dist/type'
import { Address, AddressInputParts } from './address'
import { State } from './states'
import { ContactData } from './contact'
import { InitialData } from './initialData'
import { StateInfo, ImplementedState } from './stateInfo'
import { Voter, RegistrationArgs, AlloyResponse } from './voter'
import { Locale } from './locale'

export interface IVbmRpc extends IRpc<IVbmRpc> {
  add(x: number, y: number): Promise<RpcRet<number>>
  fetchState(zip: string): Promise<RpcRet<State>>
  fetchInitialData(org: string): Promise<RpcRet<InitialData>>
  fetchContactAddress(addr: AddressInputParts | string): Promise<RpcRet<{contact: ContactData, address: Address}>>
  fetchContact(locale: Locale): Promise<RpcRet<ContactData>>
  fetchContacts(state: ImplementedState): Promise<RpcRet<string[]>>
  getContact(state: ImplementedState, key: string): Promise<RpcRet<ContactData>>
  contactUs(author: string, subject: string, text: string): Promise<RpcRet<boolean>>
  subscribe(email: string): Promise<RpcRet<boolean>>
  isRegistered(voter: RegistrationArgs): Promise<RpcRet<AlloyResponse>>
  register(info: StateInfo, voter: Voter): Promise<RpcRet<string>>
}
