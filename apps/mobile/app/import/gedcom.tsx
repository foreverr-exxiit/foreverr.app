import React, { useState } from "react";
import { View, ScrollView, Alert, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text, ScreenWrapper } from "@foreverr/ui";
import {
  useAuth,
  useMyFamilyTrees,
  useParseGedcom,
  useImportGedcomToTree,
} from "@foreverr/core";
import type { GedcomParseResult } from "@foreverr/core/src/hooks/useGedcomImport";

export default function GedcomImportScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user?.id;

  const { data: trees, isLoading: treesLoading } = useMyFamilyTrees(userId);
  const parseGedcom = useParseGedcom();
  const importToTree = useImportGedcomToTree();

  const [parsedData, setParsedData] = useState<GedcomParseResult | null>(null);
  const [selectedTreeId, setSelectedTreeId] = useState<string | undefined>();
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(null);

  // In production, you would use expo-document-picker to pick the file
  // For now, we simulate with a placeholder
  const handlePickFile = async () => {
    // Simulated GEDCOM content for demonstration
    const sampleGedcom = `0 HEAD
1 SOUR Foreverr
1 GEDC
2 VERS 5.5
0 @I1@ INDI
1 NAME John /Smith/
1 SEX M
1 BIRT
2 DATE 15 JUN 1950
1 DEAT
2 DATE 20 DEC 2020
0 @I2@ INDI
1 NAME Mary /Johnson/
1 SEX F
1 BIRT
2 DATE 3 MAR 1952
0 @I3@ INDI
1 NAME James /Smith/
1 SEX M
1 BIRT
2 DATE 10 SEP 1975
0 @I4@ INDI
1 NAME Sarah /Smith/
1 SEX F
1 BIRT
2 DATE 22 JAN 1978
0 @F1@ FAM
1 HUSB @I1@
1 WIFE @I2@
1 CHIL @I3@
1 CHIL @I4@
1 MARR
2 DATE 8 AUG 1974
0 TRLR`;

    setFileInfo({ name: "family_tree.ged", size: sampleGedcom.length });

    try {
      const result = await parseGedcom.mutateAsync(sampleGedcom);
      setParsedData(result);
    } catch (err: any) {
      Alert.alert("Parse Error", err.message ?? "Failed to parse GEDCOM file.");
    }
  };

  const handleImport = async () => {
    if (!parsedData || !selectedTreeId) {
      Alert.alert("Missing Selection", "Please select a family tree to import into.");
      return;
    }

    try {
      const result = await importToTree.mutateAsync({
        treeId: selectedTreeId,
        parsed: parsedData,
      });

      Alert.alert(
        "Import Complete",
        `Successfully imported ${result.membersCreated} members and ${result.connectionsCreated} relationships.`,
        [
          {
            text: "View Tree",
            onPress: () => router.push(`/family-tree/${selectedTreeId}`),
          },
          { text: "Done", onPress: () => router.back() },
        ]
      );
    } catch (err: any) {
      Alert.alert("Import Error", err.message ?? "Failed to import GEDCOM data.");
    }
  };

  return (
    <ScreenWrapper>
      <Stack.Screen
        options={{
          title: "GEDCOM Import",
          headerStyle: { backgroundColor: "#2D1B4E" },
          headerTintColor: "#fff",
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View className="px-4 pt-4 pb-2">
          <View className="bg-brand-50 dark:bg-brand-900/20 rounded-2xl p-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="git-branch" size={20} color="#7C3AED" />
              <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white ml-2">
                GEDCOM Family Tree Import
              </Text>
            </View>
            <Text className="text-xs font-sans text-gray-600 dark:text-gray-400">
              GEDCOM is the standard format for genealogy data. Export your family tree
              from Ancestry, FamilySearch, MyHeritage, or other genealogy software, then
              import it here.
            </Text>
          </View>
        </View>

        {/* File Picker */}
        <View className="px-4 mb-4">
          <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-3">
            Step 1: Select GEDCOM File
          </Text>
          <TouchableOpacity
            onPress={handlePickFile}
            activeOpacity={0.8}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-6 items-center"
          >
            {fileInfo ? (
              <>
                <Ionicons name="document-text" size={36} color="#7C3AED" />
                <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mt-3">
                  {fileInfo.name}
                </Text>
                <Text className="text-xs font-sans text-gray-500 dark:text-gray-400 mt-1">
                  {(fileInfo.size / 1024).toFixed(1)} KB
                </Text>
                <Text className="text-xs font-sans text-brand-600 mt-2">
                  Tap to choose a different file
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={36} color="#9CA3AF" />
                <Text className="text-sm font-sans-medium text-gray-600 dark:text-gray-400 mt-3">
                  Tap to select a .ged file
                </Text>
                <Text className="text-xs font-sans text-gray-400 mt-1">
                  Supports GEDCOM 5.5 and 5.5.1
                </Text>
              </>
            )}
          </TouchableOpacity>
          {parseGedcom.isPending && (
            <View className="flex-row items-center justify-center mt-3">
              <ActivityIndicator size="small" color="#7C3AED" />
              <Text className="text-sm font-sans text-gray-500 ml-2">Parsing file...</Text>
            </View>
          )}
        </View>

        {/* Parsed Preview */}
        {parsedData && (
          <View className="px-4 mb-4">
            <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-3">
              Step 2: Review Parsed Data
            </Text>

            {/* Summary Stats */}
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700 items-center">
                <Text className="text-2xl font-sans-bold text-brand-700">
                  {parsedData.individuals.length}
                </Text>
                <Text className="text-xs font-sans text-gray-500 dark:text-gray-400">
                  Individuals
                </Text>
              </View>
              <View className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700 items-center">
                <Text className="text-2xl font-sans-bold text-brand-700">
                  {parsedData.families.length}
                </Text>
                <Text className="text-xs font-sans text-gray-500 dark:text-gray-400">
                  Families
                </Text>
              </View>
            </View>

            {/* Individual Preview List */}
            <View className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <View className="px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                <Text className="text-xs font-sans-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Individuals Found
                </Text>
              </View>
              {parsedData.individuals.slice(0, 10).map((indi, idx) => (
                <View
                  key={indi.id}
                  className={`flex-row items-center px-3 py-2.5 ${
                    idx < Math.min(parsedData.individuals.length, 10) - 1
                      ? "border-b border-gray-50 dark:border-gray-700"
                      : ""
                  }`}
                >
                  <Ionicons
                    name={indi.gender === "male" ? "man" : indi.gender === "female" ? "woman" : "person"}
                    size={16}
                    color={indi.isLiving ? "#059669" : "#6B7280"}
                  />
                  <Text className="text-sm font-sans text-gray-900 dark:text-white ml-2 flex-1">
                    {indi.firstName} {indi.lastName}
                  </Text>
                  {indi.dateOfBirth && (
                    <Text className="text-[11px] font-sans text-gray-400">
                      b. {indi.dateOfBirth}
                    </Text>
                  )}
                  {indi.dateOfDeath && (
                    <Text className="text-[11px] font-sans text-gray-400 ml-2">
                      d. {indi.dateOfDeath}
                    </Text>
                  )}
                </View>
              ))}
              {parsedData.individuals.length > 10 && (
                <View className="px-3 py-2 bg-gray-50 dark:bg-gray-700/50">
                  <Text className="text-xs font-sans text-gray-500 text-center">
                    + {parsedData.individuals.length - 10} more individuals
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Family Tree Selection */}
        {parsedData && (
          <View className="px-4 mb-4">
            <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-3">
              Step 3: Select Family Tree
            </Text>

            {treesLoading ? (
              <ActivityIndicator size="small" color="#7C3AED" />
            ) : (trees ?? []).length === 0 ? (
              <View className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 flex-row items-center">
                <Ionicons name="warning" size={20} color="#D97706" />
                <View className="flex-1 ml-3">
                  <Text className="text-sm font-sans-medium text-yellow-800 dark:text-yellow-300">
                    No family trees found
                  </Text>
                  <Text className="text-xs font-sans text-yellow-700 dark:text-yellow-400 mt-0.5">
                    Create a family tree first, then come back to import.
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => router.push("/family-tree/create")}
                  className="bg-yellow-200 dark:bg-yellow-800 rounded-lg px-3 py-1.5"
                >
                  <Text className="text-xs font-sans-semibold text-yellow-900 dark:text-yellow-200">
                    Create
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ gap: 8 }}>
                {(trees ?? []).map((tree: any) => (
                  <TouchableOpacity
                    key={tree.id}
                    onPress={() => setSelectedTreeId(tree.id)}
                    activeOpacity={0.8}
                    className={`rounded-xl p-3.5 flex-row items-center border ${
                      selectedTreeId === tree.id
                        ? "bg-brand-50 dark:bg-brand-900/20 border-brand-300 dark:border-brand-700"
                        : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"
                    }`}
                  >
                    <Ionicons
                      name="git-branch"
                      size={20}
                      color={selectedTreeId === tree.id ? "#7C3AED" : "#9CA3AF"}
                    />
                    <Text
                      className={`text-sm font-sans-medium ml-3 flex-1 ${
                        selectedTreeId === tree.id
                          ? "text-brand-700 dark:text-brand-300"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {tree.name}
                    </Text>
                    {selectedTreeId === tree.id && (
                      <Ionicons name="checkmark-circle" size={20} color="#7C3AED" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Import Button */}
        {parsedData && selectedTreeId && (
          <View className="px-4 mb-8">
            <TouchableOpacity
              onPress={handleImport}
              activeOpacity={0.8}
              disabled={importToTree.isPending}
              className={`rounded-xl py-3.5 items-center flex-row justify-center ${
                importToTree.isPending ? "bg-gray-400" : "bg-brand-700"
              }`}
            >
              {importToTree.isPending ? (
                <>
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-base font-sans-semibold text-white ml-2">
                    Importing...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="git-merge" size={18} color="white" />
                  <Text className="text-base font-sans-semibold text-white ml-2">
                    Import {parsedData.individuals.length} Members to Tree
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom spacing */}
        <View className="h-8" />
      </ScrollView>
    </ScreenWrapper>
  );
}
