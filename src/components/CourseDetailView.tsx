import React, { useState, useEffect } from 'react';
import { Course, Lesson } from '../types';
import { extractGoogleDriveInfo } from '../utils/googleDrive';
import { VideoPlayer } from './VideoPlayer';
import { useCourses } from '../context/CoursesContext';
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  Circle,
  Play,
  FileCode2,
  HelpCircle,
  Send,
  AlertCircle,
  Share2,
  Copy,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CourseDetailViewProps {
  course: Course;
  onBack: () => void;
  initialLessonId?: string;
}

export const CourseDetailView: React.FC<CourseDetailViewProps> = ({
  course,
  onBack,
  initialLessonId,
}) => {
  const {
    toggleTaskCompleted,
    saveSubmission,
    getSubmission,
  } = useCourses();

  // Active lesson selection
  const [activeLessonId, setActiveLessonId] = useState<string>(() => {
    if (initialLessonId && course.lessons.some((l) => l.id === initialLessonId)) {
      return initialLessonId;
    }
    return course.lessons[0]?.id || '';
  });

  const activeLesson: Lesson | undefined =
    course.lessons.find((l) => l.id === activeLessonId) || course.lessons[0];

  // Submission inputs
  const submission = activeLesson ? getSubmission(course.id, activeLesson.id) : undefined;
  const [solutionUrl, setSolutionUrl] = useState(submission?.solutionUrl || '');
  const [notes, setNotes] = useState(submission?.notes || '');
  const [copiedLink, setCopiedLink] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [showHints, setShowHints] = useState(false);

  // Sync state when lesson changes
  useEffect(() => {
    if (activeLesson) {
      const sub = getSubmission(course.id, activeLesson.id);
      setSolutionUrl(sub?.solutionUrl || '');
      setNotes(sub?.notes || '');
      setSaveSuccessMsg(false);
      setShowHints(false);
    }
  }, [activeLessonId, course.id]);

  if (!activeLesson) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <p className="text-neutral-400">В этом курсе пока нет доступных уроков.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-white text-black font-semibold rounded-lg"
        >
          Вернуться к списку
        </button>
      </div>
    );
  }

  const driveInfo = extractGoogleDriveInfo(activeLesson.googleDriveUrl);
  const completedTasks = submission?.completedTasks || [];
  const totalTasks = activeLesson.homework?.instructions?.length || 0;
  const isAllTasksCompleted =
    totalTasks > 0 && completedTasks.length === totalTasks;

  const handleTaskToggle = (index: number) => {
    toggleTaskCompleted(course.id, activeLesson.id, index);
  };

  const handleSaveHomework = (e: React.FormEvent) => {
    e.preventDefault();
    saveSubmission(course.id, activeLesson.id, solutionUrl, notes);
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 4000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(activeLesson.googleDriveUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="w-full min-h-screen bg-black text-white pb-24">
      {/* Top Breadcrumbs & Course Header Bar */}
      <div className="border-b border-neutral-900 bg-neutral-950/90 backdrop-blur-md sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              id="back-to-catalog-btn"
              onClick={onBack}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-xs font-mono text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Каталог курсов</span>
            </button>

            <span className="text-neutral-700">/</span>
            <span className="text-xs font-mono text-neutral-400 truncate max-w-[200px] sm:max-w-md">
              {course.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded text-neutral-300">
              {course.category}
            </span>
            <span className="text-xs font-mono px-2 py-1 bg-white text-black font-semibold rounded">
              {activeLesson.order} из {course.lessons.length} уроков
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Video & Content Column */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* High-tech Video Player Card */}
            <VideoPlayer
              url={activeLesson.googleDriveUrl}
              title={activeLesson.title}
            />

            {/* Lesson Title & Info */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                  Урок {activeLesson.order} из {course.lessons.length}
                </span>
                <span className="text-xs font-mono px-2.5 py-1 bg-neutral-900 border border-neutral-800 text-neutral-300 rounded">
                  Длительность: {activeLesson.duration}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {activeLesson.title}
              </h1>

              <p className="mt-3 text-sm text-neutral-300 leading-relaxed">
                {activeLesson.description}
              </p>

              {/* Lesson Materials / Resources */}
              {activeLesson.resources && activeLesson.resources.length > 0 && (
                <div className="mt-6 pt-5 border-t border-neutral-900">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-2">
                    <FileCode2 className="w-4 h-4 text-neutral-300" />
                    <span>Полезные ссылки и материалы к уроку</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {activeLesson.resources.map((res, i) => (
                      <a
                        key={i}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded text-xs font-mono text-neutral-200 transition-colors"
                      >
                        <span>{res.title}</span>
                        <ExternalLink className="w-3 h-3 text-neutral-500" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ========================================================
                HOMEWORK BLOCK (ДОМАШНЕЕ ЗАДАНИЕ)
               ======================================================== */}
            <div
              id="homework-section"
              className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 sm:p-7 shadow-xl relative overflow-hidden"
            >
              {/* Top Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-white" />

              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-300 mb-2">
                    <FileCode2 className="w-3.5 h-3.5 text-white" />
                    <span>ПРАКТИЧЕСКОЕ ЗАДАНИЕ</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {activeLesson.homework?.title || 'Практическое домашнее задание'}
                  </h2>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  {submission?.isCompleted ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-black font-semibold text-xs rounded-full font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                      <span>Выполнено</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-900 text-neutral-300 border border-neutral-800 text-xs rounded-full font-mono">
                      <Circle className="w-3.5 h-3.5 text-neutral-500" />
                      <span>В процессе</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Homework Description */}
              <p className="mt-4 text-sm text-neutral-300 leading-relaxed font-sans">
                {activeLesson.homework?.description}
              </p>

              {/* Task Checklist */}
              {activeLesson.homework?.instructions && activeLesson.homework.instructions.length > 0 && (
                <div className="mt-6 bg-neutral-900/60 border border-neutral-800/80 rounded-lg p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-300 font-semibold">
                      Пошаговые пункты выполнения:
                    </h4>
                    <span className="text-xs font-mono text-neutral-400">
                      {completedTasks.length} / {totalTasks} готово
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-neutral-800 rounded-full mb-4 overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-300"
                      style={{
                        width: `${totalTasks ? (completedTasks.length / totalTasks) * 100 : 0}%`,
                      }}
                    />
                  </div>

                  <ul className="space-y-3">
                    {activeLesson.homework.instructions.map((step, idx) => {
                      const isChecked = completedTasks.includes(idx);
                      return (
                        <li
                          key={idx}
                          onClick={() => handleTaskToggle(idx)}
                          className="flex items-start gap-3 p-2.5 rounded-md hover:bg-neutral-800/50 cursor-pointer transition-colors group"
                        >
                          <button
                            type="button"
                            className="mt-0.5 text-neutral-400 group-hover:text-white transition-colors"
                          >
                            {isChecked ? (
                              <CheckCircle2 className="w-4 h-4 text-white fill-white/10" />
                            ) : (
                              <Circle className="w-4 h-4 text-neutral-600" />
                            )}
                          </button>
                          <span
                            className={`text-xs sm:text-sm leading-relaxed transition-colors ${
                              isChecked
                                ? 'text-neutral-500 line-through'
                                : 'text-neutral-200 group-hover:text-white'
                            }`}
                          >
                            {step}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Deliverables requirement */}
              {activeLesson.homework?.deliverables && (
                <div className="mt-5 p-4 bg-black border border-neutral-800 rounded-lg">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
                    Что нужно подготовить к сдаче:
                  </span>
                  <p className="text-xs sm:text-sm text-neutral-200 font-mono">
                    {activeLesson.homework.deliverables}
                  </p>
                </div>
              )}

              {/* Expandable Hints */}
              {activeLesson.homework?.hints && activeLesson.homework.hints.length > 0 && (
                <div className="mt-4">
                  <button
                    onClick={() => setShowHints(!showHints)}
                    className="flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{showHints ? 'Скрыть подсказки' : 'Показать подсказки и советы к ДЗ'}</span>
                  </button>

                  <AnimatePresence>
                    {showHints && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 p-4 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-300 space-y-2 font-mono"
                      >
                        {activeLesson.homework.hints.map((hint, i) => (
                          <p key={i} className="flex items-start gap-2">
                            <span className="text-neutral-500">→</span>
                            <span>{hint}</span>
                          </p>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Submission Form */}
              <form onSubmit={handleSaveHomework} className="mt-6 pt-5 border-t border-neutral-900 flex flex-col gap-4">
                <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                  Форма сдачи домашнего задания:
                </h4>

                <div>
                  <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                    Ссылка на решение (GitHub / Google Drive / Google Colab):
                  </label>
                  <input
                    type="url"
                    value={solutionUrl}
                    onChange={(e) => setSolutionUrl(e.target.value)}
                    placeholder="https://github.com/username/project или https://drive.google.com/..."
                    className="w-full px-3.5 py-2.5 bg-black border border-neutral-800 rounded-lg text-xs font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                    Заметки, вопросы ментору или пояснения к коду:
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Опишите, какие возникли трудности, результаты метрик или особенности реализации..."
                    className="w-full px-3.5 py-2.5 bg-black border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-white text-black font-semibold text-xs rounded-lg hover:bg-neutral-200 transition-colors flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Отправить / Сохранить ДЗ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const newCompleted = !submission?.isCompleted;
                        saveSubmission(course.id, activeLesson.id, solutionUrl, notes);
                        if (newCompleted && activeLesson.homework?.instructions) {
                          activeLesson.homework.instructions.forEach((_, idx) => {
                            if (!completedTasks.includes(idx)) {
                              toggleTaskCompleted(course.id, activeLesson.id, idx);
                            }
                          });
                        }
                      }}
                      className="px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white rounded-lg text-xs font-mono transition-colors cursor-pointer"
                    >
                      {submission?.isCompleted ? 'Снять отметку' : 'Отметить все пункты'}
                    </button>
                  </div>

                  {saveSuccessMsg && (
                    <span className="text-xs font-mono text-white flex items-center gap-1.5 animate-fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Задание сохранено в вашем прогрессе!</span>
                    </span>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Right Sidebar: Course Lessons List & Curriculum */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Lessons Navigation Card */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 sticky top-32 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-900 mb-4">
                <h3 className="font-bold text-sm tracking-tight text-white uppercase font-mono">
                  Программа курса ({course.lessons.length})
                </h3>
                <span className="text-[11px] font-mono text-neutral-400">
                  {course.level}
                </span>
              </div>

              {/* List of lessons */}
              <div className="flex flex-col gap-2">
                {course.lessons.map((lesson) => {
                  const isActive = lesson.id === activeLessonId;
                  const lessonSub = getSubmission(course.id, lesson.id);
                  const isDone = lessonSub?.isCompleted;

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => setActiveLessonId(lesson.id)}
                      className={`text-left p-3.5 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
                        isActive
                          ? 'bg-neutral-900 border-white text-white shadow-md'
                          : 'bg-black/50 border-neutral-900 text-neutral-400 hover:text-white hover:border-neutral-700'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        ) : isActive ? (
                          <Play className="w-4 h-4 text-white fill-white" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-neutral-700 flex items-center justify-center text-[9px] font-mono">
                            {lesson.order}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold leading-snug line-clamp-2 ${isActive ? 'text-white' : 'text-neutral-300'}`}>
                          {lesson.title}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-[10px] font-mono text-neutral-500">
                          <span>{lesson.duration}</span>
                          <span>•</span>
                          <span className="truncate">Google Drive</span>
                          {isDone && (
                            <>
                              <span>•</span>
                              <span className="text-white">ДЗ сдано</span>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Course Info Summary in Sidebar */}
              <div className="mt-6 pt-5 border-t border-neutral-900">
                <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">
                  О курсе:
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {course.fullDescription}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {course.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono px-2 py-0.5 bg-neutral-900 text-neutral-400 rounded border border-neutral-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
