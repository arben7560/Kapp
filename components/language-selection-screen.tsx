import { LinearGradient } from 'expo-linear-gradient';
import { Globe2, MoveRight } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessibilityInfo, Animated, Pressable, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppLanguage } from '../lib/i18n/LanguageProvider';
import { AppText } from './app-text';
import { LanguageChoices } from './language-choices';

export function LanguageSelectionScreen() {
  const { deviceLocale, setPreference } = useAppLanguage();
  const [selected, setSelected] = useState(deviceLocale);
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const busy = useRef(false);
  const opacity = useMemo(() => new Animated.Value(0), []);
  const { t } = useTranslation('common', { lng: selected });
  const uiScript = selected === 'ja' ? 'japanese' : 'latin';

  useEffect(() => {
    let active = true;
    const animation = Animated.timing(opacity, { toValue: 1, duration: 420, useNativeDriver: true });
    void AccessibilityInfo.isReduceMotionEnabled().catch(() => false).then((reduceMotion) => {
      if (!active) return;
      if (reduceMotion) opacity.setValue(1);
      else animation.start();
    });
    return () => { active = false; animation.stop(); };
  }, [opacity]);

  const confirm = async () => {
    if (busy.current) return;
    busy.current = true;
    setSaving(true);
    setSaveFailed(false);
    try {
      // Persist only the language. The parent then reveals the existing welcome screen.
      await setPreference(selected);
    } catch {
      setSaveFailed(true);
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };

  return (
    <LinearGradient colors={['#020306', '#090817', '#020306']} style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.screen}>
        <Animated.View style={[styles.screen, { opacity }]}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.mark}><Globe2 size={30} color="#22D3EE" strokeWidth={1.4} /></View>
            <AppText variant="featureTitle" accessibilityRole="header" accessibilityLanguage="en" align="center">
              {t('language.title')}
            </AppText>
            <AppText variant="body" script="korean" align="center" tone="muted" style={styles.subtitle}>
              {t('language.subtitle')}
            </AppText>
            <View style={styles.choices}>
              <LanguageChoices value={selected} disabled={saving} onSelect={(locale) => {
                setSelected(locale);
                setSaveFailed(false);
              }} />
            </View>
            {saveFailed ? (
              <AppText script={uiScript} variant="bodySecondary" accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>
                {t('language.saveError')}
              </AppText>
            ) : null}
            <Pressable
              accessibilityRole="button"
              accessibilityHint={t('language.choiceHint')}
              accessibilityState={{ disabled: saving, busy: saving }}
              disabled={saving}
              onPress={() => void confirm()}
              style={({ pressed }) => [styles.continue, pressed && styles.pressed]}
            >
              <LinearGradient
                colors={['rgba(244,114,182,0.35)', 'rgba(34,211,238,0.25)']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill}
              />
              <AppText script={uiScript} variant="button" align="center" style={styles.buttonText}>
                {t(saving ? 'language.saving' : 'language.continueLabel')}
              </AppText>
              <MoveRight size={19} color="#FFFFFF" />
            </Pressable>
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    flexGrow: 1, justifyContent: 'center', width: '100%', maxWidth: 520,
    alignSelf: 'center', paddingHorizontal: 24, paddingVertical: 32,
  },
  mark: {
    width: 64, height: 64, borderRadius: 24, alignSelf: 'center',
    borderWidth: 1, borderColor: 'rgba(34,211,238,0.25)', backgroundColor: 'rgba(34,211,238,0.06)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 28,
  },
  subtitle: { marginTop: 12 },
  choices: { marginTop: 36 },
  continue: {
    minHeight: 58, paddingHorizontal: 20, paddingVertical: 16, marginTop: 24,
    borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', overflow: 'hidden',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  buttonText: { color: '#FFFFFF', flexShrink: 1 },
  error: { color: '#FB7185', marginTop: 16 },
  pressed: { opacity: 0.85 },
});
