import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { taskService } from '../services/taskService';
import api from '../services/api';

export default function TraineeTaskDetailPage() {
  const { t } = useTranslation();
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTask();
  }, [taskId]);

  const loadTask = async () => {
    try {
      const data = await taskService.getTaskDetailsForTrainee(taskId);
      setTask(data);
      if (data.response?.responseData?.text) {
        setResponse(data.response.responseData.text);
      }
    } catch (err) {
      setError(t('tasks.failedToLoad'));
      if (err?.response?.status === 401) return;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!task) return;

    if (task.type === 'text_response' && !response.trim()) {
      setError(t('tasks.shareBeforeSubmit'));
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      let responseData = {};
      switch (task.type) {
        case 'text_response':
          responseData = { text: response };
          break;
        case 'read_document':
          responseData = { markedAsDone: true, timestamp: new Date().toISOString() };
          break;
        case 'questionnaire':
          setError(t('tasks.questionnaireComingSoonAlert'));
          setSubmitting(false);
          return;
        default:
          setError(t('tasks.unknownTaskType'));
          setSubmitting(false);
          return;
      }
      await taskService.submitTaskResponse(taskId, responseData, 'submitted');
      navigate('/my-tasks');
    } catch (err) {
      setError(t('tasks.failedToSubmit'));
    } finally {
      setSubmitting(false);
    }
  };

  const openDocument = () => {
    let url = task?.metadata?.documentUrl;
    if (!url?.trim()) return;
    if (url.startsWith('/')) {
      url = `${api.defaults.baseURL}${url}`;
    }
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sand flex items-center justify-center">
        <p className="text-charcoal-light">{t('common.loading')}</p>
      </div>
    );
  }

  if (!task || error) {
    return (
      <div className="min-h-screen bg-sand flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-charcoal-light mb-4">{error || t('common.clientNotFound')}</p>
          <Link to="/my-tasks" className="text-sage hover:underline">
            {t('tasks.backToPractices')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand">
      <header className="border-b border-sand-dark/60 bg-cream/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <Link to="/my-tasks" className="text-charcoal-light hover:text-sage text-sm">
            ← {t('common.back')}
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-6">
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm ${
              task.status === 'completed'
                ? 'bg-green-100 text-green-800'
                : task.status === 'in_progress'
                ? 'bg-sage/20 text-sage'
                : 'bg-sand-dark text-charcoal-light'
            }`}
          >
            {task.status === 'completed'
              ? t('tasks.completed')
              : task.status === 'in_progress'
              ? t('tasks.inProgress')
              : t('tasks.pending')}
          </span>
        </div>

        <h1 className="font-serif text-3xl font-semibold text-charcoal mb-4">{task.title}</h1>
        {task.description && (
          <p className="text-charcoal-light text-lg mb-8">{task.description}</p>
        )}

        {task.type === 'text_response' && (
          <div className="mb-8">
            {task.metadata?.prompt && (
              <p className="font-serif text-lg text-charcoal mb-4">{task.metadata.prompt}</p>
            )}
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder={t('tasks.placeholderReflection')}
              className="w-full min-h-[200px] px-5 py-4 rounded-2xl border border-sand-dark bg-cream text-charcoal focus:border-sage focus:ring-1 focus:ring-sage resize-none"
              disabled={task.status === 'completed'}
            />
          </div>
        )}

        {task.type === 'read_document' && (
          <div className="mb-8">
            <p className="font-serif text-lg text-charcoal mb-2">
              {task.metadata?.documentTitle || t('tasks.document')}
            </p>
            <button
              onClick={openDocument}
              className="text-sage hover:underline font-medium"
            >
              {t('tasks.openDocument')}
            </button>
            <p className="text-charcoal-light mt-4 text-sm">{t('tasks.readDocumentInstruction')}</p>
          </div>
        )}

        {task.type === 'questionnaire' && (
          <p className="text-charcoal-light mb-8">{t('tasks.questionnaireComingSoon')}</p>
        )}

        {error && (
          <div className="mb-6 p-4 bg-rose-light/50 border border-rose/30 rounded-2xl text-charcoal text-sm">
            {error}
          </div>
        )}

        {task.status !== 'completed' && task.type !== 'questionnaire' && (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-4 bg-sage text-cream font-medium rounded-2xl hover:bg-sage-light transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? t('common.loading') : task.response?.status === 'submitted' ? t('tasks.updateReflection') : t('tasks.submit')}
          </button>
        )}
      </main>
    </div>
  );
}
