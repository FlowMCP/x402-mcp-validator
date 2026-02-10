import { describe, test, expect } from '@jest/globals'
import { CapabilityClassifier } from '../../src/task/CapabilityClassifier.mjs'
import {
    MOCK_TOOLS,
    MOCK_RESOURCES,
    MOCK_PROMPTS,
    MOCK_CAPABILITIES,
    MOCK_CAPABILITIES_WITH_TASKS,
    MOCK_CAPABILITIES_WITH_LOGGING_COMPLETIONS,
    MOCK_CAPABILITIES_WITH_EXPERIMENTAL,
    MOCK_CAPABILITIES_WITH_TASK_SUB_CAPABILITIES,
    MOCK_CAPABILITIES_WITH_RESOURCE_SUB_PROPERTIES,
    MOCK_SERVER_INFO
} from '../helpers/config.mjs'


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


    test( 'detects logging capability', () => {
        const { categories } = CapabilityClassifier
            .classify( {
                serverInfo: MOCK_SERVER_INFO,
                tools: [],
                resources: [],
                prompts: [],
                capabilities: MOCK_CAPABILITIES_WITH_LOGGING_COMPLETIONS
            } )

        expect( categories.supportsLogging ).toBe( true )
    } )


    test( 'returns false for logging when absent', () => {
        const { categories } = CapabilityClassifier
            .classify( {
                serverInfo: MOCK_SERVER_INFO,
                tools: [],
                resources: [],
                prompts: [],
                capabilities: MOCK_CAPABILITIES
            } )

        expect( categories.supportsLogging ).toBe( false )
    } )


    test( 'detects completions capability', () => {
        const { categories } = CapabilityClassifier
            .classify( {
                serverInfo: MOCK_SERVER_INFO,
                tools: [],
                resources: [],
                prompts: [],
                capabilities: MOCK_CAPABILITIES_WITH_LOGGING_COMPLETIONS
            } )

        expect( categories.supportsCompletions ).toBe( true )
    } )


    test( 'returns false for completions when absent', () => {
        const { categories } = CapabilityClassifier
            .classify( {
                serverInfo: MOCK_SERVER_INFO,
                tools: [],
                resources: [],
                prompts: [],
                capabilities: MOCK_CAPABILITIES
            } )

        expect( categories.supportsCompletions ).toBe( false )
    } )


    test( 'detects resource subscribe and listChanged', () => {
        const { categories } = CapabilityClassifier
            .classify( {
                serverInfo: MOCK_SERVER_INFO,
                tools: [],
                resources: [],
                prompts: [],
                capabilities: MOCK_CAPABILITIES_WITH_RESOURCE_SUB_PROPERTIES
            } )

        expect( categories.supportsResourceSubscription ).toBe( true )
        expect( categories.supportsResourceListChanged ).toBe( true )
    } )


    test( 'returns false for resource subscribe and listChanged when absent', () => {
        const { categories } = CapabilityClassifier
            .classify( {
                serverInfo: MOCK_SERVER_INFO,
                tools: [],
                resources: [],
                prompts: [],
                capabilities: MOCK_CAPABILITIES
            } )

        expect( categories.supportsResourceSubscription ).toBe( false )
        expect( categories.supportsResourceListChanged ).toBe( false )
    } )


    test( 'detects prompt listChanged', () => {
        const { categories } = CapabilityClassifier
            .classify( {
                serverInfo: MOCK_SERVER_INFO,
                tools: [],
                resources: [],
                prompts: [],
                capabilities: MOCK_CAPABILITIES_WITH_RESOURCE_SUB_PROPERTIES
            } )

        expect( categories.supportsPromptListChanged ).toBe( true )
    } )


    test( 'returns false for prompt listChanged when absent', () => {
        const { categories } = CapabilityClassifier
            .classify( {
                serverInfo: MOCK_SERVER_INFO,
                tools: [],
                resources: [],
                prompts: [],
                capabilities: MOCK_CAPABILITIES
            } )

        expect( categories.supportsPromptListChanged ).toBe( false )
    } )


    test( 'detects tool listChanged', () => {
        const { categories } = CapabilityClassifier
            .classify( {
                serverInfo: MOCK_SERVER_INFO,
                tools: [],
                resources: [],
                prompts: [],
                capabilities: MOCK_CAPABILITIES_WITH_RESOURCE_SUB_PROPERTIES
            } )

        expect( categories.supportsToolListChanged ).toBe( true )
    } )


    test( 'returns false for tool listChanged when absent', () => {
        const { categories } = CapabilityClassifier
            .classify( {
                serverInfo: MOCK_SERVER_INFO,
                tools: [],
                resources: [],
                prompts: [],
                capabilities: MOCK_CAPABILITIES
            } )

        expect( categories.supportsToolListChanged ).toBe( false )
    } )


    test( 'detects task sub-capabilities list and cancel', () => {
        const { categories } = CapabilityClassifier
            .classify( {
                serverInfo: MOCK_SERVER_INFO,
                tools: [],
                resources: [],
                prompts: [],
                capabilities: MOCK_CAPABILITIES_WITH_TASK_SUB_CAPABILITIES
            } )

        expect( categories.supportsTaskList ).toBe( true )
        expect( categories.supportsTaskCancel ).toBe( true )
    } )


    test( 'detects task augmented tool call', () => {
        const { categories } = CapabilityClassifier
            .classify( {
                serverInfo: MOCK_SERVER_INFO,
                tools: [],
                resources: [],
                prompts: [],
                capabilities: MOCK_CAPABILITIES_WITH_TASK_SUB_CAPABILITIES
            } )

        expect( categories.supportsTaskAugmentedToolCall ).toBe( true )
    } )


    test( 'returns false for task sub-capabilities when absent', () => {
        const { categories } = CapabilityClassifier
            .classify( {
                serverInfo: MOCK_SERVER_INFO,
                tools: [],
                resources: [],
                prompts: [],
                capabilities: MOCK_CAPABILITIES
            } )

        expect( categories.supportsTaskList ).toBe( false )
        expect( categories.supportsTaskCancel ).toBe( false )
        expect( categories.supportsTaskAugmentedToolCall ).toBe( false )
    } )


    test( 'returns false for task sub-capabilities when tasks exists but no sub-properties', () => {
        const { categories } = CapabilityClassifier
            .classify( {
                serverInfo: MOCK_SERVER_INFO,
                tools: [],
                resources: [],
                prompts: [],
                capabilities: MOCK_CAPABILITIES_WITH_TASKS
            } )

        expect( categories.supportsTaskList ).toBe( false )
        expect( categories.supportsTaskCancel ).toBe( false )
        expect( categories.supportsTaskAugmentedToolCall ).toBe( false )
    } )


    test( 'detects experimental capabilities', () => {
        const { categories } = CapabilityClassifier
            .classify( {
                serverInfo: MOCK_SERVER_INFO,
                tools: [],
                resources: [],
                prompts: [],
                capabilities: MOCK_CAPABILITIES_WITH_EXPERIMENTAL
            } )

        expect( categories.hasExperimentalCapabilities ).toBe( true )
    } )


    test( 'returns false for experimental when absent', () => {
        const { categories } = CapabilityClassifier
            .classify( {
                serverInfo: MOCK_SERVER_INFO,
                tools: [],
                resources: [],
                prompts: [],
                capabilities: MOCK_CAPABILITIES
            } )

        expect( categories.hasExperimentalCapabilities ).toBe( false )
    } )


    test( 'classifies specVersion 2025-03-26', () => {
        const { categories } = CapabilityClassifier
            .classify( {
                serverInfo: MOCK_SERVER_INFO,
                tools: [],
                resources: [],
                prompts: [],
                capabilities: MOCK_CAPABILITIES
            } )

        expect( categories.specVersion ).toBe( '2025-03-26' )
    } )


    test( 'classifies specVersion 2024-11-05', () => {
        const serverInfo = {
            ...MOCK_SERVER_INFO,
            protocolVersion: '2024-11-05'
        }

        const { categories } = CapabilityClassifier
            .classify( {
                serverInfo,
                tools: [],
                resources: [],
                prompts: [],
                capabilities: MOCK_CAPABILITIES
            } )

        expect( categories.specVersion ).toBe( '2024-11-05' )
    } )


    test( 'classifies unknown specVersion', () => {
        const serverInfo = {
            ...MOCK_SERVER_INFO,
            protocolVersion: '1999-01-01'
        }

        const { categories } = CapabilityClassifier
            .classify( {
                serverInfo,
                tools: [],
                resources: [],
                prompts: [],
                capabilities: MOCK_CAPABILITIES
            } )

        expect( categories.specVersion ).toBe( 'unknown' )
    } )


    test( 'returns null specVersion when serverInfo has no protocolVersion', () => {
        const serverInfo = {
            serverInfo: { name: 'test', version: '1.0.0' }
        }

        const { categories } = CapabilityClassifier
            .classify( {
                serverInfo,
                tools: [],
                resources: [],
                prompts: [],
                capabilities: MOCK_CAPABILITIES
            } )

        expect( categories.specVersion ).toBeNull()
    } )


    test( 'returns null specVersion when serverInfo is null', () => {
        const { categories } = CapabilityClassifier
            .classify( {
                serverInfo: null,
                tools: [],
                resources: [],
                prompts: [],
                capabilities: MOCK_CAPABILITIES
            } )

        expect( categories.specVersion ).toBeNull()
    } )
} )
