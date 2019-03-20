
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
        return new Promise((resolve, reject) => {
          target.client[name](params, (err, res) => {
            if (!err) {
              if (res.status === 200) {
                resolve(res.json || res)
                // if (res.json) {
                //   if (res.json.error_message) {
                //     throw new Error(res.json.error_message)
                //   }
                //   resolve(res.json)
                // } else {
                //   resolve(res)
                // }
              } else {
                reject(res)
              }
              // Handle response.
            } else if (err === 'timeout') {
              reject('Timeout error')
              // Handle timeout.
            } else if (err.json) {
              // reject(err.json)
              throw new Error(res.json.error_message)
              // Inspect err.status for more info.
            } else {
              reject('Network error')
              // Handle network error.
            }
          })
        })
      }
      // return async (params) => {
        // let res = await (target.client[name](params).asPromise())


        // if (res.status === 200) {
        //   if (res.json) {
        //     if (res.json.error_message) {
        //       throw new Error(res.json.error_message)
        //     }
        //     return res.json
        //   } else {
        //     return res
        //   }
        // } else {
        //   throw new Error('Error in google maps request', res)
        // }
      // }
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

  async placesPhotoUrls (options = {}) {
    const place = await this.place({
      placeid: options.place_id,
      fields: [ 'photo' ]
    })

    if (!place || !place.result) {
      return []
    }

    let photos = (place.result.photos || []).slice(0, options.limit || 5).map(item => item.photo_reference)
    return this.parsePhotoReferences(photos, options)
  }

  async parsePhotoReferences (references, options = {}) {
    const promises = []
    const urls = []
    for (let reference of references) {
      let promise = this.placesPhoto({
        photoreference: reference,
        maxwidth: options.maxwidth || 3000,
        maxheight: options.maxheight || 3000,
      }).catch(() => {})

      promises.push(promise.then(res => {
        res && res.requestUrl && urls.push(res.requestUrl)
      }))
    }
    await Promise.all(promises)
    return urls
  }

  parseAddress (place, fields) {
    if (!place.address_components) {
      return {}
    }
    const returnData = {}
    let parsedAddressFields = Object.assign({
      street_number: 'short_name',
      route: 'long_name',
      locality: 'long_name',
      administrative_area_level_1: 'short_name',
      administrative_area_level_2: 'short_name',
      administrative_area_level_3: 'short_name',
      postal_code: 'short_name',
      address_line_2: 'establishment'
    }, fields)

    // Get each component of the address from the place details
    for (let addressCmp of place.address_components) {
      const addressType = addressCmp.types[0]

      if (parsedAddressFields[addressType]) {
        const val = addressCmp[parsedAddressFields[addressType]]
        returnData[addressType] = val
      }
      if (addressType === 'country') {
        returnData.country = addressCmp['long_name']
        returnData.country_code = addressCmp['short_name']
      }
    }
    returnData.latitude = place.geometry.location.lat
    returnData.longitude = place.geometry.location.lng
    return returnData
  }
}
module.exports = GoogleMaps