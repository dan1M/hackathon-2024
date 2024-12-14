import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid'; 
import interactionPlugin, { Draggable } from '@fullcalendar/interaction'; 
import dayGridPlugin from '@fullcalendar/daygrid';
import { createClient } from '@supabase/supabase-js';
import { useUser } from '../context/user-context';
import { Modal, Button, Form } from 'react-bootstrap';

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

const TeacherAvailabilities = () => {
  const { user } = useUser();
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null); 
  const [constraintReason, setConstraintReason] = useState('');

  // Fetch teacher availabilities
  const fetchAvailabilities = async () => {
    try {
      const { data: availabilityData, error } = await supabase
        .from('teacher_availabilities')
        .select('id, start_date, end_date, constraint_reason, status')
        .eq('teacher_id', user.id);

      if (error) throw error;

      const transformedAvailabilities = availabilityData.map((availability) => ({
        id: availability.id,
        title: availability.constraint_reason || (availability.status === 'dispo' ? 'Disponible' : 'Indisponible'),
        start: availability.start_date,
        end: availability.end_date,
        color: availability.status === 'dispo' ? '#28a745' : '#ff4d4f',
      }));

      setEvents(transformedAvailabilities);
    } catch (error) {
      console.error('Erreur lors de la récupération des indisponibilités :', error);
    }
  };

  useEffect(() => {
    if (user?.role === 'teacher') {
      fetchAvailabilities();

      // Activer le Drag & Drop externe
      new Draggable(document.getElementById('external-events'), {
        itemSelector: '.fc-event',
        eventData: (eventEl) => ({
          title: eventEl.getAttribute('data-title'),
          color: eventEl.getAttribute('data-color'),
        }),
      });
    }
  }, [user]);

  const handleEventReceive = (info) => {
    // Vérifier si l'événement est "Indisponible" pour demander une justification
    if (info.event.title === 'Indisponible') {
      setModalData({
        start: info.event.start,
        end: info.event.end,
        title: info.event.title,
        info,
      });
      setShowModal(true);
    } else {
      saveEvent(info, 'Disponible', '');
    }
  };

  const saveEvent = async (info, status, reason) => {
    const newEvent = {
      start_date: info.event.start.toISOString(),
      end_date: info.event.end?.toISOString() || `${info.event.start.toISOString().split('T')[0]}T23:59:59`,
      constraint_reason: reason,
      status: status === 'Disponible' ? 'dispo' : 'indispo',
      teacher_id: user.id,
    };

    try {
      const { data, error } = await supabase
        .from('teacher_availabilities')
        .insert(newEvent)
        .select();

      if (error) throw error;

      setEvents((prev) => [
        ...prev,
        {
          ...newEvent,
          id: data[0].id,
          color: newEvent.status === 'dispo' ? '#28a745' : '#ff4d4f',
          title: newEvent.status === 'dispo' ? 'Disponible' : reason,
        },
      ]);

      alert(`${status} ajoutée avec succès !`);
      setShowModal(false);
      setConstraintReason('');
    } catch (error) {
      console.error('Erreur lors de l’ajout de la disponibilité :', error);
      info.revert();
    }
  };

  return (
    <div className="container mt-4">
      <h1>Gérer mes disponibilités</h1>

      {/* Éléments drag-and-drop externes */}
      <div id="external-events" style={{ marginBottom: '20px' }}>
        <p>Faites glisser ces éléments dans le calendrier :</p>
        <div
          className="fc-event"
          data-title="Disponible"
          data-color="#28a745"
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            padding: '5px',
            margin: '5px 0',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Disponible
        </div>
        <div
          className="fc-event"
          data-title="Indisponible"
          data-color="#ff4d4f"
          style={{
            backgroundColor: '#ff4d4f',
            color: 'white',
            padding: '5px',
            margin: '5px 0',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Indisponible
        </div>
      </div>

      {/* Calendrier */}
      <FullCalendar
        plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        locale="fr"
        firstDay={1}
        allDaySlot={false}
        editable={true}
        droppable={true}
        events={events}
        eventReceive={handleEventReceive}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
      />

      {/* Modal pour la justification */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Ajouter une indisponibilité</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="constraintReason">
            <Form.Label>Justification</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={constraintReason}
              onChange={(e) => setConstraintReason(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (!constraintReason) {
                alert('La justification est obligatoire pour une indisponibilité.');
                return;
              }
              saveEvent(modalData.info, 'Indisponible', constraintReason);
            }}
          >
            Ajouter
          </Button>
        </Modal.Footer>
      </Modal>

      <style>
        {`
          .fc-event {
            font-size: 1rem;
            font-weight: bold;
          }
        `}
      </style>
    </div>
  );
};

export default TeacherAvailabilities;
