import { z } from "zod";

export const memorialStep1Schema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  middleName: z.string().max(50).optional(),
  nickname: z.string().max(50).optional(),
  dateOfBirth: z.string().optional(),
  dateOfDeath: z.string().optional(),
  relationship: z.enum(["immediate_family", "extended_family", "friend", "colleague", "fan"], {
    required_error: "Please select your relationship",
  }),
  relationshipDetail: z.string().max(100).optional(),
});

export const memorialStep2Schema = z.object({
  personality: z.string().max(1000).optional(),
  accomplishments: z.string().max(1000).optional(),
  hobbies: z.string().max(1000).optional(),
  favoriteMemories: z.string().max(2000).optional(),
});

export const memorialStep3Schema = z.object({
  profilePhotoUri: z.string().nullable().optional(),
  coverPhotoUri: z.string().nullable().optional(),
  privacy: z.enum(["public", "private", "invited"]).default("public"),
});

export type MemorialStep1Input = z.infer<typeof memorialStep1Schema>;
export type MemorialStep2Input = z.infer<typeof memorialStep2Schema>;
export type MemorialStep3Input = z.infer<typeof memorialStep3Schema>;
