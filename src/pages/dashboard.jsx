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

  useEffect(() => {
    fetchUsers();
    fetchCourses();
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
      const courseHourlyVolumes = data.map(course => course.hourly_volume); // Utiliser l'attribut hourly_volume pour l'axe des ordonnées

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
      <h1>Dashboard</h1>
      <p>Bienvenue dans le tableau de bord</p>

      <div className="courses-container"></div>

      {/* Diagramme des cours de l'utilisateur */}
      <div className="courses-chart">
        <h2>Diagramme des cours</h2>
        {coursesData.labels.length > 0 ? (
          <Bar data={coursesData} options={{
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
          }} />
        ) : (
          <p>Chargement des données du diagramme...</p>
        )}
      </div>

      {/* Tableau des utilisateurs */}
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
  );
}

export default Dashboard;
