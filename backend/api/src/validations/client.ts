import { string, z } from "zod";


export const ValidateUsername = z.object({
    username: z
        .string()
        .regex(
            /^[a-z0-9_]{3,15}$/,
            "should be between 3-15 characters and can only contain numbers, letters, and underscores."
        ),
});

export const UpdateClientParser = z.object({
    firstname: z
        .string()
        .regex(
            /^[A-Za-z]+([- ]?[A-Za-z]+)*$/,
            "should be between 3-15 characters and can only contain numbers, letters, and underscores."
        ),

    lastname: z
        .string()
        .regex(
            /^[A-Za-z]+([- ]?[A-Za-z]+)*$/,
            "should be between 3-15 characters and can only contain numbers, letters, and underscores."
        ),

});