import { Router } from 'express'

import { implementedStates, isImplementedState } from '../../common'
import { getContactRecords } from '../contact'
import { sampleLetter } from './sample'

export const router = Router()

router.get('/:state/:key?', async (req, res) => {
  const { state, key } = req.params

  if (!isImplementedState(state)) return res.redirect('/letter/Florida/')

  const letter = await sampleLetter(state, key)
  if (!letter) return res.redirect(`/${state}`)

  const contactRecords = await getContactRecords()
  const keys = Object.keys(contactRecords[state])

  const renderLetter = (letter: string) => {
    return res.render('letter.pug', {
      letter,

      // state data
      implementedStates: [...implementedStates].sort(),
      state,

      // locale data
      keys,
      key,
    })
  }

  return renderLetter(letter.render('html'))
})
