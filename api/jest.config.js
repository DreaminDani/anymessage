module.exports = {
	"transform": {
		".(ts|tsx)": "ts-jest"
	},
	"testRegex": "(\\.(test|spec))\\.(ts|tsx|js)$",
	"moduleFileExtensions": [
		"ts",
		"tsx",
		"js",
		"json"
	],
	"collectCoverage": true,
	"collectCoverageFrom": [
		"src/**/*.ts",
		"!**/*.d.ts",
		"!**/dist/**"
	]
};