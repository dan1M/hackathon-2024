import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid'; // For month view
import timeGridPlugin from '@fullcalendar/timegrid'; // For week/day view
import interactionPlugin from '@fullcalendar/interaction'; // For interactions
import { Modal, Button, Form } from 'react-bootstrap';

const Planning = () => {
  const [showEventModal, setShowEventModal] = useState(false); // Event modal visibility
  const [eventForm, setEventForm] = useState({
    id: null,
    title: '',
    start: '',
    end: '',
    description: '',
  });

  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Cours de Mathématiques',
      start: '2024-12-11T08:00:00',
      end: '2024-12-11T09:00:00',
      description: 'Introduction aux mathématiques.',
    },
    {
      id: 2,
      title: 'Cours de Physique',
      start: '2024-12-11T09:15:00',
      end: '2024-12-11T10:15:00',
      description: 'Physique de base.',
    },
  ]);

  const [courseList, setCourseList] = useState([
    { id: 'course-1', title: 'Nouveau Cours A', description: 'Description du cours A' },
    { id: 'course-2', title: 'Nouveau Cours B', description: 'Description du cours B' },
  ]);

  // Make sidebar items draggable
  useEffect(() => {
    const draggableElements = document.querySelectorAll('.course-list li');
    draggableElements.forEach((el) => {
      el.setAttribute(
        'data-event',
        JSON.stringify({
          title: el.dataset.title,
          description: el.dataset.description,
        })
      );
    });
  }, [courseList]);

  // Handle event click to show details in a modal
  const handleEventClick = (info) => {
    const event = events.find((e) => e.id === parseInt(info.event.id));
    setEventForm({
      ...event,
      start: event.start.slice(11, 16), // Extract time from full datetime
      end: event.end.slice(11, 16), // Extract time from full datetime
    });
    setShowEventModal(true);
  };

  // Save event changes
  const handleSaveEvent = () => {
    const startFull = `2024-12-11T${eventForm.start}:00`; // Append default date
    const endFull = `2024-12-11T${eventForm.end}:00`; // Append default date

    const updatedEvent = { ...eventForm, start: startFull, end: endFull };

    if (eventForm.id) {
      // Update existing event
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === eventForm.id ? updatedEvent : event
        )
      );
    } else {
      // Add new event
      setEvents((prevEvents) => [
        ...prevEvents,
        { ...updatedEvent, id: new Date().getTime() },
      ]);
    }
    setShowEventModal(false);
  };

  // Delete event
  const handleDeleteEvent = () => {
    setEvents((prevEvents) =>
      prevEvents.filter((event) => event.id !== eventForm.id)
    );
    setShowEventModal(false);
  };

  // Handle drop from sidebar into the calendar
  const handleDrop = (info) => {
    const eventObject = JSON.parse(info.draggedEl.getAttribute('data-event'));

    const newEvent = {
      id: new Date().getTime(),
      title: eventObject.title,
      start: info.dateStr + 'T08:00:00', // Default time
      end: info.dateStr + 'T09:00:00', // Default time
      description: eventObject.description || 'Aucun détail ajouté.',
    };

    setEvents((prevEvents) => [...prevEvents, newEvent]);
  };

  return (
    <div className="container mt-4 d-flex">
      {/* Sidebar for Course List */}
      <div className="course-list p-3 border-end" style={{ width: '300px' }}>
        <h5>Cours Disponibles</h5>
        <ul className="list-unstyled">
          {courseList.map((course) => (
            <li
              key={course.id}
              className="mb-3 p-2 bg-light border"
              data-title={course.title}
              data-description={course.description}
              draggable="true"
              style={{ cursor: 'grab' }}
            >
              <strong>{course.title}</strong>
              <p className="mb-0">{course.description}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Calendar */}
      <div className="calendar-container flex-grow-1">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          locale="fr" // Set to French
          allDaySlot={false} // Remove the "all-day" row
          editable={true}
          droppable={true} // Allow items to be dropped onto the calendar
          events={events.map((event) => ({
            ...event,
            id: String(event.id),
          }))}
          eventClick={handleEventClick} // Show popup on event click
          drop={handleDrop} // Handle drop from the sidebar
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
        />
      </div>

      {/* Modal for Adding/Editing Event */}
      <Modal show={showEventModal} onHide={() => setShowEventModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{eventForm.id ? 'Modifier le cours' : 'Ajouter un cours'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="eventTitle" className="mb-3">
              <Form.Label>Titre</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="eventStart" className="mb-3">
              <Form.Label>Heure de début</Form.Label>
              <Form.Control
                type="time"
                name="start"
                value={eventForm.start}
                onChange={(e) => setEventForm({ ...eventForm, start: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="eventEnd" className="mb-3">
              <Form.Label>Heure de fin</Form.Label>
              <Form.Control
                type="time"
                name="end"
                value={eventForm.end}
                onChange={(e) => setEventForm({ ...eventForm, end: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="eventDescription" className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={eventForm.description}
                onChange={(e) =>
                  setEventForm({ ...eventForm, description: e.target.value })
                }
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
            Enregistrer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Planning;
