import { describe, test, expect } from '@jest/globals'
import { CapabilityClassifier } from '../../src/task/CapabilityClassifier.mjs'
import { MOCK_TOOLS, MOCK_RESOURCES, MOCK_PROMPTS, MOCK_CAPABILITIES, MOCK_CAPABILITIES_WITH_TASKS, MOCK_SERVER_INFO } from '../helpers/config.mjs'


describe( 'CapabilityClassifier', () => {
    test( 'classifies server with all basic capabilities', () => {
        const { categories } = CapabilityClassifier
            .classify( {
                serverInfo: MOCK_SERVER_INFO,
                tools: MOCK_TOOLS,
                resources: MOCK_RESOURCES,
                prompts: MOCK_PROMPTS,
                capabilities: MOCK_CAPABILITIES
            } )

        expect( categories.hasTools ).toBe( true )
        expect( categories.hasResources ).toBe( true )
        expect( categories.hasPrompts ).toBe( true )
        expect( categories.supportsTasks ).toBe( false )
        expect( categories.supportsMcpApps ).toBe( false )
    } )


    test( 'detects tasks capability', () => {
        const { categories } = CapabilityClassifier
            .classify( {
                serverInfo: MOCK_SERVER_INFO,
                tools: MOCK_TOOLS,
                resources: [],
                prompts: [],
                capabilities: MOCK_CAPABILITIES_WITH_TASKS
            } )

        expect( categories.supportsTasks ).toBe( true )
    } )


    test( 'returns false for empty tools array', () => {
        const { categories } = CapabilityClassifier
            .classify( {
                serverInfo: MOCK_SERVER_INFO,
                tools: [],
                resources: MOCK_RESOURCES,
                prompts: MOCK_PROMPTS,
                capabilities: MOCK_CAPABILITIES
            } )

        expect( categories.hasTools ).toBe( false )
    } )


    test( 'returns false for null capabilities', () => {
        const { categories } = CapabilityClassifier
            .classify( {
                serverInfo: MOCK_SERVER_INFO,
                tools: MOCK_TOOLS,
                resources: [],
                prompts: [],
                capabilities: null
            } )

        expect( categories.supportsTasks ).toBe( false )
        expect( categories.supportsMcpApps ).toBe( false )
    } )


    test( 'returns false for undefined capabilities', () => {
        const { categories } = CapabilityClassifier
            .classify( {
                serverInfo: MOCK_SERVER_INFO,
                tools: [],
                resources: [],
                prompts: [],
                capabilities: undefined
            } )

        expect( categories.supportsTasks ).toBe( false )
        expect( categories.supportsMcpApps ).toBe( false )
    } )


    test( 'handles non-array items as no items', () => {
        const { categories } = CapabilityClassifier
            .classify( {
                serverInfo: MOCK_SERVER_INFO,
                tools: 'not-an-array',
                resources: null,
                prompts: undefined,
                capabilities: MOCK_CAPABILITIES
            } )

        expect( categories.hasTools ).toBe( false )
        expect( categories.hasResources ).toBe( false )
        expect( categories.hasPrompts ).toBe( false )
    } )


    test( 'detects mcpApps capability', () => {
        const { categories } = CapabilityClassifier
            .classify( {
                serverInfo: MOCK_SERVER_INFO,
                tools: [],
                resources: [],
                prompts: [],
                capabilities: { mcpApps: { supported: true } }
            } )

        expect( categories.supportsMcpApps ).toBe( true )
    } )


    test( 'does not detect capability set to null', () => {
        const { categories } = CapabilityClassifier
            .classify( {
                serverInfo: MOCK_SERVER_INFO,
                tools: [],
                resources: [],
                prompts: [],
                capabilities: { tasks: null }
            } )

        expect( categories.supportsTasks ).toBe( false )
    } )
} )
