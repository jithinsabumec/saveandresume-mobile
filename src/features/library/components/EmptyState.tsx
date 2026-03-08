import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

interface Props {
  onHowItWorks: () => void;
}

const LIGHTBULB_ICON_XML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.62507 12.6874C9.62507 12.8035 9.57898 12.9147 9.49693 12.9968C9.41488 13.0788 9.3036 13.1249 9.18757 13.1249H4.81257C4.69654 13.1249 4.58526 13.0788 4.50321 12.9968C4.42117 12.9147 4.37507 12.8035 4.37507 12.6874C4.37507 12.5714 4.42117 12.4601 4.50321 12.3781C4.58526 12.296 4.69654 12.2499 4.81257 12.2499H9.18757C9.3036 12.2499 9.41488 12.296 9.49693 12.3781C9.57898 12.4601 9.62507 12.5714 9.62507 12.6874ZM11.8126 5.68743C11.8145 6.41677 11.6497 7.13689 11.3309 7.79285C11.012 8.44881 10.5476 9.02326 9.97288 9.47235C9.86543 9.55472 9.77823 9.66056 9.71795 9.78179C9.65767 9.90302 9.6259 10.0364 9.62507 10.1718V10.4999C9.62507 10.732 9.53288 10.9546 9.36879 11.1187C9.2047 11.2827 8.98214 11.3749 8.75007 11.3749H5.25007C5.01801 11.3749 4.79545 11.2827 4.63135 11.1187C4.46726 10.9546 4.37507 10.732 4.37507 10.4999V10.1718C4.37498 10.038 4.34422 9.90607 4.28516 9.78605C4.2261 9.66603 4.1403 9.56115 4.03437 9.47946C3.46113 9.03302 2.99697 8.46203 2.67701 7.8097C2.35705 7.15737 2.18968 6.4408 2.18757 5.71423C2.17335 3.10782 4.27992 0.937276 6.88413 0.874932C7.52581 0.859469 8.16409 0.972524 8.76142 1.20744C9.35875 1.44236 9.90305 1.79439 10.3623 2.24283C10.8215 2.69126 11.1864 3.22702 11.4355 3.81859C11.6845 4.41016 11.8128 5.04557 11.8126 5.68743ZM10.0566 5.17665C9.94311 4.54298 9.63825 3.95929 9.183 3.50414C8.72776 3.049 8.144 2.74426 7.51031 2.63095C7.45364 2.6214 7.39565 2.6231 7.33965 2.63596C7.28364 2.64882 7.23072 2.67258 7.1839 2.7059C7.13708 2.73921 7.09728 2.78142 7.06677 2.83011C7.03626 2.87881 7.01564 2.93303 7.00609 2.9897C6.99654 3.04636 6.99824 3.10435 7.0111 3.16036C7.02396 3.21636 7.04772 3.26929 7.08103 3.31611C7.11435 3.36293 7.15656 3.40273 7.20525 3.43324C7.25395 3.46375 7.30817 3.48436 7.36484 3.49392C8.27101 3.64649 9.03992 4.4154 9.19359 5.32321C9.2109 5.42511 9.26373 5.51758 9.34271 5.58425C9.42168 5.65092 9.52172 5.68747 9.62507 5.68743C9.6498 5.68728 9.67448 5.68527 9.6989 5.68142C9.81326 5.66189 9.91518 5.59775 9.98225 5.50309C10.0493 5.40843 10.076 5.29101 10.0566 5.17665Z" fill="#A0A0A0"/>
</svg>`;

function LightbulbIcon() {
  return <SvgXml xml={LIGHTBULB_ICON_XML} width={16} height={16} />;
}

export function EmptyState({ onHowItWorks }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Open any YouTube video and save a timestamp to get started.</Text>

      <View style={styles.actions}>
        <Pressable style={({ pressed }) => [styles.howItWorksButton, pressed ? styles.howItWorksButtonPressed : null]} onPress={onHowItWorks}>
          <LightbulbIcon />
          <Text style={styles.howItWorksText}>How the app works?</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 282,
    alignItems: 'center',
    gap: 36
  },
  text: {
    color: '#868686',
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'Manrope_600SemiBold',
    textAlign: 'center'
  },
  actions: {
    alignItems: 'center'
  },
  howItWorksButton: {
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginTop: 8,
    gap: 6
  },
  howItWorksButtonPressed: {
    backgroundColor: '#1E1E1E',
    opacity: 0.92
  },
  howItWorksText: {
    color: '#A0A0A0',
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Manrope_600SemiBold',
    textDecorationLine: 'underline',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center'
  }
});
