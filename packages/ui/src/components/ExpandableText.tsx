import React, { useState, useCallback } from "react";
import { View, Pressable, Platform, LayoutAnimation, NativeSyntheticEvent, TextLayoutEventData } from "react-native";
import { Text } from "../primitives/Text";

interface ExpandableTextProps {
  children: string;
  numberOfLines?: number;
  className?: string;
  readMoreLabel?: string;
  readLessLabel?: string;
  linkColor?: string;
  style?: any;
}

export function ExpandableText({
  children,
  numberOfLines = 3,
  className = "",
  readMoreLabel = "Read more",
  readLessLabel = "Read less",
  linkColor = "#7C3AED",
  style,
}: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const [measured, setMeasured] = useState(false);

  const onTextLayout = useCallback(
    (e: NativeSyntheticEvent<TextLayoutEventData>) => {
      if (!measured && !expanded) {
        // If the number of lines is >= numberOfLines, the text was truncated
        const lines = (e.nativeEvent as any).lines;
        if (lines && lines.length >= numberOfLines) {
          setNeedsTruncation(true);
        }
        setMeasured(true);
      }
    },
    [measured, expanded, numberOfLines]
  );

  const toggle = () => {
    if (Platform.OS !== "web") {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setExpanded((prev) => !prev);
  };

  if (!children || children.trim().length === 0) return null;

  return (
    <View>
      <Text
        className={className}
        style={style}
        numberOfLines={expanded ? undefined : numberOfLines}
        onTextLayout={onTextLayout}
      >
        {children}
      </Text>
      {needsTruncation && (
        <Pressable onPress={toggle} hitSlop={8}>
          <Text
            style={{
              color: linkColor,
              marginTop: 4,
              fontSize: 13,
              fontFamily: "Inter_600SemiBold",
            }}
          >
            {expanded ? readLessLabel : readMoreLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
