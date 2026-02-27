import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { Text, Input, Button, ScreenWrapper, FamilyTreeNode } from "@foreverr/ui";
import {
  useFamilyTree,
  useFamilyTreeMembers,
  useFamilyTreeConnections,
  useAddTreeMember,
  useAddTreeConnection,
} from "@foreverr/core";
import { useAuthStore } from "@foreverr/core";

const GENDERS = [
  { value: "male", label: "Male", icon: "👨" },
  { value: "female", label: "Female", icon: "👩" },
  { value: "other", label: "Other", icon: "🧑" },
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
  const user = useAuthStore((s) => s.user);
  const { data: tree } = useFamilyTree(id);
  const { data: members } = useFamilyTreeMembers(id);
  const { data: connections } = useFamilyTreeConnections(id);
  const addMember = useAddTreeMember();
  const addConnection = useAddTreeConnection();

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
    if (!firstName.trim() || !lastName.trim() || !id) return;

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
  };

  return (
    <ScreenWrapper>
      <Stack.Screen options={{ title: tree?.name ?? "Family Tree" }} />

      <ScrollView className="flex-1">
        {/* Tree Header */}
        <View className="px-4 py-4 bg-purple-50 border-b border-purple-100">
          <Text className="text-lg font-bold text-gray-900 dark:text-white">{tree?.name}</Text>
          {tree?.description && (
            <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">{tree.description}</Text>
          )}
          <Text className="text-xs text-gray-500 mt-2">
            👥 {members?.length ?? 0} members · {connections?.length ?? 0} connections
          </Text>
        </View>

        {/* Add Member Form (slide-down panel) */}
        {showAddForm && (
          <View className="mx-4 mt-4 bg-white dark:bg-gray-800 rounded-2xl p-4 border border-purple-200 shadow-sm">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-base font-semibold text-gray-900 dark:text-white">
                Add Family Member
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
              >
                <Text className="text-sm text-gray-500">✕ Close</Text>
              </TouchableOpacity>
            </View>

            {/* Name Fields */}
            <View className="flex-row mb-1">
              <View className="flex-1 mr-2">
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
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender</Text>
            <View className="flex-row mb-3">
              {GENDERS.map((g) => (
                <TouchableOpacity
                  key={g.value}
                  onPress={() => setGender(g.value)}
                  className={`px-3 py-2 rounded-xl mr-2 flex-row items-center ${
                    gender === g.value ? "bg-purple-700" : "bg-gray-100 dark:bg-gray-700"
                  }`}
                >
                  <Text className="mr-1">{g.icon}</Text>
                  <Text
                    className={`text-sm ${
                      gender === g.value ? "text-white" : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {g.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Living Toggle */}
            <TouchableOpacity
              onPress={() => setIsLiving(!isLiving)}
              className="flex-row items-center mb-3"
            >
              <View
                className={`w-5 h-5 rounded border-2 mr-2 items-center justify-center ${
                  isLiving
                    ? "bg-purple-700 border-purple-700"
                    : "border-gray-300"
                }`}
              >
                {isLiving && <Text className="text-white text-xs">✓</Text>}
              </View>
              <Text className="text-sm text-gray-700 dark:text-gray-300">Living</Text>
            </TouchableOpacity>

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
            <Input
              label="Generation Level"
              value={generationLevel}
              onChangeText={setGenerationLevel}
              placeholder="0"
              keyboardType="numeric"
            />
            <Text className="text-xs text-gray-400 mb-3 -mt-2">
              0 = base, -1 = parents, -2 = grandparents, 1 = children
            </Text>

            {/* Bio */}
            <Input
              label="Short Bio (optional)"
              value={bio}
              onChangeText={setBio}
              placeholder="A few words about this person..."
              multiline
              numberOfLines={2}
            />

            {/* Connect to Existing Member */}
            {(members?.length ?? 0) > 0 && (
              <>
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Connect to Existing Member (optional)
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mb-3"
                >
                  <TouchableOpacity
                    onPress={() => setConnectToId(null)}
                    className={`px-3 py-2 rounded-xl mr-2 ${
                      !connectToId ? "bg-purple-700" : "bg-gray-100 dark:bg-gray-700"
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        !connectToId ? "text-white" : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      None
                    </Text>
                  </TouchableOpacity>
                  {(members ?? []).map((m) => (
                    <TouchableOpacity
                      key={m.id}
                      onPress={() => setConnectToId(m.id)}
                      className={`px-3 py-2 rounded-xl mr-2 ${
                        connectToId === m.id ? "bg-purple-700" : "bg-gray-100 dark:bg-gray-700"
                      }`}
                    >
                      <Text
                        className={`text-sm ${
                          connectToId === m.id ? "text-white" : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {m.first_name} {m.last_name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {connectToId && (
                  <>
                    <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Relationship
                    </Text>
                    <View className="flex-row flex-wrap mb-3">
                      {RELATIONSHIP_TYPES.map((r) => (
                        <TouchableOpacity
                          key={r.value}
                          onPress={() => setRelationshipType(r.value)}
                          className={`px-3 py-2 rounded-xl mr-2 mb-2 ${
                            relationshipType === r.value
                              ? "bg-purple-700"
                              : "bg-gray-100 dark:bg-gray-700"
                          }`}
                        >
                          <Text
                            className={`text-sm ${
                              relationshipType === r.value
                                ? "text-white"
                                : "text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {r.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}
              </>
            )}

            <Button
              title="Add Member"
              onPress={handleAddMember}
              loading={addMember.isPending || addConnection.isPending}
              disabled={!firstName.trim() || !lastName.trim() || addMember.isPending}
            />
          </View>
        )}

        {/* Tree Visualization */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-6">
          <View className="px-4">
            {sortedGenerations.map((genLevel) => (
              <View key={genLevel} className="mb-6">
                <Text className="text-xs text-gray-400 mb-3 font-medium uppercase">
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
                <Text className="text-4xl mb-3">🌱</Text>
                <Text className="text-gray-500 text-center">
                  Start building your family tree by adding the first member.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Selected Member Info */}
        {selectedMemberId && (
          <View className="mx-4 mb-4 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600 shadow-sm">
            <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
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
                  <View key={conn.id} className="flex-row items-center py-1">
                    <Text className="text-sm text-gray-600 dark:text-gray-400">
                      {conn.relationship_label || conn.relationship_type} →{" "}
                      {otherMember
                        ? `${otherMember.first_name} ${otherMember.last_name}`
                        : "Unknown"}
                    </Text>
                  </View>
                );
              })
            ) : (
              <Text className="text-sm text-gray-400">No connections yet</Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* FAB - Add Member */}
      <TouchableOpacity
        onPress={() => setShowAddForm(!showAddForm)}
        className="absolute bottom-6 right-6 w-14 h-14 bg-purple-700 rounded-full items-center justify-center shadow-lg"
      >
        <Text className="text-white text-2xl">{showAddForm ? "×" : "+"}</Text>
      </TouchableOpacity>
    </ScreenWrapper>
  );
}
