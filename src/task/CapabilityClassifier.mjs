class CapabilityClassifier {


    static classify( { serverInfo, tools, resources, prompts, capabilities } ) {
        const { hasItems: hasTools } = CapabilityClassifier.#hasNonEmpty( { items: tools } )
        const { hasItems: hasResources } = CapabilityClassifier.#hasNonEmpty( { items: resources } )
        const { hasItems: hasPrompts } = CapabilityClassifier.#hasNonEmpty( { items: prompts } )
        const { detected: supportsTasks } = CapabilityClassifier.#detectCapability( { capabilities, key: 'tasks' } )
        const { detected: supportsMcpApps } = CapabilityClassifier.#detectCapability( { capabilities, key: 'mcpApps' } )

        const categories = {
            hasTools,
            hasResources,
            hasPrompts,
            supportsTasks,
            supportsMcpApps
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
}


export { CapabilityClassifier }
