import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import '../assets/styles/AdvancedManagement.css';

const AdvancedManagement = () => {
  const [users, setUsers] = useState([]); // État pour les utilisateurs
  const [courses, setCourses] = useState([]); // État pour les cours
  const [showModal, setShowModal] = useState(false); // État pour la fenêtre modale
  const [currentUser, setCurrentUser] = useState(null); // État pour l'utilisateur à modifier
  const [updatedUser, setUpdatedUser] = useState({ name: '', email: '', role: '' }); // État pour les modifications

  // Fonction pour récupérer les utilisateurs
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from('users_hackathon').select();
      if (error) throw error;

      // Trier les utilisateurs par rôle
      const rolesOrder = ['admin', 'teacher', 'student'];
      const sortedUsers = data.sort((a, b) => rolesOrder.indexOf(a.role) - rolesOrder.indexOf(b.role));
      setUsers(sortedUsers);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs :', error);
    }
  };

  // Fonction pour récupérer les cours
  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase.from('courses').select();
      if (error) throw error;
      setCourses(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des cours :', error);
    }
  };

  // Fonction pour supprimer un utilisateur
  const handleDelete = async (userId) => {
    try {
      const { error } = await supabase.from('users_hackathon').delete().eq('id', userId);
      if (error) throw error;

      // Mettre à jour l'état local après suppression
      setUsers(users.filter((user) => user.id !== userId));
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur :", error);
    }
  };

  // Fonction pour supprimer un cours
  const handleDeleteCourse = async (courseId) => {
    try {
      const { error } = await supabase.from('courses').delete().eq('id', courseId);
      if (error) throw error;

      // Mettre à jour l'état local après suppression
      setCourses(courses.filter((course) => course.id !== courseId));
    } catch (error) {
      console.error('Erreur lors de la suppression du cours :', error);
    }
  };

  // Fonction pour gérer la mise à jour d'un utilisateur
  const handleUpdateUser = async () => {
    try {
      const { error } = await supabase
        .from('users_hackathon')
        .update(updatedUser)
        .eq('id', currentUser.id);
      if (error) throw error;

      // Mettre à jour la liste des utilisateurs après modification
      setUsers(
        users.map((user) =>
          user.id === currentUser.id ? { ...user, ...updatedUser } : user
        )
      );
      setShowModal(false); // Fermer la modale
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur :', error);
    }
  };

  // Charger les utilisateurs et les cours au montage du composant
  useEffect(() => {
    fetchUsers();
    fetchCourses();
  }, []);

  return (
    <div className="advanced-management-container">
      <h1 className="page-title">Gestion Avancée</h1>
      <p className="page-description">
        Cette page est réservée aux administrateurs pour gérer les plannings, les utilisateurs et les cours.
      </p>

      {/* Tableau récapitulatif des utilisateurs */}
      <h2 className="section-title">Liste des Utilisateurs</h2>
      <div className="table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users && users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name || 'Nom inconnu'}</td>
                  <td>{user.email || 'Email inconnu'}</td>
                  <td>{user.role || 'Rôle inconnu'}</td>
                  <td>
                    <button className="edit-button" onClick={() => {
                      setCurrentUser(user);
                      setUpdatedUser({ name: user.name, email: user.email, role: user.role });
                      setShowModal(true);
                    }}>
                      Modifier
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(user.id)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="no-users-message">
                  Il n'y a pas d'utilisateurs pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modale de modification d'un utilisateur */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Modifier l'utilisateur</h3>
            <div>
              <label>Nom</label>
              <input
                type="text"
                value={updatedUser.name}
                onChange={(e) => setUpdatedUser({ ...updatedUser, name: e.target.value })}
              />
            </div>
            <div>
              <label>Email</label>
              <input
                type="email"
                value={updatedUser.email}
                onChange={(e) => setUpdatedUser({ ...updatedUser, email: e.target.value })}
              />
            </div>
            <div>
              <label>Rôle</label>
              <select
                value={updatedUser.role}
                onChange={(e) => setUpdatedUser({ ...updatedUser, role: e.target.value })}
              >
                <option value="admin">Admin</option>
                <option value="teacher">Enseignant</option>
                <option value="student">Étudiant</option>
              </select>
            </div>
            <div className="modal-buttons">
              <button onClick={handleUpdateUser}>Mettre à jour</button>
              <button onClick={() => setShowModal(false)}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* Tableau des cours */}
      <h2 className="section-title">Liste des Cours</h2>
      <div className="table-container">
        <table className="course-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Description</th>
              <th>Semestre</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses && courses.length > 0 ? (
              courses.map((course) => (
                <tr key={course.id}>
                  <td>{course.name || 'Nom inconnu'}</td>
                  <td>{course.description || 'Description manquante'}</td>
                  <td>{course.semester || 'Semestre non spécifié'}</td>
                  <td>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteCourse(course.id)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="no-courses-message">
                  Il n'y a pas de cours pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdvancedManagement;
