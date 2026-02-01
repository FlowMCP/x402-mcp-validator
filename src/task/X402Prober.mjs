class X402Prober {


    static async probe( { client, tools, timeout } ) {
        const messages = []
        const restrictedCalls = []
        const paymentOptions = []

        if( !Array.isArray( tools ) || tools.length === 0 ) {
            messages.push( 'PRB-005 probe: No tools available to probe' )

            return { status: false, messages, restrictedCalls, paymentOptions }
        }

        await X402Prober.#probeSequentially( { client, toolsToProbe: tools, index: 0, messages, restrictedCalls, paymentOptions, timeout } )

        const status = true

        return { status, messages, restrictedCalls, paymentOptions }
    }


    static async #probeSequentially( { client, toolsToProbe, index, messages, restrictedCalls, paymentOptions, timeout } ) {
        if( index >= toolsToProbe.length ) {
            return
        }

        const tool = toolsToProbe[index]
        const { restricted, paymentRequired } = await X402Prober.#probeTool( { client, tool, timeout } )

        if( restricted && paymentRequired ) {
            const toolName = tool['name']
            restrictedCalls.push( { toolName, paymentRequired } )

            const accepts = paymentRequired['accepts']

            if( Array.isArray( accepts ) ) {
                accepts
                    .forEach( ( option ) => {
                        paymentOptions.push( option )
                    } )
            }
        } else if( restricted === null ) {
            const toolName = tool['name']
            messages.push( `PRB-004 probe(${toolName}): Unexpected exception` )
        }

        await X402Prober.#probeSequentially( { client, toolsToProbe, index: index + 1, messages, restrictedCalls, paymentOptions, timeout } )
    }


    static async #probeTool( { client, tool, timeout } ) {
        const toolName = tool['name']
        const args = X402Prober.#buildMinimalArgs( { tool } )

        try {
            await client.callTool( { name: toolName, arguments: args }, { timeout } )

            return { restricted: false, paymentRequired: null }
        } catch( error ) {
            const { is402, paymentRequired } = X402Prober.#parse402Error( { error } )

            if( is402 ) {
                return { restricted: true, paymentRequired }
            }

            return { restricted: false, paymentRequired: null }
        }
    }


    static #buildMinimalArgs( { tool } ) {
        const schema = tool['inputSchema']

        if( !schema || typeof schema !== 'object' ) {
            return {}
        }

        const properties = schema['properties'] || {}
        const required = schema['required'] || []
        const args = {}

        required
            .forEach( ( key ) => {
                const prop = properties[key]

                if( !prop ) {
                    args[key] = ''

                    return
                }

                const type = prop['type']

                if( type === 'string' ) {
                    args[key] = 'test'
                } else if( type === 'number' || type === 'integer' ) {
                    args[key] = 0
                } else if( type === 'boolean' ) {
                    args[key] = false
                } else if( type === 'array' ) {
                    args[key] = []
                } else if( type === 'object' ) {
                    args[key] = {}
                } else {
                    args[key] = ''
                }
            } )

        return args
    }


    static #parse402Error( { error } ) {
        const code = error['code'] || error['statusCode']
        const is402Code = code === 402 || code === -32402

        if( !is402Code ) {
            return { is402: false, paymentRequired: null }
        }

        const data = error['data']

        if( data === undefined || data === null ) {
            return { is402: true, paymentRequired: null }
        }

        if( typeof data !== 'object' || Array.isArray( data ) ) {
            return { is402: true, paymentRequired: null }
        }

        return { is402: true, paymentRequired: data }
    }
}


export { X402Prober }
