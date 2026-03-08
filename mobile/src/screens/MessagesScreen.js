import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { messageService } from '../services/messageService';
import { traineeService } from '../services/traineeService';
import { EmptyState } from '../components/EmptyState';
import { theme } from '../theme';

const { colors, spacing, radius, shadows, typography } = theme;

export default function MessagesScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [coach, setCoach] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCoach();
  }, []);

  useEffect(() => {
    if (coach?.id) {
      loadMessages();
    } else {
      setLoading(false);
    }
  }, [coach?.id]);

  // Reload messages when screen comes into focus (e.g. switching tabs, returning to app)
  useFocusEffect(
    React.useCallback(() => {
      if (coach?.id) loadMessages();
    }, [coach?.id])
  );

  const loadCoach = async () => {
    try {
      const coachData = await traineeService.getMyCoach();
      setCoach(coachData);
    } catch (error) {
      console.error('Failed to load coach:', error);
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!coach?.id) return;
    try {
      const data = await messageService.getMessages(coach.id);
      setMessages(data || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMessages();
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !coach?.id) return;

    try {
      const message = await messageService.sendMessage(coach.id, newMessage);
      setMessages([...messages, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const renderMessage = ({ item }) => {
    const isOwn = item.senderId === user.id;
    return (
      <View
        style={[
          styles.messageBubble,
          isOwn ? styles.ownBubble : styles.otherBubble,
        ]}
      >
        <Text style={isOwn ? styles.ownText : styles.otherText}>
          {item.content}
        </Text>
        <Text style={[styles.time, isOwn ? styles.ownTime : styles.otherTime]}>
          {new Date(item.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    );
  };

  if (loading) {
    return null;
  }

  if (!coach) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: spacing.xl + insets.top }]}>
          <Text style={styles.headerTitle}>{t('messages.messages')}</Text>
        </View>
        <EmptyState
          title={t('messages.guideAwaits')}
          message={t('messages.guideAwaitsMessage')}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={[styles.header, { paddingTop: spacing.xl + insets.top }]}>
        <Text style={styles.headerTitle}>{t('messages.messages')}</Text>
        <Text style={styles.coachSubtitle}>{t('messages.with')} {coach.name}</Text>
      </View>

      {messages.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.messagesList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.sage} />
          }
        >
          <EmptyState
            title={t('messages.beginConversation')}
            message={t('messages.beginConversationMessage')}
          />
        </ScrollView>
      ) : (
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.sage} />
          }
        />
      )}

      <View style={[styles.inputWrapper, { paddingBottom: spacing.md + insets.bottom }]}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder={t('messages.shareThoughts')}
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !newMessage.trim() && styles.sendBtnDisabled]}
          onPress={handleSendMessage}
          disabled={!newMessage.trim()}
          activeOpacity={0.8}
        >
          <Text style={styles.sendBtnText}>{t('messages.send')}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.creamDark,
  },
  headerTitle: {
    ...typography.headingM,
    color: colors.textPrimary,
  },
  coachSubtitle: {
    ...typography.bodyM,
    color: colors.textMuted,
    marginTop: 4,
  },
  messagesList: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: '80%',
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
  },
  ownBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.sage,
    borderBottomRightRadius: 6,
  },
  otherBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.warmWhite,
    borderBottomLeftRadius: 6,
    ...shadows.soft,
  },
  ownText: {
    ...typography.bodyM,
    color: colors.warmWhite,
    marginBottom: 4,
  },
  otherText: {
    ...typography.bodyM,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  time: {
    ...typography.caption,
  },
  ownTime: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  otherTime: {
    color: colors.textMuted,
  },
  inputWrapper: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.warmWhite,
    borderTopWidth: 1,
    borderTopColor: colors.creamDark,
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.cream,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    maxHeight: 100,
    fontFamily: 'DMSans_400Regular',
  },
  sendBtn: {
    backgroundColor: colors.sage,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendBtnText: {
    ...typography.label,
    color: colors.warmWhite,
  },
});
