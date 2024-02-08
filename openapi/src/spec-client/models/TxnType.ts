/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cluster } from './Cluster';
import type { EthCluster } from './EthCluster';
import type { Network } from './Network';
export type TxnType = {
    id?: string;
    date?: string;
    clientId?: string;
    blockTime?: number;
    amount?: number;
    fee?: number;
    from?: string;
    to?: string;
    postBalances?: Array<number>;
    preBalances?: Array<number>;
    recentBlockhash?: string;
    signature?: Array<string>;
    network?: Network;
    slot?: number;
    chainId?: number;
    cluster?: (EthCluster | Cluster);
};

