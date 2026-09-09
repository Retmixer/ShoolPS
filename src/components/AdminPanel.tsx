import React, { useState } from 'react';
import { useCourses } from '../context/CoursesContext';
import { Course, Lesson, Homework } from '../types';
import { extractGoogleDriveInfo } from '../utils/googleDrive';
import {
  Plus,
  Trash2,
  Edit,
  Video,
  BookOpen,
  LogOut,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  FileCode,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

interface AdminPanelProps {
  onClose: () => void;
}

const PRESET_THUMBNAILS = [
  { name: '1С:Предприятие 8.3', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80' },
  { name: '1С + AI Интеграция', url: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Нейросети & LLM', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Запросы & СКД 1С', url: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=1200&q=80' },
  { name: 'REST & Web-сервисы 1С', url: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=1200&q=80' }
];

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const {
    courses,
    logoutAdmin,
    addCourse,
    updateCourse,
    deleteCourse,
    addLessonToCourse,
    updateLesson,
    deleteLesson,
    resetToInitialData,
    loadDemoCourses,
    clearAllCourses,
  } = useCourses();

  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(courses[0]?.id || null);

  // Modals state
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [targetCourseIdForLesson, setTargetCourseIdForLesson] = useState<string>('');
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  // Toast / feedback state
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Course Form State
  const [cTitle, setCTitle] = useState('');
  const [cSlug, setCSlug] = useState('');
  const [cCategory, setCCategory] = useState('Разработка 1С');
  const [cLevel, setCLevel] = useState<'Начинающий' | 'Средний' | 'Продвинутый'>('Средний');
  const [cThumbnail, setCThumbnail] = useState(PRESET_THUMBNAILS[0].url);
  const [cShortDesc, setCShortDesc] = useState('');
  const [cFullDesc, setCFullDesc] = useState('');
  const [cTags, setCTags] = useState('1С, 8.3, Конфигурирование, AI');

  // Lesson & Homework Form State
  const [lTitle, setLTitle] = useState('');
  const [lDuration, setLDuration] = useState('25 мин');
  const [lDriveUrl, setLDriveUrl] = useState('');
  const [lDesc, setLDesc] = useState('');
  const [lOrder, setLOrder] = useState(1);
  const [hwTitle, setHwTitle] = useState('');
  const [hwDesc, setHwDesc] = useState('');
  const [hwInstructions, setHwInstructions] = useState<string[]>(['']);
  const [hwDeliverables, setHwDeliverables] = useState('');
  const [hwHints, setHwHints] = useState<string[]>(['']);

  // Open Course Modal for Create
  const handleOpenCreateCourse = () => {
    setEditingCourse(null);
    setCTitle('');
    setCSlug(`course-${Date.now().toString().slice(-4)}`);
    setCCategory('Искусственный интеллект (AI)');
    setCLevel('Средний');
    setCThumbnail(PRESET_THUMBNAILS[0].url);
    setCShortDesc('');
    setCFullDesc('');
    setCTags('AI, Python, LLM');
    setIsCourseModalOpen(true);
  };

  // Open Course Modal for Edit
  const handleOpenEditCourse = (c: Course) => {
    setEditingCourse(c);
    setCTitle(c.title);
    setCSlug(c.slug);
    setCCategory(c.category);
    setCLevel(c.level);
    setCThumbnail(c.thumbnail);
    setCShortDesc(c.shortDescription);
    setCFullDesc(c.fullDescription);
    setCTags(c.tags.join(', '));
    setIsCourseModalOpen(true);
  };

  // Submit Course Form
  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const tagList = cTags.split(',').map((t) => t.trim()).filter(Boolean);

    if (editingCourse) {
      updateCourse(editingCourse.id, {
        title: cTitle,
        slug: cSlug || editingCourse.slug,
        category: cCategory,
        level: cLevel,
        thumbnail: cThumbnail,
        shortDescription: cShortDesc,
        fullDescription: cFullDesc,
        tags: tagList,
      });
      triggerToast(`Курс «${cTitle}» успешно обновлен!`);
    } else {
      const newCourseId = addCourse({
        title: cTitle,
        slug: cSlug || `course-${Date.now()}`,
        category: cCategory,
        level: cLevel,
        thumbnail: cThumbnail,
        shortDescription: cShortDesc,
        fullDescription: cFullDesc,
        tags: tagList,
        lessons: []
      });
      setExpandedCourseId(newCourseId);
      triggerToast(`Курс «${cTitle}» создан! Добавьте в него первый видеоурок с Google Drive.`);
    }

    setIsCourseModalOpen(false);
  };

  // Open Lesson Modal for Create
  const handleOpenAddLesson = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    const nextOrder = (course?.lessons.length || 0) + 1;

    setTargetCourseIdForLesson(courseId);
    setEditingLesson(null);
    setLTitle(`Урок ${nextOrder}: `);
    setLDuration('25 мин');
    setLDriveUrl('');
    setLDesc('');
    setLOrder(nextOrder);
    setHwTitle(`Домашнее задание к уроку ${nextOrder}`);
    setHwDesc('Выполните практическое задание по материалам видеоурока.');
    setHwInstructions(['Шаг 1: Настройка окружения', 'Шаг 2: Реализация ключевого функционала']);
    setHwDeliverables('Ссылка на GitHub / файл на Google Drive');
    setHwHints(['Внимательно проверьте зависимости перед отправкой']);
    setIsLessonModalOpen(true);
  };

  // Open Lesson Modal for Edit
  const handleOpenEditLesson = (courseId: string, lesson: Lesson) => {
    setTargetCourseIdForLesson(courseId);
    setEditingLesson(lesson);
    setLTitle(lesson.title);
    setLDuration(lesson.duration);
    setLDriveUrl(lesson.googleDriveUrl);
    setLDesc(lesson.description);
    setLOrder(lesson.order);
    setHwTitle(lesson.homework?.title || '');
    setHwDesc(lesson.homework?.description || '');
    setHwInstructions(lesson.homework?.instructions?.length ? lesson.homework.instructions : ['']);
    setHwDeliverables(lesson.homework?.deliverables || '');
    setHwHints(lesson.homework?.hints?.length ? lesson.homework.hints : ['']);
    setIsLessonModalOpen(true);
  };

  // Submit Lesson Form
  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanInstructions = hwInstructions.map((s) => s.trim()).filter(Boolean);
    const cleanHints = hwHints.map((s) => s.trim()).filter(Boolean);

    const homeworkPayload: Homework = {
      id: editingLesson?.homework?.id || `hw-${Date.now()}`,
      title: hwTitle || 'Практическое домашнее задание',
      description: hwDesc || 'Выполните требования по уроку',
      instructions: cleanInstructions.length ? cleanInstructions : ['Выполнить шаги из видеоурока'],
      deliverables: hwDeliverables || 'Ссылка на решение',
      hints: cleanHints.length ? cleanHints : undefined,
    };

    if (editingLesson) {
      updateLesson(targetCourseIdForLesson, editingLesson.id, {
        title: lTitle,
        duration: lDuration,
        googleDriveUrl: lDriveUrl,
        description: lDesc,
        order: Number(lOrder),
        homework: homeworkPayload,
      });
      triggerToast(`Урок «${lTitle}» и ДЗ успешно обновлены!`);
    } else {
      addLessonToCourse(targetCourseIdForLesson, {
        title: lTitle,
        duration: lDuration,
        googleDriveUrl: lDriveUrl,
        description: lDesc,
        order: Number(lOrder),
        homework: homeworkPayload,
      });
      triggerToast(`Новый видеоурок «${lTitle}» с ДЗ добавлен!`);
    }

    setIsLessonModalOpen(false);
  };

  const driveValidation = extractGoogleDriveInfo(lDriveUrl);

  return (
    <div className="w-full min-h-screen bg-black text-white pb-24">
      {/* Admin Top Banner */}
      <div className="border-b border-neutral-800 bg-neutral-950 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="px-2 py-0.5 sm:py-1 bg-white text-black font-mono font-bold text-[11px] sm:text-xs rounded">
              АДМИН
            </div>
            <div className="flex flex-col">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                Панель управления PaceSetter
              </h1>
              <span className="text-[11px] font-mono text-neutral-400">
                lazd548@gmail.com
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <button
              onClick={handleOpenCreateCourse}
              id="admin-create-course-btn"
              className="px-3 py-2 bg-white text-black font-semibold text-xs rounded-lg hover:bg-neutral-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow min-h-[38px]"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Создать курс</span>
              <span className="sm:hidden">+ Курс</span>
            </button>

            {courses.length === 0 ? (
              <button
                onClick={() => {
                  loadDemoCourses();
                  triggerToast('Демо-курсы 1С и AI успешно загружены!');
                }}
                title="Загрузить программы по 1С и AI"
                className="px-2.5 sm:px-3 py-2 bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300 hover:text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer min-h-[38px]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Загрузить демо</span>
                <span className="sm:hidden">Демо</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  if (confirm('Очистить все курсы?')) {
                    clearAllCourses();
                    triggerToast('Все курсы очищены.');
                  }
                }}
                title="Очистить все курсы"
                className="px-2.5 sm:px-3 py-2 bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-400 hover:text-red-400 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer min-h-[38px]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Очистить</span>
                <span className="sm:hidden">Сброс</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-2.5 sm:px-3 py-2 bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300 hover:text-white rounded-lg transition-colors cursor-pointer min-h-[38px]"
            >
              На сайт
            </button>

            <button
              onClick={() => {
                logoutAdmin();
                onClose();
              }}
              className="px-2.5 sm:px-3 py-2 bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300 hover:text-red-400 rounded-lg transition-colors flex items-center gap-1 cursor-pointer min-h-[38px]"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Выход</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
          <div className="p-3 bg-white text-black text-xs font-mono font-semibold rounded-lg flex items-center gap-2 shadow-lg animate-fade-in">
            <Check className="w-4 h-4" />
            <span>{successToast}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl">
            <span className="text-xs font-mono text-neutral-400 uppercase">Всего курсов</span>
            <p className="text-2xl font-bold font-mono text-white mt-1">{courses.length}</p>
          </div>
          <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl">
            <span className="text-xs font-mono text-neutral-400 uppercase">Видеоуроков (Google Drive)</span>
            <p className="text-2xl font-bold font-mono text-white mt-1">
              {courses.reduce((acc, c) => acc + c.lessons.length, 0)}
            </p>
          </div>
          <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl">
            <span className="text-xs font-mono text-neutral-400 uppercase">Домашних заданий</span>
            <p className="text-2xl font-bold font-mono text-white mt-1">
              {courses.reduce((acc, c) => acc + c.lessons.filter((l) => !!l.homework).length, 0)}
            </p>
          </div>
        </div>

        {/* Courses Management List */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-tight">Список курсов и управление видео/ДЗ</h2>
            <button
              onClick={handleOpenCreateCourse}
              className="text-xs font-mono text-neutral-300 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Добавить блок курса</span>
            </button>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-16 px-6 bg-neutral-950 border border-neutral-800 rounded-xl max-w-xl mx-auto">
              <Layers className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white font-mono">
                Список курсов пуст
              </h3>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                Вы можете создать свой собственный блок курса и добавить в него видеоуроки с Google Диска и практические ДЗ, либо загрузить демонстрационные материалы для примера.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleOpenCreateCourse}
                  className="px-4 py-2 bg-white text-black font-semibold text-xs rounded-lg hover:bg-neutral-200 transition-colors flex items-center gap-1.5 cursor-pointer font-mono"
                >
                  <Plus className="w-4 h-4" />
                  <span>Создать первый курс</span>
                </button>
                <button
                  onClick={() => {
                    loadDemoCourses();
                    triggerToast('Демонстрационные курсы загружены!');
                  }}
                  className="px-4 py-2 bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer font-mono"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Загрузить демо</span>
                </button>
              </div>
            </div>
          ) : (
            courses.map((course) => {
              const isExpanded = expandedCourseId === course.id;

              return (
              <div
                key={course.id}
                className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden transition-all shadow-md"
              >
                {/* Course Header Bar */}
                <div className="p-5 flex flex-wrap items-center justify-between gap-4 bg-neutral-900/40">
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-16 h-11 object-cover rounded border border-neutral-800 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-neutral-800 text-neutral-300 rounded">
                          {course.category}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500">
                          {course.lessons.length} {course.lessons.length === 1 ? 'урок' : 'урока'}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white tracking-tight truncate">
                        {course.title}
                      </h3>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenAddLesson(course.id)}
                      className="px-3 py-1.5 bg-neutral-900 border border-neutral-700 hover:border-white text-white text-xs font-mono rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Добавить видеоурок</span>
                    </button>

                    <button
                      onClick={() => handleOpenEditCourse(course)}
                      title="Редактировать курс"
                      className="p-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-600 text-neutral-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Удалить курс «${course.title}» и все его уроки?`)) {
                          deleteCourse(course.id);
                          triggerToast(`Курс «${course.title}» удален.`);
                        }
                      }}
                      title="Удалить курс"
                      className="p-2 bg-neutral-900 border border-neutral-800 hover:border-red-600 text-neutral-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                      className="p-2 bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                      title={isExpanded ? 'Свернуть уроки' : 'Развернуть уроки'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Lessons & Homeworks View */}
                {isExpanded && (
                  <div className="p-5 border-t border-neutral-900 bg-black/70">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                        Уроки в этом курсе ({course.lessons.length}):
                      </h4>
                      <button
                        onClick={() => handleOpenAddLesson(course.id)}
                        className="text-xs font-mono text-white hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Добавить видеоурок с Google Drive</span>
                      </button>
                    </div>

                    {course.lessons.length === 0 ? (
                      <div className="p-6 text-center border border-dashed border-neutral-800 rounded-lg">
                        <p className="text-xs text-neutral-500 font-mono">В курсе пока нет видеоуроков.</p>
                        <button
                          onClick={() => handleOpenAddLesson(course.id)}
                          className="mt-2 text-xs text-white font-semibold underline cursor-pointer"
                        >
                          Добавить первый урок прямо сейчас
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {course.lessons.map((lesson) => {
                          const info = extractGoogleDriveInfo(lesson.googleDriveUrl);
                          return (
                            <div
                              key={lesson.id}
                              className="p-4 bg-neutral-950 border border-neutral-800 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
                            >
                              <div className="flex items-start gap-3 min-w-0">
                                <div className="p-2 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 shrink-0">
                                  <Video className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[11px] font-mono font-semibold text-white">
                                      {lesson.title}
                                    </span>
                                    <span className="text-[10px] font-mono px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-neutral-400">
                                      {lesson.duration}
                                    </span>
                                  </div>

                                  {/* Google Drive status */}
                                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-neutral-400">
                                    <span className="truncate max-w-xs text-neutral-500">
                                      {lesson.googleDriveUrl}
                                    </span>
                                    {info.embedUrl && (
                                      <a
                                        href={info.viewUrl || lesson.googleDriveUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-neutral-300 hover:text-white inline-flex items-center gap-1"
                                      >
                                        <span>Тест ссылки</span>
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    )}
                                  </div>

                                  {/* Homework info */}
                                  {lesson.homework && (
                                    <div className="mt-2 flex items-center gap-2 text-[11px] font-mono text-neutral-300 bg-neutral-900/80 px-2.5 py-1 rounded border border-neutral-800 w-fit">
                                      <BookOpen className="w-3 h-3 text-white" />
                                      <span>ДЗ: {lesson.homework.title}</span>
                                      <span className="text-neutral-500">
                                        ({lesson.homework.instructions?.length || 0} пунктов)
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Lesson Buttons */}
                              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                                <button
                                  onClick={() => handleOpenEditLesson(course.id, lesson)}
                                  className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-mono text-white rounded transition-colors flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                  <span>Изменить видео и ДЗ</span>
                                </button>

                                <button
                                  onClick={() => {
                                    if (confirm(`Удалить урок «${lesson.title}»?`)) {
                                      deleteLesson(course.id, lesson.id);
                                      triggerToast('Урок удален');
                                    }
                                  }}
                                  className="p-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-red-400 rounded transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          }))}
        </div>
      </div>

      {/* =========================================================
          COURSE CREATE / EDIT MODAL
         ========================================================= */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-xl p-6 sm:p-8 shadow-2xl my-8">
            <button
              onClick={() => setIsCourseModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <Layers className="w-5 h-5 text-white" />
              <h3 className="text-lg font-bold text-white tracking-tight">
                {editingCourse ? 'Редактировать блок курса' : 'Создать новый блок курса'}
              </h3>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-neutral-300 mb-1.5">Название курса:</label>
                <input
                  type="text"
                  required
                  value={cTitle}
                  onChange={(e) => setCTitle(e.target.value)}
                  placeholder="Например: Архитектура LLM-агентов на Python"
                  className="w-full px-3 py-2.5 bg-black border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 mb-1.5">Категория:</label>
                  <select
                    value={cCategory}
                    onChange={(e) => setCCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-black border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-white"
                  >
                    <option>Искусственный интеллект (AI)</option>
                    <option>Машинное обучение</option>
                    <option>Веб-разработка</option>
                    <option>Архитектура & DevOps</option>
                    <option>Python & Data Science</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 mb-1.5">Сложность:</label>
                  <select
                    value={cLevel}
                    onChange={(e) => setCLevel(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-black border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-white"
                  >
                    <option>Начинающий</option>
                    <option>Средний</option>
                    <option>Продвинутый</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 mb-1.5">Краткое описание (для карточки на главной):</label>
                <textarea
                  rows={2}
                  required
                  value={cShortDesc}
                  onChange={(e) => setCShortDesc(e.target.value)}
                  placeholder="2-3 предложения о ключевых навыках..."
                  className="w-full px-3 py-2.5 bg-black border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-white font-sans"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1.5">Полное описание (на странице курса):</label>
                <textarea
                  rows={3}
                  value={cFullDesc}
                  onChange={(e) => setCFullDesc(e.target.value)}
                  placeholder="Подробное описание программы курса..."
                  className="w-full px-3 py-2.5 bg-black border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-white font-sans"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1.5">Обложка / Превью (URL):</label>
                <input
                  type="url"
                  required
                  value={cThumbnail}
                  onChange={(e) => setCThumbnail(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2.5 bg-black border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-white"
                />

                {/* Quick Presets */}
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="text-[10px] text-neutral-500 self-center">Быстрый выбор:</span>
                  {PRESET_THUMBNAILS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setCThumbnail(preset.url)}
                      className="text-[10px] px-2 py-1 bg-neutral-900 border border-neutral-800 rounded hover:border-white transition-colors text-neutral-300"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 mb-1.5">Теги (через запятую):</label>
                <input
                  type="text"
                  value={cTags}
                  onChange={(e) => setCTags(e.target.value)}
                  placeholder="AI, LangChain, Python, Deep Learning"
                  className="w-full px-3 py-2.5 bg-black border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-white"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-neutral-900">
                <button
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="px-4 py-2 bg-neutral-900 text-neutral-300 rounded-lg hover:text-white"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 shadow"
                >
                  {editingCourse ? 'Сохранить изменения' : 'Создать курс'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          LESSON & HOMEWORK CREATE / EDIT MODAL
         ========================================================= */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-neutral-950 border border-neutral-800 rounded-xl p-6 sm:p-8 shadow-2xl my-8">
            <button
              onClick={() => setIsLessonModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <Video className="w-5 h-5 text-white" />
              <h3 className="text-lg font-bold text-white tracking-tight">
                {editingLesson ? 'Редактировать видеоурок и ДЗ' : 'Добавить видеоурок (Google Drive) и ДЗ'}
              </h3>
            </div>

            <form onSubmit={handleSaveLesson} className="space-y-6 text-xs font-mono">
              {/* VIDEO SECTION */}
              <div className="p-4 bg-black border border-neutral-800 rounded-xl space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-neutral-900">
                  <Video className="w-4 h-4 text-white" />
                  <span className="font-bold text-white uppercase">1. Параметры видеоурока</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-neutral-300 mb-1.5">Название видеоурока:</label>
                    <input
                      type="text"
                      required
                      value={lTitle}
                      onChange={(e) => setLTitle(e.target.value)}
                      placeholder="Урок: Реализация трансформера"
                      className="w-full px-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-300 mb-1.5">Длительность:</label>
                    <input
                      type="text"
                      required
                      value={lDuration}
                      onChange={(e) => setLDuration(e.target.value)}
                      placeholder="30 мин"
                      className="w-full px-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-white"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-neutral-300">
                      Ссылка на видео (Google Drive, YouTube, RuTube или MP4):
                    </label>
                    {lDriveUrl && (
                      <button
                        type="button"
                        onClick={() => setLDriveUrl('')}
                        className="text-[10px] text-neutral-500 hover:text-white transition-colors"
                      >
                        Очистить
                      </button>
                    )}
                  </div>
                  <input
                    type="url"
                    required
                    value={lDriveUrl}
                    onChange={(e) => setLDriveUrl(e.target.value.trim())}
                    placeholder="https://drive.google.com/file/d/1p0BYhROxfd6imOCQmmlGSBeC97goS6Or/view?usp=sharing"
                    className="w-full px-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-white text-xs font-mono"
                  />

                  {/* Video URL validation & Diagnostic info */}
                  {driveValidation.isValid ? (
                    <div className="mt-2.5 p-3 bg-neutral-900 border border-neutral-800 rounded-lg space-y-2 text-[11px]">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                          <Check className="w-3.5 h-3.5" />
                          <span>Источник распознан: {driveValidation.providerLabel}</span>
                          {driveValidation.fileId && (
                            <span className="text-neutral-400 font-mono text-[10px]">
                              (ID: {driveValidation.fileId})
                            </span>
                          )}
                        </div>

                        <a
                          href={driveValidation.viewUrl || lDriveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-white hover:underline bg-neutral-800 px-2 py-1 rounded text-[10px]"
                        >
                          <span>Проверить открытие</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      {driveValidation.isGoogleDrive && (
                        <div className="text-neutral-400 leading-relaxed border-t border-neutral-800 pt-2 space-y-1">
                          <p>
                            <strong className="text-white">Обратите внимание:</strong> Для видеофайлов Google Drive (особенно крупных, более 1 ГБ, таких как <code className="text-neutral-300">Opencode.mp4</code>) серверы Google требуют время на конвертацию для встроенного плеера.
                          </p>
                          <p className="text-neutral-300">
                            Плеер на сайте автоматически предоставляет студентам прямую кнопку <strong>«Смотреть в Google Диске»</strong>, которая работает в любой момент независимо от ограничений браузера.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2 p-2.5 bg-neutral-900 border border-neutral-800 rounded-md text-[11px] text-neutral-300 flex items-start gap-2">
                      <Info className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                      <div>
                        <p>
                          <strong className="text-white">Как получить правильную ссылку Google Drive:</strong> В Google Диске нажмите правой кнопкой на видео → «Поделиться» → включите доступ «Все, у кого есть ссылка» (Читатель) → нажмите «Копировать ссылку».
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-neutral-300 mb-1.5">Краткое описание урока:</label>
                  <textarea
                    rows={2}
                    value={lDesc}
                    onChange={(e) => setLDesc(e.target.value)}
                    placeholder="О чем этот урок, основные тезисы..."
                    className="w-full px-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-white font-sans"
                  />
                </div>
              </div>

              {/* HOMEWORK SECTION */}
              <div className="p-4 bg-black border border-neutral-800 rounded-xl space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-neutral-900">
                  <FileCode className="w-4 h-4 text-white" />
                  <span className="font-bold text-white uppercase">2. Блок домашнего задания (ДЗ)</span>
                </div>

                <div>
                  <label className="block text-neutral-300 mb-1.5">Тема / Заголовок ДЗ:</label>
                  <input
                    type="text"
                    required
                    value={hwTitle}
                    onChange={(e) => setHwTitle(e.target.value)}
                    placeholder="Домашнее задание: Создание пайплайна эмбеддингов"
                    className="w-full px-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 mb-1.5">Описание задания:</label>
                  <textarea
                    rows={2}
                    value={hwDesc}
                    onChange={(e) => setHwDesc(e.target.value)}
                    placeholder="Поясните суть задачи, цель и ожидаемый результат..."
                    className="w-full px-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-white font-sans"
                  />
                </div>

                {/* Step-by-step tasks */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-neutral-300">Пошаговый чек-лист пунктов задания:</label>
                    <button
                      type="button"
                      onClick={() => setHwInstructions([...hwInstructions, ''])}
                      className="text-[11px] text-white underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Добавить пункт</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {hwInstructions.map((inst, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-neutral-500 w-5">{idx + 1}.</span>
                        <input
                          type="text"
                          value={inst}
                          onChange={(e) => {
                            const copy = [...hwInstructions];
                            copy[idx] = e.target.value;
                            setHwInstructions(copy);
                          }}
                          placeholder={`Пункт ${idx + 1}`}
                          className="flex-1 px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-white focus:outline-none focus:border-white"
                        />
                        {hwInstructions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setHwInstructions(hwInstructions.filter((_, i) => i !== idx));
                            }}
                            className="p-1 text-neutral-500 hover:text-red-400"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-300 mb-1.5">Что необходимо сдать (Deliverables):</label>
                  <input
                    type="text"
                    value={hwDeliverables}
                    onChange={(e) => setHwDeliverables(e.target.value)}
                    placeholder="Ссылка на GitHub репозиторий со скриптом и README"
                    className="w-full px-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-neutral-300">Подсказки и советы (опционально):</label>
                    <button
                      type="button"
                      onClick={() => setHwHints([...hwHints, ''])}
                      className="text-[11px] text-white underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Добавить подсказку</span>
                    </button>
                  </div>
                  <div className="space-y-2">
                    {hwHints.map((hint, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={hint}
                          onChange={(e) => {
                            const copy = [...hwHints];
                            copy[idx] = e.target.value;
                            setHwHints(copy);
                          }}
                          placeholder="Совет или предостережение от частой ошибки..."
                          className="flex-1 px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-white focus:outline-none focus:border-white"
                        />
                        {hwHints.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setHwHints(hwHints.filter((_, i) => i !== idx))}
                            className="p-1 text-neutral-500 hover:text-red-400"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-neutral-900">
                <button
                  type="button"
                  onClick={() => setIsLessonModalOpen(false)}
                  className="px-4 py-2 bg-neutral-900 text-neutral-300 rounded-lg hover:text-white"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 shadow"
                >
                  {editingLesson ? 'Сохранить урок и ДЗ' : 'Добавить урок в курс'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
