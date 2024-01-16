import { z } from "zod";
import { ClientSignupFormValidate } from "./validations";

export type Client = z.infer<typeof ClientSignupFormValidate> & { id: string }
export enum SignType {
    Signin = "Signin",
    Signout = "Signout",
    Signup = "Signup"
}