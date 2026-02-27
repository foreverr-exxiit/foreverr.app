import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";

// ============================================================
// Convert a living tribute into a memorial
// ============================================================

export function useConvertLivingTributeToMemorial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      tributeId: string;
      userId: string;
      firstName: string;
      lastName: string;
      dateOfDeath?: string;
    }) => {
      // 1. Create the memorial
      const { data: memorialData, error: memError } = await supabase
        .from("memorials")
        .insert({
          created_by: input.userId,
          first_name: input.firstName,
          last_name: input.lastName,
          date_of_death: input.dateOfDeath ?? null,
          privacy: "public",
          status: "active",
          converted_from_living_tribute_id: input.tributeId,
          page_type: "converted_tribute",
        })
        .select("*")
        .single();
      if (memError) throw memError;
      const memorial = memorialData as any;

      // 2. Update the living tribute status
      const { error: tributeError } = await supabase
        .from("living_tributes")
        .update({
          status: "converted_to_memorial",
          memorial_id: memorial.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", input.tributeId);
      if (tributeError) throw tributeError;

      // 3. Copy tribute messages as wall posts / tributes on the memorial
      const { data: messages } = await supabase
        .from("living_tribute_messages")
        .select("*")
        .eq("tribute_id", input.tributeId);

      if (messages && messages.length > 0) {
        const tributeInserts = messages.map((msg: any) => ({
          memorial_id: memorial.id,
          author_id: msg.author_id,
          content: msg.content ?? "",
          type: "text",
          ribbon_type: "silver",
        }));

        await supabase.from("tributes").insert(tributeInserts as any);
      }

      return memorial;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["living-tributes"] });
      qc.invalidateQueries({ queryKey: ["memorials"] });
    },
  });
}
