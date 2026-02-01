import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'


const MCP_URL = process.env.MCP_SERVER_URL || 'https://x402.flowmcp.org/mcp/streamable'


const buildMinimalArgs = ( { tool } ) => {
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


const run = async () => {
    console.log( `\n  Connecting to: ${MCP_URL}\n` )

    const transport = new StreamableHTTPClientTransport( new URL( MCP_URL ) )
    const client = new Client( { name: 'debug-x402', version: '0.1.0' } )

    const serverInfo = await client.connect( transport )
    console.log( '  === Server Info ===' )
    console.log( JSON.stringify( serverInfo, null, 4 ) )

    console.log( '\n  === Capabilities ===' )
    console.log( JSON.stringify( client['serverCapabilities'], null, 4 ) )

    const toolsResult = await client.listTools()
    const tools = toolsResult['tools'] || []
    console.log( `\n  === Tools (${tools.length}) ===\n` )

    const toolIndex = []

    tools
        .forEach( ( tool, i ) => {
            toolIndex.push( { index: i, name: tool['name'] } )
            console.log( `  [${i}] ${tool['name']}` )
            console.log( `      Description: ${tool['description']}` )
            console.log( `      InputSchema: ${JSON.stringify( tool['inputSchema'] )}` )
            console.log( '' )
        } )

    console.log( '  === Probing each tool ===\n' )

    const results = []

    for( const tool of tools ) {
        const args = buildMinimalArgs( { tool } )
        const name = tool['name']

        console.log( `  --- ${name} ---` )
        console.log( `      Args: ${JSON.stringify( args )}` )

        try {
            const result = await client.callTool( { name, arguments: args }, { timeout: 15000 } )
            console.log( `      Result Type: success` )
            console.log( `      Result: ${JSON.stringify( result, null, 4 )}` )

            results.push( { name, type: 'success', result } )
        } catch( error ) {
            const code = error['code'] || error['statusCode'] || null
            const message = error['message'] || String( error )
            const data = error['data'] || null

            console.log( `      Error Code: ${code}` )
            console.log( `      Error Message: ${message}` )
            console.log( `      Error Data: ${JSON.stringify( data, null, 4 )}` )

            const errorKeys = Object.keys( error )
            console.log( `      Error Keys: [${errorKeys.join( ', ' )}]` )

            if( code === 402 || code === -32402 ) {
                console.log( `      >>> 402 DETECTED <<<` )
                console.log( `      Full Error Object:` )
                console.log( JSON.stringify( error, null, 4 ) )
            }

            results.push( { name, type: 'error', code, message, data, allKeys: errorKeys } )
        }

        console.log( '' )
    }

    console.log( '  === Summary ===\n' )

    results
        .forEach( ( r ) => {
            const label = r['type'] === 'success' ? 'OK' : `ERR ${r['code']}`
            console.log( `  ${label.padEnd( 12 )} ${r['name']}` )
        } )

    console.log( '' )

    await client.close()
}


run().catch( ( e ) => { console.error( `\n  Fatal: ${e['message']}\n` ) } )
