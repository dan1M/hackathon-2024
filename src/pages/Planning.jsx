import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid'; // For week/day view
import dayGridPlugin from '@fullcalendar/daygrid'; // For month view
import interactionPlugin from '@fullcalendar/interaction'; // For interactions
import { Modal, Button, Form } from 'react-bootstrap';
import { createClient } from '@supabase/supabase-js';

// Supabase initialization
const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

const Planning = () => {
  const [events, setEvents] = useState([]); // Calendar events
  const [courses, setCourses] = useState([]); // Courses data
  const [slots, setSlots] = useState({ start: "08:00", end: "19:00" }); // Default slots
  const [eventForm, setEventForm] = useState({
    id: null,
    title: '',
    start: '',
    end: '',
    description: '',
    courseId: null, // To link to a course
  });
  const [showEventModal, setShowEventModal] = useState(false);

  // Fetch lessons, courses, and slots from Supabase
  const fetchLessons = async () => {
    try {
      const { data: lessons, error } = await supabase
        .from('lessons')
        .select('*, courses(name)'); // Use Supabase relationship to fetch course name
  
      if (error) throw error;
  
      const transformedEvents = lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.courses?.name || `Lesson ${lesson.course_id}`, // Show course name
        start: `${lesson.date}T${lesson.start_time}`,
        end: `${lesson.date}T${lesson.end_time}`,
        extendedProps: { courseId: lesson.course_id },
      }));
      setEvents(transformedEvents);
    } catch (error) {
      console.error('Error fetching lessons:', error);
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
      const { data: fetchedSlots, error } = await supabase.from('slots').select('*');
      if (error) throw error;

      if (fetchedSlots.length > 0) {
        const earliestSlot = fetchedSlots.reduce((prev, curr) =>
          curr.start_time < prev.start_time ? curr : prev
        );
        const latestSlot = fetchedSlots.reduce((prev, curr) =>
          curr.end_time > prev.end_time ? curr : prev
        );

        setSlots({
          start: earliestSlot.start_time,
          end: latestSlot.end_time,
        });
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchLessons();
    fetchCourses();
    fetchSlots();
  }, []);

  // Handle event drop to update lesson date and time
  const handleEventDrop = async (info) => {
    const { id } = info.event;
    const newStart = info.event.start;
    const newEnd = info.event.end;
  
    // Format date and time for the database
    const newDate = newStart.toISOString().split('T')[0];
    const newStartTime = newStart.toTimeString().split(' ')[0]; // Correctly format time
    const newEndTime = newEnd?.toTimeString().split(' ')[0] || '23:59:59';
  
    try {
      // Update the lesson in Supabase
      const { error } = await supabase
        .from('lessons')
        .update({
          date: newDate,
          start_time: newStartTime,
          end_time: newEndTime,
        })
        .eq('id', id);
  
      if (error) throw error;
  
      // Update local events state
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
  
      // Display alert with correct time and date
      alert(
        `Lesson updated successfully:\nDate: ${newDate}\nStart Time: ${newStartTime}\nEnd Time: ${newEndTime}`
      );
    } catch (error) {
      console.error('Error updating lesson:', error);
      alert('Failed to update lesson. Changes have been reverted.');
      // Revert the drag operation if update fails
      info.revert();
    }
  };
  

  // Handle saving changes to course in modal
  const handleSaveEvent = async () => {
    const { id, courseId, start, end } = eventForm;

    if (id && courseId) {
      try {
        // Update the course_id in Supabase
        const { error } = await supabase
          .from('lessons')
          .update({ course_id: courseId })
          .eq('id', id);

        if (error) {
          console.error('Error updating course_id:', error);
          alert('Failed to update the course. Please try again.');
          return;
        }

        // Update the event in the state
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.id === id
              ? { ...event, title: courses.find((c) => c.id === courseId)?.name }
              : event
          )
        );

        alert('Course updated successfully in Supabase.');
      } catch (error) {
        console.error('Error saving course changes:', error.message);
      }
    }

    setShowEventModal(false);
  };

  return (
    <div className="container mt-4">
      <FullCalendar
        plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
        initialView="timeGridWeek" // Default to week view
        locale="fr" // French locale
        allDaySlot={false} // Remove "all-day" row
        editable={true} // Allow event editing
        events={events} // Lessons as calendar events
        slotMinTime={slots.start} // Dynamic start time based on slots
        slotMaxTime={slots.end} // Dynamic end time based on slots
        height="auto" // Adjust height dynamically to remove scroll
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay', // Add month view
        }}
        eventClick={(info) => {
          const event = events.find((e) => e.id === parseInt(info.event.id));
          const linkedCourse = courses.find((course) => course.id === event.extendedProps.courseId);

          setEventForm({
            id: event.id,
            title: linkedCourse?.name || '',
            description: linkedCourse?.description || '',
            start: event.start.slice(11, 16), // Extract time
            end: event.end.slice(11, 16), // Extract time
            courseId: linkedCourse?.id || null,
          });
          setShowEventModal(true);
        }}
        eventDrop={handleEventDrop} // Handle drag-and-drop updates
      />

      {/* Modal for Viewing/Editing Lesson */}
      <Modal show={showEventModal} onHide={() => setShowEventModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Modifier le cours</Modal.Title>
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
                    description: selectedCourse?.description,
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
          </Form>
        </Modal.Body>
        <Modal.Footer>
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
