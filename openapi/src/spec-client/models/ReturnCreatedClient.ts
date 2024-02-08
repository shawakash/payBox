/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ReturnCreatedClient = {
    id?: string;
    jwt?: string;
    status?: ReturnCreatedClient.status;
    username?: string;
    email?: string;
    mobile?: number;
    firstname?: string;
    lastname?: string;
    password?: string;
    address?: (Record<string, any> | {
        eth?: string;
        sol?: string;
        bitcoin?: string;
        usdc?: string;
    });
};
export namespace ReturnCreatedClient {
    export enum status {
        OK = 'ok',
        ERROR = 'error',
    }
}

