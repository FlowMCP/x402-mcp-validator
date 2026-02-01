const EMPTY_CATEGORIES = {
    isReachable: false,
    supportsMcp: false,
    hasTools: false,
    hasResources: false,
    hasPrompts: false,
    supportsX402: false,
    hasValidPaymentRequirements: false,
    supportsExactScheme: false,
    supportsEvm: false,
    supportsSolana: false,
    supportsTasks: false,
    supportsMcpApps: false
}


class SnapshotBuilder {


    static build( { mcpUrl, serverInfo, tools, resources, prompts, capabilities, partialCategories, restrictedCalls, paymentOptions, validPaymentOptions, latency } ) {
        const { categories } = SnapshotBuilder.#buildCategories( { partialCategories, restrictedCalls, paymentOptions, validPaymentOptions } )
        const { entries } = SnapshotBuilder.#buildEntries( { mcpUrl, serverInfo, tools, resources, prompts, capabilities, restrictedCalls, paymentOptions, validPaymentOptions, latency } )

        return { categories, entries }
    }


    static buildEmpty( { mcpUrl } ) {
        const categories = { ...EMPTY_CATEGORIES }

        const entries = {
            mcpUrl,
            serverName: null,
            serverVersion: null,
            serverDescription: null,
            protocolVersion: null,
            capabilities: {},
            instructions: null,
            tools: [],
            resources: [],
            prompts: [],
            x402: {
                version: null,
                restrictedCalls: [],
                paymentOptions: [],
                networks: [],
                schemes: [],
                perTool: {}
            },
            latency: {
                ping: null,
                listTools: null
            },
            timestamp: new Date().toISOString()
        }

        return { categories, entries }
    }


    static #buildCategories( { partialCategories, restrictedCalls, paymentOptions, validPaymentOptions } ) {
        const supportsX402 = restrictedCalls.length > 0
        const hasValidPaymentRequirements = validPaymentOptions.length > 0
        const { hasExact: supportsExactScheme } = SnapshotBuilder.#detectScheme( { paymentOptions: validPaymentOptions, scheme: 'exact' } )
        const { hasNetwork: supportsEvm } = SnapshotBuilder.#detectNetworkPrefix( { paymentOptions: validPaymentOptions, prefix: 'eip155:' } )
        const { hasNetwork: supportsSolana } = SnapshotBuilder.#detectNetworkPrefix( { paymentOptions: validPaymentOptions, prefix: 'solana:' } )

        const categories = {
            isReachable: true,
            supportsMcp: true,
            hasTools: partialCategories['hasTools'],
            hasResources: partialCategories['hasResources'],
            hasPrompts: partialCategories['hasPrompts'],
            supportsX402,
            hasValidPaymentRequirements,
            supportsExactScheme,
            supportsEvm,
            supportsSolana,
            supportsTasks: partialCategories['supportsTasks'],
            supportsMcpApps: partialCategories['supportsMcpApps']
        }

        return { categories }
    }


    static #buildEntries( { mcpUrl, serverInfo, tools, resources, prompts, capabilities, restrictedCalls, paymentOptions, validPaymentOptions, latency } ) {
        const { serverName, serverVersion, serverDescription, protocolVersion, instructions } = SnapshotBuilder.#extractServerInfo( { serverInfo } )
        const { networks } = SnapshotBuilder.#extractUniqueNetworks( { paymentOptions: validPaymentOptions } )
        const { schemes } = SnapshotBuilder.#extractUniqueSchemes( { paymentOptions: validPaymentOptions } )
        const { perTool } = SnapshotBuilder.#buildPerToolPayments( { restrictedCalls } )

        const version = restrictedCalls.length > 0 ? 2 : null

        const entries = {
            mcpUrl,
            serverName,
            serverVersion,
            serverDescription,
            protocolVersion,
            capabilities: capabilities || {},
            instructions,
            tools,
            resources,
            prompts,
            x402: {
                version,
                restrictedCalls,
                paymentOptions,
                networks,
                schemes,
                perTool
            },
            latency,
            timestamp: new Date().toISOString()
        }

        return { entries }
    }


    static #extractServerInfo( { serverInfo } ) {
        if( !serverInfo || typeof serverInfo !== 'object' ) {
            return { serverName: null, serverVersion: null, serverDescription: null, protocolVersion: null, instructions: null }
        }

        const inner = serverInfo['serverInfo'] || {}
        const serverName = inner['name'] || null
        const serverVersion = inner['version'] || null
        const serverDescription = inner['description'] || null
        const protocolVersion = serverInfo['protocolVersion'] || null
        const instructions = serverInfo['instructions'] || null

        return { serverName, serverVersion, serverDescription, protocolVersion, instructions }
    }


    static #buildPerToolPayments( { restrictedCalls } ) {
        const perTool = {}

        restrictedCalls
            .forEach( ( call ) => {
                const { toolName, paymentRequired } = call

                if( !paymentRequired ) {
                    return
                }

                const accepts = paymentRequired['accepts'] || []
                const resource = paymentRequired['resource'] || null
                const x402Version = paymentRequired['x402Version'] || null

                const byNetwork = {}

                accepts
                    .forEach( ( option ) => {
                        const network = option['network']

                        if( !network ) {
                            return
                        }

                        byNetwork[network] = {
                            scheme: option['scheme'] || null,
                            amount: option['amount'] || null,
                            asset: option['asset'] || null,
                            payTo: option['payTo'] || null,
                            maxTimeoutSeconds: option['maxTimeoutSeconds'] || null,
                            extra: option['extra'] || null
                        }
                    } )

                perTool[toolName] = {
                    x402Version,
                    resource,
                    networks: Object.keys( byNetwork ),
                    byNetwork
                }
            } )

        return { perTool }
    }


    static #extractUniqueNetworks( { paymentOptions } ) {
        const networkSet = new Set()

        paymentOptions
            .forEach( ( option ) => {
                const network = option['network']

                if( typeof network === 'string' ) {
                    networkSet.add( network )
                }
            } )

        const networks = Array.from( networkSet )

        return { networks }
    }


    static #extractUniqueSchemes( { paymentOptions } ) {
        const schemeSet = new Set()

        paymentOptions
            .forEach( ( option ) => {
                const scheme = option['scheme']

                if( typeof scheme === 'string' ) {
                    schemeSet.add( scheme )
                }
            } )

        const schemes = Array.from( schemeSet )

        return { schemes }
    }


    static #detectScheme( { paymentOptions, scheme } ) {
        const hasExact = paymentOptions
            .some( ( option ) => option['scheme'] === scheme )

        return { hasExact }
    }


    static #detectNetworkPrefix( { paymentOptions, prefix } ) {
        const hasNetwork = paymentOptions
            .some( ( option ) => typeof option['network'] === 'string' && option['network'].startsWith( prefix ) )

        return { hasNetwork }
    }
}


export { SnapshotBuilder }
