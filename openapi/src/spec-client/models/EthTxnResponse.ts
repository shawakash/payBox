/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type EthTxnResponse = {
    /**
     * Type of the transaction receipt
     */
    _type?: string;
    /**
     * List of access lists
     */
    accessList?: Array<any>;
    /**
     * The block number
     */
    blockNumber?: number;
    /**
     * The block hash
     */
    blockHash?: string;
    /**
     * The chain ID
     */
    chainId?: string;
    /**
     * The transaction data
     */
    data?: string;
    /**
     * The sender address
     */
    from?: string;
    /**
     * The gas limit
     */
    gasLimit?: string;
    /**
     * The gas price
     */
    gasPrice?: string;
    /**
     * The transaction hash
     */
    hash?: string;
    /**
     * The maximum fee per gas
     */
    maxFeePerGas?: string;
    /**
     * The maximum priority fee per gas
     */
    maxPriorityFeePerGas?: string;
    /**
     * The nonce
     */
    nonce?: number;
    /**
     * The transaction signature
     */
    signature?: {
        /**
         * Type of the signature
         */
        _type?: string;
        /**
         * Network version
         */
        networkV?: any;
        /**
         * The R value of the signature
         */
        'r'?: string;
        /**
         * The S value of the signature
         */
        's'?: string;
        /**
         * The V value of the signature
         */
        'v'?: number;
    };
    /**
     * The recipient address
     */
    to?: string;
    /**
     * The transaction type
     */
    type?: number;
    /**
     * The transaction value
     */
    value?: string;
};

