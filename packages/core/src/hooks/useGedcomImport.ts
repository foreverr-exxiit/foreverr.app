import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";

// ============================================================
// GEDCOM Types
// ============================================================

export interface GedcomIndividual {
  id: string;
  firstName: string;
  lastName: string;
  gender?: string;
  dateOfBirth?: string;
  dateOfDeath?: string;
  isLiving: boolean;
}

export interface GedcomFamily {
  id: string;
  husbandId?: string;
  wifeId?: string;
  childIds: string[];
  marriageDate?: string;
}

export interface GedcomParseResult {
  individuals: GedcomIndividual[];
  families: GedcomFamily[];
}

// ============================================================
// GEDCOM Parser
// ============================================================

/**
 * Simple GEDCOM 5.5 parser.
 * Extracts INDI (individuals) and FAM (families) records.
 */
function parseGedcomContent(content: string): GedcomParseResult {
  const lines = content.split(/\r?\n/);
  const individuals: GedcomIndividual[] = [];
  const families: GedcomFamily[] = [];

  let currentRecord: Record<string, string> | null = null;
  let currentType: "INDI" | "FAM" | null = null;
  let currentId = "";
  let childIds: string[] = [];

  const flushRecord = () => {
    if (!currentRecord || !currentType) return;

    if (currentType === "INDI") {
      const nameParts = (currentRecord.NAME ?? "").replace(/\//g, "").trim().split(" ");
      const firstName = nameParts[0] ?? "";
      const lastName = nameParts.slice(1).join(" ") ?? "";
      const dateOfDeath = currentRecord.DEAT_DATE;

      individuals.push({
        id: currentId,
        firstName,
        lastName,
        gender: currentRecord.SEX === "M" ? "male" : currentRecord.SEX === "F" ? "female" : undefined,
        dateOfBirth: currentRecord.BIRT_DATE,
        dateOfDeath,
        isLiving: !dateOfDeath,
      });
    } else if (currentType === "FAM") {
      families.push({
        id: currentId,
        husbandId: currentRecord.HUSB,
        wifeId: currentRecord.WIFE,
        childIds: [...childIds],
        marriageDate: currentRecord.MARR_DATE,
      });
    }
  };

  let lastTag = "";

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const match = line.match(/^(\d+)\s+(@\S+@|\S+)\s*(.*)?$/);
    if (!match) continue;

    const level = parseInt(match[1], 10);
    const tag = match[2];
    const value = (match[3] ?? "").trim();

    // Level 0 = new record
    if (level === 0) {
      flushRecord();
      currentRecord = null;
      currentType = null;
      childIds = [];

      if (value === "INDI") {
        currentType = "INDI";
        currentId = tag;
        currentRecord = {};
      } else if (value === "FAM") {
        currentType = "FAM";
        currentId = tag;
        currentRecord = {};
      }
      continue;
    }

    if (!currentRecord) continue;

    // Level 1+ tags
    if (level === 1) {
      lastTag = tag;

      if (tag === "NAME") {
        currentRecord.NAME = value;
      } else if (tag === "SEX") {
        currentRecord.SEX = value;
      } else if (tag === "HUSB") {
        currentRecord.HUSB = value;
      } else if (tag === "WIFE") {
        currentRecord.WIFE = value;
      } else if (tag === "CHIL") {
        childIds.push(value);
      }
      // BIRT, DEAT, MARR are container tags — the DATE comes on level 2
    }

    if (level === 2 && tag === "DATE") {
      if (lastTag === "BIRT") {
        currentRecord.BIRT_DATE = value;
      } else if (lastTag === "DEAT") {
        currentRecord.DEAT_DATE = value;
      } else if (lastTag === "MARR") {
        currentRecord.MARR_DATE = value;
      }
    }
  }

  // Flush the last record
  flushRecord();

  return { individuals, families };
}

// ============================================================
// Hooks
// ============================================================

/** Parse a GEDCOM file content string into structured data */
export function useParseGedcom() {
  return useMutation({
    mutationFn: async (fileContent: string): Promise<GedcomParseResult> => {
      // Parsing is synchronous but wrapped in a mutation for consistency
      return parseGedcomContent(fileContent);
    },
  });
}

/** Import parsed GEDCOM data into a family tree (bulk insert members + connections) */
export function useImportGedcomToTree() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      treeId: string;
      parsed: GedcomParseResult;
    }) => {
      const { treeId, parsed } = params;

      // 1. Build a map from GEDCOM @ID@ to newly-created member UUID
      const gedcomToUuid: Record<string, string> = {};

      // 2. Bulk-insert individuals as family_tree_members
      if (parsed.individuals.length > 0) {
        const membersToInsert = parsed.individuals.map((indi, idx) => ({
          tree_id: treeId,
          first_name: indi.firstName || "Unknown",
          last_name: indi.lastName || "",
          gender: indi.gender,
          date_of_birth: indi.dateOfBirth,
          date_of_death: indi.dateOfDeath,
          is_living: indi.isLiving,
          position_x: (idx % 5) * 200,
          position_y: Math.floor(idx / 5) * 150,
          generation_level: 0,
        }));

        const { data: insertedMembers, error: membersError } = await supabase
          .from("family_tree_members" as any)
          .insert(membersToInsert as any)
          .select("id");
        if (membersError) throw membersError;

        // Map GEDCOM IDs to new UUIDs
        const inserted = (insertedMembers ?? []) as any[];
        parsed.individuals.forEach((indi, idx) => {
          if (inserted[idx]) {
            gedcomToUuid[indi.id] = inserted[idx].id;
          }
        });
      }

      // 3. Derive relationships from families and insert as connections
      const connections: Array<{
        tree_id: string;
        from_member_id: string;
        to_member_id: string;
        relationship_type: string;
        relationship_label?: string;
      }> = [];

      for (const fam of parsed.families) {
        const husbandUuid = fam.husbandId ? gedcomToUuid[fam.husbandId] : undefined;
        const wifeUuid = fam.wifeId ? gedcomToUuid[fam.wifeId] : undefined;

        // Spouse connection
        if (husbandUuid && wifeUuid) {
          connections.push({
            tree_id: treeId,
            from_member_id: husbandUuid,
            to_member_id: wifeUuid,
            relationship_type: "spouse",
            relationship_label: "Married",
          });
        }

        // Parent-child connections
        for (const childGedcomId of fam.childIds) {
          const childUuid = gedcomToUuid[childGedcomId];
          if (!childUuid) continue;

          if (husbandUuid) {
            connections.push({
              tree_id: treeId,
              from_member_id: husbandUuid,
              to_member_id: childUuid,
              relationship_type: "parent",
              relationship_label: "Father",
            });
          }
          if (wifeUuid) {
            connections.push({
              tree_id: treeId,
              from_member_id: wifeUuid,
              to_member_id: childUuid,
              relationship_type: "parent",
              relationship_label: "Mother",
            });
          }
        }
      }

      if (connections.length > 0) {
        const { error: connError } = await supabase
          .from("family_tree_connections" as any)
          .insert(connections as any);
        if (connError) throw connError;
      }

      return {
        membersCreated: parsed.individuals.length,
        connectionsCreated: connections.length,
        gedcomToUuid,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family-trees"] });
      queryClient.invalidateQueries({ queryKey: ["tree-members"] });
      queryClient.invalidateQueries({ queryKey: ["tree-connections"] });
    },
  });
}
