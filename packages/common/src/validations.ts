import * as z from "zod";

export const ClientSignupFormValidate = z.object({
    username: z
        .string()
        .regex(
            /^[a-z0-9_]{3,15}$/,
            "should be between 3-15 characters and can only contain numbers, letters, and underscores."
        ),
    firstname: z
        .string()
        .regex(
            /^[A-Za-z]+([- ]?[A-Za-z]+)*$/,
            "should be between 3-15 characters and can only contain numbers, letters, and underscores."
        ).optional(),

    lastname: z
        .string()
        .regex(
            /^[A-Za-z]+([- ]?[A-Za-z]+)*$/,
            "should be between 3-15 characters and can only contain numbers, letters, and underscores."
        ).optional(),

    email: z.
        string()
        .regex(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            "should be a valid email"
        ),
    mobile: z.
        string()
        .refine(value => /^\d{10}$/.test(value.toString()), {
            message: "Invalid mobile number. It should be a 10-digit number.",
        }).optional(),
    chain: z.object({
        eth: z.string(),
        bitcoin: z.string(),
        sol: z.string(),
        usdc: z.string(),
        id: z.string().optional()
    }).optional()
});