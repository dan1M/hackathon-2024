import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import '../assets/styles/Dashboard.css'; 

function Dashboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users_hackathon').select();
    if (error) {
      console.error('Error fetching users:', error);
    } else {
      // Trier les utilisateurs par rôle (admin, teacher, student)
      const sortedUsers = data.sort((a, b) => {
        const rolesOrder = ['admin', 'teacher', 'student']; // Définir l'ordre des rôles
        return rolesOrder.indexOf(a.role) - rolesOrder.indexOf(b.role);
      });
      setUsers(sortedUsers);
    }
  };

  const handleEdit = (userId) => {
    // Logique pour éditer un utilisateur
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
