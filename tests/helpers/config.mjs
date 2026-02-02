// --- MCP Server Info ---

const MOCK_SERVER_INFO = {
    serverInfo: {
        name: 'test-mcp-server',
        version: '1.0.0',
        description: 'A test MCP server'
    },
    protocolVersion: '2025-03-26',
    instructions: null
}


// --- MCP Capabilities ---

const MOCK_TOOLS = [
    {
        name: 'get_weather',
        description: 'Get weather for a location',
        inputSchema: {
            type: 'object',
            properties: {
                location: { type: 'string' }
            },
            required: [ 'location' ]
        }
    },
    {
        name: 'search_web',
        description: 'Search the web',
        inputSchema: {
            type: 'object',
            properties: {
                query: { type: 'string' }
            },
            required: [ 'query' ]
        }
    }
]

const MOCK_RESOURCES = [
    {
        uri: 'resource://docs',
        name: 'Documentation',
        description: 'API documentation'
    }
]

const MOCK_PROMPTS = [
    {
        name: 'summarize',
        description: 'Summarize text'
    }
]

const MOCK_CAPABILITIES = {
    tools: {},
    resources: {},
    prompts: {}
}

const MOCK_CAPABILITIES_WITH_TASKS = {
    tools: {},
    tasks: { supported: true }
}


// --- Valid Payment Required ---

const VALID_PAYMENT_REQUIRED = {
    x402Version: 2,
    resource: {
        url: 'https://mcp.example.com/tool/get_weather'
    },
    accepts: [
        {
            scheme: 'exact',
            network: 'eip155:84532',
            amount: '100000',
            asset: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
            payTo: '0x7B4d4C1E3bD0C6e3c8e1E5dA1f3a0E7c9B2D4F6A',
            maxTimeoutSeconds: 300,
            extra: {
                name: 'USDC',
                version: '2'
            }
        }
    ]
}

const VALID_PAYMENT_REQUIRED_MULTI_NETWORK = {
    x402Version: 2,
    accepts: [
        {
            scheme: 'exact',
            network: 'eip155:84532',
            amount: '100000',
            asset: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
            payTo: '0x7B4d4C1E3bD0C6e3c8e1E5dA1f3a0E7c9B2D4F6A',
            maxTimeoutSeconds: 300,
            extra: {
                name: 'USDC',
                version: '2'
            }
        },
        {
            scheme: 'exact',
            network: 'solana:mainnet',
            amount: '200000',
            asset: '0xAbCdEf0123456789AbCdEf0123456789AbCdEf01',
            payTo: '0x1234567890AbCdEf1234567890AbCdEf12345678',
            maxTimeoutSeconds: 600
        }
    ]
}


// --- Invalid Payment Required Variants ---

const INVALID_PAYMENT_MISSING_VERSION = {
    accepts: [
        {
            scheme: 'exact',
            network: 'eip155:84532',
            amount: '100000',
            asset: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
            payTo: '0x7B4d4C1E3bD0C6e3c8e1E5dA1f3a0E7c9B2D4F6A',
            maxTimeoutSeconds: 300
        }
    ]
}

const INVALID_PAYMENT_WRONG_VERSION = {
    x402Version: 1,
    accepts: [
        {
            scheme: 'exact',
            network: 'eip155:84532',
            amount: '100000',
            asset: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
            payTo: '0x7B4d4C1E3bD0C6e3c8e1E5dA1f3a0E7c9B2D4F6A',
            maxTimeoutSeconds: 300
        }
    ]
}

const INVALID_PAYMENT_EMPTY_ACCEPTS = {
    x402Version: 2,
    accepts: []
}

const INVALID_PAYMENT_BAD_SCHEME = {
    x402Version: 2,
    accepts: [
        {
            scheme: 'flexible',
            network: 'eip155:84532',
            amount: '100000',
            asset: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
            payTo: '0x7B4d4C1E3bD0C6e3c8e1E5dA1f3a0E7c9B2D4F6A',
            maxTimeoutSeconds: 300
        }
    ]
}

const INVALID_PAYMENT_BAD_NETWORK = {
    x402Version: 2,
    accepts: [
        {
            scheme: 'exact',
            network: 'bitcoin:mainnet',
            amount: '100000',
            asset: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
            payTo: '0x7B4d4C1E3bD0C6e3c8e1E5dA1f3a0E7c9B2D4F6A',
            maxTimeoutSeconds: 300
        }
    ]
}

const INVALID_PAYMENT_BAD_AMOUNT = {
    x402Version: 2,
    accepts: [
        {
            scheme: 'exact',
            network: 'eip155:84532',
            amount: 'not-a-number',
            asset: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
            payTo: '0x7B4d4C1E3bD0C6e3c8e1E5dA1f3a0E7c9B2D4F6A',
            maxTimeoutSeconds: 300
        }
    ]
}

const INVALID_PAYMENT_BAD_ADDRESS = {
    x402Version: 2,
    accepts: [
        {
            scheme: 'exact',
            network: 'eip155:84532',
            amount: '100000',
            asset: '0xinvalid',
            payTo: '0x7B4d4C1E3bD0C6e3c8e1E5dA1f3a0E7c9B2D4F6A',
            maxTimeoutSeconds: 300
        }
    ]
}


// --- Mock Restricted Calls ---

const MOCK_RESTRICTED_CALLS = [
    {
        toolName: 'get_weather',
        paymentRequired: VALID_PAYMENT_REQUIRED
    }
]

const MOCK_RESTRICTED_CALLS_MULTI = [
    {
        toolName: 'get_weather',
        paymentRequired: VALID_PAYMENT_REQUIRED
    },
    {
        toolName: 'search_web',
        paymentRequired: VALID_PAYMENT_REQUIRED_MULTI_NETWORK
    }
]


// --- Valid Payment Options (extracted from accepts) ---

const VALID_PAYMENT_OPTIONS = VALID_PAYMENT_REQUIRED['accepts']

const VALID_PAYMENT_OPTIONS_MULTI = [
    ...VALID_PAYMENT_REQUIRED['accepts'],
    ...VALID_PAYMENT_REQUIRED_MULTI_NETWORK['accepts']
]


// --- Expected Category Keys (12) ---

const EXPECTED_CATEGORY_KEYS = [
    'isReachable',
    'supportsMcp',
    'hasTools',
    'hasResources',
    'hasPrompts',
    'supportsX402',
    'hasValidPaymentRequirements',
    'supportsExactScheme',
    'supportsEvm',
    'supportsSolana',
    'supportsTasks',
    'supportsMcpApps'
]


// --- Expected Entry Keys (13) ---

const EXPECTED_ENTRY_KEYS = [
    'endpoint',
    'serverName',
    'serverVersion',
    'serverDescription',
    'protocolVersion',
    'capabilities',
    'instructions',
    'tools',
    'resources',
    'prompts',
    'x402',
    'latency',
    'timestamp'
]


// --- Full Valid Categories ---

const FULL_VALID_CATEGORIES = {
    isReachable: true,
    supportsMcp: true,
    hasTools: true,
    hasResources: true,
    hasPrompts: true,
    supportsX402: true,
    hasValidPaymentRequirements: true,
    supportsExactScheme: true,
    supportsEvm: true,
    supportsSolana: false,
    supportsTasks: false,
    supportsMcpApps: false
}


// --- Empty Categories ---

const EMPTY_CATEGORIES = {
    isReachable: false,
    supportsMcp: false,
    hasTools: false,
    hasResources: false,
    hasPrompts: false,
    supportsX402: false,
    hasValidPaymentRequirements: false,
    supportsExactScheme: false,
    supportsEvm: false,
    supportsSolana: false,
    supportsTasks: false,
    supportsMcpApps: false
}


// --- Mock Latency ---

const MOCK_LATENCY = {
    ping: 120,
    listTools: 250
}


// --- Test Endpoint ---

const TEST_ENDPOINT = 'https://mcp.example.com/mcp'


export {
    MOCK_SERVER_INFO,
    MOCK_TOOLS,
    MOCK_RESOURCES,
    MOCK_PROMPTS,
    MOCK_CAPABILITIES,
    MOCK_CAPABILITIES_WITH_TASKS,
    VALID_PAYMENT_REQUIRED,
    VALID_PAYMENT_REQUIRED_MULTI_NETWORK,
    INVALID_PAYMENT_MISSING_VERSION,
    INVALID_PAYMENT_WRONG_VERSION,
    INVALID_PAYMENT_EMPTY_ACCEPTS,
    INVALID_PAYMENT_BAD_SCHEME,
    INVALID_PAYMENT_BAD_NETWORK,
    INVALID_PAYMENT_BAD_AMOUNT,
    INVALID_PAYMENT_BAD_ADDRESS,
    MOCK_RESTRICTED_CALLS,
    MOCK_RESTRICTED_CALLS_MULTI,
    VALID_PAYMENT_OPTIONS,
    VALID_PAYMENT_OPTIONS_MULTI,
    EXPECTED_CATEGORY_KEYS,
    EXPECTED_ENTRY_KEYS,
    FULL_VALID_CATEGORIES,
    EMPTY_CATEGORIES,
    MOCK_LATENCY,
    TEST_ENDPOINT
}
