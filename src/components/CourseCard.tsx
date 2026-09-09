import React from 'react';
import { Course } from '../types';
import { PlayCircle, BookOpen, Clock, ArrowRight, Layers } from 'lucide-react';
import { motion } from 'motion/react';

interface CourseCardProps {
  course: Course;
  onSelect: (course: Course) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onSelect }) => {
  const totalDuration = course.lessons.reduce((acc, lesson) => {
    const minMatch = lesson.duration.match(/(\d+)/);
    return acc + (minMatch ? parseInt(minMatch[1], 10) : 20);
  }, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      id={`course-card-${course.id}`}
      onClick={() => onSelect(course)}
      className="group relative flex flex-col bg-neutral-950 border border-neutral-800 hover:border-neutral-500 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 shadow-sm hover:shadow-2xl hover:shadow-white/5"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover grayscale contrast-125 transition-transform duration-500 group-hover:scale-105 group-hover:grayscale-0"
          loading="lazy"
        />
        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        {/* Level Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 text-[11px] font-mono font-medium rounded-full bg-black/80 text-white border border-neutral-700 backdrop-blur-md">
            {course.level}
          </span>
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 text-[11px] font-mono font-medium rounded-full bg-white text-black font-semibold">
            {course.category}
          </span>
        </div>

        {/* Play Icon hover preview */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="p-3.5 rounded-full bg-white text-black shadow-lg transform group-hover:scale-110 transition-transform">
            <PlayCircle className="w-7 h-7 fill-black text-white" />
          </div>
        </div>

        {/* Lessons count pill on bottom */}
        <div className="absolute bottom-3 left-3 flex items-center gap-3 text-[11px] font-mono text-neutral-300">
          <span className="flex items-center gap-1 bg-black/70 px-2 py-0.5 rounded border border-neutral-800">
            <Layers className="w-3 h-3 text-neutral-400" />
            {course.lessons.length} {course.lessons.length === 1 ? 'урок' : 'урока'}
          </span>
          <span className="flex items-center gap-1 bg-black/70 px-2 py-0.5 rounded border border-neutral-800">
            <Clock className="w-3 h-3 text-neutral-400" />
            ~{totalDuration} мин
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="text-lg font-bold text-white tracking-tight leading-snug group-hover:text-neutral-200 transition-colors line-clamp-2">
          {course.title}
        </h3>

        <p className="mt-2 text-xs text-neutral-400 leading-relaxed line-clamp-2 flex-1">
          {course.shortDescription}
        </p>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {course.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-mono px-2 py-0.5 bg-neutral-900 text-neutral-400 rounded border border-neutral-800"
            >
              #{tag}
            </span>
          ))}
          {course.tags.length > 3 && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 text-neutral-500">
              +{course.tags.length - 3}
            </span>
          )}
        </div>

        {/* Footer / CTA */}
        <div className="mt-5 pt-3.5 border-t border-neutral-900 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <BookOpen className="w-3.5 h-3.5 text-neutral-300" />
            <span className="text-[11px]">ДЗ включено</span>
          </div>

          <div className="flex items-center gap-1 text-xs font-semibold text-white group-hover:translate-x-1 transition-transform">
            <span>Смотреть</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
