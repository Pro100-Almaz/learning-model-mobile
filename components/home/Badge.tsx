import { Text, View } from 'react-native';

interface BadgeProps {
  children: string;
  /** 'soft' = tinted chip (default), 'solid' = filled blue CTA-style. */
  tone?: 'soft' | 'solid';
}

/** Small pill label used in section headers and lesson rows. */
export function Badge({ children, tone = 'soft' }: BadgeProps) {
  const isSolid = tone === 'solid';
  return (
    <View
      className={
        isSolid
          ? 'rounded-pill bg-blue-500 px-3 py-1'
          : 'rounded-pill bg-blue-50 px-3 py-1'
      }>
      <Text
        className={
          isSolid
            ? 'font-bodyBold text-[13px] text-white'
            : 'font-bodyBold text-[13px] text-blue-600'
        }>
        {children}
      </Text>
    </View>
  );
}
