import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface IconTileProps {
  name: keyof typeof Ionicons.glyphMap;
  /** Glyph colour (subject accent). */
  tint: string;
  /** Soft background colour. */
  soft: string;
  size?: number;
  glyphSize?: number;
  /** Rounded-corner radius; defaults to the DS icon-tile radius (16). */
  radius?: number;
}

/** Rounded leading icon square with a soft tinted background. */
export function IconTile({ name, tint, soft, size = 48, glyphSize = 24, radius = 16 }: IconTileProps) {
  return (
    <View
      className="items-center justify-center"
      style={{ width: size, height: size, borderRadius: radius, backgroundColor: soft }}>
      <Ionicons name={name} size={glyphSize} color={tint} />
    </View>
  );
}
