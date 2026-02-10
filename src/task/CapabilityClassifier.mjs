class CapabilityClassifier {


    static classify( { serverInfo, tools, resources, prompts, capabilities } ) {
        const { hasItems: hasTools } = CapabilityClassifier.#hasNonEmpty( { items: tools } )
        const { hasItems: hasResources } = CapabilityClassifier.#hasNonEmpty( { items: resources } )
        const { hasItems: hasPrompts } = CapabilityClassifier.#hasNonEmpty( { items: prompts } )
        const { detected: supportsTasks } = CapabilityClassifier.#detectCapability( { capabilities, key: 'tasks' } )
        const { detected: supportsMcpApps } = CapabilityClassifier.#detectCapability( { capabilities, key: 'mcpApps' } )
        const { detected: supportsLogging } = CapabilityClassifier.#detectCapability( { capabilities, key: 'logging' } )
        const { detected: supportsCompletions } = CapabilityClassifier.#detectCapability( { capabilities, key: 'completions' } )
        const { detected: supportsResourceSubscription } = CapabilityClassifier.#detectSubProperty( { capabilities, key: 'resources', subKey: 'subscribe' } )
        const { detected: supportsResourceListChanged } = CapabilityClassifier.#detectSubProperty( { capabilities, key: 'resources', subKey: 'listChanged' } )
        const { detected: supportsPromptListChanged } = CapabilityClassifier.#detectSubProperty( { capabilities, key: 'prompts', subKey: 'listChanged' } )
        const { detected: supportsToolListChanged } = CapabilityClassifier.#detectSubProperty( { capabilities, key: 'tools', subKey: 'listChanged' } )
        const { detected: supportsTaskList } = CapabilityClassifier.#detectSubProperty( { capabilities, key: 'tasks', subKey: 'list' } )
        const { detected: supportsTaskCancel } = CapabilityClassifier.#detectSubProperty( { capabilities, key: 'tasks', subKey: 'cancel' } )
        const { detected: supportsTaskAugmentedToolCall } = CapabilityClassifier.#detectDeepProperty( { capabilities, path: [ 'tasks', 'requests', 'tools', 'call' ] } )
        const { detected: hasExperimentalCapabilities } = CapabilityClassifier.#detectCapability( { capabilities, key: 'experimental' } )
        const { specVersion } = CapabilityClassifier.#classifySpecVersion( { serverInfo } )

        const categories = {
            hasTools,
            hasResources,
            hasPrompts,
            supportsTasks,
            supportsMcpApps,
            supportsLogging,
            supportsCompletions,
            supportsResourceSubscription,
            supportsResourceListChanged,
            supportsPromptListChanged,
            supportsToolListChanged,
            supportsTaskList,
            supportsTaskCancel,
            supportsTaskAugmentedToolCall,
            hasExperimentalCapabilities,
            specVersion
        }

        return { categories }
    }


    static #hasNonEmpty( { items } ) {
        const hasItems = Array.isArray( items ) && items.length > 0

        return { hasItems }
    }


    static #detectCapability( { capabilities, key } ) {
        if( !capabilities || typeof capabilities !== 'object' ) {
            return { detected: false }
        }

        const detected = capabilities[key] !== undefined && capabilities[key] !== null

        return { detected }
    }


    static #detectSubProperty( { capabilities, key, subKey } ) {
        if( !capabilities || typeof capabilities !== 'object' ) {
            return { detected: false }
        }

        const parent = capabilities[key]

        if( !parent || typeof parent !== 'object' ) {
            return { detected: false }
        }

        const detected = parent[subKey] === true

        return { detected }
    }


    static #detectDeepProperty( { capabilities, path } ) {
        if( !capabilities || typeof capabilities !== 'object' ) {
            return { detected: false }
        }

        let current = capabilities

        const allResolved = path
            .every( ( segment ) => {
                if( !current || typeof current !== 'object' ) {
                    return false
                }

                current = current[segment]

                return true
            } )

        const detected = allResolved && current !== undefined && current !== null

        return { detected }
    }


    static #classifySpecVersion( { serverInfo } ) {
        if( !serverInfo || typeof serverInfo !== 'object' ) {
            return { specVersion: null }
        }

        const version = serverInfo['protocolVersion']

        if( version === undefined || version === null ) {
            return { specVersion: null }
        }

        const knownVersions = [ '2024-11-05', '2025-03-26' ]
        const specVersion = knownVersions.includes( version ) ? version : 'unknown'

        return { specVersion }
    }
}


export { CapabilityClassifier }
