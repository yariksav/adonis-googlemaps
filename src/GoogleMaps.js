
const proxyHandler = {
  get (target, name) {
    /**
     * if node is inspecting then stick to target properties
     */
    if (typeof (name) === 'symbol' || name === 'inspect') {
      return target[name]
    }

    /**
     * If a faker object exists, give preference to it over
     * the actual methods
     */
    // if (target._fake && target._fake[name] !== undefined) {
    //   debug('fake.' + name)
    //   return typeof (target._fake[name]) === 'function' ? target._fake[name].bind(target._fake) : target._fake[name]
    // }

    // console.log('name', name)
    if (target.client && target.client[name] !== undefined) {
      return async (params) => {
        let res = await (target.client[name](params).asPromise())

        if (res.status === 200 && res.json) {
          if (res.json.error_message) {
            throw new Error(res.json.error_message)
          }
          return res.json
        } else {
          throw new Error('Error in google maps request')
        }
      }
    }
    return target[name]
  }
}

class GoogleMaps {
  constructor (Config) {
    this.key = Config.get('services.googlemaps.key')

    this.client = require('@google/maps').createClient({
      key: this.key,
      Promise: Promise
    });

    this._proxyHandler = new Proxy(this, proxyHandler)
    return this._proxyHandler
  }

}
module.exports = GoogleMaps