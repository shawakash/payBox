import { z } from "zod";
import { ClientSignupFormValidate, MetadataUpdateForm } from "./validations";

export type Client = z.infer<typeof ClientSignupFormValidate> & { id: string }
export enum SignType {
    Signin = "Signin",
    Signout = "Signout",
    Signup = "Signup"
}

export type ClientForm = z.infer<typeof ClientSignupFormValidate>;

export enum responseStatus {
    Error = "error",
    Ok = "ok",
}

export enum hookStatus {
    Error = "error",
    Ok = "ok",
}

export type useSignUpHookProps = {
    status: hookStatus,
    msg: string,
    load?: string
};

export type ClientWithJwt = Partial<Client> & {jwt: string};

export type MetadataUpdateFormType = z.infer<typeof MetadataUpdateForm>
