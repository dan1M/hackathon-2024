import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import '../assets/styles/listeTeachers.css';

function ListeTeachers() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dateOfBirth: '',
    classId: '',
    subjectId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
    fetchAssignments();
  }, []);

  // Récupérer les classes depuis Supabase
  const fetchClasses = async () => {
    const { data, error } = await supabase.from('classes').select('id, name');
    if (error) {
      console.error('Error fetching classes:', error);
    } else {
      setClasses(data);
    }
  };

  // Récupérer les matières depuis Supabase
  const fetchSubjects = async () => {
    const { data, error } = await supabase.from('courses').select('id, name');
    if (error) {
      console.error('Error fetching subjects:', error);
    } else {
      setSubjects(data);
    }
  };

  // Récupérer les affectations depuis Supabase
  const fetchAssignments = async () => {
    const { data, error } = await supabase
      .from('lessons')
      .select(`
        id,
        teacher:users_hackathon(name, email),
        class:classes(name),
        course:courses(name)
      `);

    if (error) {
      console.error('Error fetching assignments:', error);
    } else {
      setAssignments(data);
    }
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { name, email, dateOfBirth, classId, subjectId } = formData;

    try {
      // Ajouter le professeur
      const { data: professor, error: professorError } = await supabase
        .from('users_hackathon')
        .insert([
          {
            name,
            email,
            birthdate: dateOfBirth,
            role: 'teacher',
            password: 'password',
            class_id: classId
          }
        ])
        .select();

      if (professorError) {
        throw professorError;
      }

      // Créer une leçon pour assigner la matière au professeur
      const { error: lessonError } = await supabase
        .from('lessons')
        .insert([
          {
            teacher_id: professor[0].id,
            course_id: subjectId,
            date: new Date().toISOString().split('T')[0], // Date actuelle
            start_time: '08:00:00',
            end_time: '09:00:00'
          }
        ]);

      if (lessonError) {
        throw lessonError;
      }

      alert('Professeur ajouté et leçon créée avec succès !');
      setFormData({ name: '', email: '', dateOfBirth: '', classId: '', subjectId: '' });
      fetchAssignments(); // Mettre à jour les affectations
    } catch (error) {
      console.error('Error:', error);
      alert('Une erreur est survenue lors de la soumission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gérer les changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="add-professor-form">
      <h1>Liste des Professeurs Assignés</h1>
      <table>
        <thead>
          <tr>
            <th>Professeur</th>
            <th>Email</th>
            <th>Classe</th>
            <th>Matière</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((assignment) => (
            <tr key={assignment.id}>
              <td>{assignment.teacher?.name}</td>
              <td>{assignment.teacher?.email}</td>
              <td>{assignment.class?.name}</td>
              <td>{assignment.course?.name}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h1>Ajouter un Professeur</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Nom:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Date de Naissance:
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Classe:
          <select
            name="classId"
            value={formData.classId}
            onChange={handleChange}
            required
          >
            <option value="">Sélectionner une classe</option>
            {classes.map((classItem) => (
              <option key={classItem.id} value={classItem.id}>
                {classItem.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Matière:
          <select
            name="subjectId"
            value={formData.subjectId}
            onChange={handleChange}
            required
          >
            <option value="">Sélectionner une matière</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </label>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'En cours...' : 'Ajouter'}
        </button>
      </form>
    </div>
  );
}

export default ListeTeachers;
