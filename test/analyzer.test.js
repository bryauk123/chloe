import assert from "assert/strict";
import parse from "../src/parser.js";
import analyze from "../src/analyzer.js";
import * as core from "../src/core.js";

const goodPrograms = [
  ["comparisons", "show(3 < 5)pls"],
  ["additions", "show(7 - 2 + 5)pls"],
  ["exponentiations", "show(7 ** 3 ** 2.5 ** 5)pls"],
  ["negations", "show(7 * (-3))pls"],
  ["declared variables", "toy x is 3pls show(x * 5)pls"],
  ["assign nums", "toy x is 3pls x is 10 ** (7-2)pls"],
  ["assign bools", "toy x is 3pls x is 10 ** (7-2)pls"],
];

const badPrograms = [
  ["bad types in addition", "show(false + 1)pls", /Number expected/],
  ["bad types in multiplication", 'show("x" * 5)pls', /Number expected/],
  ["non-boolean while test", "washingHands 3 {}", /Boolean expected/],
  ["undeclared in print", "show(x)pls", /x not declared/],
  ["undeclared in add", "show(x + 5)pls", /x not declared/],
  ["undeclared in negate", "show(-z)pls", /z not declared/],
  ["assign bool to a number", "toy x is 1pls x is falsepls", /Type mismatch/],
  ["arrays of mixed types", `toy a is [2, "dog"]pls`, /Mixed types in array/],
];

describe("The analyzer", () => {
  for (const [scenario, source] of goodPrograms) {
    it(`recognizes ${scenario}`, () => {
      assert.ok(analyze(parse(source)));
    });
  }

  for (const [scenario, source, errorMessagePattern] of badPrograms) {
    it(`throws on ${scenario}`, () => {
      assert.throws(() => analyze(parse(source)), errorMessagePattern);
    });
  }

  it("builds a proper representation of the simplest program", () => {
    const rep = analyze(parse("print 0;"));
    assert.deepEqual(rep, new core.Program([new core.PrintStmt(0)]));
  });
});