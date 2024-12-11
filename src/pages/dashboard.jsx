import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import '../assets/styles/Dashboard.css'; 
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const [users, setUsers] = useState([]);
  const [coursesData, setCoursesData] = useState({ labels: [], datasets: [] });
  const [userRole, setUserRole] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [calendarDate, setCalendarDate] = useState(new Date()); // Etat pour le calendrier

  useEffect(() => {
    fetchUsers();
    fetchCourses();
    fetchUserRole();
    fetchNotifications();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users_hackathon').select();
    if (error) {
      console.error('Error fetching users:', error);
    } else {
      const sortedUsers = data.sort((a, b) => {
        const rolesOrder = ['admin', 'teacher', 'student'];
        return rolesOrder.indexOf(a.role) - rolesOrder.indexOf(b.role);
      });
      setUsers(sortedUsers);
    }
  };

  const fetchCourses = async () => {
    const { data, error } = await supabase.from('courses').select();
    if (error) {
      console.error('Error fetching courses:', error);
    } else {
      const courseNames = data.map(course => course.name);
      const courseHourlyVolumes = data.map(course => course.hourly_volume);

      setCoursesData({
        labels: courseNames,
        datasets: [
          {
            label: 'Volume horaire (heures)',
            data: courseHourlyVolumes,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      });
    }
  };

  const fetchUserRole = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error fetching user:', error);
    } else {
      setUserRole(data?.role);
    }
  };

  const fetchNotifications = async () => {
    const { data, error } = await supabase.from('notifications').select();
    if (error) {
      console.error('Error fetching notifications:', error);
    } else {
      setNotifications(data);
    }
  };

  const handleEdit = (userId) => {
    console.log(`Edit user with id: ${userId}`);
  };

  const handleDelete = async (userId) => {
    const { error } = await supabase.from('users_hackathon').delete().eq('id', userId);
    if (error) {
      console.error('Error deleting user:', error);
    } else {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Bienvenue dans le tableau de bord</p>
      </header>

      {/* Section Vue globale des statistiques */}
      <section className="statistics-summary">
        <h2>Vue Globale</h2>
        <div className="statistics-cards">
          <div className="stat-card">
            <h3>Total Utilisateurs</h3>
            <p>{users.length}</p>
          </div>
          <div className="stat-card">
            <h3>Total Etudiants</h3>
            <p>{users.filter(user => user.role === 'student').length}</p>
          </div>
          <div className="stat-card">
            <h3>Total Enseignants</h3>
            <p>{users.filter(user => user.role === 'teacher').length}</p>
          </div>
          <div className="stat-card">
            <h3>Total Cours</h3>
            <p>{coursesData.labels.length}</p>
          </div>
        </div>
      </section>

      {/* Section Notifications */}
      <section className="notifications">
        <h2>Notifications</h2>
        <ul>
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <li key={notification.id}>
                <p>{notification.message}</p>
              </li>
            ))
          ) : (
            <p>Aucune notification pour le moment.</p>
          )}
        </ul>
      </section>

      {/* Section Calendrier et Diagramme côte à côte */}
      <section className="calendar-and-chart">
        <div className="courses-chart">
          <h2>Diagramme des cours</h2>
          {coursesData.labels.length > 0 ? (
            <Bar
              data={coursesData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Volume horaire par cours',
                  },
                },
              }}
            />
          ) : (
            <p>Chargement des données du diagramme...</p>
          )}
        </div>

        <div className="calendar">
          <h2>Calendrier des événements</h2>
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            events={[{ title: 'Exemple d\'événement', date: '2024-12-12' }]}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,dayGridWeek,dayGridDay',
            }}
          />
        </div>
      </section>

      {/* Affichage selon le rôle de l'utilisateur */}
      <div className="role-specific-sections">
        {userRole === 'student' && (
          <section className="student-planning">
            <h2>Votre planning</h2>
            {/* Logique pour afficher le planning de l'élève */}
          </section>
        )}

        {userRole === 'teacher' && (
          <section className="teacher-planning">
            <h2>Planning et Disponibilités/Contraintes</h2>
            {/* Logique pour afficher le planning et les disponibilités/contraintes */}
          </section>
        )}

        {userRole === 'admin' && (
          <section className="admin-dashboard">
            <h2>Gestion de l'Accueil et des Classes</h2>
            <div className="admin-actions">
              <button>Gestion des classes</button>
              <button>Assignation des matières</button>
              <button>IA - Gestion globale</button>
            </div>

            {/* Tableau des utilisateurs */}
            <div className="admin-users">
              <h3>Gestion des utilisateurs</h3>
              <table>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>
                          <button onClick={() => handleEdit(user.id)}>Modifier</button>
                          <button className="delete" onClick={() => handleDelete(user.id)}>Supprimer</button>
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
          </section>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
