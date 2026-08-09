import React, { useState, useEffect } from 'react';
// 1. Se remueve 'IconPlus' si no se utiliza en el render
// Si usas íconos de alguna librería (ej. lucide-react o react-icons), importa solo los requeridos.

interface User {
  id?: number;
  name: string;
  email: string;
}

export const UserCrud: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Función para obtener usuarios con tipado explícito de errores
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data: User[] = await response.json();
      setUsers(data);
    } catch (err) {
      // 2. Se maneja el error sin usar 'any'
      const error = err as Error;
      console.error('Error al obtener usuarios:', error.message);
    }
  };

  // 3. Solución al render en cascada: Se envuelve la ejecución asíncrona dentro de useEffect
  useEffect(() => {
    let isMounted = true;

    const loadUsers = async () => {
      try {
        const response = await fetch('/api/users');
        const data: User[] = await response.json();
        if (isMounted) {
          setUsers(data);
        }
      } catch (err) {
        const error = err as Error;
        console.error('Error en carga inicial:', error.message);
      }
    };

    void loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenCreateModal = () => {
    setIsModalOpen(true);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });

      if (response.ok) {
        setName('');
        setEmail('');
        setIsModalOpen(false);
        await fetchUsers();
      }
    } catch (err) {
      // Manejo seguro sin tipo 'any' ni variables no utilizadas
      const error = err as Error;
      console.error('Error al crear usuario:', error.message);
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchUsers();
      }
    } catch (err) {
      // Manejo seguro sin tipo 'any'
      const error = err as Error;
      console.error('Error al eliminar usuario:', error.message);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Gestión de Usuarios</h2>
      <button onClick={handleOpenCreateModal}>Nuevo Usuario</button>

      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} ({user.email})
            {user.id && (
              <button onClick={() => handleDeleteUser(user.id!)}>Eliminar</button>
            )}
          </li>
        ))}
      </ul>

      {isModalOpen && (
        <form onSubmit={handleCreateUser}>
          <input
            type="text"
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit">Guardar</button>
        </form>
      )}
    </div>
  );
};