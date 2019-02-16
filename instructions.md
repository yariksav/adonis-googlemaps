

## Installation

```js
adonis install adonis-googlemaps
```

## Registering provider

The provider is registered inside `start/app.js` file under `providers` array.

```js
const providers = [
  'adonis-googlemaps/providers/GoogleMapsProvider'
]
```

## Configuration and Environment variables

The configuration file is saved as `config/services.js`, feel free to tweak it according.

```js
{
  googlemaps: {
    key: YOUR_GOOGLEMAPS_API_KEY
  }
}
```
Also make sure to define sensitive driver details inside the `.env` file and reference them via `Env` provider.
