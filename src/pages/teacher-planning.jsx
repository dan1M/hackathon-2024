import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid'; 
import interactionPlugin from '@fullcalendar/interaction';
import { createClient } from '@supabase/supabase-js';
import { useUser } from '../context/user-context';

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

const TeacherPlanning = () => {
  const { user } = useUser();
  const [events, setEvents] = useState([]);

  const fetchLessons = async () => {
    try {
      const { data: lessons, error } = await supabase
        .from('lessons')
        .select('id, date, start_time, end_time, courses(name)')
        .eq('teacher_id', user.id);

      if (error) throw error;

      const transformedEvents = lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.courses?.name || 'Cours',
        start: `${lesson.date}T${lesson.start_time}`,
        end: `${lesson.date}T${lesson.end_time}`,
      }));

      setEvents(transformedEvents);
    } catch (error) {
      console.error('Erreur lors de la récupération des cours :', error);
    }
  };

  useEffect(() => {
    if (user?.role === 'teacher') {
      fetchLessons();
    }
  }, [user]);

  return (
    <div className="container mt-4">
      <h1>Planning de l'enseignant</h1>
      <FullCalendar
        plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        locale="fr"
        firstDay={1}
        allDaySlot={false}
        editable={false}
        selectable={false}
        events={events}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
      />
    </div>
  );
};

export default TeacherPlanning;
