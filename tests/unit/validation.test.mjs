import { describe, test, expect } from '@jest/globals'
import { Validation } from '../../src/task/Validation.mjs'


describe( 'Validation', () => {
    describe( 'validationStart', () => {
        test( 'validates correct input', () => {
            const { status, messages } = Validation
                .validationStart( { mcpUrl: 'https://mcp.example.com/mcp', timeout: 10000 } )

            expect( status ).toBe( true )
            expect( messages ).toHaveLength( 0 )
        } )


        test( 'rejects missing mcpUrl', () => {
            const { status, messages } = Validation
                .validationStart( { mcpUrl: undefined, timeout: 10000 } )

            expect( status ).toBe( false )
            expect( messages[ 0 ] ).toContain( 'VAL-001' )
        } )


        test( 'rejects non-string mcpUrl', () => {
            const { status, messages } = Validation
                .validationStart( { mcpUrl: 123, timeout: 10000 } )

            expect( status ).toBe( false )
            expect( messages[ 0 ] ).toContain( 'VAL-002' )
        } )


        test( 'rejects empty mcpUrl', () => {
            const { status, messages } = Validation
                .validationStart( { mcpUrl: '   ', timeout: 10000 } )

            expect( status ).toBe( false )
            expect( messages[ 0 ] ).toContain( 'VAL-003' )
        } )


        test( 'rejects invalid URL', () => {
            const { status, messages } = Validation
                .validationStart( { mcpUrl: 'not-a-url', timeout: 10000 } )

            expect( status ).toBe( false )
            expect( messages[ 0 ] ).toContain( 'VAL-004' )
        } )


        test( 'rejects non-number timeout', () => {
            const { status, messages } = Validation
                .validationStart( { mcpUrl: 'https://mcp.example.com/mcp', timeout: 'fast' } )

            expect( status ).toBe( false )
            expect( messages[ 0 ] ).toContain( 'VAL-005' )
        } )


        test( 'rejects zero timeout', () => {
            const { status, messages } = Validation
                .validationStart( { mcpUrl: 'https://mcp.example.com/mcp', timeout: 0 } )

            expect( status ).toBe( false )
            expect( messages[ 0 ] ).toContain( 'VAL-006' )
        } )


        test( 'rejects negative timeout', () => {
            const { status, messages } = Validation
                .validationStart( { mcpUrl: 'https://mcp.example.com/mcp', timeout: -5 } )

            expect( status ).toBe( false )
            expect( messages[ 0 ] ).toContain( 'VAL-006' )
        } )


        test( 'accepts undefined timeout as optional', () => {
            const { status, messages } = Validation
                .validationStart( { mcpUrl: 'https://mcp.example.com/mcp', timeout: undefined } )

            expect( status ).toBe( true )
            expect( messages ).toHaveLength( 0 )
        } )
    } )


    describe( 'validationCompare', () => {
        const validSnapshot = {
            categories: { isReachable: true },
            entries: { mcpUrl: 'https://example.com' }
        }


        test( 'validates correct input', () => {
            const { status, messages } = Validation
                .validationCompare( { before: validSnapshot, after: validSnapshot } )

            expect( status ).toBe( true )
            expect( messages ).toHaveLength( 0 )
        } )


        test( 'rejects missing before', () => {
            const { status, messages } = Validation
                .validationCompare( { before: undefined, after: validSnapshot } )

            expect( status ).toBe( false )
            expect( messages[ 0 ] ).toContain( 'VAL-010' )
        } )


        test( 'rejects null before', () => {
            const { status, messages } = Validation
                .validationCompare( { before: null, after: validSnapshot } )

            expect( status ).toBe( false )
            expect( messages[ 0 ] ).toContain( 'VAL-011' )
        } )


        test( 'rejects array before', () => {
            const { status, messages } = Validation
                .validationCompare( { before: [], after: validSnapshot } )

            expect( status ).toBe( false )
            expect( messages[ 0 ] ).toContain( 'VAL-011' )
        } )


        test( 'rejects before without categories', () => {
            const { status, messages } = Validation
                .validationCompare( { before: { entries: {} }, after: validSnapshot } )

            expect( status ).toBe( false )
            expect( messages[ 0 ] ).toContain( 'VAL-012' )
        } )


        test( 'rejects missing after', () => {
            const { status, messages } = Validation
                .validationCompare( { before: validSnapshot, after: undefined } )

            expect( status ).toBe( false )
            expect( messages[ 0 ] ).toContain( 'VAL-013' )
        } )


        test( 'rejects null after', () => {
            const { status, messages } = Validation
                .validationCompare( { before: validSnapshot, after: null } )

            expect( status ).toBe( false )
            expect( messages[ 0 ] ).toContain( 'VAL-014' )
        } )


        test( 'rejects after without entries', () => {
            const { status, messages } = Validation
                .validationCompare( { before: validSnapshot, after: { categories: {} } } )

            expect( status ).toBe( false )
            expect( messages[ 0 ] ).toContain( 'VAL-015' )
        } )
    } )


    describe( 'error', () => {
        test( 'throws error with joined messages', () => {
            expect( () => {
                Validation.error( { messages: [ 'Error A', 'Error B' ] } )
            } ).toThrow( 'Error A, Error B' )
        } )
    } )
} )
