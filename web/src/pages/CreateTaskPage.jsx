import { useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { taskService } from '../services/taskService';
import { uploadService } from '../services/uploadService';
import Layout from '../components/Layout';

const TASK_TYPES = [
  { id: 'text_response', labelKey: 'tasks.reflection', descKey: 'tasks.reflectionDesc' },
  { id: 'read_document', labelKey: 'tasks.read', descKey: 'tasks.readDesc' },
  { id: 'questionnaire', labelKey: 'tasks.questionnaire', descKey: 'tasks.questionnaireDesc' },
];

export default function CreateTaskPage() {
  const { t } = useTranslation();
  const { traineeId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'text_response',
    dueDate: '',
    metadata: {},
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.type === 'read_document' && !formData.metadata.documentUrl?.trim()) {
      setError(t('tasks.uploadOrLinkRequired'));
      return;
    }
    setLoading(true);
    setError('');

    try {
      let metadata = {};
      if (formData.type === 'text_response') {
        metadata = { prompt: formData.metadata.prompt || '' };
      } else if (formData.type === 'read_document') {
        metadata = {
          documentUrl: formData.metadata.documentUrl || '',
          documentTitle: formData.metadata.documentTitle || '',
        };
      }

      await taskService.createTask({
        traineeId,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        dueDate: formData.dueDate || null,
        metadata,
      });
      navigate(`/trainees/${traineeId}`);
    } catch (err) {
      setError(err.response?.data?.error?.message || t('tasks.failedToCreate'));
    } finally {
      setLoading(false);
    }
  };

  const updateMetadata = (field, value) => {
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        [field]: value,
      },
    });
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const { url, originalName } = await uploadService.uploadDocument(file);
      const title = formData.metadata.documentTitle || originalName.replace(/\.[^.]+$/, '');
      setFormData({
        ...formData,
        metadata: {
          ...formData.metadata,
          documentUrl: url,
          documentTitle: title,
        },
      });
    } catch (err) {
      setError(err.response?.data?.error?.message || t('tasks.uploadFailed'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <Link 
          to={`/trainees/${traineeId}`} 
          className="text-charcoal-light hover:text-sage transition-colors duration-300 text-sm mb-8 inline-block"
        >
          ← {t('common.back')}
        </Link>

        <h1 className="font-serif text-4xl font-semibold text-charcoal mb-2">
          {t('tasks.createPractice')}
        </h1>
        <p className="text-charcoal-light mb-12">
          {t('tasks.createPracticeSubtitle')}
        </p>

        {error && (
          <div className="bg-rose-light/50 border border-rose/30 rounded-2xl p-4 text-charcoal mb-8">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Task type selector */}
          <div>
            <label className="block text-charcoal font-medium mb-4">{t('tasks.practiceType')}</label>
            <div className="grid gap-3">
              {TASK_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => {
                  if (type.id === formData.type) return;
                  setFormData((prev) => ({ ...prev, type: type.id, metadata: {} }));
                }}
                  className={`text-left p-5 rounded-2xl border-2 transition-all duration-300 ${
                    formData.type === type.id
                      ? 'border-sage bg-sage/5'
                      : 'border-sand-dark bg-cream hover:border-sage-muted'
                  }`}
                >
                  <span className="font-serif text-lg font-semibold text-charcoal block mb-1">
                    {t(type.labelKey)}
                  </span>
                  <span className="text-charcoal-light text-sm">{t(type.descKey)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-charcoal font-medium mb-2">{t('tasks.title')}</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t('tasks.placeholderTitle')}
              className="w-full px-5 py-4 rounded-2xl border border-sand-dark bg-cream text-charcoal placeholder-charcoal-light/60 focus:border-sage"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-charcoal font-medium mb-2">{t('tasks.description')}</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder={t('tasks.placeholderDescription')}
              className="w-full px-5 py-4 rounded-2xl border border-sand-dark bg-cream text-charcoal placeholder-charcoal-light/60 focus:border-sage resize-none"
            />
          </div>

          {/* Type-specific fields */}
          {formData.type === 'text_response' && (
            <div>
              <label className="block text-charcoal font-medium mb-2">{t('tasks.prompt')}</label>
              <textarea
                required
                value={formData.metadata.prompt || ''}
                onChange={(e) => updateMetadata('prompt', e.target.value)}
                rows={6}
                placeholder={t('tasks.placeholderPrompt')}
                className="w-full px-5 py-4 rounded-2xl border border-sand-dark bg-cream text-charcoal placeholder-charcoal-light/60 focus:border-sage resize-none text-lg leading-relaxed"
              />
            </div>
          )}

          {formData.type === 'read_document' && (
            <div className="space-y-4">
              <div>
                <label className="block text-charcoal font-medium mb-2">{t('tasks.documentTitle')}</label>
                <input
                  type="text"
                  required
                  value={formData.metadata.documentTitle || ''}
                  onChange={(e) => updateMetadata('documentTitle', e.target.value)}
                  placeholder={t('tasks.placeholderDocumentTitle')}
                  className="w-full px-5 py-4 rounded-2xl border border-sand-dark bg-cream text-charcoal placeholder-charcoal-light/60 focus:border-sage"
                />
              </div>
              <div>
                <label className="block text-charcoal font-medium mb-2">{t('tasks.document')}</label>
                <p className="text-charcoal-light text-sm mb-3">{t('tasks.uploadOrLinkRequired')}</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="px-5 py-3 rounded-2xl border-2 border-dashed border-sand-dark bg-cream text-charcoal hover:border-sage hover:bg-sage/5 transition-colors duration-300 disabled:opacity-50"
                    >
                      {uploading ? t('tasks.uploading') : t('tasks.uploadDocument')}
                    </button>
                    <span className="text-charcoal-light text-sm">{t('tasks.orLink')}</span>
                  </div>
                  <input
                    type="text"
                    value={formData.metadata.documentUrl || ''}
                    onChange={(e) => updateMetadata('documentUrl', e.target.value)}
                    placeholder={t('tasks.placeholderDocumentUrl')}
                    className="w-full px-5 py-4 rounded-2xl border border-sand-dark bg-cream text-charcoal placeholder-charcoal-light/60 focus:border-sage"
                  />
                  {formData.metadata.documentUrl && (
                    <p className="text-sage text-sm">{t('tasks.documentReady')}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {formData.type === 'questionnaire' && (
            <p className="text-charcoal-light py-4">
              {t('tasks.questionnaireComingSoon')}
            </p>
          )}

          {/* Due date */}
          <div>
            <label className="block text-charcoal font-medium mb-2">{t('tasks.dueDate')}</label>
            <input
              type="datetime-local"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-5 py-4 rounded-2xl border border-sand-dark bg-cream text-charcoal focus:border-sage"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-sage text-cream font-medium rounded-2xl hover:bg-sage-light transition-colors duration-300 shadow-soft disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {loading ? t('tasks.sending') : t('tasks.sendWithIntention')}
          </button>
        </form>
      </div>
    </Layout>
  );
}
