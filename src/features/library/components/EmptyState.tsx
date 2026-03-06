import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

interface Props {
  onHowItWorks: () => void;
  onOpenYouTube: () => void;
}

const LIGHTBULB_ICON_XML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.62507 12.6874C9.62507 12.8035 9.57898 12.9147 9.49693 12.9968C9.41488 13.0788 9.3036 13.1249 9.18757 13.1249H4.81257C4.69654 13.1249 4.58526 13.0788 4.50321 12.9968C4.42117 12.9147 4.37507 12.8035 4.37507 12.6874C4.37507 12.5714 4.42117 12.4601 4.50321 12.3781C4.58526 12.296 4.69654 12.2499 4.81257 12.2499H9.18757C9.3036 12.2499 9.41488 12.296 9.49693 12.3781C9.57898 12.4601 9.62507 12.5714 9.62507 12.6874ZM11.8126 5.68743C11.8145 6.41677 11.6497 7.13689 11.3309 7.79285C11.012 8.44881 10.5476 9.02326 9.97288 9.47235C9.86543 9.55472 9.77823 9.66056 9.71795 9.78179C9.65767 9.90302 9.6259 10.0364 9.62507 10.1718V10.4999C9.62507 10.732 9.53288 10.9546 9.36879 11.1187C9.2047 11.2827 8.98214 11.3749 8.75007 11.3749H5.25007C5.01801 11.3749 4.79545 11.2827 4.63135 11.1187C4.46726 10.9546 4.37507 10.732 4.37507 10.4999V10.1718C4.37498 10.038 4.34422 9.90607 4.28516 9.78605C4.2261 9.66603 4.1403 9.56115 4.03437 9.47946C3.46113 9.03302 2.99697 8.46203 2.67701 7.8097C2.35705 7.15737 2.18968 6.4408 2.18757 5.71423C2.17335 3.10782 4.27992 0.937276 6.88413 0.874932C7.52581 0.859469 8.16409 0.972524 8.76142 1.20744C9.35875 1.44236 9.90305 1.79439 10.3623 2.24283C10.8215 2.69126 11.1864 3.22702 11.4355 3.81859C11.6845 4.41016 11.8128 5.04557 11.8126 5.68743ZM10.0566 5.17665C9.94311 4.54298 9.63825 3.95929 9.183 3.50414C8.72776 3.049 8.144 2.74426 7.51031 2.63095C7.45364 2.6214 7.39565 2.6231 7.33965 2.63596C7.28364 2.64882 7.23072 2.67258 7.1839 2.7059C7.13708 2.73921 7.09728 2.78142 7.06677 2.83011C7.03626 2.87881 7.01564 2.93303 7.00609 2.9897C6.99654 3.04636 6.99824 3.10435 7.0111 3.16036C7.02396 3.21636 7.04772 3.26929 7.08103 3.31611C7.11435 3.36293 7.15656 3.40273 7.20525 3.43324C7.25395 3.46375 7.30817 3.48436 7.36484 3.49392C8.27101 3.64649 9.03992 4.4154 9.19359 5.32321C9.2109 5.42511 9.26373 5.51758 9.34271 5.58425C9.42168 5.65092 9.52172 5.68747 9.62507 5.68743C9.6498 5.68728 9.67448 5.68527 9.6989 5.68142C9.81326 5.66189 9.91518 5.59775 9.98225 5.50309C10.0493 5.40843 10.076 5.29101 10.0566 5.17665Z" fill="#A0A0A0"/>
</svg>`;

const YOUTUBE_ICON_XML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.8149 3.80188C12.7634 3.60027 12.6647 3.4138 12.5269 3.25786C12.3891 3.10192 12.2162 2.98098 12.0225 2.905C10.1478 2.18094 7.16406 2.1875 7 2.1875C6.83594 2.1875 3.85219 2.18094 1.9775 2.905C1.78378 2.98098 1.61089 3.10192 1.47311 3.25786C1.33533 3.4138 1.23661 3.60027 1.18508 3.80188C1.04344 4.34766 0.875 5.34516 0.875 7C0.875 8.65485 1.04344 9.65235 1.18508 10.1981C1.23653 10.3998 1.33522 10.5864 1.47301 10.7425C1.61079 10.8985 1.78371 11.0195 1.9775 11.0955C3.77344 11.7884 6.58437 11.8125 6.96391 11.8125H7.03609C7.41563 11.8125 10.2282 11.7884 12.0225 11.0955C12.2163 11.0195 12.3892 10.8985 12.527 10.7425C12.6648 10.5864 12.7635 10.3998 12.8149 10.1981C12.9566 9.65125 13.125 8.65485 13.125 7C13.125 5.34516 12.9566 4.34766 12.8149 3.80188ZM8.78227 7.35656L6.59477 8.88781C6.52933 8.93366 6.45259 8.9607 6.37287 8.96602C6.29315 8.97134 6.2135 8.95473 6.14256 8.91799C6.07161 8.88125 6.01208 8.82578 5.97042 8.7576C5.92876 8.68943 5.90657 8.61115 5.90625 8.53125V5.46875C5.90627 5.38872 5.92825 5.31022 5.96979 5.24181C6.01132 5.1734 6.07083 5.1177 6.14183 5.08076C6.21283 5.04382 6.2926 5.02707 6.37246 5.03232C6.45233 5.03757 6.52922 5.06463 6.59477 5.11055L8.78227 6.6418C8.83981 6.68215 8.88678 6.73577 8.91921 6.79812C8.95164 6.86047 8.96857 6.92972 8.96857 7C8.96857 7.07028 8.95164 7.13953 8.91921 7.20188C8.88678 7.26423 8.83981 7.31785 8.78227 7.35821V7.35656Z" fill="white"/>
</svg>`;

function LightbulbIcon() {
  return <SvgXml xml={LIGHTBULB_ICON_XML} width={14} height={14} />;
}

function YouTubeIcon() {
  return <SvgXml xml={YOUTUBE_ICON_XML} width={14} height={14} />;
}

export function EmptyState({ onHowItWorks, onOpenYouTube }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Open any YouTube video and save a timestamp to get started.</Text>

      <View style={styles.actions}>
        <Pressable style={({ pressed }) => [styles.howItWorksButton, pressed ? styles.howItWorksButtonPressed : null]} onPress={onHowItWorks}>
          <LightbulbIcon />
          <Text style={styles.howItWorksText}>How the app works?</Text>
        </Pressable>

        <Pressable style={({ pressed }) => [styles.openYouTubeButton, pressed ? styles.openYouTubeButtonPressed : null]} onPress={onOpenYouTube}>
          <YouTubeIcon />
          <Text style={styles.openYouTubeText}>Open YouTube</Text>
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
    width: 173,
    alignItems: 'center',
    gap: 16
  },
  howItWorksButton: {
    width: 173,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4E4E4E',
    backgroundColor: '#272727',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 0,
    gap: 6
  },
  howItWorksButtonPressed: {
    opacity: 0.86
  },
  howItWorksText: {
    color: '#A0A0A0',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Manrope_600SemiBold',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center'
  },
  openYouTubeButton: {
    width: 173,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ED1A43',
    backgroundColor: '#711628',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 0,
    gap: 6
  },
  openYouTubeButtonPressed: {
    opacity: 0.88
  },
  openYouTubeText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Manrope_600SemiBold',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center'
  }
});
