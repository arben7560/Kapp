import { Check } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { SUPPORTED_LOCALES, type AppLocale } from '../lib/i18n/config';
import { appI18n } from '../lib/i18n/instance';
import { AppText } from './app-text';

/** Shared autonyms for the first-run selector and account settings. */
export function LanguageChoices({ value, disabled = false, onSelect }: {
  value: AppLocale;
  disabled?: boolean;
  onSelect: (locale: AppLocale) => void;
}) {
  return (
    <View style={styles.choices} accessibilityRole="radiogroup">
      {SUPPORTED_LOCALES.map((locale) => {
        const selected = value === locale;
        const label = appI18n.t(locale === 'fr' ? 'language.french' : 'language.japanese', {
          ns: 'common', lng: locale,
        });
        return (
          <Pressable
            key={locale}
            accessibilityRole="radio"
            accessibilityLabel={label}
            accessibilityLanguage={locale === 'ja' ? 'ja-JP' : 'fr-FR'}
            accessibilityState={{ checked: selected, disabled }}
            aria-checked={selected}
            aria-disabled={disabled}
            disabled={disabled}
            onPress={() => onSelect(locale)}
            style={({ pressed }) => [
              styles.choice, selected && styles.selected, pressed && styles.pressed,
            ]}
          >
            <AppText
              variant="bodyStrong"
              script={locale === 'ja' ? 'japanese' : 'latin'}
              accessibilityLanguage={locale === 'ja' ? 'ja-JP' : 'fr-FR'}
              style={styles.label}
            >
              {label}
            </AppText>
            <View style={[styles.radio, selected && styles.radioSelected]}>
              {selected ? <Check size={15} color="#22D3EE" strokeWidth={2.4} /> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  choices: { gap: 12, width: '100%' },
  choice: {
    minHeight: 64, paddingHorizontal: 20, paddingVertical: 17,
    borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.035)',
    flexDirection: 'row', alignItems: 'center', gap: 16,
  },
  selected: { borderColor: 'rgba(34,211,238,0.6)', backgroundColor: 'rgba(34,211,238,0.08)' },
  label: { flex: 1, color: '#FFFFFF' },
  radio: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center',
  },
  radioSelected: { borderColor: '#22D3EE' },
  pressed: { opacity: 0.8 },
});
