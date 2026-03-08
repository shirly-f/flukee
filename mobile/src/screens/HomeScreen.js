import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { taskService } from '../services/taskService';
import { traineeService } from '../services/traineeService';
import { EmptyState } from '../components/EmptyState';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { theme } from '../theme';

const { colors, spacing, radius, shadows, typography } = theme;

export default function HomeScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [coach, setCoach] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tasksData, coachData] = await Promise.all([
        taskService.listTasks().catch((err) => {
          console.warn('Failed to load tasks:', err.response?.status, err.config?.url);
          return [];
        }),
        traineeService.getMyCoach().catch((err) => {
          console.warn('Failed to load coach:', err.response?.status, err.config?.url);
          return null;
        }),
      ]);
      setTasks(Array.isArray(tasksData) ? tasksData : []);
      setCoach(coachData || null);
    } catch (error) {
      const base = error.config?.baseURL || '';
      const path = error.config?.url || '';
      console.error('Failed to load data:', error.message, error.response?.status, base + path);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const currentFocus = tasks.find((t) => t.status === 'in_progress') || tasks.find((t) => t.status === 'pending');
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color={colors.sage} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingTop: spacing.xl + insets.top, paddingBottom: spacing.xxl + insets.bottom },
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.sage}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{t('dashboard.welcome')}</Text>
          <Text style={styles.userName}>{user?.name || t('dashboard.friend')}</Text>
        </View>
        <View style={styles.headerActions}>
          <LanguageSwitcher />
          <TouchableOpacity onPress={logout} style={styles.logoutBtn} activeOpacity={0.7}>
            <Text style={styles.logoutText}>{t('common.signOut')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {tasks.length === 0 ? (
        <EmptyState
          title={t('dashboard.emptyStateTitle')}
          message={t('dashboard.emptyStateMessage')}
          style={styles.emptyState}
        />
      ) : (
        <>
          {/* Current Focus Card */}
          {currentFocus && (
            <TouchableOpacity
              style={[styles.card, styles.focusCard]}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('TaskDetail', { taskId: currentFocus.id })}
            >
              <Text style={styles.cardLabel}>{t('tasks.currentFocus')}</Text>
              <Text style={styles.focusTitle}>{currentFocus.title}</Text>
              {currentFocus.description ? (
                <Text style={styles.focusDescription} numberOfLines={2}>
                  {currentFocus.description}
                </Text>
              ) : null}
              <View style={styles.focusFooter}>
                <View style={[styles.statusPill, styles[`status_${currentFocus.status}`]]}>
                  <Text style={styles.statusText}>
                    {currentFocus.status === 'completed' ? t('tasks.completed') : currentFocus.status === 'in_progress' ? t('tasks.inProgress') : t('tasks.pending')}
                  </Text>
                </View>
                <Text style={styles.tapHint}>{t('tasks.tapToOpen')}</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Progress Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('tasks.yourProgress')}</Text>
            <View style={[styles.card, styles.progressCard]}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressValue}>{progressPercent}%</Text>
                <Text style={styles.progressLabel}>{t('tasks.tasksCompleted')}</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
              </View>
              <Text style={styles.progressCount}>
                {t('progress.completedOfTotal', { completed: completedCount, total: tasks.length })}
              </Text>
            </View>
          </View>

          {/* Tasks List */}
          {tasks.length > 1 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('tasks.allPractices')}</Text>
              {tasks
                .filter((t) => t.id !== currentFocus?.id)
                .map((task) => (
                  <TouchableOpacity
                    key={task.id}
                    style={[styles.card, styles.taskCard]}
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
                  >
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <View style={[styles.statusPill, styles[`status_${task.status}`]]}>
                      <Text style={styles.statusText}>
                        {task.status === 'completed' ? t('tasks.completed') : task.status === 'in_progress' ? t('tasks.inProgress') : t('tasks.pending')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
            </View>
          )}

          {/* Coach Preview */}
          {coach && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('messages.yourGuide')}</Text>
              <TouchableOpacity
                style={[styles.card, styles.coachCard]}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('Messages')}
              >
                <View style={styles.coachAvatar}>
                  <Text style={styles.coachAvatarText}>
                    {(coach.name || 'C').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.coachInfo}>
                  <Text style={styles.coachName}>{coach.name}</Text>
                  <Text style={styles.coachRole}>{t('messages.spiritualCoach')}</Text>
                  <Text style={styles.coachCta}>{t('messages.messageYourCoach')}</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </ScrollView>
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
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  greeting: {
    ...typography.bodyM,
    color: colors.textMuted,
    marginBottom: 4,
  },
  userName: {
    ...typography.headingL,
    color: colors.textPrimary,
  },
  logoutBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  logoutText: {
    ...typography.label,
    color: colors.textMuted,
  },
  card: {
    backgroundColor: colors.warmWhite,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.soft,
  },
  focusCard: {
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.sage,
  },
  cardLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  focusTitle: {
    ...typography.headingM,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  focusDescription: {
    ...typography.bodyM,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  focusFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tapHint: {
    ...typography.caption,
    color: colors.sage,
  },
  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
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
    ...typography.caption,
    color: colors.textPrimary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.headingS,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  progressCard: {
    padding: spacing.lg,
  },
  progressHeader: {
    marginBottom: spacing.md,
  },
  progressValue: {
    ...typography.headingL,
    color: colors.sage,
  },
  progressLabel: {
    ...typography.bodyM,
    color: colors.textMuted,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.creamDark,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.sage,
    borderRadius: 4,
  },
  progressCount: {
    ...typography.caption,
    color: colors.textMuted,
  },
  taskCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  taskTitle: {
    ...typography.bodyL,
    color: colors.textPrimary,
    flex: 1,
  },
  coachCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coachAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.dustyRoseLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  coachAvatarText: {
    ...typography.headingM,
    color: colors.dustyRose,
  },
  coachInfo: {
    flex: 1,
  },
  coachName: {
    ...typography.headingS,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  coachRole: {
    ...typography.bodyM,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  coachCta: {
    ...typography.caption,
    color: colors.sage,
  },
  emptyState: {
    paddingTop: spacing.xxl,
  },
});
