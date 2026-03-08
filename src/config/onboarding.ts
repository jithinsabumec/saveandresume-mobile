import type { AVPlaybackSource } from 'expo-av';
import type { ImageSourcePropType } from 'react-native';

// Upload your video to Firebase Storage and paste the public URL here via .env.
// Example path in Firebase Storage: public/how-it-works.mp4
const HOW_IT_WORKS_VIDEO_URL = (process.env.EXPO_PUBLIC_HOW_IT_WORKS_VIDEO_URL ?? '').trim();

export const HOW_IT_WORKS_VIDEO_SOURCE: AVPlaybackSource | null =
  HOW_IT_WORKS_VIDEO_URL.length > 0 ? { uri: HOW_IT_WORKS_VIDEO_URL } : null;

export const HOW_IT_WORKS_POSTER_SOURCE: ImageSourcePropType = require('../../assets/images/onboarding/how-it-works-poster.png');

export const HOW_IT_WORKS_VIDEO_ASPECT_RATIO = 358 / 487;
