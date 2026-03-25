import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { messageService } from '../services/messageService';
import { traineeService } from '../services/traineeService';
import TraineeLayout from '../components/TraineeLayout';

export default function TraineeMessagesPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [coaches, setCoaches] = useState([]);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setListLoading(true);
    traineeService
      .getMyCoaches()
      .then((list) => {
        if (cancelled) return;
        setCoaches(Array.isArray(list) ? list : []);
        if (list?.length === 1) setSelectedCoach(list[0]);
      })
      .catch(() => {
        if (!cancelled) setCoaches([]);
      })
      .finally(() => {
        if (!cancelled) setListLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (selectedCoach?.id) {
      loadMessages(selectedCoach.id);
    } else {
      setMessages([]);
    }
  }, [selectedCoach?.id]);

  const loadMessages = async (coachId) => {
    setLoading(true);
    try {
      const data = await messageService.getMessages(coachId);
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedCoach) return;

    try {
      const message = await messageService.sendMessage(selectedCoach.id, newMessage);
      setMessages((prev) => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <TraineeLayout>
      <h1 className="font-serif text-4xl font-semibold text-charcoal mb-2">
        {t('messages.messages')}
      </h1>
      <p className="text-charcoal-light mb-8">{t('messages.subtitleTrainee')}</p>

      {listLoading ? (
        <div className="text-center py-20 text-charcoal-light">{t('common.loading')}</div>
      ) : coaches.length === 0 ? (
        <div className="bg-cream rounded-2xl p-16 text-center shadow-soft max-w-xl mx-auto">
          <p className="font-serif text-xl text-charcoal mb-2">{t('messages.guideAwaits')}</p>
          <p className="text-charcoal-light text-sm">{t('messages.noCoachForMessages')}</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-72 flex-shrink-0">
            <div className="bg-cream rounded-2xl overflow-hidden shadow-soft">
              {coaches.length > 1 && (
                <p className="px-4 py-2 text-xs text-charcoal-light border-b border-sand-dark">
                  {t('messages.yourCoaches')}
                </p>
              )}
              {coaches.map((coach) => (
                <button
                  key={coach.id}
                  type="button"
                  onClick={() => setSelectedCoach(coach)}
                  className={`w-full text-left px-6 py-4 transition-colors duration-300 ${
                    selectedCoach?.id === coach.id
                      ? 'bg-sage/10 border-l-4 border-sage'
                      : 'hover:bg-sand/30'
                  }`}
                >
                  <p className="font-medium text-charcoal">{coach.name}</p>
                  <p className="text-charcoal-light text-sm">{coach.email}</p>
                  {coach.domain && (
                    <p className="text-charcoal-light text-xs mt-1">{coach.domain}</p>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-h-[500px] flex flex-col bg-cream rounded-2xl shadow-soft overflow-hidden">
            {selectedCoach ? (
              <>
                <div className="p-6 border-b border-sand-dark">
                  <h2 className="font-serif text-xl font-semibold text-charcoal">
                    {selectedCoach.name}
                  </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {loading ? (
                    <div className="text-center py-12 text-charcoal-light">{t('common.loading')}</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-16">
                      <p className="text-charcoal-light mb-2">{t('messages.beginConversation')}</p>
                      <p className="text-charcoal-light/80 text-sm">{t('messages.beginConversationMessage')}</p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isOwn = message.senderId === user.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                              isOwn
                                ? 'bg-sage text-cream rounded-br-md'
                                : 'bg-sand-dark/50 text-charcoal rounded-bl-md'
                            }`}
                          >
                            <p className="leading-relaxed">{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${isOwn ? 'text-cream/80' : 'text-charcoal-light'}`}
                            >
                              {new Date(message.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="p-4 border-t border-sand-dark">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={t('messages.shareThoughts')}
                      className="flex-1 px-5 py-3 rounded-2xl border border-sand-dark bg-sand/30 text-charcoal placeholder-charcoal-light/60 focus:border-sage"
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 bg-sage text-cream font-medium rounded-2xl hover:bg-sage-light transition-colors duration-300"
                    >
                      {t('messages.send')}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-12">
                <p className="text-charcoal-light text-center">{t('messages.selectCoach')}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </TraineeLayout>
  );
}
