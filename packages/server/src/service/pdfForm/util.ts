import { createPdfBuffer } from '../pdf'

export const stripPhoneNumber = (phoneNumber: string) => {
  return phoneNumber
    .replace('+1', '')
    .replace('(', '')
    .replace(')', '')
    .split('-')
    .join('')
    .split(' ')
    .join('')
}

export const toSignatureBuffer = async (dataUrl: string, maxWidth: number, maxHeight: number): Promise<Buffer> => {
  const html = '<style>@page{margin: 0mm;} body{margin: 0px;}</style>' +
    `<img src='${dataUrl}' style='max-width: ${maxWidth}; max-height: ${maxHeight}; padding: 0; margin: 0; border: 0 solid #fff;'/>`
  return createPdfBuffer(html, {width: (maxWidth) + 'px', height: (maxHeight) + 'px', border: '0px'})
}
