import React from 'react'

import { addSection } from 'test-ui/core/UiTester'

import MiniWorldMap from 'app/ui/widget/MiniWorldMap'


const mapWidth = 280

addSection('MiniWorldMap')
    .add('degrees', context => (
        <div style={{ width: mapWidth, background: '#263238' }}>
            <MiniWorldMap
                width={mapWidth}
                pins={[
                    { lat: 0, lon: -180 },
                    { lat: 0, lon: -135 },
                    { lat: 0, lon: -90 },
                    { lat: 0, lon: -45 },
                    { lat: 0, lon: 0 },
                    { lat: 0, lon: 45 },
                    { lat: 0, lon: 90 },
                    { lat: 0, lon: 135 },
                    { lat: 0, lon: 180 },

                    { lat: -60, lon: 0 },
                    { lat: -40, lon: 0 },
                    { lat: -20, lon: 0 },
                    { lat: 20, lon: 0 },
                    { lat: 40, lon: 0 },
                    { lat: 60, lon: 0 },
                ]}
            />
        </div>
    ))
    .add('continent edges', context => (
        <div style={{ width: mapWidth, background: '#263238' }}>
            <MiniWorldMap
                width={mapWidth}
                pins={[
                    // continents / countries

                    { lat:  58.582582, lon:   -4.033830 },  // North of Great Britain

                    { lat:  48.998988, lon: -103.085194 },  // North of USA
                    { lat:  26.728834, lon:  -80.034238 },  // East of Florida
                    { lat:  25.841209, lon:  -97.410013 },  // South of USA
                    { lat:  42.834615, lon: -124.544733 },  // West of USA

                    { lat:  12.402549, lon:  -71.573966 },  // North of South America
                    { lat:  -7.187764, lon:  -34.790504 },  // East of South America
                    { lat:  -4.650940, lon:  -81.293384 },  // West of South America
                    { lat: -55.720941, lon:  -68.065568 },  // South of South America

                    { lat:  37.346938, lon:    9.744717 },  // North of Africa
                    { lat:  14.742723, lon:  -17.528281 },  // West of Africa
                    { lat: -34.833189, lon:   20.000145 },  // South of africa
                    { lat:  11.827773, lon:   51.289445 },  // East of Africa

                    { lat: -10.725022, lon:  142.483014 },  // North of Australia
                    { lat: -28.645667, lon:  153.632757 },  // East of Australia
                    { lat: -39.134874, lon:  146.377443 },  // South of Australia
                    { lat: -24.470352, lon:  113.399441 },  // West of Australia

                    // Islands

                    { lat:  80.457875, lon:   19.814836 },  // North of Spitzbergen
                    { lat:  59.773999, lon:  -43.901510 },  // South of greenland
                    { lat:  20.729196, lon: -157.081605 },  // Hawaii
                    { lat: -49.332006, lon:   69.475556 },  // Kerguelen
                ]}
            />
        </div>
    ))
