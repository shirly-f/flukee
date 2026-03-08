import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { taskService } from '../services/taskService';
import { API_BASE_URL } from '../services/api';
import { theme } from '../theme';

const { colors, spacing, radius, shadows, typography } = theme;

export default function TaskDetailScreen() {
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  const { taskId } = route.params;
  const [task, setTask] = useState(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTask();
  }, [taskId]);

  const loadTask = async () => {
    try {
      const data = await taskService.getTaskDetails(taskId);
      setTask(data);
      if (data.response?.responseData) {
        if (data.type === 'text_response') {
          setResponse(data.response.responseData.text || '');
        }
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('tasks.failedToLoad'));
      if (navigation.canGoBack() && error?.response?.status !== 401) {
        navigation.goBack();
      }
      // 401: user will be redirected to login by AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!task) return;

    setSubmitting(true);
    try {
      let responseData = {};

      switch (task.type) {
        case 'text_response':
          if (!response.trim()) {
            Alert.alert(t('login.gentleReminderTitle'), t('tasks.shareBeforeSubmit'));
            setSubmitting(false);
            return;
          }
          responseData = { text: response };
          break;
        case 'read_document':
          responseData = {
            markedAsDone: true,
            timestamp: new Date().toISOString(),
          };
          break;
        case 'questionnaire':
          Alert.alert(t('tasks.comingSoon'), t('tasks.questionnaireComingSoonAlert'));
          setSubmitting(false);
          return;
        default:
          Alert.alert(t('common.error'), t('tasks.unknownTaskType'));
          setSubmitting(false);
          return;
      }

      await taskService.submitTaskResponse(taskId, responseData, 'submitted');
      Alert.alert(t('tasks.thankYou'), t('tasks.reflectionShared'), [
        { text: t('common.ok'), onPress: () => navigation.canGoBack() && navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert(t('common.error'), t('tasks.failedToSubmit'));
    } finally {
      setSubmitting(false);
    }
  };

  const openDocument = async () => {
    let url = task?.metadata?.documentUrl;
    if (!url?.trim()) {
      Alert.alert(t('common.error'), t('tasks.noDocumentUrl'));
      return;
    }
    // Relative path or localhost: prepend API base so mobile can reach backend
    if (url.startsWith('/')) {
      url = `${API_BASE_URL}${url}`;
    } else if (url.includes('localhost') || url.includes('127.0.0.1')) {
      url = url.replace(/https?:\/\/[^/]+/, API_BASE_URL);
    }
    try {
      await Linking.openURL(url);
    } catch (err) {
      Alert.alert(t('common.error'), t('tasks.failedToOpenDocument'));
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color={colors.sage} />
      </View>
    );
  }

  if (!task) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Immersive header */}
        <View style={styles.header}>
          <View style={[styles.statusPill, styles[`status_${task.status}`]]}>
            <Text style={styles.statusText}>
              {task.status === 'completed' ? t('tasks.completed') : task.status === 'in_progress' ? t('tasks.inProgress') : t('tasks.pending')}
            </Text>
          </View>
          <Text style={styles.title}>{task.title}</Text>
          {task.description && (
            <Text style={styles.description}>{task.description}</Text>
          )}
        </View>

        {/* Task content */}
        {task.type === 'text_response' && (
          <View style={styles.section}>
            {task.metadata?.prompt && (
              <Text style={styles.prompt}>{task.metadata.prompt}</Text>
            )}
            <TextInput
              style={styles.textInput}
              multiline
              numberOfLines={8}
              value={response}
              onChangeText={setResponse}
              placeholder={t('tasks.placeholderReflection')}
              placeholderTextColor={colors.textMuted}
              textAlignVertical="top"
            />
          </View>
        )}

        {task.type === 'read_document' && (
          <View style={styles.section}>
            <Text style={styles.prompt}>
              {task.metadata?.documentTitle || t('tasks.document')}
            </Text>
            <TouchableOpacity
              style={styles.documentLink}
              onPress={openDocument}
              activeOpacity={0.8}
            >
              <Text style={styles.documentLinkText}>
                {t('tasks.openDocument')}
              </Text>
            </TouchableOpacity>
            <Text style={styles.instruction}>
              {t('tasks.readDocumentInstruction')}
            </Text>
          </View>
        )}

        {task.type === 'questionnaire' && (
          <View style={styles.section}>
            <Text style={styles.instruction}>
              {t('tasks.questionnaireComingSoon')}
            </Text>
          </View>
        )}

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.9}
        >
          {submitting ? (
            <ActivityIndicator color={colors.warmWhite} />
          ) : (
            <Text style={styles.submitBtnText}>
              {task.response?.status === 'submitted' ? t('tasks.updateReflection') : t('tasks.submit')}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.xl + 20,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.xl,
    paddingBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.creamDark,
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    marginBottom: spacing.md,
  },
  status_pending: {
    backgroundColor: colors.warmSand,
  },
  status_in_progress: {
    backgroundColor: colors.sageMuted,
  },
  status_completed: {
    backgroundColor: colors.successMuted,
  },
  statusText: {
    ...typography.label,
    color: colors.textPrimary,
  },
  title: {
    ...typography.headingXL,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.bodyL,
    color: colors.textSecondary,
    lineHeight: 26,
  },
  section: {
    marginBottom: spacing.xl,
  },
  prompt: {
    ...typography.headingS,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  textInput: {
    backgroundColor: colors.warmWhite,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...typography.bodyL,
    color: colors.textPrimary,
    minHeight: 200,
    textAlignVertical: 'top',
    ...shadows.soft,
  },
  documentLink: {
    marginBottom: spacing.md,
  },
  documentLinkText: {
    ...typography.bodyL,
    color: colors.sage,
  },
  instruction: {
    ...typography.bodyM,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  submitBtn: {
    backgroundColor: colors.sage,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.md,
    ...shadows.soft,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    ...typography.headingS,
    color: colors.warmWhite,
  },
});
