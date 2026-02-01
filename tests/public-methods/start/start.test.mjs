import { jest } from '@jest/globals'

import {
    MOCK_SERVER_INFO,
    MOCK_TOOLS,
    MOCK_RESOURCES,
    MOCK_PROMPTS,
    MOCK_CAPABILITIES,
    VALID_PAYMENT_REQUIRED,
    MOCK_LATENCY,
    EXPECTED_CATEGORY_KEYS,
    EXPECTED_ENTRY_KEYS,
    EMPTY_CATEGORIES,
    TEST_MCP_URL
} from '../../helpers/config.mjs'


// --- Mock Setup ---

const mockClient = {
    callTool: jest.fn(),
    listTools: jest.fn().mockResolvedValue( { tools: MOCK_TOOLS } ),
    listResources: jest.fn().mockResolvedValue( { resources: MOCK_RESOURCES } ),
    listPrompts: jest.fn().mockResolvedValue( { prompts: MOCK_PROMPTS } ),
    ping: jest.fn().mockResolvedValue( undefined ),
    close: jest.fn().mockResolvedValue( undefined ),
    serverCapabilities: MOCK_CAPABILITIES
}

const mockConnector = {
    connect: jest.fn(),
    discover: jest.fn(),
    measureLatency: jest.fn(),
    disconnect: jest.fn()
}

jest.unstable_mockModule( '../../../src/task/McpConnector.mjs', () => ( {
    McpConnector: {
        connect: mockConnector['connect'],
        discover: mockConnector['discover'],
        measureLatency: mockConnector['measureLatency'],
        disconnect: mockConnector['disconnect']
    }
} ) )

const { McpServerValidator } = await import( '../../../src/McpServerValidator.mjs' )


describe( 'McpServerValidator.start', () => {

    beforeEach( () => {
        jest.clearAllMocks()
    } )


    describe( 'Parameter Validation', () => {

        test( 'throws when mcpUrl is missing', async () => {
            await expect( McpServerValidator.start( {} ) ).rejects.toThrow( 'VAL-001' )
        } )


        test( 'throws when mcpUrl is not a string', async () => {
            await expect( McpServerValidator.start( { mcpUrl: 42 } ) ).rejects.toThrow( 'VAL-002' )
        } )


        test( 'throws when mcpUrl is empty', async () => {
            await expect( McpServerValidator.start( { mcpUrl: '  ' } ) ).rejects.toThrow( 'VAL-003' )
        } )


        test( 'throws when mcpUrl is invalid URL', async () => {
            await expect( McpServerValidator.start( { mcpUrl: 'not-a-url' } ) ).rejects.toThrow( 'VAL-004' )
        } )


        test( 'throws when timeout is not a number', async () => {
            await expect( McpServerValidator.start( { mcpUrl: TEST_MCP_URL, timeout: 'fast' } ) ).rejects.toThrow( 'VAL-005' )
        } )


        test( 'throws when timeout is zero', async () => {
            await expect( McpServerValidator.start( { mcpUrl: TEST_MCP_URL, timeout: 0 } ) ).rejects.toThrow( 'VAL-006' )
        } )


        test( 'throws when timeout is negative', async () => {
            await expect( McpServerValidator.start( { mcpUrl: TEST_MCP_URL, timeout: -1 } ) ).rejects.toThrow( 'VAL-006' )
        } )
    } )


    describe( 'Unreachable Server', () => {

        test( 'returns empty categories when server is not reachable', async () => {
            mockConnector['connect'].mockResolvedValue( {
                status: false,
                messages: [ 'CON-001 mcpUrl: Server is not reachable' ],
                client: null,
                serverInfo: null
            } )

            const { status, messages, categories, entries } = await McpServerValidator.start( { mcpUrl: TEST_MCP_URL } )

            expect( status ).toBe( false )
            expect( messages ).toContainEqual( expect.stringContaining( 'CON-001' ) )

            EXPECTED_CATEGORY_KEYS
                .forEach( ( key ) => {
                    expect( categories[key] ).toBe( false )
                } )

            expect( entries['mcpUrl'] ).toBe( TEST_MCP_URL )
            expect( entries['serverName'] ).toBeNull()
            expect( entries['tools'] ).toEqual( [] )
        } )
    } )


    describe( 'Successful Pipeline', () => {

        beforeEach( () => {
            mockConnector['connect'].mockResolvedValue( {
                status: true,
                messages: [],
                client: mockClient,
                serverInfo: MOCK_SERVER_INFO
            } )

            mockConnector['discover'].mockResolvedValue( {
                status: true,
                messages: [],
                tools: MOCK_TOOLS,
                resources: MOCK_RESOURCES,
                prompts: MOCK_PROMPTS,
                capabilities: MOCK_CAPABILITIES
            } )

            mockConnector['measureLatency'].mockResolvedValue( {
                latency: MOCK_LATENCY
            } )

            mockConnector['disconnect'].mockResolvedValue( {
                disconnected: true
            } )
        } )


        test( 'returns all 12 category keys', async () => {
            const { categories } = await McpServerValidator.start( { mcpUrl: TEST_MCP_URL } )

            const categoryKeys = Object.keys( categories )

            EXPECTED_CATEGORY_KEYS
                .forEach( ( key ) => {
                    expect( categoryKeys ).toContain( key )
                } )

            expect( categoryKeys.length ).toBe( 12 )
        } )


        test( 'returns all 13 entry keys', async () => {
            const { entries } = await McpServerValidator.start( { mcpUrl: TEST_MCP_URL } )

            const entryKeys = Object.keys( entries )

            EXPECTED_ENTRY_KEYS
                .forEach( ( key ) => {
                    expect( entryKeys ).toContain( key )
                } )

            expect( entryKeys.length ).toBe( 13 )
        } )


        test( 'sets isReachable and supportsMcp to true', async () => {
            const { categories } = await McpServerValidator.start( { mcpUrl: TEST_MCP_URL } )

            expect( categories['isReachable'] ).toBe( true )
            expect( categories['supportsMcp'] ).toBe( true )
        } )


        test( 'classifies tools, resources, prompts correctly', async () => {
            const { categories } = await McpServerValidator.start( { mcpUrl: TEST_MCP_URL } )

            expect( categories['hasTools'] ).toBe( true )
            expect( categories['hasResources'] ).toBe( true )
            expect( categories['hasPrompts'] ).toBe( true )
        } )


        test( 'extracts server info into entries', async () => {
            const { entries } = await McpServerValidator.start( { mcpUrl: TEST_MCP_URL } )

            expect( entries['serverName'] ).toBe( 'test-mcp-server' )
            expect( entries['serverVersion'] ).toBe( '1.0.0' )
            expect( entries['protocolVersion'] ).toBe( '2025-03-26' )
        } )


        test( 'includes latency in entries', async () => {
            const { entries } = await McpServerValidator.start( { mcpUrl: TEST_MCP_URL } )

            expect( entries['latency']['ping'] ).toBe( 120 )
            expect( entries['latency']['listTools'] ).toBe( 250 )
        } )


        test( 'includes timestamp in entries', async () => {
            const { entries } = await McpServerValidator.start( { mcpUrl: TEST_MCP_URL } )

            expect( entries['timestamp'] ).toBeDefined()
            expect( typeof entries['timestamp'] ).toBe( 'string' )
        } )


        test( 'calls disconnect after pipeline', async () => {
            await McpServerValidator.start( { mcpUrl: TEST_MCP_URL } )

            expect( mockConnector['disconnect'] ).toHaveBeenCalledTimes( 1 )
        } )
    } )


    describe( 'x402 Detection', () => {

        beforeEach( () => {
            mockConnector['connect'].mockResolvedValue( {
                status: true,
                messages: [],
                client: mockClient,
                serverInfo: MOCK_SERVER_INFO
            } )

            mockConnector['discover'].mockResolvedValue( {
                status: true,
                messages: [],
                tools: MOCK_TOOLS,
                resources: MOCK_RESOURCES,
                prompts: MOCK_PROMPTS,
                capabilities: MOCK_CAPABILITIES
            } )

            mockConnector['measureLatency'].mockResolvedValue( {
                latency: MOCK_LATENCY
            } )

            mockConnector['disconnect'].mockResolvedValue( {
                disconnected: true
            } )
        } )


        test( 'detects x402 when tool returns 402 error', async () => {
            mockClient['callTool']
                .mockRejectedValueOnce( { code: -32402, data: VALID_PAYMENT_REQUIRED } )
                .mockRejectedValueOnce( { code: -32402, data: VALID_PAYMENT_REQUIRED } )

            const { categories, entries } = await McpServerValidator.start( { mcpUrl: TEST_MCP_URL } )

            expect( categories['supportsX402'] ).toBe( true )
            expect( entries['x402']['restrictedCalls'].length ).toBeGreaterThan( 0 )
        } )


        test( 'validates payment options', async () => {
            mockClient['callTool']
                .mockRejectedValueOnce( { code: -32402, data: VALID_PAYMENT_REQUIRED } )
                .mockResolvedValueOnce( {} )

            const { categories, entries } = await McpServerValidator.start( { mcpUrl: TEST_MCP_URL } )

            expect( categories['supportsX402'] ).toBe( true )
            expect( categories['hasValidPaymentRequirements'] ).toBe( true )
            expect( entries['x402']['networks'].length ).toBeGreaterThan( 0 )
            expect( entries['x402']['schemes'] ).toContain( 'exact' )
        } )


        test( 'sets supportsX402 false when no 402 errors', async () => {
            mockClient['callTool'].mockResolvedValue( {} )

            const { categories } = await McpServerValidator.start( { mcpUrl: TEST_MCP_URL } )

            expect( categories['supportsX402'] ).toBe( false )
            expect( categories['hasValidPaymentRequirements'] ).toBe( false )
        } )
    } )
} )
