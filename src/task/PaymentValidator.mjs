const EVM_ADDRESS_REGEX = /^0x[0-9a-fA-F]{40}$/
const ALLOWED_SCHEMES = [ 'exact' ]
const KNOWN_NETWORK_PREFIXES = [ 'eip155:', 'solana:' ]


class PaymentValidator {


    static validate( { restrictedCalls, paymentOptions } ) {
        const messages = []
        const validPaymentOptions = []

        restrictedCalls
            .forEach( ( restrictedCall, i ) => {
                const { paymentRequired } = restrictedCall

                if( paymentRequired === undefined || paymentRequired === null ) {
                    messages.push( `PAY-001 restrictedCalls[${i}]: PaymentRequired data is missing` )

                    return
                }

                if( typeof paymentRequired !== 'object' || Array.isArray( paymentRequired ) ) {
                    messages.push( `PAY-002 restrictedCalls[${i}]: PaymentRequired is not an object` )

                    return
                }

                PaymentValidator.#validateVersion( { paymentRequired, index: i, messages } )
                PaymentValidator.#validateResource( { paymentRequired, index: i, messages } )
                PaymentValidator.#validateAccepts( { paymentRequired, index: i, messages, validPaymentOptions } )
            } )

        return { messages, validPaymentOptions }
    }


    static #validateVersion( { paymentRequired, index, messages } ) {
        const prefix = `restrictedCalls[${index}]`

        if( paymentRequired['x402Version'] === undefined ) {
            messages.push( `PAY-010 ${prefix}.x402Version: Missing required field` )

            return
        }

        if( typeof paymentRequired['x402Version'] !== 'number' ) {
            messages.push( `PAY-011 ${prefix}.x402Version: Must be a number` )

            return
        }

        if( paymentRequired['x402Version'] !== 2 ) {
            messages.push( `PAY-012 ${prefix}.x402Version: Expected 2, got ${paymentRequired['x402Version']}` )
        }
    }


    static #validateResource( { paymentRequired, index, messages } ) {
        const prefix = `restrictedCalls[${index}]`
        const resource = paymentRequired['resource']

        if( resource === undefined || resource === null ) {
            return
        }

        if( typeof resource === 'string' ) {
            PaymentValidator.#validateResourceString( { resource, prefix, messages } )

            return
        }

        if( typeof resource !== 'object' || Array.isArray( resource ) ) {
            messages.push( `PAY-020 ${prefix}.resource: Must be a string or object` )

            return
        }

        PaymentValidator.#validateResourceObject( { resource, prefix, messages } )
    }


    static #validateResourceString( { resource, prefix, messages } ) {
        if( resource.trim() === '' ) {
            messages.push( `PAY-021 ${prefix}.resource: Must not be empty` )
        }
    }


    static #validateResourceObject( { resource, prefix, messages } ) {
        const url = resource['url']

        if( url === undefined ) {
            messages.push( `PAY-021 ${prefix}.resource.url: Missing value` )
        } else if( typeof url !== 'string' ) {
            messages.push( `PAY-022 ${prefix}.resource.url: Must be a string` )
        } else {
            try {
                new URL( url )
            } catch( _e ) {
                messages.push( `PAY-023 ${prefix}.resource.url: Invalid URL format` )
            }
        }

        const knownFields = [ 'url' ]

        Object.keys( resource )
            .filter( ( key ) => !knownFields.includes( key ) )
            .forEach( ( key ) => {
                messages.push( `PAY-024 ${prefix}.resource.${key}: Unknown field` )
            } )
    }


    static #validateAccepts( { paymentRequired, index, messages, validPaymentOptions } ) {
        const prefix = `restrictedCalls[${index}]`
        const accepts = paymentRequired['accepts']

        if( accepts === undefined ) {
            messages.push( `PAY-030 ${prefix}.accepts: Missing required field` )

            return
        }

        if( !Array.isArray( accepts ) ) {
            messages.push( `PAY-031 ${prefix}.accepts: Must be an array` )

            return
        }

        if( accepts.length === 0 ) {
            messages.push( `PAY-032 ${prefix}.accepts: Is empty array` )

            return
        }

        accepts
            .forEach( ( option, j ) => {
                const { valid } = PaymentValidator.#validatePaymentOption( { option, callIndex: index, optIndex: j, messages } )

                if( valid ) {
                    validPaymentOptions.push( option )
                }
            } )
    }


    static #validatePaymentOption( { option, callIndex, optIndex, messages } ) {
        const prefix = `restrictedCalls[${callIndex}].accepts[${optIndex}]`
        const initialLength = messages.length

        PaymentValidator.#validateScheme( { option, prefix, messages } )
        PaymentValidator.#validateNetworkField( { option, prefix, messages } )
        PaymentValidator.#validateAmount( { amount: option['amount'], prefix: `${prefix}.amount`, messages } )
        PaymentValidator.#validateAsset( { option, prefix, messages } )
        PaymentValidator.#validatePayTo( { option, prefix, messages } )
        PaymentValidator.#validateMaxTimeout( { option, prefix, messages } )
        PaymentValidator.#validateExtra( { option, prefix, messages } )

        const valid = messages.length === initialLength

        return { valid }
    }


    static #validateScheme( { option, prefix, messages } ) {
        const scheme = option['scheme']

        if( scheme === undefined ) {
            messages.push( `PAY-040 ${prefix}.scheme: Missing value` )

            return
        }

        if( typeof scheme !== 'string' ) {
            messages.push( `PAY-041 ${prefix}.scheme: Must be a string` )

            return
        }

        if( !ALLOWED_SCHEMES.includes( scheme ) ) {
            messages.push( `PAY-042 ${prefix}.scheme: Invalid value "${scheme}". Allowed are exact` )
        }
    }


    static #validateNetworkField( { option, prefix, messages } ) {
        const network = option['network']

        if( network === undefined ) {
            messages.push( `PAY-050 ${prefix}.network: Missing value` )

            return
        }

        if( typeof network !== 'string' ) {
            messages.push( `PAY-051 ${prefix}.network: Must be a string` )

            return
        }

        PaymentValidator.#validateNetwork( { network, prefix: `${prefix}.network`, messages } )
    }


    static #validateNetwork( { network, prefix, messages } ) {
        const matchedPrefix = KNOWN_NETWORK_PREFIXES
            .find( ( p ) => network.startsWith( p ) )

        if( !matchedPrefix ) {
            messages.push( `PAY-052 ${prefix}: Unknown prefix "${network}". Expected "eip155:*" or "solana:*"` )

            return
        }

        const afterPrefix = network.slice( matchedPrefix.length )

        if( afterPrefix === '' ) {
            messages.push( `PAY-053 ${prefix}: Missing chain ID after prefix` )
        }
    }


    static #validateAmount( { amount, prefix, messages } ) {
        if( amount === undefined ) {
            messages.push( `PAY-060 ${prefix}: Missing value` )

            return
        }

        if( typeof amount !== 'string' ) {
            messages.push( `PAY-061 ${prefix}: Must be a string` )

            return
        }

        const parsed = Number( amount )

        if( Number.isNaN( parsed ) ) {
            messages.push( `PAY-062 ${prefix}: Must be a numeric string` )

            return
        }

        if( parsed <= 0 ) {
            messages.push( `PAY-063 ${prefix}: Must be positive` )
        }
    }


    static #validateAsset( { option, prefix, messages } ) {
        const asset = option['asset']

        if( asset === undefined ) {
            messages.push( `PAY-070 ${prefix}.asset: Missing value` )

            return
        }

        if( typeof asset !== 'string' ) {
            messages.push( `PAY-071 ${prefix}.asset: Must be a string` )

            return
        }

        PaymentValidator.#validateEvmAddress( { address: asset, field: 'asset', prefix, messages } )
    }


    static #validatePayTo( { option, prefix, messages } ) {
        const payTo = option['payTo']

        if( payTo === undefined ) {
            messages.push( `PAY-080 ${prefix}.payTo: Missing value` )

            return
        }

        if( typeof payTo !== 'string' ) {
            messages.push( `PAY-081 ${prefix}.payTo: Must be a string` )

            return
        }

        PaymentValidator.#validateEvmAddress( { address: payTo, field: 'payTo', prefix, messages } )

        if( EVM_ADDRESS_REGEX.test( payTo ) ) {
            const { checksummed } = PaymentValidator.#isChecksummed( { address: payTo } )

            if( !checksummed ) {
                messages.push( `PAY-083 ${prefix}.payTo: Not checksummed` )
            }
        }
    }


    static #validateEvmAddress( { address, field, prefix, messages } ) {
        if( !EVM_ADDRESS_REGEX.test( address ) ) {
            const code = field === 'asset' ? 'PAY-072' : 'PAY-082'
            messages.push( `${code} ${prefix}.${field}: Invalid EVM address format` )
        }
    }


    static #isChecksummed( { address } ) {
        const checksummed = address !== address.toLowerCase() && address !== address.toUpperCase()

        return { checksummed }
    }


    static #validateMaxTimeout( { option, prefix, messages } ) {
        const maxTimeoutSeconds = option['maxTimeoutSeconds']

        if( maxTimeoutSeconds === undefined ) {
            messages.push( `PAY-090 ${prefix}.maxTimeoutSeconds: Missing value` )

            return
        }

        if( typeof maxTimeoutSeconds !== 'number' ) {
            messages.push( `PAY-091 ${prefix}.maxTimeoutSeconds: Must be a number` )

            return
        }

        if( maxTimeoutSeconds <= 0 ) {
            messages.push( `PAY-092 ${prefix}.maxTimeoutSeconds: Must be greater than 0` )
        }
    }


    static #validateExtra( { option, prefix, messages } ) {
        const extra = option['extra']

        if( extra === undefined ) {
            return
        }

        if( typeof extra !== 'object' || extra === null || Array.isArray( extra ) ) {
            messages.push( `PAY-100 ${prefix}.extra: Must be an object` )

            return
        }

        const network = option['network']
        const isEvm = typeof network === 'string' && network.startsWith( 'eip155:' )

        if( isEvm && !extra['name'] ) {
            messages.push( `PAY-101 ${prefix}.extra.name: Missing (recommended for EVM)` )
        }

        if( isEvm && !extra['version'] ) {
            messages.push( `PAY-102 ${prefix}.extra.version: Missing (recommended for EIP-3009)` )
        }
    }
}


export { PaymentValidator }
