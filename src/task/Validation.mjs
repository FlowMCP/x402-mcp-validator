class Validation {


    static validationStart( { mcpUrl, timeout } ) {
        const struct = { status: false, messages: [] }

        if( mcpUrl === undefined ) {
            struct['messages'].push( 'VAL-001 mcpUrl: Missing value' )
        } else if( typeof mcpUrl !== 'string' ) {
            struct['messages'].push( 'VAL-002 mcpUrl: Must be a string' )
        } else if( mcpUrl.trim() === '' ) {
            struct['messages'].push( 'VAL-003 mcpUrl: Must not be empty' )
        } else {
            try {
                new URL( mcpUrl )
            } catch( _e ) {
                struct['messages'].push( 'VAL-004 mcpUrl: Must be a valid URL' )
            }
        }

        if( timeout !== undefined ) {
            if( typeof timeout !== 'number' ) {
                struct['messages'].push( 'VAL-005 timeout: Must be a number' )
            } else if( timeout <= 0 ) {
                struct['messages'].push( 'VAL-006 timeout: Must be greater than 0' )
            }
        }

        if( struct['messages'].length > 0 ) {
            return struct
        }

        struct['status'] = true

        return struct
    }


    static validationCompare( { before, after } ) {
        const struct = { status: false, messages: [] }

        if( before === undefined ) {
            struct['messages'].push( 'VAL-010 before: Missing value' )
        } else if( before === null || typeof before !== 'object' || Array.isArray( before ) ) {
            struct['messages'].push( 'VAL-011 before: Must be an object' )
        } else if( !before['categories'] || !before['entries'] ) {
            struct['messages'].push( 'VAL-012 before: Missing categories or entries' )
        }

        if( after === undefined ) {
            struct['messages'].push( 'VAL-013 after: Missing value' )
        } else if( after === null || typeof after !== 'object' || Array.isArray( after ) ) {
            struct['messages'].push( 'VAL-014 after: Must be an object' )
        } else if( !after['categories'] || !after['entries'] ) {
            struct['messages'].push( 'VAL-015 after: Missing categories or entries' )
        }

        if( struct['messages'].length > 0 ) {
            return struct
        }

        struct['status'] = true

        return struct
    }


    static error( { messages } ) {
        const messageStr = messages.join( ', ' )

        throw new Error( messageStr )
    }
}


export { Validation }
