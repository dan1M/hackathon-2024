import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
// import '../assets/styles/ListeTeachers.css'; // Importez un fichier CSS pour styliser si nécessaire

function ListeTeachers() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [professors, setProfessors] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [showAddProfessorForm, setShowAddProfessorForm] = useState(false);
  const [showAssignSubjectsForm, setShowAssignSubjectsForm] = useState(false);
  const [showGlobalManagementForm, setShowGlobalManagementForm] = useState(false);
  
  const [newProfessor, setNewProfessor] = useState({ name: '', email: '' });
  const [subjectAssignment, setSubjectAssignment] = useState({ subject: '', professorId: '' });

  useEffect(() => {
    fetchCourses();
    fetchUserRole();
  }, []);

  // Récupérer la liste des cours
  const fetchCourses = async () => {
    const { data, error } = await supabase.from('courses').select();
    if (error) {
      console.error('Error fetching courses:', error);
    } else {
      setCourses(data);
    }
  };

  // Récupérer le rôle de l'utilisateur
  const fetchUserRole = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error fetching user:', error);
    } else {
      setUserRole(data?.role);
    }
  };

  // Récupérer les professeurs assignés à un cours
  const fetchProfessors = async (courseId) => {
    const { data, error } = await supabase
      .from('users_hackathon')
      .select('id, name, email')
      .eq('role', 'teacher')
      .eq('class_id', courseId);

    if (error) {
      console.error('Error fetching professors:', error);
    } else {
      setProfessors(data);
    }
  };

  // Gérer la sélection du cours
  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    setSelectedCourse(courseId);
    fetchProfessors(courseId); // Récupérer les professeurs pour ce cours
  };

  // Supprimer un professeur
  const handleDelete = async (id) => {
    const { error } = await supabase
      .from('users_hackathon')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting professor:', error);
    } else {
      setProfessors(professors.filter((professor) => professor.id !== id));
    }
  };

  // Soumettre le formulaire d'ajout de professeur
  const handleAddProfessor = async (e) => {
    e.preventDefault();
    const { name, email } = newProfessor;

    const { error } = await supabase
      .from('users_hackathon')
      .insert([{ name, email, role: 'teacher', class_id: selectedCourse }]);

    if (error) {
      console.error('Error adding professor:', error);
    } else {
      setProfessors([...professors, { name, email }]);
      setShowAddProfessorForm(false);
      setNewProfessor({ name: '', email: '' });
    }
  };

  // Soumettre le formulaire d'assignation de matières
  const handleAssignSubjects = async (e) => {
    e.preventDefault();
    const { subject, professorId } = subjectAssignment;

    const { error } = await supabase
      .from('course_assignments')
      .insert([{ subject, professor_id: professorId }]);

    if (error) {
      console.error('Error assigning subject:', error);
    } else {
      setShowAssignSubjectsForm(false);
      setSubjectAssignment({ subject: '', professorId: '' });
    }
  };

  return (
    <div className="teachers-container">
      <header className="teachers-header">
        <h1>Gestion des Professeurs</h1>
        <p>Gérez les professeurs pour chaque cours.</p>
      </header>

      <section className="course-selection">
        <h2>Sélectionner un Cours</h2>
        <select onChange={handleCourseChange} value={selectedCourse || ''}>
          <option value="">Sélectionner un cours</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>
      </section>

      {selectedCourse && (
        <section className="professors-list">
          <h2>Professeurs du Cours {selectedCourse}</h2>

          <table className="professors-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {professors.length > 0 ? (
                professors.map((professor) => (
                  <tr key={professor.id}>
                    <td>{professor.name}</td>
                    <td>{professor.email}</td>
                    <td>
                      <button onClick={() => handleDelete(professor.id)}>
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">Aucun professeur trouvé pour ce cours.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}

      <section className="admin-actions">
        <h2>Actions Admin</h2>
        <button onClick={() => setShowAddProfessorForm(!showAddProfessorForm)}>
          Ajouter un professeur
        </button>
        <button onClick={() => setShowAssignSubjectsForm(!showAssignSubjectsForm)}>
          Assigner des matières
        </button>
        <button onClick={() => setShowGlobalManagementForm(!showGlobalManagementForm)}>
          Gestion globale
        </button>
      </section>

      {/* Formulaire Ajouter un professeur */}
      {showAddProfessorForm && (
        <form onSubmit={handleAddProfessor}>
          <h3>Ajouter un Professeur</h3>
          <label>
            Nom:
            <input
              type="text"
              value={newProfessor.name}
              onChange={(e) => setNewProfessor({ ...newProfessor, name: e.target.value })}
              required
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              value={newProfessor.email}
              onChange={(e) => setNewProfessor({ ...newProfessor, email: e.target.value })}
              required
            />
          </label>
          <button type="submit">Ajouter</button>
        </form>
      )}

      {/* Formulaire Assigner des matières */}
      {showAssignSubjectsForm && (
        <form onSubmit={handleAssignSubjects}>
          <h3>Assigner une Matière</h3>
          <label>
            Matière:
            <input
              type="text"
              value={subjectAssignment.subject}
              onChange={(e) => setSubjectAssignment({ ...subjectAssignment, subject: e.target.value })}
              required
            />
          </label>
          <label>
            Professeur:
            <select
              value={subjectAssignment.professorId}
              onChange={(e) => setSubjectAssignment({ ...subjectAssignment, professorId: e.target.value })}
              required
            >
              <option value="">Sélectionner un professeur</option>
              {professors.map((professor) => (
                <option key={professor.id} value={professor.id}>
                  {professor.name}
                </option>
              ))}
            </select>
          </label>
          <button type="submit">Assigner</button>
        </form>
      )}

      {/* Formulaire Gestion globale */}
      {showGlobalManagementForm && (
        <form>
          <h3>Gestion Globale</h3>
          <p>Options de gestion pour les administrateurs.</p>
        </form>
      )}
    </div>
  );
}

export default ListeTeachers;
