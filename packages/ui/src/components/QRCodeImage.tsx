import React, { useMemo } from "react";
import { View, Text } from "react-native";

interface QRCodeImageProps {
  code: string;
  size?: number;
}

/**
 * A stylized QR code representation using React Native Views.
 * Generates a deterministic grid pattern from the code string.
 * This is a visual representation — for scannable QR codes, use react-native-qrcode-svg.
 */
export function QRCodeImage({ code, size = 120 }: QRCodeImageProps) {
  const gridSize = 11;
  const cellSize = size / gridSize;

  const grid = useMemo(() => {
    // Generate a deterministic grid from the code string
    const cells: boolean[][] = [];
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
      hash = (hash * 31 + code.charCodeAt(i)) & 0x7fffffff;
    }

    for (let row = 0; row < gridSize; row++) {
      cells[row] = [];
      for (let col = 0; col < gridSize; col++) {
        // Finder patterns (3 corners)
        const inTopLeft = row < 3 && col < 3;
        const inTopRight = row < 3 && col >= gridSize - 3;
        const inBottomLeft = row >= gridSize - 3 && col < 3;

        if (inTopLeft || inTopRight || inBottomLeft) {
          // Solid finder pattern borders
          const isEdge =
            row === 0 ||
            col === 0 ||
            row === 2 ||
            col === 2 ||
            row === gridSize - 1 ||
            col === gridSize - 1 ||
            row === gridSize - 3 ||
            col === gridSize - 3;
          const isCenter =
            (inTopLeft && row === 1 && col === 1) ||
            (inTopRight && row === 1 && col === gridSize - 2) ||
            (inBottomLeft && row === gridSize - 2 && col === 1);
          cells[row][col] = isEdge || isCenter;
        } else {
          // Data cells — deterministic pseudo-random from hash
          hash = ((hash << 5) - hash + row * gridSize + col) & 0x7fffffff;
          cells[row][col] = hash % 3 !== 0;
        }
      }
    }
    return cells;
  }, [code, gridSize]);

  return (
    <View
      className="bg-white rounded-lg overflow-hidden items-center justify-center p-2"
      style={{ width: size + 16, height: size + 16 }}
    >
      <View style={{ width: size, height: size }}>
        {grid.map((row, rowIdx) => (
          <View key={rowIdx} style={{ flexDirection: "row" }}>
            {row.map((filled, colIdx) => (
              <View
                key={colIdx}
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: filled ? "#2D1B4E" : "#ffffff",
                  borderRadius: cellSize * 0.1,
                }}
              />
            ))}
          </View>
        ))}
      </View>
      <Text className="text-[8px] font-sans text-gray-400 mt-1 text-center" numberOfLines={1}>
        {code}
      </Text>
    </View>
  );
}
