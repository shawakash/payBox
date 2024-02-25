import * as z from "zod";

export const ClientSignupFormValidate = z.object({
  username: z
    .string()
    .regex(
      /^[a-z0-9_]{3,15}$/,
      "should be between 3-15 characters and can only contain numbers, letters, and underscores.",
    ),
  password: z
    .string()
    .regex(
      /^[a-z0-9_]{3,50}$/,
      "should be between 3-15 characters and can only contain numbers, letters, and underscores.",
    ),
  firstname: z
    .string()
    .regex(
      /^[A-Za-z]+([- ]?[A-Za-z]+)*$/,
      "should be between 3-15 characters and can only contain numbers, letters, and underscores.",
    )
    .optional(),

  lastname: z
    .string()
    .regex(
      /^[A-Za-z]+([- ]?[A-Za-z]+)*$/,
      "should be between 3-15 characters and can only contain numbers, letters, and underscores.",
    )
    .optional(),

  email: z
    .string()
    .regex(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "should be a valid email",
    ),
  mobile: z
    .string()
    .refine((value) => /^\d{10}$/.test(value.toString()), {
      message: "Invalid mobile number. It should be a 10-digit number.",
    })
    .optional(),
  address: z
    .object({
      eth: z.string().optional(),
      bitcoin: z.string().optional(),
      sol: z.string().optional(),
      usdc: z.string().optional(),
    })
    .optional(),
});

export const ClientSigninFormValidate = z.object({
  email: z
    .string()
    .regex(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "should be a valid email",
    ),
  password: z.string(),
});

export const MetadataUpdateForm = z.object({
  firstname: z
    .string()
    .regex(
      /^[A-Za-z]+([- ]?[A-Za-z]+)*$/,
      "should be between 3-15 characters and can only contain numbers, letters, and underscores.",
    )
    .optional(),

  lastname: z
    .string()
    .regex(
      /^[A-Za-z]+([- ]?[A-Za-z]+)*$/,
      "should be between 3-15 characters and can only contain numbers, letters, and underscores.",
    )
    .optional(),
  mobile: z
    .string()
    .refine((value) => /^\d{10}$/.test(value.toString()), {
      message: "Invalid mobile number. It should be a 10-digit number.",
    })
    .optional(),
  bio: z.string().max(160).min(4),
  address: z
    .object({
      eth: z.string(),
      bitcoin: z.string(),
      sol: z.string(),
      usdc: z.string(),
      id: z.string().optional(),
    })
    .optional(),
});


export const PasswordValid = z.object({
  password: z
    .string()
    .regex(
      /^[a-z0-9_]{3,50}$/,
      "should be between 3-15 characters and can only contain numbers, letters, and underscores.",
    ),
}).passthrough();

export const ChangePasswordValid = z.object({
  password: z
    .string()
    .regex(
      /^[a-z0-9_]{3,50}$/,
      "should be between 3-15 characters and can only contain numbers, letters, and underscores.",
    ),
  newPassword: z
    .string()
    .regex(
      /^[a-z0-9_]{3,50}$/,
      "should be between 3-15 characters and can only contain numbers, letters, and underscores.",
    ),
}).passthrough();