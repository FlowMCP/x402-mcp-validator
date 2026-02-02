import { describe, test, expect } from '@jest/globals'
import { SnapshotBuilder } from '../../src/task/SnapshotBuilder.mjs'
import {
    MOCK_SERVER_INFO,
    MOCK_TOOLS,
    MOCK_RESOURCES,
    MOCK_PROMPTS,
    MOCK_CAPABILITIES,
    MOCK_RESTRICTED_CALLS,
    VALID_PAYMENT_OPTIONS,
    MOCK_LATENCY,
    TEST_ENDPOINT,
    EXPECTED_CATEGORY_KEYS,
    EXPECTED_ENTRY_KEYS
} from '../helpers/config.mjs'


describe( 'SnapshotBuilder', () => {
    const buildArgs = {
        endpoint: TEST_ENDPOINT,
        serverInfo: MOCK_SERVER_INFO,
        tools: MOCK_TOOLS,
        resources: MOCK_RESOURCES,
        prompts: MOCK_PROMPTS,
        capabilities: MOCK_CAPABILITIES,
        partialCategories: {
            hasTools: true,
            hasResources: true,
            hasPrompts: true,
            supportsTasks: false,
            supportsMcpApps: false
        },
        restrictedCalls: MOCK_RESTRICTED_CALLS,
        paymentOptions: VALID_PAYMENT_OPTIONS,
        validPaymentOptions: VALID_PAYMENT_OPTIONS,
        latency: MOCK_LATENCY
    }


    describe( 'build', () => {
        test( 'returns all 12 category keys', () => {
            const { categories } = SnapshotBuilder.build( buildArgs )

            EXPECTED_CATEGORY_KEYS
                .forEach( ( key ) => {
                    expect( categories ).toHaveProperty( key )
                } )
        } )


        test( 'returns all 13 entry keys', () => {
            const { entries } = SnapshotBuilder.build( buildArgs )

            EXPECTED_ENTRY_KEYS
                .forEach( ( key ) => {
                    expect( entries ).toHaveProperty( key )
                } )
        } )


        test( 'sets isReachable and supportsMcp to true', () => {
            const { categories } = SnapshotBuilder.build( buildArgs )

            expect( categories.isReachable ).toBe( true )
            expect( categories.supportsMcp ).toBe( true )
        } )


        test( 'detects x402 support', () => {
            const { categories } = SnapshotBuilder.build( buildArgs )

            expect( categories.supportsX402 ).toBe( true )
            expect( categories.hasValidPaymentRequirements ).toBe( true )
        } )


        test( 'detects exact scheme', () => {
            const { categories } = SnapshotBuilder.build( buildArgs )

            expect( categories.supportsExactScheme ).toBe( true )
        } )


        test( 'detects EVM network', () => {
            const { categories } = SnapshotBuilder.build( buildArgs )

            expect( categories.supportsEvm ).toBe( true )
        } )


        test( 'extracts server info into entries', () => {
            const { entries } = SnapshotBuilder.build( buildArgs )

            expect( entries.serverName ).toBe( 'test-mcp-server' )
            expect( entries.serverVersion ).toBe( '1.0.0' )
            expect( entries.protocolVersion ).toBe( '2025-03-26' )
        } )


        test( 'includes x402 details in entries', () => {
            const { entries } = SnapshotBuilder.build( buildArgs )

            expect( entries.x402.version ).toBe( 2 )
            expect( entries.x402.networks ).toContain( 'eip155:84532' )
            expect( entries.x402.schemes ).toContain( 'exact' )
        } )


        test( 'builds perTool payments', () => {
            const { entries } = SnapshotBuilder.build( buildArgs )

            expect( entries.x402.perTool ).toHaveProperty( 'get_weather' )
            expect( entries.x402.perTool[ 'get_weather' ].networks ).toContain( 'eip155:84532' )
        } )


        test( 'includes timestamp', () => {
            const { entries } = SnapshotBuilder.build( buildArgs )

            expect( entries.timestamp ).toBeDefined()
            expect( typeof entries.timestamp ).toBe( 'string' )
        } )
    } )


    describe( 'buildEmpty', () => {
        test( 'returns all categories as false', () => {
            const { categories } = SnapshotBuilder.buildEmpty( { endpoint: TEST_ENDPOINT } )

            EXPECTED_CATEGORY_KEYS
                .forEach( ( key ) => {
                    expect( categories[ key ] ).toBe( false )
                } )
        } )


        test( 'returns empty entries with endpoint', () => {
            const { entries } = SnapshotBuilder.buildEmpty( { endpoint: TEST_ENDPOINT } )

            expect( entries.endpoint ).toBe( TEST_ENDPOINT )
            expect( entries.serverName ).toBeNull()
            expect( entries.tools ).toEqual( [] )
            expect( entries.x402.restrictedCalls ).toEqual( [] )
        } )
    } )
} )
