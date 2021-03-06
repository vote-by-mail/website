import { createPdfBuffer } from '../pdf'

export const cleanPhoneNumber = (phoneNumber: string) => {
  return phoneNumber
    .replace(/ /g, '')
    .replace(/^\+1/, '')
    .replace('(', '')
    .replace(')', '')
    .replace(/-/g, '')
}

export const toSignatureBuffer = async (dataUrl: string, maxWidth: number, maxHeight: number): Promise<Buffer> => {
  const html = '<style>@page{margin: 0mm;} body{margin: 0px;}</style>' +
    `<img src='${dataUrl}' style='max-width: ${maxWidth}; max-height: ${maxHeight}; padding: 0; margin: 0; border: 0 solid #fff;'/>`
  return createPdfBuffer(html, {width: (maxWidth) + 'px', height: (maxHeight) + 'px', border: '0px'})
}
