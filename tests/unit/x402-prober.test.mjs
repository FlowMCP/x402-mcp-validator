import { describe, test, expect, jest } from '@jest/globals'
import { X402Prober } from '../../src/task/X402Prober.mjs'
import { MOCK_TOOLS } from '../helpers/config.mjs'


describe( 'X402Prober', () => {
    describe( 'probe', () => {
        test( 'returns PRB-005 when tools array is empty', async () => {
            const mockClient = { callTool: jest.fn() }

            const { status, messages, restrictedCalls, paymentOptions } = await X402Prober
                .probe( { client: mockClient, tools: [], timeout: 5000 } )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'PRB-005 probe: No tools available to probe' )
            expect( restrictedCalls ).toEqual( [] )
            expect( paymentOptions ).toEqual( [] )
        } )


        test( 'returns PRB-005 when tools is not an array', async () => {
            const mockClient = { callTool: jest.fn() }

            const { status, messages } = await X402Prober
                .probe( { client: mockClient, tools: null, timeout: 5000 } )

            expect( status ).toBe( false )
            expect( messages[ 0 ] ).toContain( 'PRB-005' )
        } )


        test( 'returns no restricted calls when tools respond normally', async () => {
            const mockClient = {
                callTool: jest.fn().mockResolvedValue( { content: [ { type: 'text', text: 'ok' } ] } )
            }

            const { status, restrictedCalls, paymentOptions } = await X402Prober
                .probe( { client: mockClient, tools: MOCK_TOOLS, timeout: 5000 } )

            expect( status ).toBe( true )
            expect( restrictedCalls ).toEqual( [] )
            expect( paymentOptions ).toEqual( [] )
            expect( mockClient.callTool ).toHaveBeenCalledTimes( 2 )
        } )


        test( 'detects 402 restricted tools', async () => {
            const paymentRequired = {
                x402Version: 2,
                accepts: [
                    { scheme: 'exact', network: 'eip155:84532', amount: '100000' }
                ]
            }

            const error402 = new Error( 'Payment Required' )
            error402.code = -32402
            error402.data = paymentRequired

            const mockClient = {
                callTool: jest.fn()
                    .mockRejectedValueOnce( error402 )
                    .mockResolvedValueOnce( { content: [] } )
            }

            const { status, restrictedCalls, paymentOptions } = await X402Prober
                .probe( { client: mockClient, tools: MOCK_TOOLS, timeout: 5000 } )

            expect( status ).toBe( true )
            expect( restrictedCalls ).toHaveLength( 1 )
            expect( restrictedCalls[ 0 ].toolName ).toBe( 'get_weather' )
            expect( restrictedCalls[ 0 ].paymentRequired ).toEqual( paymentRequired )
            expect( paymentOptions ).toHaveLength( 1 )
            expect( paymentOptions[ 0 ].scheme ).toBe( 'exact' )
        } )


        test( 'detects HTTP 402 code', async () => {
            const error402 = new Error( 'Payment Required' )
            error402.code = 402
            error402.data = { x402Version: 2, accepts: [] }

            const mockClient = {
                callTool: jest.fn()
                    .mockRejectedValueOnce( error402 )
                    .mockResolvedValueOnce( { content: [] } )
            }

            const { restrictedCalls } = await X402Prober
                .probe( { client: mockClient, tools: MOCK_TOOLS, timeout: 5000 } )

            expect( restrictedCalls ).toHaveLength( 1 )
        } )


        test( 'ignores non-402 errors', async () => {
            const error500 = new Error( 'Internal error' )
            error500.code = -32603

            const mockClient = {
                callTool: jest.fn()
                    .mockRejectedValueOnce( error500 )
                    .mockResolvedValueOnce( { content: [] } )
            }

            const { status, restrictedCalls } = await X402Prober
                .probe( { client: mockClient, tools: MOCK_TOOLS, timeout: 5000 } )

            expect( status ).toBe( true )
            expect( restrictedCalls ).toEqual( [] )
        } )


        test( 'handles 402 with no data', async () => {
            const error402 = new Error( 'Payment Required' )
            error402.code = 402

            const mockClient = {
                callTool: jest.fn()
                    .mockRejectedValueOnce( error402 )
                    .mockResolvedValueOnce( { content: [] } )
            }

            const { restrictedCalls } = await X402Prober
                .probe( { client: mockClient, tools: MOCK_TOOLS, timeout: 5000 } )

            expect( restrictedCalls ).toEqual( [] )
        } )


        test( 'handles 402 with non-object data', async () => {
            const error402 = new Error( 'Payment Required' )
            error402.code = 402
            error402.data = 'string-data'

            const mockClient = {
                callTool: jest.fn()
                    .mockRejectedValueOnce( error402 )
                    .mockResolvedValueOnce( { content: [] } )
            }

            const { restrictedCalls } = await X402Prober
                .probe( { client: mockClient, tools: MOCK_TOOLS, timeout: 5000 } )

            expect( restrictedCalls ).toEqual( [] )
        } )


        test( 'handles 402 with array data', async () => {
            const error402 = new Error( 'Payment Required' )
            error402.code = 402
            error402.data = [ 'array-data' ]

            const mockClient = {
                callTool: jest.fn()
                    .mockRejectedValueOnce( error402 )
                    .mockResolvedValueOnce( { content: [] } )
            }

            const { restrictedCalls } = await X402Prober
                .probe( { client: mockClient, tools: MOCK_TOOLS, timeout: 5000 } )

            expect( restrictedCalls ).toEqual( [] )
        } )


        test( 'builds minimal args from input schema', async () => {
            const toolsWithSchema = [
                {
                    name: 'typed_tool',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            query: { type: 'string' },
                            count: { type: 'number' },
                            flag: { type: 'boolean' },
                            items: { type: 'array' },
                            config: { type: 'object' }
                        },
                        required: [ 'query', 'count', 'flag', 'items', 'config' ]
                    }
                }
            ]

            const mockClient = {
                callTool: jest.fn().mockResolvedValue( { content: [] } )
            }

            await X402Prober.probe( { client: mockClient, tools: toolsWithSchema, timeout: 5000 } )

            expect( mockClient.callTool ).toHaveBeenCalledWith(
                {
                    name: 'typed_tool',
                    arguments: {
                        query: 'test',
                        count: 0,
                        flag: false,
                        items: [],
                        config: {}
                    }
                },
                { timeout: 5000 }
            )
        } )


        test( 'builds empty args when no input schema', async () => {
            const toolsNoSchema = [
                { name: 'simple_tool' }
            ]

            const mockClient = {
                callTool: jest.fn().mockResolvedValue( { content: [] } )
            }

            await X402Prober.probe( { client: mockClient, tools: toolsNoSchema, timeout: 5000 } )

            expect( mockClient.callTool ).toHaveBeenCalledWith(
                { name: 'simple_tool', arguments: {} },
                { timeout: 5000 }
            )
        } )


        test( 'handles required field with unknown type', async () => {
            const toolsUnknown = [
                {
                    name: 'unknown_type_tool',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            data: { type: 'custom' }
                        },
                        required: [ 'data' ]
                    }
                }
            ]

            const mockClient = {
                callTool: jest.fn().mockResolvedValue( { content: [] } )
            }

            await X402Prober.probe( { client: mockClient, tools: toolsUnknown, timeout: 5000 } )

            expect( mockClient.callTool ).toHaveBeenCalledWith(
                { name: 'unknown_type_tool', arguments: { data: '' } },
                { timeout: 5000 }
            )
        } )
    } )
} )
