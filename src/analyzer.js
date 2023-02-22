import fs from "fs"
import ohm from "ohm-js"
import * as core from "./core.js"

// Throw an error message that takes advantage of Ohm's messaging
function error(message, node) {
  if (node) {
    throw new Error(`${node.source.getLineAndColumnMessage()}${message}`)
  }
  throw new Error(message)
}

const chloeGrammar = ohm.grammar(fs.readFileSync("src/chloe.ohm"))

export default function analyze(sourceCode) {
    const context = {
        locals: new Map(),
    }
  const analyzer = chloeGrammar.createSemantics().addOperation("rep", {
    Program(body) {
      return new core.Program(body.rep())
    },
    PrintStmt(_show, _left, argument, _right, _pls) {
      return new core.PrintStatement(argument.rep())
    },
    VarDec(_toy, identifier, _eq, initializer, _pls) {
        const name = identifier.rep()
        if(context.locals.has(name)){
            error(`Redeclared var: ${variable}`,identifier)
        }
      return new core.VariableDeclaration(variable, initializer.rep())
    },
    AssignStmt(target, _eq, source, _bird) {
        const name = target.rep()
        const variable = context.locals.get(name)
        if(!variable){
            error(`Undecalred Variable: ${name}`,target)
        }
      return new core.AssignmentStatement(variable, source.rep())
    },
    IfStmt(_dress, test, consequent, _nodress, alternate) {
      return new core.IfStatement(test.rep(), consequent.rep(), alternate.rep())
    },
    id(chars) {
      return this.sourceString
    },
    Var(id) {
      return id.rep()
    },
    Exp_add(left, _plus, right) {
      return new core.BinaryExpression("+", left.rep(), right.rep())
    },
    Exp_sub(left, _plus, right) {
      return new core.BinaryExpression("-", left.rep(), right.rep())
    },
    Term_parens(_open, expression, _close) {
      return expression.rep()
    },
    numeral(_leading, _dot, _fractional) {
      return Number(this.sourceString)
    },
    strlit(_open, chars, _close) {
      return new core.StringLiteral(chars.sourceString)
    },
    _iter(...children) {
      return children.map((child) => child.rep())
    },
  })

  const match = chloeGrammar.match(sourceCode)
  if (!match.succeeded()) error(match.message)
  return analyzer(match).rep()
}