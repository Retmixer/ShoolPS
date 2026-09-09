import React, { useState, useMemo, useRef } from 'react';
import { CoursesProvider, useCourses } from './context/CoursesContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AnimatedAiHero } from './components/AnimatedAiHero';
import { CourseCard } from './components/CourseCard';
import { CourseDetailView } from './components/CourseDetailView';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminPanel } from './components/AdminPanel';
import { Course } from './types';
import { Layers, Terminal, Sparkles } from 'lucide-react';

function MainContent() {
  const { courses, isAdmin } = useCourses();

  // Navigation state
  const [currentView, setCurrentView] = useState<'home' | 'course' | 'admin'>('home');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Admin Login Modal State
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');

  const coursesSectionRef = useRef<HTMLDivElement | null>(null);

  // Unique categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    set.add('Все');
    courses.forEach((c) => set.add(c.category));
    return Array.from(set);
  }, [courses]);

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesCat =
        selectedCategory === 'Все' || course.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        course.title.toLowerCase().includes(q) ||
        course.shortDescription.toLowerCase().includes(q) ||
        course.tags.some((t) => t.toLowerCase().includes(q));

      return matchesCat && matchesSearch;
    });
  }, [courses, selectedCategory, searchQuery]);

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    setCurrentView('course');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoHome = () => {
    setCurrentView('home');
    setSelectedCourse(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToCourses = () => {
    coursesSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white selection:bg-white selection:text-black">
      {/* Top Header */}
      <Header
        currentView={currentView}
        onGoHome={handleGoHome}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onOpenAdminPanel={() => setCurrentView('admin')}
      />

      {/* Main View Switcher */}
      <main className="flex-1 flex flex-col">
        {currentView === 'admin' ? (
          <AdminPanel onClose={handleGoHome} />
        ) : currentView === 'course' && selectedCourse ? (
          <CourseDetailView
            course={selectedCourse}
            onBack={handleGoHome}
          />
        ) : (
          /* HOME VIEW */
          <div className="flex flex-col">
            {/* Animated 1C & AI Hero */}
            <AnimatedAiHero
              onExploreClick={handleScrollToCourses}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categories={categories}
            />

            {/* Courses Blocks Section */}
            <section
              ref={coursesSectionRef}
              id="courses-catalog"
              className="max-w-7xl mx-auto w-full px-3 sm:px-6 py-10 sm:py-16"
            >
              {/* Section Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4 pb-5 sm:pb-6 border-b border-neutral-800/80 mb-8 sm:mb-10">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 mb-1.5 uppercase tracking-wider">
                    <Layers className="w-3.5 h-3.5 text-white" />
                    <span>КАТАЛОГ ПРОГРАММ ОБУЧЕНИЯ</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
                    Курсы по 1С и AI
                  </h2>
                </div>

                <div className="text-xs font-mono text-neutral-400">
                  Показано {filteredCourses.length} из {courses.length} программ
                </div>
              </div>

              {/* Course Cards Grid or Clean Empty State */}
              {courses.length === 0 ? (
                <div className="text-center py-16 sm:py-20 border border-neutral-900 rounded-2xl bg-neutral-950/30 p-6 sm:p-8 max-w-2xl mx-auto">
                  <Terminal className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-white font-mono">
                    Курсы готовятся к публикации
                  </h3>
                  <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                    Материалы и видеоуроки по 1С и AI обновляются. Войдите в панель администратора для управления курсами или загрузки демо-данных.
                  </p>
                  {isAdmin ? (
                    <button
                      onClick={() => setCurrentView('admin')}
                      className="mt-6 px-4 py-2.5 bg-white text-black font-semibold text-xs rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer font-mono min-h-[44px]"
                    >
                      + Открыть панель администратора
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsAdminLoginOpen(true)}
                      className="mt-6 px-4 py-2.5 bg-neutral-900 border border-neutral-800 text-white font-semibold text-xs rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer font-mono min-h-[44px]"
                    >
                      Войти как администратор
                    </button>
                  )}
                </div>
              ) : filteredCourses.length === 0 ? (
                <div className="text-center py-14 border border-neutral-900 rounded-2xl bg-neutral-950/30 p-6 sm:p-8">
                  <Terminal className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-white font-mono">
                    Курсов по запросу «{searchQuery}» не найдено
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('Все');
                    }}
                    className="mt-4 px-4 py-2 bg-white text-black font-semibold text-xs rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer min-h-[40px]"
                  >
                    Сбросить фильтры
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
                  {filteredCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onSelect={handleSelectCourse}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        isAdmin={isAdmin}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onOpenAdminPanel={() => setCurrentView('admin')}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => {
          setCurrentView('admin');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <CoursesProvider>
      <MainContent />
    </CoursesProvider>
  );
}

