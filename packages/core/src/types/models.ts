import type { Database } from "../supabase/types";

// Convenience type aliases
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type Memorial = Database["public"]["Tables"]["memorials"]["Row"];
export type MemorialInsert = Database["public"]["Tables"]["memorials"]["Insert"];
export type MemorialUpdate = Database["public"]["Tables"]["memorials"]["Update"];

export type MemorialHost = Database["public"]["Tables"]["memorial_hosts"]["Row"];
export type Follower = Database["public"]["Tables"]["followers"]["Row"];
export type Media = Database["public"]["Tables"]["media"]["Row"];

export type Tribute = Database["public"]["Tables"]["tributes"]["Row"];
export type TributeInsert = Database["public"]["Tables"]["tributes"]["Insert"];

export type TributeComment = Database["public"]["Tables"]["tribute_comments"]["Row"];
export type Reaction = Database["public"]["Tables"]["reactions"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];

// Joined types for UI
export type TributeWithAuthor = Tribute & {
  author: Pick<Profile, "id" | "username" | "display_name" | "avatar_url">;
};

export type MemorialWithHost = Memorial & {
  host: Pick<Profile, "id" | "username" | "display_name" | "avatar_url">;
};

export type CommentWithAuthor = TributeComment & {
  author: Pick<Profile, "id" | "username" | "display_name" | "avatar_url">;
};
