import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid'; // Week/Day view
import dayGridPlugin from '@fullcalendar/daygrid'; // Month view
import interactionPlugin from '@fullcalendar/interaction'; // For interactions
import { Modal, Button, Form } from 'react-bootstrap';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

const Planning = () => {
  const [events, setEvents] = useState([]); // Calendar events
  const [courses, setCourses] = useState([]); // Courses data
  const [slots, setSlots] = useState([
    { start: "09:00", end: "12:30" },
    { start: "13:30", end: "17:00" },
    { start: "17:15", end: "19:00" },
  ]); // Default school slots
  const [holidays, setHolidays] = useState([]); // French holidays
  const [eventForm, setEventForm] = useState({
    id: null,
    title: '',
    start: '',
    end: '',
    description: '',
    courseId: null, // To link to a course
    teacherId: null,
    classroomId: null,
    classId: null,
    color: '#007bff', // Default to blue
  });
  const [showEventModal, setShowEventModal] = useState(false);
  const [classrooms, setClassrooms] = useState([]);
  const [classes, setClasses] = useState([]);

  // Fetch lessons, courses, and holidays
  const fetchLessons = async () => {
    try {
      const { data: lessons, error } = await supabase
        .from('lessons')
        .select('*, courses(name), users_hackathon(name), classroom(name), classes(name)');
  
      if (error) throw error;
  
      const transformedEvents = lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.courses?.name || `Lesson ${lesson.course_id}`,
        start: `${lesson.date}T${lesson.start_time}`,
        end: `${lesson.date}T${lesson.end_time}`,
        color: lesson.color || '#007bff', // Use the color from the database or default to blue
        extendedProps: {
          courseId: lesson.course_id,
          teacherId: lesson.teacher_id,
          classroomId: lesson.classroom_id,
          classId: lesson.class_id,
        },
      }));
      setEvents(transformedEvents);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };
  
  

  const [teachers, setTeachers] = useState([]);

const fetchTeachers = async () => {
  try {
    const { data: fetchedTeachers, error } = await supabase
      .from('users_hackathon')
      .select('id, name')
      .eq('role', 'teacher');
    if (error) throw error;
    setTeachers(fetchedTeachers);
  } catch (error) {
    console.error('Erreur lors de la récupération des professeurs:', error);
  }
};


  const fetchCourses = async () => {
    try {
      const { data: fetchedCourses, error } = await supabase.from('courses').select('*');
      if (error) throw error;
      setCourses(fetchedCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchSlots = async () => {
    try {
      const { data: fetchedSlots, error } = await supabase.from('time_slots').select('*');
      if (error) throw error;
  
      if (fetchedSlots.length > 0) {
        const earliestSlot = fetchedSlots.reduce((prev, curr) =>
          curr.start_time < prev.start_time ? curr : prev
        );
        const latestSlot = fetchedSlots.reduce((prev, curr) =>
          curr.end_time > prev.end_time ? curr : prev
        );
  
        setSlots([
          { start: earliestSlot.start_time, end: latestSlot.end_time },
        ]);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };
  

  const fetchClassrooms = async () => {
    try {
      const { data: fetchedClassrooms, error } = await supabase
        .from('classroom')
        .select('id, name');
      if (error) throw error;
      setClassrooms(fetchedClassrooms);
    } catch (error) {
      console.error('Erreur lors de la récupération des salles:', error);
    }
  };
  
  const fetchClasses = async () => {
    try {
      const { data: fetchedClasses, error } = await supabase
        .from('classes')
        .select('id, name'); 
      if (error) throw error;
      setClasses(fetchedClasses);
    } catch (error) {
      console.error('Erreur lors de la récupération des classes:', error);
    }
  };
  const fetchHolidays = async () => {
    const frenchHolidays = [
      { title: 'Nouvel An', date: '2024-01-01' },
      { title: 'Fête du Travail', date: '2024-05-01' },
      { title: 'Fête Nationale', date: '2024-07-14' },
      { title: 'Assomption', date: '2024-08-15' },
      { title: 'Toussaint', date: '2024-11-01' },
      { title: 'Noël', date: '2024-12-25' },
    ];

    const holidayDates = frenchHolidays.map((holiday) => holiday.date);
    setHolidays(holidayDates);
  };
  // Fetch data on component mount
  useEffect(() => {
    fetchLessons();
    fetchCourses();
    fetchSlots();
    fetchTeachers();
    fetchClassrooms();
    fetchClasses();
    fetchHolidays();

  }, []);

  const isSunday = (date) => date.getDay() === 0; // Sunday = 0
  const isHoliday = (date) => holidays.includes(date.toISOString().split('T')[0]);

  const handleEventDrop = async (info) => {
    const { id } = info.event;
    const newStart = info.event.start;
    const newEnd = info.event.end;
  
    const newDate = newStart.toISOString().split('T')[0];
    const newStartTime = newStart.toTimeString().split(' ')[0];
    const newEndTime = newEnd?.toTimeString().split(' ')[0] || '23:59:59';
  
    console.log("Event being updated:", {
      id,
      date: newDate,
      start_time: newStartTime,
      end_time: newEndTime,
    });
  
    try {
      const { error } = await supabase
        .from('lessons')
        .update({
          date: newDate,
          start_time: newStartTime,
          end_time: newEndTime,
        })
        .eq('id', id);
  
      if (error) {
        console.error("Error from Supabase:", error);
        throw error;
      }
  
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === parseInt(id)
            ? {
                ...event,
                start: info.event.start.toISOString(),
                end: info.event.end?.toISOString() || `${newDate}T23:59:59`,
              }
            : event
        )
      );
  
      alert(`Lesson updated successfully:\nDate: ${newDate}\nStart Time: ${newStartTime}\nEnd Time: ${newEndTime}`);
    } catch (error) {
      console.error("Error updating lesson:", error);
      alert('Failed to update lesson. Changes have been reverted.');
      info.revert();
    }
  };
  

  const handleSaveEvent = async () => {
    const {
      id,
      courseId,
      teacherId,
      classroomId,
      classId,
      start,
      end,
      date,
      color, // Mapped to the 'color' column in the 'lessons' table
    } = eventForm;
  
    // Validation to ensure required fields are filled
    if (!start || !end || !courseId || !teacherId || !classroomId || !classId || !date) {
      alert('Please fill out all fields before saving.');
      return;
    }
  
    const lessonData = {
      date, // Maps to 'date' column
      start_time: start, // Maps to 'start_time' column
      end_time: end, // Maps to 'end_time' column
      course_id: courseId, // Maps to 'course_id' column
      teacher_id: teacherId, // Maps to 'teacher_id' column
      classroom_id: classroomId, // Maps to 'classroom_id' column
      class_id: classId, // Maps to 'class_id' column
      color, // Maps to 'color' column
    };
  
    try {
      if (id) {
        // Updating an existing event
        const { error } = await supabase
          .from('lessons')
          .update(lessonData)
          .eq('id', id);
  
        if (error) throw error;
  
        // Update the events state with the updated event details
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.id === id
              ? {
                  ...event,
                  ...lessonData,
                  start: `${date}T${start}:00`,
                  end: `${date}T${end}:00`,
                  title: courses.find((course) => course.id === courseId)?.name || '', // Dynamically retrieve course name
                }
              : event
          )
        );
  
        alert('Event updated successfully!');
      } else {
        // Adding a new event
        const { data, error } = await supabase
          .from('lessons')
          .insert(lessonData)
          .select();
  
        if (error) throw error;
  
        // Add the new event to the events state
        setEvents((prevEvents) => [
          ...prevEvents,
          {
            id: data[0].id,
            ...lessonData,
            start: `${date}T${start}:00`,
            end: `${date}T${end}:00`,
            title: courses.find((course) => course.id === courseId)?.name || '', // Dynamically retrieve course name
          },
        ]);
  
        alert('Event added successfully!');
      }
  
      setShowEventModal(false);
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save the event. Please try again.');
    }
  };
  
  
  
  
  
  
  
  

  const handleDeleteEvent = async () => {
    const { id } = eventForm;

    if (id) {
      try {
        const { error } = await supabase.from('lessons').delete().eq('id', id);
        if (error) throw error;

        setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id));
        setShowEventModal(false);
        alert('Course deleted successfully!');
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Failed to delete the course.');
      }
    }
  };

  return (
    <div className="container mt-4">
        <FullCalendar
          plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          locale="fr"
          firstDay={1} // Start the week on Monday
          allDaySlot={false}
          editable={true}
          selectable={true}
          slotMinTime={slots[0].start}
          slotMaxTime={slots[slots.length - 1].end}
          events={events} // Events will now include color property
          dayCellClassNames={(info) => {
            const date = new Date(info.date);
            if (isSunday(date)) return 'sunday-cell';
            return '';
          }}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          eventClick={(info) => {
            const event = events.find((e) => e.id === parseInt(info.event.id));
            
            // Retrieve related data
            const linkedCourse = courses.find((course) => course.id === event.extendedProps.courseId);
            const linkedTeacher = teachers.find((teacher) => teacher.id === event.extendedProps.teacherId);
            const linkedClassroom = classrooms.find((classroom) => classroom.id === event.extendedProps.classroomId);
            const linkedClass = classes.find((classItem) => classItem.id === event.extendedProps.classId);

            // Update the form state
            setEventForm({
              id: event.id,
              title: linkedCourse?.name || '',
              description: linkedCourse?.description || '',
              date: event.start.split('T')[0],
              start: event.start.slice(11, 16),
              end: event.end.slice(11, 16),
              courseId: linkedCourse?.id || null,
              teacherId: linkedTeacher?.id || null,
              classroomId: linkedClassroom?.id || null,
              classId: linkedClass?.id || null,
              color: event.color || '#007bff',
            });

            setShowEventModal(true);
          }}
          eventDrop={handleEventDrop}
        />


      <Modal show={showEventModal} onHide={() => setShowEventModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{eventForm.id ? 'Modifier le cours' : 'Ajouter un cours'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
          <Form.Group controlId="eventTitle" className="mb-3">
              <Form.Label>Nom du Cours</Form.Label>
              <Form.Select
                name="courseId"
                value={eventForm.courseId || ''}
                onChange={(e) => {
                  const selectedCourse = courses.find((course) => course.id === parseInt(e.target.value));
                  setEventForm({
                    ...eventForm,
                    courseId: selectedCourse?.id,
                    title: selectedCourse?.name,
                    description: selectedCourse?.description || '', // Autofill description
                  });
                }}
              >
                <option value="">-- Sélectionner un cours --</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group controlId="classSelect" className="mb-3">
              <Form.Label>Sélectionner une classe</Form.Label>
              <Form.Select
                name="classId"
                value={eventForm.classId || ''}
                onChange={(e) => setEventForm({ ...eventForm, classId: parseInt(e.target.value) })}
              >
                <option value="">-- Aucune classe assignée --</option>
                {classes.map((classItem) => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group controlId="teacherSelect" className="mb-3">
              <Form.Label>Sélectionner un professeur</Form.Label>
              <Form.Select
                name="teacherId"
                value={eventForm.teacherId || ''}
                onChange={(e) => setEventForm({ ...eventForm, teacherId: parseInt(e.target.value) })}
              >
                <option value="">-- Aucun professeur assigné --</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group controlId="classroomSelect" className="mb-3">
              <Form.Label>Sélectionner une salle</Form.Label>
              <Form.Select
                name="classroomId"
                value={eventForm.classroomId || ''}
                onChange={(e) => setEventForm({ ...eventForm, classroomId: parseInt(e.target.value) })}
              >
                <option value="">-- Aucune salle assignée --</option>
                {classrooms.map((classroom) => (
                  <option key={classroom.id} value={classroom.id}>
                    {classroom.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group controlId="eventDescription" className="mb-3">
              <Form.Label>Description du Cours</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="eventColor" className="mb-3">
              <Form.Label>Couleur de l'Événement</Form.Label>
              <Form.Control
                type="color"
                name="color"
                value={eventForm.color || '#007bff'} // Default to blue if no color is set
                onChange={(e) => setEventForm({ ...eventForm, color: e.target.value })}
              />
            </Form.Group>


          </Form>
        </Modal.Body>
        <Modal.Footer>
          {eventForm.id && (
            <Button variant="danger" onClick={handleDeleteEvent}>
              Supprimer
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowEventModal(false)}>
            Fermer
          </Button>
          <Button variant="primary" onClick={handleSaveEvent}>
            Enregistrer les modifications
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Planning;
