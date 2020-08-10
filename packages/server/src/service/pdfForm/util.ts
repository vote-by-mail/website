import { createPdfBuffer } from '../pdf'

export const stripPhoneNumber = (phoneNumber: string) => {
  // Get rid of characters. split-join acts as 'replaceAll'
  let strippedNumber = phoneNumber
    .replace('+', '')
    .replace('(', '')
    .replace(')', '')
    .split('-')
    .join('')
    .split(' ')
    .join('')
  // Remove leading 1.
  if (strippedNumber.length > 10) {
    strippedNumber = strippedNumber.substr(1, strippedNumber.length)
  }
  return strippedNumber
}

export const toSignatureBuffer = async (dataUrl: string, maxWidth: number, maxHeight: number): Promise<Buffer> => {
  const html = '<style>@page{margin: 0mm;} body{margin: 0px;}</style>' +
    `<img src='${dataUrl}' style='max-width: ${maxWidth}; max-height: ${maxHeight}; padding: 0; margin: 0; border: 0 solid #fff;'/>`
  return createPdfBuffer(html, {width: (maxWidth) + 'px', height: (maxHeight) + 'px', border: '0px'})
}
