/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MiscellaneousService {
    /**
     * healthcheck endpoint
     * @returns any OK
     * @throws ApiError
     */
    public static getHealthCheck(): CancelablePromise<{
        $ref?: any;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/_health',
        });
    }
    /**
     * homepage endpoint
     * @returns any OK
     * @throws ApiError
     */
    public static getHealthCheck1(): CancelablePromise<{
        $ref?: any;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/',
        });
    }
}
