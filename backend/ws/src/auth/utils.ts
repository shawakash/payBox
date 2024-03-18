import { importPKCS8, importSPKI, jwtVerify, SignJWT } from "jose";
import { AUTH_JWT_PUBLIC_KEY, } from "../config";
import { JWT_ALGO } from "@paybox/common";

/**
 * @param jwt
 * @returns
 */
export const validateJwt = async (jwt: string) => {
    const publicKey = await importSPKI(AUTH_JWT_PUBLIC_KEY, JWT_ALGO);
    return await jwtVerify(jwt, publicKey, {
        issuer: "shawakash",
        audience: "payBox",
    });
};

/**
 * 
 * @param jwt | string
 * @param ws  | any
 * @returns   | string | null
 */
export const extractClientId = async (jwt: string, ws: any): Promise<string | null> => {
    try {
        let id: string;
        const payloadRes = await validateJwt(jwt);
        if (payloadRes.payload.sub) {
            id = payloadRes.payload.sub;
            if (!id) {
                ws.send(JSON.stringify({
                    error: "Unauthorized: No such id"
                }));
                ws.close();
                return null;
            }
            return id;
        }
    } catch (error) {
        console.log("Error validating jwt:", error);
        ws.send(JSON.stringify({
            error: "Unauthorized: Error in authentication"
        }));
        ws.close();
        return null;
    }
    return null;
}