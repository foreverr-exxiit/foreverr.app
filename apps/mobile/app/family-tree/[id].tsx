import React, { useState, useCallback } from "react";
import { View, ScrollView, Pressable, Alert, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text, Input, FamilyTreeNode } from "@foreverr/ui";
import {
  useAuth,
  useFamilyTree,
  useFamilyTreeMembers,
  useFamilyTreeConnections,
  useAddTreeMember,
  useAddTreeConnection,
  useRemoveTreeMember,
} from "@foreverr/core";

const GENDERS = [
  { value: "male", label: "Male", icon: "\u{1F468}" },
  { value: "female", label: "Female", icon: "\u{1F469}" },
  { value: "other", label: "Other", icon: "\u{1F9D1}" },
];

const RELATIONSHIP_TYPES = [
  { value: "parent", label: "Parent" },
  { value: "child", label: "Child" },
  { value: "spouse", label: "Spouse" },
  { value: "sibling", label: "Sibling" },
  { value: "grandparent", label: "Grandparent" },
  { value: "grandchild", label: "Grandchild" },
  { value: "aunt_uncle", label: "Aunt/Uncle" },
  { value: "niece_nephew", label: "Niece/Nephew" },
  { value: "cousin", label: "Cousin" },
];

export default function FamilyTreeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/family-tree" as any);
  }, [router]);
  const { user } = useAuth();
  const { data: tree, isLoading: treeLoading } = useFamilyTree(id);
  const { data: members } = useFamilyTreeMembers(id);
  const { data: connections } = useFamilyTreeConnections(id);
  const addMember = useAddTreeMember();
  const addConnection = useAddTreeConnection();
  const removeMember = useRemoveTreeMember();

  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Add member form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("other");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [dateOfDeath, setDateOfDeath] = useState("");
  const [isLiving, setIsLiving] = useState(true);
  const [generationLevel, setGenerationLevel] = useState("0");
  const [bio, setBio] = useState("");
  // Connection to existing member
  const [connectToId, setConnectToId] = useState<string | null>(null);
  const [relationshipType, setRelationshipType] = useState("parent");

  // Group members by generation level
  const generations = (members ?? []).reduce<Record<number, typeof members>>((acc, member) => {
    const level = member.generation_level;
    if (!acc[level]) acc[level] = [];
    acc[level]!.push(member);
    return acc;
  }, {});

  const sortedGenerations = Object.keys(generations)
    .map(Number)
    .sort((a, b) => a - b);

  // Find connections for selected member
  const selectedConnections = selectedMemberId
    ? (connections ?? []).filter(
        (c) => c.from_member_id === selectedMemberId || c.to_member_id === selectedMemberId
      )
    : [];

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setGender("other");
    setDateOfBirth("");
    setDateOfDeath("");
    setIsLiving(true);
    setGenerationLevel("0");
    setBio("");
    setConnectToId(null);
    setRelationshipType("parent");
  };

  const handleAddMember = async () => {
    if (!user?.id) {
      Alert.alert("Sign In Required", "Please sign in to add family members.");
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Name Required", "Please enter both first and last name.");
      return;
    }

    if (!id) return;

    try {
      const newMember = await addMember.mutateAsync({
        treeId: id,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender,
        dateOfBirth: dateOfBirth.trim() || undefined,
        dateOfDeath: isLiving ? undefined : dateOfDeath.trim() || undefined,
        isLiving,
        generationLevel: parseInt(generationLevel, 10) || 0,
        bio: bio.trim() || undefined,
      });

      // If connecting to an existing member, create the connection
      if (connectToId && newMember) {
        await addConnection.mutateAsync({
          treeId: id,
          fromMemberId: connectToId,
          toMemberId: newMember.id,
          relationshipType,
        });
      }

      resetForm();
      setShowAddForm(false);
      Alert.alert("Member Added", `${firstName.trim()} ${lastName.trim()} has been added to the family tree.`);
    } catch (err: any) {
      Alert.alert(
        "Could Not Add Member",
        err?.message ?? "Something went wrong. Please try again."
      );
    }
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    Alert.alert(
      "Remove Member",
      `Are you sure you want to remove ${memberName} from this family tree?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await removeMember.mutateAsync({ memberId, treeId: id! });
              if (selectedMemberId === memberId) setSelectedMemberId(null);
            } catch (err: any) {
              Alert.alert("Error", err?.message ?? "Could not remove member.");
            }
          },
        },
      ]
    );
  };

  if (treeLoading) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#4A2D7A" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-4 pt-14 pb-4 border-b border-gray-100 dark:border-gray-700">
        <View className="flex-row items-center">
          <Pressable onPress={goBack} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#4A2D7A" />
          </Pressable>
          <View className="flex-1 ml-2">
            <Text className="text-xl font-sans-bold text-gray-900 dark:text-white" numberOfLines={1}>
              {tree?.name ?? "Family Tree"}
            </Text>
            <Text className="text-xs font-sans text-gray-500 mt-0.5">
              {members?.length ?? 0} members {"\u00B7"} {connections?.length ?? 0} connections
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Tree Description */}
        {tree?.description && (
          <View className="mx-4 mt-3 bg-brand-50 dark:bg-brand-900/20 rounded-xl px-4 py-3">
            <Text className="text-sm font-sans text-brand-700 dark:text-brand-300">
              {tree.description}
            </Text>
          </View>
        )}

        {/* Add Member Form (slide-down panel) */}
        {showAddForm && (
          <View className="mx-4 mt-4 bg-white dark:bg-gray-800 rounded-2xl p-5 border border-brand-200 dark:border-brand-800 shadow-sm">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-base font-sans-bold text-gray-900 dark:text-white">
                Add Family Member
              </Text>
              <Pressable
                onPress={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
                className="p-1"
              >
                <Ionicons name="close" size={20} color="#9ca3af" />
              </Pressable>
            </View>

            <View className="gap-4">
              {/* Name Fields */}
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Input
                    label="First Name"
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="First name"
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label="Last Name"
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Last name"
                  />
                </View>
              </View>

              {/* Gender Selector */}
              <View>
                <Text className="text-sm font-sans-medium text-gray-700 dark:text-gray-300 mb-2">Gender</Text>
                <View className="flex-row gap-2">
                  {GENDERS.map((g) => (
                    <Pressable
                      key={g.value}
                      onPress={() => setGender(g.value)}
                      className={`px-4 py-2.5 rounded-xl flex-row items-center gap-1.5 ${
                        gender === g.value
                          ? "bg-brand-700"
                          : "bg-gray-100 dark:bg-gray-700"
                      }`}
                    >
                      <Text style={{ fontSize: 14 }}>{g.icon}</Text>
                      <Text
                        className={`text-sm font-sans-medium ${
                          gender === g.value ? "text-white" : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {g.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Living Toggle */}
              <Pressable
                onPress={() => setIsLiving(!isLiving)}
                className="flex-row items-center"
              >
                <View
                  className={`h-5 w-5 rounded border-2 mr-2 items-center justify-center ${
                    isLiving
                      ? "bg-brand-700 border-brand-700"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {isLiving && <Ionicons name="checkmark" size={14} color="white" />}
                </View>
                <Text className="text-sm font-sans text-gray-700 dark:text-gray-300">Living</Text>
              </Pressable>

              {/* Dates */}
              <Input
                label="Date of Birth (YYYY-MM-DD)"
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                placeholder="1950-01-15"
              />
              {!isLiving && (
                <Input
                  label="Date of Death (YYYY-MM-DD)"
                  value={dateOfDeath}
                  onChangeText={setDateOfDeath}
                  placeholder="2020-06-30"
                />
              )}

              {/* Generation Level */}
              <View>
                <Input
                  label="Generation Level"
                  value={generationLevel}
                  onChangeText={setGenerationLevel}
                  placeholder="0"
                  keyboardType="numeric"
                />
                <Text className="text-xs font-sans text-gray-400 mt-1">
                  0 = base, -1 = parents, -2 = grandparents, 1 = children
                </Text>
              </View>

              {/* Bio */}
              <Input
                label="Short Bio (optional)"
                value={bio}
                onChangeText={setBio}
                placeholder="A few words about this person..."
                multiline
                numberOfLines={2}
                style={{ minHeight: 60, textAlignVertical: "top" }}
              />

              {/* Connect to Existing Member */}
              {(members?.length ?? 0) > 0 && (
                <View>
                  <Text className="text-sm font-sans-medium text-gray-700 dark:text-gray-300 mb-2">
                    Connect to Existing Member (optional)
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 8 }}
                    className="mb-2"
                  >
                    <Pressable
                      onPress={() => setConnectToId(null)}
                      className={`px-4 py-2.5 rounded-xl ${
                        !connectToId ? "bg-brand-700" : "bg-gray-100 dark:bg-gray-700"
                      }`}
                    >
                      <Text
                        className={`text-sm font-sans-medium ${
                          !connectToId ? "text-white" : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        None
                      </Text>
                    </Pressable>
                    {(members ?? []).map((m) => (
                      <Pressable
                        key={m.id}
                        onPress={() => setConnectToId(m.id)}
                        className={`px-4 py-2.5 rounded-xl ${
                          connectToId === m.id ? "bg-brand-700" : "bg-gray-100 dark:bg-gray-700"
                        }`}
                      >
                        <Text
                          className={`text-sm font-sans-medium ${
                            connectToId === m.id ? "text-white" : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {m.first_name} {m.last_name}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>

                  {connectToId && (
                    <View className="mt-2">
                      <Text className="text-sm font-sans-medium text-gray-700 dark:text-gray-300 mb-2">
                        Relationship
                      </Text>
                      <View className="flex-row flex-wrap gap-2">
                        {RELATIONSHIP_TYPES.map((r) => (
                          <Pressable
                            key={r.value}
                            onPress={() => setRelationshipType(r.value)}
                            className={`px-3 py-2 rounded-xl ${
                              relationshipType === r.value
                                ? "bg-brand-700"
                                : "bg-gray-100 dark:bg-gray-700"
                            }`}
                          >
                            <Text
                              className={`text-sm font-sans-medium ${
                                relationshipType === r.value
                                  ? "text-white"
                                  : "text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {r.label}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              )}

              {/* Submit Button */}
              <Pressable
                onPress={handleAddMember}
                disabled={!firstName.trim() || !lastName.trim() || addMember.isPending}
                className={`w-full rounded-2xl py-4 items-center mt-1 ${
                  !firstName.trim() || !lastName.trim() || addMember.isPending
                    ? "bg-gray-300 dark:bg-gray-700"
                    : "bg-brand-700 active:bg-brand-800"
                }`}
              >
                <Text
                  className={`text-base font-sans-bold ${
                    !firstName.trim() || !lastName.trim() || addMember.isPending
                      ? "text-gray-500"
                      : "text-white"
                  }`}
                >
                  {addMember.isPending ? "Adding..." : "Add Member"}
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Tree Visualization */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-6">
          <View className="px-4">
            {sortedGenerations.map((genLevel) => (
              <View key={genLevel} className="mb-6">
                <Text className="text-xs font-sans-bold text-gray-400 mb-3 uppercase tracking-wider">
                  Generation {genLevel}
                </Text>
                <View className="flex-row flex-wrap">
                  {(generations[genLevel] ?? []).map((member) => {
                    // Find relationship label from connections
                    const conn = selectedMemberId
                      ? selectedConnections.find(
                          (c) =>
                            c.from_member_id === member.id ||
                            c.to_member_id === member.id
                        )
                      : undefined;

                    return (
                      <View key={member.id} className="mr-3 mb-3">
                        <FamilyTreeNode
                          firstName={member.first_name}
                          lastName={member.last_name}
                          photoUrl={member.photo_url}
                          dateOfBirth={member.date_of_birth}
                          dateOfDeath={member.date_of_death}
                          gender={member.gender}
                          isLiving={member.is_living}
                          isSelected={selectedMemberId === member.id}
                          relationshipLabel={conn?.relationship_label ?? undefined}
                          onPress={() =>
                            setSelectedMemberId(
                              selectedMemberId === member.id ? null : member.id
                            )
                          }
                        />
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}

            {(members?.length ?? 0) === 0 && !showAddForm && (
              <View className="items-center py-12 px-8">
                <View className="h-16 w-16 rounded-2xl bg-green-50 dark:bg-green-900/20 items-center justify-center mb-4">
                  <Text style={{ fontSize: 32 }}>{"\u{1F331}"}</Text>
                </View>
                <Text className="text-base font-sans-bold text-gray-400 mb-1">
                  No Members Yet
                </Text>
                <Text className="text-sm font-sans text-gray-400 text-center">
                  Tap the + button to start adding family members.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Selected Member Info */}
        {selectedMemberId && (() => {
          const selMember = members?.find((m) => m.id === selectedMemberId);
          return (
            <View className="mx-4 mb-4 bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base font-sans-bold text-gray-900 dark:text-white">
                  {selMember ? `${selMember.first_name} ${selMember.last_name}` : "Member"}
                </Text>
                {selMember && (
                  <Pressable
                    onPress={() => handleRemoveMember(selMember.id, `${selMember.first_name} ${selMember.last_name}`)}
                    className="p-1"
                  >
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  </Pressable>
                )}
              </View>

              {selMember?.bio && (
                <Text className="text-sm font-sans text-gray-500 mb-3">{selMember.bio}</Text>
              )}

              <Text className="text-xs font-sans-bold text-gray-400 uppercase tracking-wider mb-2">
                Connections
              </Text>
              {selectedConnections.length > 0 ? (
                selectedConnections.map((conn) => {
                  const otherMemberId =
                    conn.from_member_id === selectedMemberId
                      ? conn.to_member_id
                      : conn.from_member_id;
                  const otherMember = members?.find((m) => m.id === otherMemberId);
                  return (
                    <View key={conn.id} className="flex-row items-center py-1.5">
                      <Ionicons name="git-branch-outline" size={14} color="#9ca3af" />
                      <Text className="text-sm font-sans text-gray-600 dark:text-gray-400 ml-2">
                        {conn.relationship_label || conn.relationship_type} {"\u2192"}{" "}
                        {otherMember
                          ? `${otherMember.first_name} ${otherMember.last_name}`
                          : "Unknown"}
                      </Text>
                    </View>
                  );
                })
              ) : (
                <Text className="text-sm font-sans text-gray-400">No connections yet</Text>
              )}
            </View>
          );
        })()}
      </ScrollView>

      {/* FAB - Add Member */}
      <Pressable
        onPress={() => setShowAddForm(!showAddForm)}
        className="absolute bottom-6 right-6 w-14 h-14 bg-brand-700 rounded-full items-center justify-center shadow-lg"
        style={{
          shadowColor: "#4A2D7A",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <Ionicons name={showAddForm ? "close" : "add"} size={28} color="white" />
      </Pressable>
    </View>
  );
}
