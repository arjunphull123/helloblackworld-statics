import * as d3 from 'd3'

import * as fs from 'fs'

// Read the existing json file
const data = JSON.parse(fs.readFileSync('life_income.json', 'utf-8'))

// Create an empty array to store the structured data
const structuredData = []

// Iterate through each year in the data
for (let year in data) {
    // Create an object to store the data for the current year
    const yearObject = {
        year: year,
        races: [
            {
                race: "white",
                life_exp: data[year].white_le,
                income: data[year].white_income
            },
            {
                race: "black",
                life_exp: data[year].black_le,
                income: data[year].black_income
            },
            {
                race: "all",
                life_exp: data[year].all_le,
                income: data[year].all_income
            }
        ]
    }
    // Add the year object to the structured data array
    structuredData.push(yearObject)
}

// Write the structured data array to a new json file
fs.writeFileSync('new_data.json', JSON.stringify(structuredData))
