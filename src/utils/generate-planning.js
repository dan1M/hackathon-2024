import { findAvailableEntities } from './planning-utils';
import { supabase } from './supabaseClient';
import getDayjs from './getDayjs';

const firstWeekOfSchool = 37; // Rentrée: 1ère semaine de septembre
const nbHoursPerLesson = 3.5;
const initialSchoolYear = 2024;

const d = getDayjs();

// Créé une "lesson" pour chaque créneau horaire disponible pour une classe donnée et une semaine donnée
export const generatePlanning = async ({ class_id, week }) => {
  // Logique globale:
  // 1.1/ Récupérer les dispos des classes (table class_availabilities) => available_weeks
  // 1.2/ Récupérer les créneaux horaires par jour (table time_slots)
  // 1.3/ Récupérer les matières (table courses)
  // 1.4/ En dériver une liste de matières avec le nb de lessons à faire (actuellement il y a l'info des heures par cours et le semestre du cours)
  //      => nb_lessons = hourly_volume / nbHoursPerLesson
  // 2/ Pour chaque classe (ligne de la table), parcourir les semaines disponibles, et pour chaque semaine:
  // ATTENTION: ce sont les numéros de semaine à partir de la rentrée scolaire (ex: 1ère semaine de septembre = semaine 1 => calculer par rapport à la semaine de rentrée)
  // 3/ Boucler chaque jour de la semaine (bonus: en vérifiant que le jour n'est pas un jour férié)
  // 4.1/ Pour chaque jour, boucler sur les créneaux horaires disponibles
  // 4.2/ Prendre 2 matières aléatoires dans la liste des matières à faire de ce semestre
  // 5/ Prendre un professeur disponible pour le créneau horaire
  // 6/ Prendre une salle disponible pour le créneau horaire
  // 7/ Créer l'entrée dans la table lessons
  // 8/ Soustraire le nb de lessons à faire pour la matière choisie

  const { data: classData, error: classesError } = await supabase
    .from('class_availabilities')
    .select()
    .eq('class_id', class_id)
    .single();
  if (classesError)
    return (
      console.error(
        'Erreur lors de la récupération des disponibilités de classe :',
        classesError
      ) && []
    );

  const { data: timeSlots, error: timeSlotsError } = await supabase
    .from('time_slots')
    .select()
    .eq('is_special', false);
  if (timeSlotsError)
    return (
      console.error(
        'Erreur lors de la récupération des créneaux horaires :',
        timeSlotsError
      ) && []
    );

  const { data: courses, error: coursesError } = await supabase
    .from('courses')
    .select();
  if (coursesError)
    return (
      console.error(
        'Erreur lors de la récupération des matières :',
        coursesError
      ) && []
    );

  let coursesToPlan = courses.map((course) => {
    const nbLessons = Math.round(course.hourly_volume / nbHoursPerLesson);
    return { ...course, nbLessons };
  });

  if (!week) return console.error('Veuillez spécifier une semaine');

  // Vérifier si pour la semaine demandée, la classe a cours
  if (!classData.available_weeks.includes(week))
    return console.log('Pas de cours pour cette semaine');

  // Semaine par rapport à la rentrée scolaire
  const realWeek = (week + firstWeekOfSchool) % 52;
  const year = initialSchoolYear + Math.floor((week + firstWeekOfSchool) / 52);
  const semester = week <= 26 ? 1 : 2;

  const weekDays = Array.from(
    { length: 5 },
    (_, i) =>
      d()
        .year(year)
        .week(realWeek)
        .day(i + 1) // 0 = dimanche, 1 = lundi, ..., 6 = samedi
  );

  for (const day of weekDays) {
    if (isHoliday(day)) {
      continue;
    }

    for (const timeSlot of timeSlots) {
      // Prendre 2 matières aléatoires dans la liste des matières à faire de ce semestre
      const randomCourses = coursesToPlan
        .filter((course) => course.semester === semester)
        .sort(() => Math.random() - 0.5)
        .slice(0, 2);

      for (const course of randomCourses) {
        // Check if a lesson exists for the same class, day, start_time, end_time
        const { data: existingLessons, error: existingLessonsError } =
          await supabase
            .from('lessons')
            .select()
            .eq('class_id', class_id)
            .eq('date', day.format('YYYY-MM-DD'))
            .eq('start_time', timeSlot.start_time)
            .eq('end_time', timeSlot.end_time);

        if (existingLessonsError) {
          console.error(
            'Erreur lors de la récupération des leçons existantes :',
            existingLessonsError
          );
        }

        if (existingLessons.length > 0) {
          console.log('Leçon déjà existante');
          continue;
        }

        const rooms = await findAvailableEntities(
          'classroom',
          'classroom_id',
          day,
          timeSlot.start_time,
          timeSlot.end_time
        );
        const teachers = await findAvailableEntities(
          'users_hackathon',
          'teacher_id',
          day,
          timeSlot.start_time,
          timeSlot.end_time
        );

        if (rooms.length === 0 || teachers.length === 0) {
          console.log('Pas de salle ou de professeur disponible');
          continue;
        }

        const room = rooms[0];
        const teacher = teachers[0];

        // Créer l'entrée dans la table lessons
        const { error: lessonError } = await supabase.from('lessons').insert([
          {
            class_id: class_id,
            course_id: course.id,
            teacher_id: teacher.id,
            classroom_id: room.id,
            date: day.format('YYYY-MM-DD'),
            start_time: timeSlot.start_time,
            end_time: timeSlot.end_time,
          },
        ]);

        if (lessonError) {
          console.error(
            'Erreur lors de la création de la leçon :',
            lessonError
          );
        }
      }
    }
  }
};

// Jours fériés
const holidays = [
  '01-01',
  '04-01',
  '05-01',
  '05-08',
  '05-30',
  '07-14',
  '08-15',
  '11-01',
  '11-11',
  '12-25',
];

const isHoliday = (day) => {
  return holidays.includes(day.format('MM-DD'));
};
