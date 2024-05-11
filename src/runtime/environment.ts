import { RuntimeValue } from "./values"


export default class Environment {
    
    private parent: Environment | null
    private variables: Map<string, RuntimeValue>


    constructor(parent: Environment | null) {
        this.parent = parent
        this.variables = new Map()
    }

    public declareVariable(varname: string, value: RuntimeValue): void {
        if (this.variables.has(varname)) {
            throw new Error("Variable already declared: " + varname)
        }
        this.variables.set(varname, value)
    }
    public assignVariable(varname: string, value: RuntimeValue): void {
        const env = this.resolve(varname)
        env.variables.set(varname, value)
        
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
    public lookup(varname: string): RuntimeValue {
        const env = this.resolve(varname)
        return env.variables.get(varname) as RuntimeValue
    }
 
}