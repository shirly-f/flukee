import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { messageService } from '../services/messageService';
import { traineeService } from '../services/traineeService';
import Layout from '../components/Layout';

export default function MessagesPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [trainees, setTrainees] = useState([]);
  const [selectedTrainee, setSelectedTrainee] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    traineeService.listTrainees().then(setTrainees);
  }, []);

  useEffect(() => {
    if (selectedTrainee?.id) {
      loadMessages(selectedTrainee.id);
    } else {
      setMessages([]);
    }
  }, [selectedTrainee?.id]);

  const loadMessages = async (traineeId) => {
    setLoading(true);
    try {
      const data = await messageService.getMessages(traineeId);
      setMessages(data);
      const fresh = await traineeService.listTrainees();
      setTrainees(fresh);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTrainee) return;

    try {
      const message = await messageService.sendMessage(selectedTrainee.id, newMessage);
      setMessages([...messages, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <Layout>
      <h1 className="font-serif text-4xl font-semibold text-charcoal mb-2">
        {t('messages.messages')}
      </h1>
      <p className="text-charcoal-light mb-8">
        {t('messages.subtitle')}
      </p>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Trainee list */}
        <div className="lg:w-72 flex-shrink-0">
          <div className="bg-cream rounded-2xl overflow-hidden shadow-soft">
            {trainees.map((trainee) => (
              <button
                key={trainee.id}
                onClick={() => setSelectedTrainee(trainee)}
                className={`w-full text-left px-6 py-4 transition-colors duration-300 ${
                  selectedTrainee?.id === trainee.id
                    ? 'bg-sage/10 border-l-4 border-sage'
                    : 'hover:bg-sand/30'
                }`}
              >
                <p className="font-medium text-charcoal flex items-center gap-2 flex-wrap">
                  {trainee.name}
                  {(trainee.unreadMessageCount ?? 0) > 0 && (
                    <span
                      className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full bg-rose text-cream text-[11px] font-semibold tabular-nums"
                      title={t('messages.unreadBadge', { count: trainee.unreadMessageCount })}
                      aria-label={t('messages.unreadBadge', { count: trainee.unreadMessageCount })}
                    >
                      {trainee.unreadMessageCount}
                    </span>
                  )}
                </p>
                <p className="text-charcoal-light text-sm">{trainee.email}</p>
              </button>
            ))}
            {trainees.length === 0 && (
              <div className="px-6 py-12 text-center text-charcoal-light text-sm">
                {t('messages.noClients')}
              </div>
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 min-h-[500px] flex flex-col bg-cream rounded-2xl shadow-soft overflow-hidden">
          {selectedTrainee ? (
            <>
              <div className="p-6 border-b border-sand-dark">
                <h2 className="font-serif text-xl font-semibold text-charcoal">
                  {selectedTrainee.name}
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loading ? (
                  <div className="text-center py-12 text-charcoal-light">{t('common.loading')}</div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-charcoal-light mb-2">{t('messages.beginConversation')}</p>
                    <p className="text-charcoal-light/80 text-sm">
                      {t('messages.sendToStart')}
                    </p>
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
                          <p className={`text-xs mt-1 ${isOwn ? 'text-cream/80' : 'text-charcoal-light'}`}>
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
              <p className="text-charcoal-light text-center">
                {t('messages.selectClient')}
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
