
//Visualization inspired from Hans Rosling's famous GapMinder Visualization of World Income and Life Expectancy Distribution visualization (2020)
// Javascript library used: D3.js by Bostock (2022): https://github.com/d3/d3
//Code adapted from Adam Janes (2020): https://github.com/adamjanes/udemy-d3/tree/master/05
//Assistance taken from ChatGPT to refine and debug code 


// Get the screen dimensions
const screenWidth = (window.innerWidth)/1.3;
const screenHeight = (window.innerHeight)/1.3;

//set the margins

const MARGIN = { LEFT: 100, RIGHT: 100, TOP: 50, BOTTOM: 100 }

// Set the width and height of the SVG container based on the screen dimensions
const WIDTH = screenWidth - MARGIN.LEFT - MARGIN.RIGHT;
const HEIGHT = screenHeight - MARGIN.TOP - MARGIN.BOTTOM;



const svg = d3.select("#chart-area").append("svg")
  .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
  .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)


// Create a tooltip object
const tip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-10, 0])
    .html(d => {
        return `Income: $${d.income}<br>Life Expectancy: ${d.life_exp} years`;
    });


const g = svg.append("g")
  .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)

let time = 0

// Scales
const x = d3.scaleLinear()
  .range([0, WIDTH])
  .domain([30000, 80000])

const y = d3.scaleLinear()
	.range([HEIGHT, 0])
	.domain([60, 90])


// Labels
const xLabel = g.append("text")
	.attr("y", HEIGHT + 50)
	.attr("x", WIDTH / 2)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.attr("class", "xLabel")
	.text("MEDIAN FAMILY INCOME IN DOLLARS.")

const yLabel = g.append("text")
	.attr("transform", "rotate(-90)")
	.attr("y", -40)
	.attr("x", -270)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.attr("class", "yLabel")
	.text("LIFE EXPECTANCY IN YEARS.")

const timeLabel = g.append("text")
	.attr("y", HEIGHT - 10)
	.attr("x", WIDTH - 55)
	.attr("font-size", "40px")
	.attr("opacity", "1")
	.attr("class", "timeLabel")
	.attr("text-anchor", "middle")
	.text("1980")

// X Axis
const xAxisCall = d3.axisBottom(x)
    .tickValues(d3.range(30000, 80000, 10000))
    .tickSize(10)
    .tickFormat(d3.format("$"));
g.append("g")
	.attr("class", "xaxis")
	.attr("transform", `translate(0, ${HEIGHT})`)
	.call(xAxisCall)
	.selectAll(".tick text")
		.style("font-size", "12px")
		.attr("class", "xTickText")

// Y Axis
const yAxisCall = d3.axisLeft(y)
	.tickValues([60,65,70,75,80,85,90])
	.tickSize(10)
g.append("g")
	.attr("class", "yaxis")
	.call(yAxisCall)
	.selectAll(".tick text")
		.style("font-size", "12px")
		.attr("class", "yTickText")

// Invoke the tooltip on the SVG container
g.call(tip);


const xGridlines = d3.axisBottom(x)
  .tickValues([30000,40000,50000,60000,70000,80000])
  .tickSize(-HEIGHT)
  .tickFormat("")

const yGridlines = d3.axisLeft(y)
  .tickValues([60,65,70,75,80,85,90])
  .tickSize(-WIDTH)
  .tickFormat("")

g.append("g")
  .attr("class", "grid")
  .attr("transform", `translate(0, ${HEIGHT})`)
  .call(xGridlines)

g.append("g")
  .attr("class", "grid")
  .call(yGridlines)

// add legends 

const legend = g.append("g")
  .attr("transform", `translate(15, 15)`)
  .attr("class", 'legend')

legend.append("rect")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", 10)
  .attr("height",10) 
  .attr("fill", "#003A63")
legend.append("text")
  .attr("x", 20)
  .attr("y", 10)
  .attr("class", "legendText")
  .text(" African Americans")

legend.append("rect")
  .attr("x", 0)
  .attr("y", 20)
  .attr("width", 10)
  .attr("height",10)
  .attr("fill", "#C79316")
legend.append("text")
  .attr("x", 20)
  .attr("y", 30)
  .attr("class", "legendText")
  .text(" White Americans")

legend.append("rect")
  .attr("x", 0)
  .attr("y", 40)
  .attr("width", 10)
  .attr("height",10)
  .attr("fill", "#B21112")
legend.append("text")
  .attr("x", 20)
  .attr("y", 50)
  .attr("class", "legendText")
  .text("All races")

d3.json("../data/current_data.json").then(function(data){
	// clean data
	const formattedData = data.map(year => {
		return year["races"].filter(race => {
			const dataExists = (race.income && race.life_exp)
			return dataExists
		}).map(race => {
			race.income = Number(race.income)
			race.life_exp = Number(race.life_exp)
			return race
		})
	})

	// run the code every 0.1 second
	d3.interval(function(){
    time = (time < formattedData.length-1) ? time + 1 : 0 
    update(formattedData[time])
    timeLabel.text(String(time + 1980))
}, 150)



	// first run of the visualization
	update(formattedData[0])
})

function update(data) {
	// standard transition time for the visualization
	const t = d3.transition()
		.duration(500)
		.ease(d3.easeLinear)

	

	// JOIN new data with old elements.
	const circles = g.selectAll("circle")
		.data(data, d => d.race)

	// EXIT old elements not present in new data.
	circles.exit().remove()

	// ENTER new elements present in new data.
	circles.enter().append("circle")
		.attr("class","circle")
		.attr("fill", d => {
            if (d.race === "white") {
                return "#C79316";
            } else if (d.race === "black") {
                return "#003A63";
            } else if (d.race === "all") {
                return "#B21112";}
})
		.on("mouseover", tip.show)
		.on("mouseout", tip.hide)
		.merge(circles)
		.transition(t)
			.attr("cy", d => y(d.life_exp))
			.attr("cx", d => x(d.income))
			.attr("r", 25)

	// update the time label
	timeLabel.text(String(time + 1980))
			}