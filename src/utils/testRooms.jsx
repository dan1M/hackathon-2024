import React, { useState } from 'react';
import { supabase } from '../../supabaseClient'; // Remplacez par le chemin vers votre fichier Supabase
import { findAvailableEntities } from './utils'; // Assurez-vous que utils contient findAvailableEntities

const TestRooms = () => {
  const [availableRooms, setAvailableRooms] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true); // Indique que la recherche est en cours
    try {
      const date = '2024-12-12'; // Exemple de date
      const start_time = '9:30'; // Heure de début
      const end_time = '12:00'; // Heure de fin
      const value = '2'

      // Trouver les salles disponibles
      const rooms = await findAvailableEntities('classroom', 'classroom_id', date, start_time, end_time, value);
      setAvailableRooms(rooms); // Met à jour l'état avec les salles disponibles

      // Trouver les professeurs disponibles
      const teachers = await findAvailableEntities('users_hackathon', 'teacher_id', date, start_time, end_time, value);
      //console.log(teachers)
      setAvailableTeachers(teachers); // Met à jour l'état avec les professeurs disponibles
    } catch (error) {
      console.error('Erreur lors du test des disponibilités :', error);
    } finally {
      setLoading(false); // Indique que la recherche est terminée
    }
  };

  return (
    <div>
      <h1>Test des disponibilités</h1>
      <button onClick={handleTest} disabled={loading}>
        {loading ? 'Recherche en cours...' : 'Tester la recherche'}
      </button>

      <h2>Salles disponibles :</h2>
      {availableRooms.length === 0 ? (
        <p>Aucune salle disponible pour ce créneau.</p>
      ) : (
        <ul>
          {availableRooms.map((room) => (
            <li key={room.id}>{room.name}</li>
          ))}
        </ul>
      )}

      <h2>Professeurs disponibles :</h2>
      {availableTeachers.length === 0 ? (
        <p>Aucun professeur disponible pour ce créneau.</p>
      ) : (
        <ul>
          {availableTeachers.map((teacher) => (
            <li key={teacher.id}>{teacher.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TestRooms;
