/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Network } from './Network';
import type { RegexAddress } from './RegexAddress';
export type TransactionSendQuery = {
    from?: RegexAddress;
    to?: RegexAddress;
    amount?: string;
    network?: Network;
};

