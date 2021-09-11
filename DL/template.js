function mutationFunction(phenotype) {
	//random 1-4
	var mutation = Math.floor(Math.random() * 4) + 1
	if (mutation == 1) {
		phenotype.score++
	}
	return phenotype
}

function crossoverFunction(phenotypeA, phenotypeB) {
	// move, copy, or append some values from a to b and from b to a
	return [phenotypeA, phenotypeB]
}

function fitnessFunction(phenotype) {
	var score = 0
	score = phenotype.score
	return score
}

var firstPhenotype = {
	x: 0,
	y: 0,
	score: 0

	// enter phenotype data here
}

var geneticAlgorithmConstructor = require('geneticalgorithm')
var geneticAlgorithm = geneticAlgorithmConstructor({
	mutationFunction: mutationFunction,
	crossoverFunction: crossoverFunction,
	fitnessFunction: fitnessFunction,
	population: [firstPhenotype],
	populationSize: 300,
});

console.log("Starting with:")
console.log(firstPhenotype)
for (var i = 0; i < 5000; i++) geneticAlgorithm.evolve()
var best = geneticAlgorithm.best()
var phenotypeList = geneticAlgorithm.population()
console.log("Finished with:")
console.log(best)
console.log("Population:")
console.log(phenotypeList)