import { pow, print as _print, println } from "./natives-functions"
import { Create, NumberValue, RuntimeValue, Variable } from "./values"

export function createGlobalScope(): Environment {
    const env = new Environment(null)
    env.declareVariable("null", Create.null(), true)
    env.declareVariable("true", Create.bool(true), true)
    env.declareVariable("false", Create.bool(false), true)

    // define a native function

    env.declareVariable("println", Create.nativeFn(println), true)
    env.declareVariable("print", Create.nativeFn(_print), true)
    env.declareVariable("pow", Create.nativeFn(pow), true)
    env.declareVariable("date", Create.nativeFn((args, env) => Create.number(Date.now())), true)

    return env
}

export default class Environment {
    
    private parent: Environment | null
    private variables: Map<string, Variable>

    constructor(parent: Environment | null) {
        this.parent = parent
        this.variables = new Map()

    }

    public declareVariable(varname: string, value: RuntimeValue, constant: boolean): void {
        if (this.variables.has(varname)) {
            throw new Error("Variable already declared: " + varname)
        }
        this.variables.set(varname, Create.var(value, constant))
    }
    public assignVariable(varname: string, value: RuntimeValue): RuntimeValue {
        const env = this.resolve(varname)
        if (env.lookup(varname).constant) {
            throw new Error("Cannot assign value to constant")
        }
        env.variables.set(varname, Create.var(value, env.lookup(varname).constant))
        return value
    }
    // finds variable in outer scopes
    public resolve(varname: string): Environment {
        //check current scope
        if (this.variables.has(varname)) {
            return this
        }

        // if parent doesn't exist then we cant check any more so
        // throw error
        if (!this.parent) {
            process.exitCode = 105 
            throw new Error("Variable doesn't exist in reachable scopes")
        }
        // call the parent's resolve to find the variable in that scope
        return this.parent.resolve(varname)
    }
    public lookup(varname: string): Variable {
        const env = this.resolve(varname)
        return env.variables.get(varname) as Variable
    }
 
}