'use strict'

/**
 * adonis-googlemaps
 *
 * (c) Yaroslav Savaryn <yariksav@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const { ServiceProvider } = require('@adonisjs/fold')

class GoogleMapsProvider extends ServiceProvider {
  register () {
    this.app.singleton('Adonis/Addons/GoogleMaps', (app) => {
      const Config = app.use('Adonis/Src/Config')
      const GoogleMaps = require('../src/GoogleMaps')
      return new GoogleMaps(Config)
    })

    this.app.alias('Adonis/Addons/GoogleMaps', 'GoogleMaps')
  }
}

module.exports = GoogleMapsProvider
