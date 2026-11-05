import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { useAppLanguage } from '../lib/i18n/LanguageProvider';
import type { AppLocale } from '../lib/i18n/config';
import { AppText } from './app-text';
import { LanguageChoices } from './language-choices';

export function ApplicationLanguageSettings() {
  const { locale, setPreference } = useAppLanguage();
  const { t } = useTranslation('account');
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const busy = useRef(false);
  const uiScript = locale === 'ja' ? 'japanese' : 'latin';

  const selectLanguage = async (choice: AppLocale) => {
    if (busy.current) return;
    busy.current = true;
    setSaving(true);
    setSaveFailed(false);
    try {
      await setPreference(choice);
    } catch {
      setSaveFailed(true);
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };

  return (
    <View style={styles.content}>
      <AppText script={uiScript} variant="sectionTitle" accessibilityRole="header">
        {t('language.title')}
      </AppText>
      <AppText script={uiScript} variant="bodySecondary" tone="muted">
        {t('language.hint')}
      </AppText>
      <LanguageChoices value={locale} disabled={saving} onSelect={(choice) => void selectLanguage(choice)} />
      {saving || saveFailed ? (
        <AppText
          script={uiScript} variant="bodySecondary" accessibilityLiveRegion="polite"
          accessibilityRole={saveFailed ? 'alert' : undefined}
          style={saveFailed ? styles.error : undefined}
        >
          {t(saveFailed ? 'language.saveError' : 'language.saving')}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: 14 },
  error: { color: '#FB7185' },
});
