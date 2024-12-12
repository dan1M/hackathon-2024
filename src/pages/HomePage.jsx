import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
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
import '../assets/styles/home.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function HomePage() {
  const [users, setUsers] = useState([]);
  const [coursesData, setCoursesData] = useState({ labels: [], datasets: [] });
  const [notifications, setNotifications] = useState([]);
  const [calendarDate, setCalendarDate] = useState(new Date()); // Etat pour le calendrier

  useEffect(() => {
    fetchUsers();
    fetchCourses();
    fetchNotifications();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users_hackathon').select();
    if (error) {
      console.error('Error fetching users:', error);
    } else {
      setUsers(data);
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

  const fetchNotifications = async () => {
    const { data, error } = await supabase.from('notifications').select();
    if (error) {
      console.error('Error fetching notifications:', error);
    } else {
      setNotifications(data);
    }
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Bienvenue sur notre Plateforme</h1>
          <p>Votre tableau de bord pour gérer les cours, les utilisateurs et plus encore.</p>
          <button className="cta-button">Explorer les filieres</button>
        </div>
      </section>

      {/* Présentation des fonctionnalités */}
      <section className="features">
        <h2>Fonctionnalités principales</h2>
        <div className="feature-cards">
          <div className="feature-card">
            <h3>Gestion des Utilisateurs</h3>
            <p>Suivez et gérez les utilisateurs de la plateforme avec facilité.</p>
          </div>
          <div className="feature-card">
            <h3>Suivi des Cours</h3>
            <p>Visualisez les volumes horaires de chaque cours avec des diagrammes détaillés.</p>
          </div>
          <div className="feature-card">
            <h3>Calendrier des Événements</h3>
            <p>Consultez les événements à venir et planifiez vos activités efficacement.</p>
          </div>
        </div>
      </section>

      {/* Statistiques */}
      <section className="statistics-summary">
        <h2>Vue Globale</h2>
        <div className="statistics-cards">
          <div className="stat-card">
            <h3>Total Utilisateurs</h3>
            <p>{users.length}</p>
          </div>
          <div className="stat-card">
            <h3>Total Cours</h3>
            <p>{coursesData.labels.length}</p>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="notifications">
        <h2>Notifications Récentes</h2>
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

      {/* Appels à l'action */}
      <section className="cta-section">
        <h2>Prêt à commencer ?</h2>
        <div className="cta-buttons">
          <button href="/login" className="cta-button">Accéder à mon compte</button>
          <button href="/fields" className="cta-button">Découvrir les filieres</button>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
