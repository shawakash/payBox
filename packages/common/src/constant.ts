import { Network } from "./types";
import { Cluster } from "@solana/web3.js";

export const PORT: number = 8080;
export const SolanaRpcUrl = "https://api.devnet.solana.com";
export const BACKEND_URL = "http://localhost:8080";
export const HASURA_ADMIN_SERCRET = "myadminsecretkey";
export const REDIS_URL = "redis://localhost:6379";
export const JWT_ALGO = "RS256";

export const AUTH_JWT_PUBLIC_KEY =
  process.env.AUTH_JWT_PUBLIC_KEY ||
  "-----BEGIN PUBLIC KEY-----MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqx+7XJxJR+0Lp8hLFKYr5Gc+0RPIdaZJ18GH8b//oMn7PCVe0gLQDkxjvhKo2ySMgWSOSGaNJkZXLhN4jlot/xaulN3dSbrgQPxvx3ALd3nXJaTLOb7xBODd196r+Ylg1QPICdrBQVi6qAXacq/UBK8K7BWQ0TG2/R9aB5mNSGtY3Ogj9xp2MP5LTi7f2Alj6IwSFRN+9SCmH3NiQzNUPBWJB02Lgx1oxwtfevkQ3BpwIqzkOTTE1G7PXgKbYRBUlUNqwvMIjk89tRf/qHgMbRPGYYNu7XoRt8AOVgNFUcL51Gb9vM75XstWoAh6BwYQsceEXUU7dgIJem9zItFRdwIDAQAB-----END PUBLIC KEY-----";

export const AUTH_JWT_PRIVATE_KEY =
  process.env.AUTH_JWT_PRIVATE_KEY ||
  "-----BEGIN PRIVATE KEY-----MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCrH7tcnElH7QunyEsUpivkZz7RE8h1pknXwYfxv/+gyfs8JV7SAtAOTGO+EqjbJIyBZI5IZo0mRlcuE3iOWi3/Fq6U3d1JuuBA/G/HcAt3edclpMs5vvEE4N3X3qv5iWDVA8gJ2sFBWLqoBdpyr9QErwrsFZDRMbb9H1oHmY1Ia1jc6CP3GnYw/ktOLt/YCWPojBIVE371IKYfc2JDM1Q8FYkHTYuDHWjHC196+RDcGnAirOQ5NMTUbs9eApthEFSVQ2rC8wiOTz21F/+oeAxtE8Zhg27tehG3wA5WA0VRwvnUZv28zvley1agCHoHBhCxx4RdRTt2Agl6b3Mi0VF3AgMBAAECggEAMom1kN1LOyXDynJ50ghdcCAZyi+YhT5uEn1Cg+AbQ8ZDH3k97rIL9h0TXAAwxD+gC1rCNpmq2AHwH1h6wzfY27w8JRT9FJhPQIINFQ5/JHLkWma36j78+V7bxbQqgBDVezOZsWdcqcrlnVfVMwfAiv2TMTQRR+bxzwGiWho8QoWNq1UcA8GGOE3vzWGrZJbgVwG43xUVDJtMem9w4QwlHLwekP3Q46Lqx1AOtesN39h/HduJtWtYGcw/t2TkIW9UibmBqZy7rkZW+4hCXhGBI6YhAUYnuyP6ZT+r1+J2aPlJeo2yIyjc6YVxoFwUR7QWtINzuBtG9v/YXfmtYCnEIQKBgQDd3E/nX4Vc7xolvoQZzN+0XWnyLqPgtAL63RLFfb8/lhnHHzca2k2eI0+P6I9etDa9c+i4l7/RM5LUkwxd8RGH6S4m8FiUkdKyaiwK1PAGRiUbWaij9WjKVjp7QhEtisQvtyMa9quwpv3C02zbD31/PqgeTmXOH0Aweh162qyeBwKBgQDFdMQ13JCkQe3GNO06EEPE+NjFkLqBVP2leDXmUVZRnHUN4OMpjCb9H0+/4rOAusCRmS9kALoeo6U9ykC5mqUViVzeTqnHXctD4llvEzSngDU/4+cbUQG3obj8JG9lupe/p3r6gRvB13nWiwVzj2wgK2SY0HGG1gaRaIS3K2nVEQKBgQCNhlJ6V9as9+GIHkYKZ0R0u/ovgU0MtAgKmye0T4jGOSvsd58hRAyrSf8g38tFMFSS+fOEfVjhTLLnY35KFtOGDVthf4QiEfuD0HKT3k3W0rws/D61iID2QZdAtV5b3N9VSM/eDWhsYboSo+gWvYTivMdlvcD3gbvisKNJkWD31QKBgCdgIqSPCHUJBK6K7WevyKPl7+xt8RNLbI1rzGvSeoEpzxnmZ8ZoQXomnVOplJwuIaqnPpEVqAfmIFSTGZcppJQH4XIfg7HTHW67G5SP4ucoJPZJr1N+MvZ4lJgLd/90V0CL2HVN+8gK/SvwazThO/GqVZQ3tPvrgEHM8vJIAQHRAoGAEjFMNmitScLogo9Cq5oX88/KpDOfCi+IG19g0HdaepgzreDzallcKf/XnXX9d7wuTuoSRNsq7RfCmLAUlzC+Waw0dpwLkZjgeVvFdrADGOFDKEovesZ0NBQ+Ln0SXJVRaynRxgnrjYINE+1I3uE8XZie4NMh5pybTXBpyx/cIz0=-----END PRIVATE KEY-----";

export const CLIENT_URL = "http://localhost:3000";

export const SALT_ROUNDS = 10;
export const WEB_URL = "http://localhost:3000";
export const isEthereumAddress = (value: string): boolean =>
  /^0x[0-9a-fA-F]{40}$/.test(value);
export const isEthereumPrivateKey = (value: string) =>
  /^0x[0-9a-fA-F]{64}$/.test(value);
export const isSolanaAddress = (value: string): boolean =>
  /^[a-zA-Z0-9]{44}$/.test(value);

export const KAFKA_CLIENT_ID =
  "83f59a2c6bc114d2ed9be33a353fce153f8a73313be585f2ae41fcebe4c8a18b";
export const KAFKA_URL = "localhost:9092";

export const HASURA_URL =
  process.env.HASURA_URL || "http://localhost:8112/v1/graphql";

export const HASURA_ADMIN_SECRET =
  process.env.HAURA_ADMIN_SECRET || "myadminsecret";

export const JWT =
  process.env.AUTH_JWT ||
  "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLWFsbG93ZWQtcm9sZXMiOlsiYWRtaW4iXSwieC1oYXN1cmEtZGVmYXVsdC1yb2xlIjoiYWRtaW4ifSwiaWF0IjoxNjY0MjQ3NzE2fQ.RMvnfvZtfhgQvCGj5HeT_4qDk1jjGTVLvO4hXQhxvH1QOU3E4yWv5rqDwhGeH9m2aZh7EiV8s3zQ70XkvPV-TA";

export const AddressSelectFramework = Object.keys(Network).map((key) => ({
  value: Network[key as keyof typeof Network],
  label: key,
}));

export enum EthCluster {
  Mainnet = "mainnet",
  Ropsten = "ropsten",
  Rinkeby = "rinkeby",
  Goerli = "goerli",
  Kovan = "kovan",
  Sepolia = "sepolia",
}

export enum BitcoinCluster {
  MAINNET = 'mainnet',
  TESTNET = 'testnet',
  REGTEST = 'regtest',
}

export enum USDCCluster {
  ETHEREUM_MAINNET = 'ethereum_mainnet',
  ETHEREUM_ROPSTEN = 'ethereum_ropsten',
  ETHEREUM_RINKEBY = 'ethereum_rinkeby',
  ETHEREUM_TESTNET = 'ethereum_testnet',
  ETHEREUM_LOCAL = 'ethereum_local',
  OTHER = 'other',
}

export enum SolCluster {
  Mainnet = "mainnet",
  Devnet = "devnet",
  Testnet = "testnet",
}

export const SOLSCAN_TXN_URL = (txnId: string, cluster: Cluster): string => {
  return `https://solscan.io/tx/${txnId}?cluster=${cluster}`;
};

export const SOLSCAN_ACCOUNT_URL = (accountId: string): string => {
  return `https://solscan.io/account/${accountId}`;
};

export const ETHERSCAN_TXN_URL = (txnHash: string, network: EthCluster): string => {
  return `https://${network === EthCluster.Mainnet ? '' : (network + '.')}etherscan.io/tx/${txnHash}`;
};

export const ETHERSCAN_ACCOUNT_URL = (address: string, network: EthCluster): string => {
  return `https://${network === EthCluster.Mainnet ? '' : (network + '.')}etherscan.io/address/${address}`;
};

export const BLOCKEXPLORER_TXN_URL = (txnId: string, network: BitcoinCluster): string => {
  return `https://blockexplorer.com/tx/${txnId}`;
};

export const BLOCKEXPLORER_ADDRESS_URL = (address: string, network: BitcoinCluster): string => {
  return `https://blockexplorer.com/address/${address}`;
};


export const USDC_ETHERSCAN_TXN_URL = (txnHash: string, network: string): string => {
  return `https://${network === USDCCluster.ETHEREUM_MAINNET ? '' : (network + '.')}etherscan.io/tx/${txnHash}`;
};

export const USDC_ETHERSCAN_ACCOUNT_URL = (address: string, network: string): string => {
  return `https://${network === USDCCluster.ETHEREUM_MAINNET ? '' : (network + '.')}etherscan.io/address/${address}`;
};


export const getTransactionUrl = (network: Network, txnId: string, cluster: Cluster | EthCluster | BitcoinCluster | USDCCluster | undefined): string => {
  switch (network) {
    case Network.Sol:
      return SOLSCAN_TXN_URL(txnId, cluster as Cluster);
    case Network.Eth:
      return ETHERSCAN_TXN_URL(txnId, cluster as EthCluster);
    case Network.Bitcoin:
      return BLOCKEXPLORER_TXN_URL(txnId, cluster as BitcoinCluster);
    case Network.USDC:
      return USDC_ETHERSCAN_TXN_URL(txnId, cluster as string);
    default:
      return '#';
  }

}

export const getAccountUrl = (network: Network, accountId: string, cluster: Cluster | EthCluster | BitcoinCluster | USDCCluster | undefined): string => {
  switch (network) {
    case Network.Sol:
      return SOLSCAN_ACCOUNT_URL(accountId);
    case Network.Eth:
      return ETHERSCAN_ACCOUNT_URL(accountId, cluster as EthCluster);
    case Network.Bitcoin:
      return BLOCKEXPLORER_ADDRESS_URL(accountId, cluster as BitcoinCluster);
    case Network.USDC:
      return USDC_ETHERSCAN_ACCOUNT_URL(accountId, cluster as string);
    default:
      return '#';
  }

}

export const capitiliaze = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const BTC_WS_URL = "wss://ws.blockchain.info/inv";


export interface ClusterObject {
  value: string;
  label: string;
}

export const enumToClustersArray = (enumObject: any): ClusterObject[] => {
  const clusters: ClusterObject[] = [];
  for (const key in enumObject) {
    if (Object.prototype.hasOwnProperty.call(enumObject, key)) {
        const value = (enumObject as any)[key]; // Type assertion to any
        clusters.push({ value, label: key });
    }
}
  return clusters;
}

// for 12 word seed
export const SECRET_PHASE_STRENGTH = 128;