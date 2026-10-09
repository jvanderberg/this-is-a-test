# Data sources

## CTA "L Stops" (rail platforms near Oak Park)
- Source: City of Chicago Data Portal, dataset 8mj8-j3c4 (CTA L Stops)
- URL: https://data.cityofchicago.org/resource/8mj8-j3c4.json
- Retrieved: date of the download in this project session (not recorded precisely; re-fetch to refresh)
- Filter: rows whose coordinates fall in lat 41.86–41.92, lon -87.82 to -87.76
  (a box around Oak Park), giving 18 platform rows across Austin, Central,
  Forest Park, Harlem, Harlem/Lake, Oak Park and Ridgeland stations.
- Kept fields: stop_id, direction, stop name, station, map_id, ADA flag,
  line flags, lat/lon. Output: data/cta_l_stops_oak_park.json

## Not yet included
- CTA bus stops: the CTA GTFS zip (transitchicago.com) is over the 25 MiB download limit.
- Pace bus GTFS: the URL tried (pacebus.com/gtfs/google_transit.zip) returned 404.
- Live arrivals: need a CTA Train Tracker API key, not added yet.

## Coverage note
The bounding box is a rough rectangle, so it also catches stations outside Oak Park
(Austin is in Chicago; Harlem/Lake and Austin sit on the city edge). Tighten the filter if strict Oak Park-only is wanted.
