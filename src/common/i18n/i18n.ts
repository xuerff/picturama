import moment from 'moment'  // This includes locale 'en'
import 'moment/locale/de'

import text_de from './text_de'
import text_en from './text_en'


export type Locale = 'de' | 'en'
export const locales = [ 'de', 'en' ]

export type I18nKey = keyof typeof text_en

const textsByLang: { [K in Locale]: { [K in I18nKey]: string } } = {
    de: text_de,
    en: text_en,
}

const msgFormatRe = /\{(\d+)\}/g


let locale: Locale

export function setLocale(newLocale: string) {
    if (newLocale.length > 2) {
        newLocale = newLocale.substr(0, 2)
    }
    if (locales.indexOf(newLocale) === -1) {
        newLocale = 'en'
    }

    locale = newLocale as Locale
    moment.locale(locale)
}

export function getLocale(): string {
    return locale
}

export function msg(key: I18nKey, ...args: any[]): string {
    let text: string = textsByLang[locale][key]
    if (!text) {
        console.error(`Missing I18N key for ${locale}: ${key}`)
        return `[${key}]`
    } else {
        if (args && args.length > 0) {
            return text.replace(msgFormatRe, (match, group1) => args[parseInt(group1)])
        } else {
            return text
        }
    }
}
