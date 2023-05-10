import fs from "fs";
import ohm from "ohm-js";
import * as core from "./core.js";

// Throw an error message that takes advantage of Ohm's messaging
function must(condition, errorMessage) {
  if (!condition) {
    throw new Error(errorMessage);
  }
}

function mustBeANumber(e) {
  must(e.type === core.Type.NUMBER, "Number expected");
}

function mustBeABoolean(e) {
  must(e.type === core.Type.BOOLEAN, "Boolean expected");
}

function mustBeAnArray(e) {
  must(e.type instanceof core.ArrayType, "Array expected");
}

function mustBeDeclared(e, id) {
  must(!!e, `${id.sourceString} not declared`);
}

function mustBeAssignable(source, targetType) {
  must(
    source.type === targetType ||
      (source.type instanceof core.ArrayType &&
        targetType instanceof core.ArrayType &&
        source.type.baseType === targetType.baseType),
    "Type mismatch"
  );
}

function mustAllBeSameType(elements) {
  const firstType = elements[0].type;
  const allSameType = elements.slice(1).every((e) => e.type === firstType);
  must(allSameType, "Mixed types in array");
}

const chloeGrammar = ohm.grammar(fs.readFileSync("src/chloe.ohm"));

class Context {
  constructor() {
    this.locals = new Map();
  }
  add(name, entity) {
    this.locals.set(name, entity);
  }
  lookup(name) {
    return this.locals.get(name);
  }
}

export default function analyze(match) {
  const context = new Context();
  const analyzer = match.matcher.grammar.createSemantics().addOperation("rep", {
    Program(body) {
      return new core.Program(body.rep());
    },
    PrintStmt(_show, _left, argument, _right, _pls) {
      return new core.PrintStatement(argument.rep());
    },
    VarDec(_toy, identifier, _eq, initializer, _pls) {
      const name = identifier.rep();
      if (context.locals.has(name)) {
        error(`Redeclared var: ${variable}`, identifier);
      }
      return new core.VariableDeclaration(variable, initializer.rep());
    },
    WhileStmt(_washingHands, exp, block) {
      const test = exp.rep();
      mustBeABoolean(test);
      const body = block.rep();
      return new core.WhileStmt(test, body);
    },
    AssignStmt(target, _eq, source, _pls) {
      const name = target.rep();
      const variable = context.locals.get(name);
      if (!variable) {
        error(`Undeclared Variable: ${name}`, target);
      }
      return new core.AssignmentStatement(variable, source.rep());
    },
    IfStmt(_dress, test, consequent, _nodress, alternate) {
      return new core.IfStatement(
        test.rep(),
        consequent.rep(),
        alternate.rep()
      );
    },
    Var(id) {
      const entity = context.lookup(id.sourceString);
      mustBeDeclared(entity, id);
      return entity;
    },
    Exp_add(left, _plus, right) {
      return new core.BinaryExpression("+", left.rep(), right.rep());
    },
    Exp_sub(left, _plus, right) {
      return new core.BinaryExpression("-", left.rep(), right.rep());
    },
    Exp_mult(left, _plus, right) {
      return new core.BinaryExpression("*", left.rep(), right.rep());
    },
    Exp_div(left, _plus, right) {
      return new core.BinaryExpression("/", left.rep(), right.rep());
    },
    Term_parens(_open, expression, _close) {
      return expression.rep();
    },
    numeral(_whole, _point, _fraction, _e, _sign, _exponent) {
      return Number(this.sourceString);
    },
    strlit(_open, chars, _close) {
      return this.sourceString;
    },
    _iter(...children) {
      return children.map((child) => child.rep());
    },
  });

  return analyzer(match).rep();
}
