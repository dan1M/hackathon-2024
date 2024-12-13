import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Modal, Button, Form } from 'react-bootstrap';
import { createClient } from '@supabase/supabase-js';
import { useUser } from '../context/user-context'; 

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

const TeacherAvailabilities = () => {
  const { user } = useUser();
  const [availabilities, setAvailabilities] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    constraint_reason: '',
  });

  const fetchAvailabilities = async () => {
    try {
      const { data, error } = await supabase
        .from('teacher_availabilities')
        .select('id, start_date, end_date, constraint_reason')
        .eq('teacher_id', user.id);

      if (error) throw error;

      const transformedAvailabilities = data.map((availability) => ({
        id: availability.id,
        title: availability.constraint_reason || 'Indisponible',
        start: availability.start_date,
        end: availability.end_date,
        color: '#ff4d4f', 
      }));

      setAvailabilities(transformedAvailabilities);
    } catch (error) {
      console.error('Erreur lors de la récupération des indisponibilités :', error);
    }
  };

  // Save a new availability
  const handleSaveAvailability = async () => {
    if (!formData.start_date || !formData.end_date || !formData.constraint_reason) {
      alert('Tous les champs doivent être remplis.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('teacher_availabilities')
        .insert({
          teacher_id: user.id,
          start_date: formData.start_date,
          end_date: formData.end_date,
          constraint_reason: formData.constraint_reason,
        })
        .select();

      if (error) throw error;

      setAvailabilities((prev) => [
        ...prev,
        {
          id: data[0].id,
          title: data[0].constraint_reason,
          start: data[0].start_date,
          end: data[0].end_date,
          color: '#ff4d4f',
        },
      ]);
      setShowModal(false);
      setFormData({ start_date: '', end_date: '', constraint_reason: '' });
      alert('Indisponibilité ajoutée avec succès !');
    } catch (error) {
      console.error('Erreur lors de l’ajout de l’indisponibilité :', error);
      alert('Une erreur est survenue lors de l’ajout.');
    }
  };

  // Delete availability
  const handleDeleteAvailability = async (id) => {
    try {
      const { error } = await supabase
        .from('teacher_availabilities')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAvailabilities((prev) => prev.filter((availability) => availability.id !== id));
      alert('Indisponibilité supprimée avec succès.');
    } catch (error) {
      console.error('Erreur lors de la suppression de l’indisponibilité :', error);
      alert('Une erreur est survenue lors de la suppression.');
    }
  };

  useEffect(() => {
    if (user?.role === 'teacher') {
      fetchAvailabilities();
    }
  }, [user]);

  return (
    <div className="container mt-4">
      <h1>Mes indisponibilités</h1>
      <Button variant="primary" onClick={() => setShowModal(true)} className="mb-3">
        Ajouter une indisponibilité
      </Button>
      <FullCalendar
        plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        locale="fr"
        firstDay={1}
        allDaySlot={false}
        editable={false}
        selectable={true}
        events={availabilities}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        eventClick={(info) => {
          const availability = availabilities.find((event) => event.id === parseInt(info.event.id));
          if (availability) {
            if (window.confirm('Voulez-vous supprimer cette indisponibilité ?')) {
              handleDeleteAvailability(availability.id);
            }
          }
        }}
      />
      {/* Modal for adding availability */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Ajouter une indisponibilité</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="startDate" className="mb-3">
              <Form.Label>Date de début</Form.Label>
              <Form.Control
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="endDate" className="mb-3">
              <Form.Label>Date de fin</Form.Label>
              <Form.Control
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="reason" className="mb-3">
              <Form.Label>Raison</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.constraint_reason}
                onChange={(e) => setFormData({ ...formData, constraint_reason: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Fermer
          </Button>
          <Button variant="primary" onClick={handleSaveAvailability}>
            Sauvegarder
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TeacherAvailabilities;
