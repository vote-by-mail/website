import { sib } from './sendinblue'

const dummy = 'dummy@example.com'

const main = async () => {
  // Adds user to list
  console.log(`Adding ${dummy} to Sendinblue listId=${sib.listId}`)
  try {
    const success = await sib.addSubscriber(dummy)
    if (!success) {
      console.log(`Failed to add ${dummy}.`)
      return
    }
    console.log(`Successfully added ${dummy}.`)
  } catch(e) {
    console.log(`Error when adding ${dummy}`)
    console.error(e)
    return
  }

  // Check user status on list
  console.log(`Checking ${dummy} status on Sendinblue listId=${sib.listId}`)
  try {
    const response = await sib.getSubscriber(dummy)
    const inList = (response?.body?.listIds?.indexOf(sib.listId) ?? -1) !== -1
    if (!inList) {
      console.log(`Apparently, ${dummy} is not on listId=${sib.listId}`)
    } else {
      console.log(`${dummy} is on listId=${sib.listId}`)
    }
  } catch(e) {
    console.log(`Error when checking ${dummy} status`)
    console.error(e)
  }
}

main()
