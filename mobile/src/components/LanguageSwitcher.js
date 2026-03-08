import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../i18n/constants';
import { theme } from '../theme';

const { colors, spacing } = theme;

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <TouchableOpacity
      onPress={() => {
        const next = i18n.language === 'he' ? 'en' : 'he';
        i18n.changeLanguage(next);
      }}
      activeOpacity={0.7}
      style={styles.container}
    >
      <Text style={styles.flag}>
        {i18n.language === 'he' ? LANGUAGES.en.flag : LANGUAGES.he.flag}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.sm,
  },
  flag: {
    fontSize: 22,
  },
});
