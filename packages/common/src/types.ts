import { z } from "zod";
import {
  ClientSignupFormValidate,
  MetadataUpdateForm,
} from "./validations/clientValid";
import {
  AddressForm,
  AddressFormPartial,
  GetQrQuerySchema,
  TxnQeuryByHash,
  TxnSendQuery,
  TxnsQeury,
  networkPublicKey,
} from "./validations";
import { Message } from "@solana/web3.js";
import { BitcoinCluster, EthCluster, USDCCluster } from "./constant";
import { Cluster } from "@solana/web3.js";

export enum Network {
  Sol = "sol",
  Eth = "eth",
  Bitcoin = "bitcoin",
  USDC = "usdc",
}

export type Client = z.infer<typeof ClientSignupFormValidate> & { id: string };
export enum SignType {
  Signin = "Signin",
  Signout = "Signout",
  Signup = "Signup",
}

export type ClientForm = z.infer<typeof ClientSignupFormValidate>;

export enum responseStatus {
  Error = "error",
  Ok = "ok",
}

export enum wsResponseStatus {
  Error = "error",
  Ok = "ok",
}

export enum hookStatus {
  Error = "error",
  Ok = "ok",
}

export type useSignUpHookProps = {
  status: hookStatus;
  msg: string;
  load?: string;
};

export type ClientWithJwt = Partial<Client> & { jwt: string };

export type MetadataUpdateFormType = z.infer<typeof MetadataUpdateForm>;
export type AddressFormPartialType = z.infer<typeof AddressFormPartial>;

export type AddressPartial = AddressFormPartialType & { id: string };

export type Address = z.infer<typeof AddressForm>;

export type AcceptSolTxn = {
  from: string;
  amount: number;
  to: string;
};

export type AcceptEthTxn = {
  from: string;
  amount: number;
  to: string;
};

export type TxnSendQueryType = z.infer<typeof TxnSendQuery>;

export type InsertTxnType = {
  clientId: string;
  blockTime: number;
  amount: number;
  fee: number;
  from: string;
  to: string;
  postBalances?: number[] | null;
  preBalances?: number[] | null;
  recentBlockhash: string;
  signature: string[];
  network: Network;
  slot?: number | null;
  nonce?: number | null;
  chainId?: number;
  cluster?: EthCluster | Cluster | BitcoinCluster | USDCCluster;
};

export type TxnType = InsertTxnType & {
  id: string;
  time?: string;
};

export type TxnsQeuryType = z.infer<typeof TxnsQeury> & { clientId: string };
export type TxnQuerySignType = z.infer<typeof TxnQeuryByHash> & {
  clientId: string;
};

export type KafkaTopicType = {
  topicName: string;
  partitions: number;
};

export type PublishType = {
  topic: string;
  message: Array<{
    partition: number;
    key: string;
    value: any;
  }>;
};

export enum dbResStatus {
  Error = "error",
  Ok = "ok",
}

export enum Partitions {
  SolTxn = "solTxn",
  EthTxn = "ethTxn",
  BtcTxn = "btcTxn",
  USDCTxn = "usdcTxn",
}

export enum Topics {
  Txn = "transaction",
  Client = "client",
}

export type TxnSolana = {
  message: Message;
  signatures: string[];
};

export enum SolToken {
  Lamp = "lamp",
  Sol = "sol",
}

export enum EthToken {
  Eth = "eth",
  Gwei = "gwei",
}

export enum BitcoinToken {
  Bitcoin = "bitcoin",
}

export type Token = SolToken | EthToken | BitcoinToken;

export type GetQrQuerySchemaType = z.infer<typeof GetQrQuerySchema>;


export type WalletKeys = {
  privateKey: string;
  publicKey: string;
};

export type WalletType = {
  secretPhase?: string;
  id: string;
  clientId: string;
  accounts?: AccountType[];
}

export type AccountType = {
  clientId: string;
  sol: SolKey;
  eth: EthKey;
  usdc?: UsdcKey;
  bitcoin?: BitcoinKey;
  walletId: string
  id: string;
  name: string
}

export type SolKey = {
  publicKey: string,
  devnetSol: number,
  mainnetSol: number,
  testnetSol: number,
}

export type EthKey = {
  publicKey: string,
  goerliEth: number,
  kovanEth: number,
  mainnetEth: number,
  rinkebyEth: number,
  ropstenEth: number,
  sepoliaEth: number,
}

export type BitcoinKey = {
  publicKey: string,
  mainnetBtc: number,
  regtestBtc: number,
  textnetBtc: number,
}

export type UsdcKey = {
  publicKey: string,
  mainnetUsdc: number,
  regtestUsdc: number,
  textnetUsdc: number,
}

export enum CoinType {
  Sol = "501",
  Eth = "60",
  Bitcoin = "0"
}

export enum EthChainId {
  Mainnet = "epi155:1",
  Goerli = "epi155:5",
  Kovan = "epi155:42",
  Rinkeby = "epi155:4",
  Ropsten = "epi155:3",
  Sepolia = "epi155:1337",
}

export enum BitcoinChainId {
  Mainnet = "bip122:000000000019d6689c085ae165831e93",
  Testnet = "bip122:000000000933ea01ad0ee984209779baaec3ced90fa3f408719526f8d77f4943"
}

export enum SolChainId {
  Mainnet = "solana:101",
  Devnet = "solana:101",
  Testnet = "solana:101"
}

export type EthChain = {
  chainId: EthChainId,
  name: "Ethereum",
  network: Network.Eth
}

export type SolChain = {
  chainId: SolChainId,
  name: "Solana",
  network: Network.Sol
}

export type BitcoinChain = {
  chainId: BitcoinChainId,
  name: "Bitcoin",
  network: Network.Bitcoin
}


export type ChainAccount = {
  chain: EthChain | SolChain | BitcoinChain;
  publicKey: string;
}

export type ChainAccountPrivate = ChainAccount & WalletKeys;

export type NetworkPublicKeyType = z.infer<typeof networkPublicKey>;

export enum WsMessageType {
  Index = "index",
  Message = "message"
}