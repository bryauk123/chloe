import assert from "assert/strict"
import fs from "fs"
import ohm from "ohm-js"

const syntaxChecks = [
  ["all numeric literal forms", "show(8 * 89.123)pls"],
  ["complex expressions", "show(83 * ((2-(3 + 1))))pls"],
  ["all unary operators", "show (-3)pls"],
  ["all binary operators", "show (x + 2 -3)pls"],
  ["end of program inside comment", "show(0)pls // yay"],
  ["comments with no text are ok", "show(1)pls//\nshow(0)pls//"],
  ["non-Latin letters in identifiers", "コンパイラ is 100pls"],
]

const syntaxErrors = [
  ["non-letter in an identifier", "ab😭c is 2", /Line 1, col 3/],
  ["malformed number", "xis 2.", /Line 1, col 6/],
  ["missing pls", "x is 3", /Line 1, col 7/],
  ["a missing right operand", "show(5 -", /Line 1, col 9/],
  ["a non-operator", "show(7 * ((2 _ 3)", /Line 1, col 14/],
  ["an expression starting with a )", "x is )pls", /Line 1, col 6/],
  ["a statement starting with expression", "x * 5pls", /Line 1, col 3/],
  ["an illegal statement on line 2", "show(5)pls\nx * 5pls", /Line 2, col 3/],
  ["a statement starting with a )", "show(5)pls\n) * 5pls", /Line 2, col 1/],
  ["an expression starting with a *", "x is * 71pls", /Line 1, col 6/],
]

describe("The grammar", () => {
  const grammar = ohm.grammar(fs.readFileSync("src/chloe.ohm"))
  for (const [scenario, source] of syntaxChecks) {
    it(`properly specifies ${scenario}`, () => {
      assert(grammar.match(source).succeeded())
    })
  }
  for (const [scenario, source, errorMessagePattern] of syntaxErrors) {
    it(`does not permit ${scenario}`, () => {
      const match = grammar.match(source)
      assert(!match.succeeded())
      assert(new RegExp(errorMessagePattern).test(match.message))
    })
  }
})