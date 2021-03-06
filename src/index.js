import BananaParser from './parser'
import BananaMessageStore from './messagestore'
import FALLBACKS from './languages/fallbacks.json'

export default class Banana {
  constructor (locale, options) {
    options = options || {}
    this.locale = locale
    this.parser = new BananaParser(this.locale)
    this.messageStore = new BananaMessageStore()
    if (options.messages) {
      this.load(options.messages, this.locale)
    }
    this.finalFallback = options.finalFallback || 'en'
  }

  /**
   * Load localized messages for a locale
   * If locale not provided, the keys in messageSource will be used as locales.
   * @param {Object} messageSource
   * @param {string} [locale]
   */
  load (messageSource, locale) {
    return this.messageStore.load(messageSource, locale || this.locale)
  }

  i18n (key, ...parameters) {
    return this.parser.parse(this.getMessage(key), parameters)
  }

  setLocale (locale) {
    this.locale = locale
    // Update parser
    this.parser = new BananaParser(this.locale)
  }

  getMessage (messageKey) {
    let locale = this.locale
    let fallbackIndex = 0
    while (locale) {
      // Iterate through locales starting at most-specific until
      // localization is found. As in fi-Latn-FI, fi-Latn and fi.
      let localeParts = locale.split('-')
      let localePartIndex = localeParts.length

      do {
        let tryingLocale = localeParts.slice(0, localePartIndex).join('-')

        let message = this.messageStore.getMessage(messageKey, tryingLocale)

        if (message) {
          return message
        }

        localePartIndex--
      } while (localePartIndex)

      if (locale === this.finalFallback) {
        break
      }

      locale = (FALLBACKS[ this.locale ] && FALLBACKS[ this.locale ][ fallbackIndex ]) || this.finalFallback
      fallbackIndex++
    }
    return messageKey
  }
}
