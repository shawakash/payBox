/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SolTransactionData = {
    /**
     * Time at which the block was created
     */
    blockTime?: number;
    /**
     * Metadata related to the transaction
     */
    meta?: {
        /**
         * Number of compute units consumed
         */
        computeUnitsConsumed?: number;
        /**
         * Transaction fee
         */
        fee?: number;
        /**
         * Log messages related to the transaction
         */
        logMessages?: Array<string>;
        /**
         * Balances after the transaction
         */
        postBalances?: Array<number>;
        /**
         * Balances before the transaction
         */
        preBalances?: Array<number>;
        /**
         * Status of the transaction
         */
        status?: {
            Ok?: any;
        };
    };
    /**
     * Slot number of the transaction
     */
    slot?: number;
    /**
     * Transaction details
     */
    transaction?: {
        /**
         * Message details of the transaction
         */
        message?: {
            /**
             * Header of the transaction message
             */
            header?: {
                /**
                 * Number of readonly signed accounts
                 */
                numReadonlySignedAccounts?: number;
                /**
                 * Number of readonly unsigned accounts
                 */
                numReadonlyUnsignedAccounts?: number;
                /**
                 * Number of required signatures
                 */
                numRequiredSignatures?: number;
            };
            /**
             * Account keys involved in the transaction
             */
            accountKeys?: Array<string>;
            /**
             * Recent blockhash used in the transaction
             */
            recentBlockhash?: string;
            /**
             * Instructions for the transaction
             */
            instructions?: Array<{
                /**
                 * Accounts involved in the instruction
                 */
                accounts?: Array<number>;
                /**
                 * Data for the instruction
                 */
                data?: string;
                /**
                 * Index of the program ID
                 */
                programIdIndex?: number;
            }>;
        };
        /**
         * Signatures of the transaction
         */
        signatures?: Array<string>;
    };
};

