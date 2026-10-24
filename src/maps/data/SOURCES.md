# World map data

Bundled with the app (no map server, nothing fetched at runtime). Built 24 Oct 2026.

| File | Source | Licence |
|---|---|---|
| `world.json` | [Natural Earth](https://www.naturalearthdata.com/) 1:110m Admin 0 Countries (`ne_110m_admin_0_countries.geojson` from github.com/nvkelso/natural-earth-vector), TopoJSON simplified with [mapshaper](https://github.com/mbloch/mapshaper); Antarctica and open-ocean territories left out | Public domain |
| `countries.json` | Facts per country on the map. Capitals: Natural Earth 1:10m populated places (German and French names). Population: Natural Earth admin-0 `POP_EST` (estimates for 2019, see `popYear`). Area, languages (ISO 639-3), currencies (ISO 4217), neighbours, landlocked: [mledoze/countries](https://github.com/mledoze/countries) | Public domain; mledoze/countries: ODbL 1.0, "© mledoze/countries contributors" |
| Flags | [flag-icons](https://github.com/lipis/flag-icons) npm package (4×3 SVGs), loaded per country when it is tapped | MIT |

Language and money names are not stored: the browser gives them in the app's language (`Intl.DisplayNames`).
The map's code uses [d3-geo](https://github.com/d3/d3-geo) and [topojson-client](https://github.com/topojson/topojson-client) (both ISC).

Kept properties in `world.json`: `iso` (ISO 3166-1 alpha-2), `cont` (continent), `de`, `en`, `fr` (names).

## Corrections to the source data

- Natural Earth gives Northern Cyprus and Somaliland no country code (both `-99`). They are shown as part of
  Cyprus and Somalia, as most school atlases do.
- Capitals corrected: Tanzania → Dodoma (not Dar es Salaam), Benin → Porto-Novo (not Cotonou), Kazakhstan →
  Astana (renamed back in 2022), Sri Lanka → Sri Jayawardenepura Kotte (not Colombo).
- Sri Lanka has no neighbours by land (the source listed India, only one way).

## Rebuilding `world.json`

In a scratch folder, with the Natural Earth file downloaded there:

```sh
npx mapshaper ne_110m_admin_0_countries.geojson -filter 'CONTINENT !== "Antarctica" && CONTINENT !== "Seven seas (open ocean)"' -each 'iso=ISO_A2_EH, cont=CONTINENT, de=NAME_DE, en=NAME_EN, fr=NAME_FR' -filter-fields iso,cont,de,en,fr -simplify 40% keep-shapes -o world.json format=topojson quantization=10000
```

Then apply the corrections above (the `-99` shapes take the code and names of Cyprus and Somalia).
