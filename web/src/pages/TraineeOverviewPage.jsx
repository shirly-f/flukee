import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { traineeService } from '../services/traineeService';
import Layout from '../components/Layout';

export default function TraineeOverviewPage() {
  const { t } = useTranslation();
  const { traineeId } = useParams();
  const [overview, setOverview] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadData();
  }, [traineeId]);

  const loadData = async () => {
    try {
      const [overviewData, tasksData] = await Promise.all([
        traineeService.getTraineeOverview(traineeId),
        traineeService.getTraineeTasks(traineeId),
      ]);
      setOverview(overviewData);
      setTasks(tasksData.tasks || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-32 text-charcoal-light">
          {t('common.loading')}
        </div>
      </Layout>
    );
  }

  if (!overview) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-32 text-charcoal-light">
          {t('common.clientNotFound')}
        </div>
      </Layout>
    );
  }

  const { trainee, stats, recentTasks } = overview;

  // Get latest reflection (text response) for preview
  const latestReflection = tasks
    .filter(t => t.response?.responseData?.text)
    .sort((a, b) => new Date(b.response?.submittedAt || 0) - new Date(a.response?.submittedAt || 0))[0];

  const tabs = [
    { id: 'overview', label: t('tasks.overview') },
    { id: 'timeline', label: t('tasks.timeline') },
  ];

  return (
    <Layout>
      {/* Header with back */}
      <div className="mb-8">
        <Link 
          to="/trainees" 
          className="text-charcoal-light hover:text-sage transition-colors duration-300 text-sm mb-4 inline-block"
        >
          ← {t('tasks.backToClients')}
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl font-semibold text-charcoal mb-1">
              {trainee.name}
            </h1>
            <p className="text-charcoal-light">{trainee.email}</p>
          </div>
          <Link
            to={`/trainees/${traineeId}/tasks/new`}
            className="inline-flex items-center justify-center px-8 py-3 bg-sage text-cream font-medium rounded-2xl hover:bg-sage-light transition-colors duration-300 shadow-soft"
          >
            {t('tasks.createPractice')}
          </Link>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 mb-8 border-b border-sand-dark">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-sm font-medium transition-colors duration-300 ${
              activeTab === tab.id
                ? 'text-sage border-b-2 border-sage'
                : 'text-charcoal-light hover:text-charcoal'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-cream rounded-2xl p-5 shadow-soft">
              <p className="text-charcoal-light text-xs mb-1">{t('tasks.completed')}</p>
              <p className="font-serif text-2xl font-semibold text-sage">{stats.completedTasks || 0}</p>
            </div>
            <div className="bg-cream rounded-2xl p-5 shadow-soft">
              <p className="text-charcoal-light text-xs mb-1">{t('tasks.pending')}</p>
              <p className="font-serif text-2xl font-semibold text-sage">{stats.pendingTasks || 0}</p>
            </div>
            <div className="bg-cream rounded-2xl p-5 shadow-soft">
              <p className="text-charcoal-light text-xs mb-1">{t('tasks.total')}</p>
              <p className="font-serif text-2xl font-semibold text-sage">{stats.totalTasks || 0}</p>
            </div>
            <div className="bg-cream rounded-2xl p-5 shadow-soft">
              <p className="text-charcoal-light text-xs mb-1">{t('tasks.rate')}</p>
              <p className="font-serif text-2xl font-semibold text-sage">
                {Math.round((stats.completionRate || 0) * 100)}%
              </p>
            </div>
          </div>

          {/* Reflection preview */}
          {latestReflection && (
            <div className="bg-cream rounded-2xl p-6 shadow-soft">
              <h3 className="font-serif text-xl font-semibold text-charcoal mb-3">
                {t('tasks.latestReflection')}
              </h3>
              <p className="text-charcoal-light text-sm mb-2">{latestReflection.title}</p>
              <p className="text-charcoal leading-relaxed line-clamp-4">
                {latestReflection.response?.responseData?.text}
              </p>
            </div>
          )}

          {/* Recent tasks */}
          <div>
            <h3 className="font-serif text-xl font-semibold text-charcoal mb-4">
              {t('tasks.recentPractices')}
            </h3>
            {recentTasks?.length > 0 ? (
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-cream rounded-2xl p-4 shadow-soft flex justify-between items-center"
                  >
                    <span className="font-medium text-charcoal">{task.title}</span>
                    <span className={`text-sm px-3 py-1 rounded-full ${
                      task.status === 'completed' 
                        ? 'bg-sage/20 text-sage' 
                        : 'bg-sand-dark text-charcoal-light'
                    }`}>
                      {task.status === 'completed' ? t('tasks.completed') : task.status === 'in_progress' ? t('tasks.inProgress') : t('tasks.pending')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-charcoal-light">{t('tasks.noPracticesYet')}</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-sand-dark" />
          
          <div className="space-y-8">
            {tasks.length > 0 ? (
              tasks
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((task) => (
                  <div key={task.id} className="relative pl-12">
                    <div className="absolute left-2 w-4 h-4 rounded-full bg-sage" />
                    <div className="bg-cream rounded-2xl p-6 shadow-soft">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-serif text-lg font-semibold text-charcoal">
                          {task.title}
                        </h4>
                        <span className={`text-xs px-3 py-1 rounded-full capitalize ${
                          task.status === 'completed' 
                            ? 'bg-sage/20 text-sage' 
                            : 'bg-sand-dark text-charcoal-light'
                        }`}>
                          {task.status === 'in_progress' ? t('tasks.inProgress') : t(`tasks.${task.status}`)}
                        </span>
                      </div>
                      <p className="text-charcoal-light text-sm mb-3">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </p>
                      {task.response?.responseData?.text && (
                        <div className="mt-4 pt-4 border-t border-sand-dark">
                          <p className="text-charcoal-light text-xs mb-1">{t('tasks.theirReflection')}</p>
                          <p className="text-charcoal leading-relaxed">
                            {task.response.responseData.text}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
            ) : (
              <div className="bg-cream rounded-2xl p-12 text-center shadow-soft">
                <p className="text-charcoal-light">{t('tasks.noPracticesInTimeline')}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
