import fs from "fs"
import ohm from "ohm-js"
import * as core from "./core.js"

const chloeGrammar = ohm.grammar(fs.readFileSync("src/chloe.ohm"))

export default function analyze(sourceCode) {
    const match = chloeGrammar.match(sourceCode)
    if (!match.succeeded()) error(match.message)
    //console.log("You're good!")

}
