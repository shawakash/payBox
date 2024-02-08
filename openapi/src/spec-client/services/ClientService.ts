/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateClient } from '../models/CreateClient';
import type { LoginClient } from '../models/LoginClient';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ClientService {
    /**
     * Client creation endpoint
     * @param requestBody Client object that needs to be added
     * @returns any created client
     * @throws ApiError
     */
    public static createClient(
        requestBody?: CreateClient,
    ): CancelablePromise<{
        $ref?: any;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/client/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                409: `Client already exists`,
                500: `Internal server error (jwt)`,
                503: `Database Service Unavailable`,
            },
        });
    }
    /**
     * Client creation or login endpoint for credentials from provider
     * @param requestBody Client object that needs to be added
     * @returns any created client
     * @throws ApiError
     */
    public static createClient1(
        requestBody?: CreateClient,
    ): CancelablePromise<{
        $ref?: any;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/client/providerAuth',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                302: `Client Found from cache`,
                500: `Internal server error (jwt)`,
                503: `Database Service Unavailable`,
            },
        });
    }
    /**
     * Client login endpoint
     * @param requestBody Login Data for client
     * @returns void
     * @throws ApiError
     */
    public static loginClient(
        requestBody?: LoginClient,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/client/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                302: `Client Found from cache`,
                401: `Wrong password`,
                404: `client not found`,
                500: `Internal server error (jwt)`,
                503: `Database Service Unavailable`,
            },
        });
    }
    /**
     * Client jwt check endpoint
     * @param authorization Access token for authentication
     * @returns void
     * @throws ApiError
     */
    public static checkClient(
        authorization: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/client/me',
            headers: {
                'Authorization': authorization,
            },
            errors: {
                302: `Client Found from cache`,
                401: `Wrong password`,
                403: `Auth Error`,
                404: `client not found`,
                500: `Internal server error (jwt)`,
                503: `Database Service Unavailable`,
            },
        });
    }
    /**
     * Client get endpoint
     * @param authorization Access token for authentication
     * @param username The username of the client to retrieve
     * @returns void
     * @throws ApiError
     */
    public static getClient(
        authorization: string,
        username: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/client/{username}',
            path: {
                'username': username,
            },
            headers: {
                'Authorization': authorization,
            },
            errors: {
                302: `OK`,
                403: `Auth Error`,
                404: `Client Not Found`,
                500: `Internal server error (jwt)`,
                503: `Database Service Unavailable`,
            },
        });
    }
    /**
     * Client metadata update endpoint
     * @param authorization Access token for authentication
     * @param requestBody Client firstname lastname that needs to be updated
     * @returns any OK
     * @throws ApiError
     */
    public static updateMetadata(
        authorization: string,
        requestBody?: {
            firstname: string;
            lastname: string;
        },
    ): CancelablePromise<{
        status?: string;
        msg?: string;
    }> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/client/updateMetadata',
            headers: {
                'Authorization': authorization,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                403: `Auth Error`,
                500: `Internal server error (jwt)`,
                503: `Database Service Unavailable`,
            },
        });
    }
    /**
     * Client delete endpoint
     * @param authorization Access token for authentication
     * @returns any OK
     * @throws ApiError
     */
    public static deleteClient(
        authorization: string,
    ): CancelablePromise<{
        status?: string;
        msg?: string;
    }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/client/delete',
            headers: {
                'Authorization': authorization,
            },
            errors: {
                403: `Auth Error`,
                500: `Internal server error (jwt)`,
                503: `Database Service Unavailable`,
            },
        });
    }
}
