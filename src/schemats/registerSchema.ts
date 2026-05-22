import { z } from 'zod';

export const registerSchema = z.object({
    username: z.string().min(3, "Username musi mieć co najmniej 3 znaki"),
    email: z.string().email("Niepoprawny adres email"),
    password: z.string()
        .min(8, "Hasło musi mieć co najmniej 8 znaków")
        .regex(/[A-Z]/, "Hasło musi zawierać wielką literę")
        .regex(/[0-9]/, "Hasło musi zawierać cyfrę")
        .regex(/[^a-zA-Z0-9]/, "Hasło musi zawierać znak specjalny"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są identyczne",
    path: ["confirmPassword"],
});

export type RegisterFormValues = z.infer<typeof registerSchema>;