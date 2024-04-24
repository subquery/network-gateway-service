// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

enum SubqueryNetwork {
  testnet = 'testnet',
  mainnet = 'mainnet',
}

type Network =
  | 'polkadot'
  | 'kusama'
  | 'moonbeam'
  | 'moonriver'
  | 'nodle'
  | 'acala'
  | 'karura'
  | 'arbitrum'
  | 'optimism'
  | 'khala'
  | 'astar'
  | 'westend'
  | 'polygon'
  | 'mumbai'
  | 'shiden'
  | 'statemint'
  | 'aleph-zero'
  | 'kilt'
  | 'bifrost'
  | 'calamari'
  | 'moonbase-alpha'
  | 'algorand'
  | 'near'
  | 'juno'
  | 'fetchai';

const NetworkChainId: Record<Network, string> = {
  polkadot:
    '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3',
  kusama: '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe',
  moonbeam:
    '0xfe58ea77779b7abda7da4ec526d14db9b1e9cd40a217c34892af80a9b332b76d',
  moonriver:
    '0x401a1f9dca3da46f5c4091016c8a2f26dcea05865116b286f60f668207d1474b',
  nodle: '0x97da7ede98d7bad4e36b4d734b6055425a3be036da2a332ea5a7037656427a21',
  acala: '0xfc41b9bd8ef8fe53d58c7ea67c794c7ec9a73daf05e6d54b14ff6342c99ba64c',
  karura: '0xbaf5aabe40646d11f0ee8abbdc64f4a4b7674925cba08e4a05ff9ebed6e2126b',
  arbitrum: '42161',
  optimism: '10',
  khala: '0xd43540ba6d3eb4897c28a77d48cb5b729fea37603cbbfc7a86a73b72adb3be8d',
  astar: '0x9eb76c5184c4ab8679d2d5d819fdf90b9c001403e9e17da2e14b6d8aec4029c6',
  westend: '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e',
  polygon: '137',
  mumbai: '80001',
  shiden: '0xf1cf9022c7ebb34b162d5b5e34e705a5a740b2d0ecc1009fb89023e62a488108',
  statemint:
    '0x68d56f15f85d3136970ec16946040bc1752654e906147f7e43e9d539d7c3de2f',
  'aleph-zero':
    '0x70255b4d28de0fc4e1a193d7e175ad1ccef431598211c55538f1018651a0344e',
  kilt: '0x411f057b9107718c9624d6aa4a3f23c1653898297f3d4d529d9bb6511a39dd21',
  bifrost: '0x9f28c6a68e0fc9646eff64935684f6eeeece527e37bbe1f213d22caa1d9d6bed',
  calamari:
    '0x4ac80c99289841dd946ef92765bf659a307d39189b3ce374a92b5f0415ee17a1',
  'moonbase-alpha':
    '0x91bc6e169807aaa54802737e1c504b2577d4fafedd5a02c10293b1cd60e39527',
  algorand: 'wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=',
  near: 'mainnet',
  juno: 'juno-1',
  fetchai: 'fetchhub-4',
};

export const chainIdToDeploymentId: Record<string, Record<string, string>> = {
  [SubqueryNetwork.testnet]: {
    [NetworkChainId.polkadot]: 'QmZGAZQ7e1oZgfuK4V29Fa5gveYK3G2zEwvUzTZKNvSBsm',
    [NetworkChainId.kusama]: 'QmXwfCF8858YY924VHgNLsxRQfBLosVbB31mygRLhgJbWn',
    [NetworkChainId.moonbeam]: 'QmeeqBHdVu7iYnhVE9ZiYEKTWe4jXVUD5pVoGXT6LbCP2t',
    [NetworkChainId.nodle]: 'QmQtmsHoJEYUcxKE4tBqr9Z8kudcgkczQPfhkAxVExQX5y',
  },
  [SubqueryNetwork.mainnet]: {
    [NetworkChainId.polkadot]: 'QmUGBdhQKnzE8q6x6MPqP6LNZGa8gzXf5gkdmhzWjdFGfL',
    [NetworkChainId.kusama]: 'Qmbe5g5vbEJYYAfpjcwNDzuhjeyaEQPQbxKyKx6PveYnR8',
    [NetworkChainId.moonbeam]: 'QmUHAsweQYXYrY5Swbt1eHkUwnE5iLc7w9Fh62JY6guXEK',
    [NetworkChainId.moonriver]:
      'QmWhwLQA4P6iZv6bmQxUqG5zumNK8KDBwcq8wxN4G213dq',
    [NetworkChainId.nodle]: 'QmZpj5wYpUbGqJDg6KWgbkK5bmeuCqYX6kwk317jdJ9DZ4',
    [NetworkChainId.acala]: 'QmUj8yYCE1YU5UNdtm4q4di4GBDEAmL8vprSRWVGrYeEFm',
    [NetworkChainId.karura]: 'QmPQQA28fxR1hePk25MHNS1vEYRs4Gbz3PXry8G4dfC76N',
    [NetworkChainId.arbitrum]: 'QmPKMkqTe7UMRPZWxuD8dFgufjKzWQEeW84Qo1x1X8VVLR', // not exist
    [NetworkChainId.optimism]: 'QmPuHdLxTQHEAitgLe9Sg1Jnr1WwJASDRSL5RUzBe3NywV', // not exist
    [NetworkChainId.khala]: 'QmP2KRbGx4vLaL8HqugVXrNPMyziFL6aM9NAd4NbFqsPA9',
    [NetworkChainId.astar]: 'QmapQ6cNKPtZE1jkeUp5V6xy7sPSiJiZpoqZcRRtyc4Stq',
    [NetworkChainId.westend]: 'QmP1BMJoyJ5iFq6XLSfTJ3D23iWuTG1tnsEffJpNieQnwN',
    [NetworkChainId.shiden]: 'QmPiTswpMTeipwnmJkAcwkcg5Se8XfrucGYVKbwuAxQgJ6',
    [NetworkChainId.statemint]:
      'Qme1iQvwLoeh1ZLZVL4zDGZBK1hnMG3xZz1oaLBRvZxT7X',
    [NetworkChainId['aleph-zero']]:
      'QmaYR3CJyhywww1Cf5TMJP15DAcD3YE9ZSNmdLbM7KiQHi',
    [NetworkChainId.kilt]: 'QmeBTNuhahUo2EhTRxV3qVAVf5bC8zVQRrrHd3SUDXgtbF',
    [NetworkChainId.bifrost]: 'QmcvcN4gZkiB2JkmK6BdHh7Wzy8Gfp8R7ZHSgGajbGv6Wy',
    [NetworkChainId.calamari]: 'QmdrqzazvSmrr6rgfxJEssJH9jqhYCZARm92UxNXMv5f86',
    [NetworkChainId['moonbase-alpha']]:
      'QmWv9Ja5AQ9cPpXb6U7sGCvkhK6XbZ7xQntTBqidsSf5SF',
    [NetworkChainId.algorand]: 'QmYNRtrcD2QKftkff2UpjV3fr3ubPZuYahTNDAct4Ad2NW',
    [NetworkChainId.near]: 'QmSKrk3BpzjWzKfS8sZRS5vyjmtXvkJnK8nHUVBhiCmz41',
    [NetworkChainId.juno]: 'QmPjq55mgUt9S8S491Q3wEbb87fXyEkdxymT6Gwe2xe1Z1',
    [NetworkChainId.fetchai]: 'QmbtSt8USCUTBWeAqevN1AwmUhKzqmtvhSdFYHYA1BviC8',
  },
};

export type ChainConfig = {
  rpc: string;
  method: string;
  blockGap: number;
  dictionaryBlockGap: number;
};

export const chainIdToConfig: Record<string, ChainConfig> = {
  [NetworkChainId.polkadot]: {
    rpc: 'https://rpc.polkadot.io',
    method: 'chain_getHeader',
    blockGap: 100,
    dictionaryBlockGap: 500,
  },
  [NetworkChainId.kusama]: {
    rpc: 'https://kusama-rpc.polkadot.io',
    method: 'chain_getHeader',
    blockGap: 100,
    dictionaryBlockGap: 500,
  },
  [NetworkChainId.nodle]: {
    rpc: 'https://nodle-parachain.api.onfinality.io/public',
    method: 'chain_getHeader',
    blockGap: 100,
    dictionaryBlockGap: 500,
  },
  [NetworkChainId.acala]: {
    rpc: 'https://acala-rpc.dwellir.com',
    method: 'chain_getHeader',
    blockGap: 100,
    dictionaryBlockGap: 500,
  },
  [NetworkChainId.karura]: {
    rpc: 'https://karura-rpc.dwellir.com',
    method: 'chain_getHeader',
    blockGap: 100,
    dictionaryBlockGap: 500,
  },
  [NetworkChainId.khala]: {
    rpc: 'https://khala.api.onfinality.io/public',
    method: 'chain_getHeader',
    blockGap: 100,
    dictionaryBlockGap: 500,
  },
  [NetworkChainId.astar]: {
    rpc: 'https://astar.api.onfinality.io/public',
    method: 'chain_getHeader',
    blockGap: 100,
    dictionaryBlockGap: 500,
  },
  [NetworkChainId.westend]: {
    rpc: 'https://westend-rpc.polkadot.io',
    method: 'chain_getHeader',
    blockGap: 100,
    dictionaryBlockGap: 500,
  },
  // ethereum compatible chains
  [NetworkChainId.moonbeam]: {
    rpc: 'https://moonbeam.api.onfinality.io/public',
    method: 'eth_blockNumber',
    blockGap: 100,
    dictionaryBlockGap: 500,
  },
  [NetworkChainId.moonriver]: {
    rpc: 'https://moonriver.api.onfinality.io/public',
    method: 'eth_blockNumber',
    blockGap: 100,
    dictionaryBlockGap: 500,
  },
  [NetworkChainId.optimism]: {
    rpc: 'https://mainnet.optimism.io',
    method: 'eth_blockNumber',
    blockGap: 100,
    dictionaryBlockGap: 500,
  },
  [NetworkChainId.arbitrum]: {
    rpc: 'https://arb1.arbitrum.io/rpc',
    method: 'eth_blockNumber',
    blockGap: 100,
    dictionaryBlockGap: 500,
  },
  [NetworkChainId.polygon]: {
    rpc: 'https://polygon-rpc.com/',
    method: 'eth_blockNumber',
    blockGap: 100,
    dictionaryBlockGap: 500,
  },
  [NetworkChainId.mumbai]: {
    rpc: 'https://rpc-mumbai.polygon.technology',
    method: 'eth_blockNumber',
    blockGap: 100,
    dictionaryBlockGap: 500,
  },
  [NetworkChainId.shiden]: {
    rpc: '',
    method: 'chain_getHeader',
    blockGap: 100,
    dictionaryBlockGap: 500,
  },
  [NetworkChainId.statemint]: {
    rpc: '',
    method: 'chain_getHeader',
    blockGap: 100,
    dictionaryBlockGap: 500,
  },
  [NetworkChainId['aleph-zero']]: {
    rpc: '',
    method: 'chain_getHeader',
    blockGap: 100,
    dictionaryBlockGap: 500,
  },
  [NetworkChainId.kilt]: {
    rpc: '',
    method: 'chain_getHeader',
    blockGap: 100,
    dictionaryBlockGap: 500,
  },
  [NetworkChainId.bifrost]: {
    rpc: '',
    method: 'chain_getHeader',
    blockGap: 100,
    dictionaryBlockGap: 500,
  },
  [NetworkChainId.calamari]: {
    rpc: '',
    method: 'chain_getHeader',
    blockGap: 100,
    dictionaryBlockGap: 500,
  },
  [NetworkChainId['moonbase-alpha']]: {
    rpc: '',
    method: 'chain_getHeader',
    blockGap: 100,
    dictionaryBlockGap: 500,
  },
  [NetworkChainId.algorand]: {
    rpc: '',
    method: '',
    blockGap: 100,
    dictionaryBlockGap: 1000,
  },
  [NetworkChainId.near]: {
    rpc: '',
    method: '',
    blockGap: 100,
    dictionaryBlockGap: 10000,
  },
  [NetworkChainId.juno]: {
    rpc: '',
    method: '',
    blockGap: 100,
    dictionaryBlockGap: 10000,
  },
  [NetworkChainId.fetchai]: {
    rpc: '',
    method: '',
    blockGap: 100,
    dictionaryBlockGap: 1000,
  },
};
