// Algorand Network Configuration
// No API keys needed - these are public endpoints

export const ALGORAND_CONFIG = {
  // TestNet Configuration (Free, no API key needed)
  testnet: {
    algod: {
      baseServer: 'https://testnet-api.algonode.cloud',
      port: '',
      token: '',
    },
    indexer: {
      baseServer: 'https://testnet-idx.algonode.cloud',
      port: '',
      token: '',
    },
    network: 'testnet',
  },
  
  // MainNet Configuration (Free, no API key needed)
  mainnet: {
    algod: {
      baseServer: 'https://mainnet-api.algonode.cloud',
      port: '',
      token: '',
    },
    indexer: {
      baseServer: 'https://mainnet-idx.algonode.cloud',
      port: '',
      token: '',
    },
    network: 'mainnet',
  },
};

// Default to TestNet for development
export const DEFAULT_NETWORK = 'testnet';

// Get current network config for AlgorandClient
export function getAlgodConfig() {
  const config = ALGORAND_CONFIG[DEFAULT_NETWORK].algod;
  return {
    baseServer: config.baseServer,
    port: config.port || '',
    token: config.token || '',
  };
}

// Get config in the format AlgorandClient expects
export function getAlgorandClientConfig() {
  const config = ALGORAND_CONFIG[DEFAULT_NETWORK].algod;
  return {
    server: config.baseServer,
    port: config.port || '',
    token: config.token || '',
  };
}

export function getIndexerConfig() {
  const config = ALGORAND_CONFIG[DEFAULT_NETWORK].indexer;
  return {
    server: config.baseServer,
    port: config.port,
    token: config.token,
  };
}

export function getNetworkName() {
  return ALGORAND_CONFIG[DEFAULT_NETWORK].network;
}
