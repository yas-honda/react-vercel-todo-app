
import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { Task } from './types';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/getTasks');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data.tasks);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddTask = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    try {
      const response = await fetch('/api/addTask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newTaskText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add task');
      }

      setNewTaskText('');
      await getTasks(); // Re-fetch tasks to get the new list
    } catch (err: any) {
      setError(err.message);
    }
  };

  const TaskList = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
        </div>
      );
    }

    if (error) {
      return <p className="text-center text-red-400 p-4">Error: {error}</p>;
    }
    
    if (tasks.length === 0) {
        return <p className="text-center text-gray-400 p-4">No tasks yet. Add one above!</p>;
    }

    return (
      <ul className="space-y-3">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="bg-gray-800 p-4 rounded-lg flex items-center shadow-md transition-transform transform hover:scale-105"
          >
            <span className="flex-grow text-gray-200">{task.text}</span>
            <span className="text-xs text-gray-500">{new Date(task.created_at).toLocaleDateString()}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <header className="text-center my-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
            My To-Do List
          </h1>
          <p className="text-gray-400 mt-2">Powered by Vercel & React</p>
        </header>

        <main className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-2xl p-6">
          <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-grow bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 disabled:opacity-50"
              disabled={!newTaskText.trim()}
            >
              Add Task
            </button>
          </form>

          <div className="space-y-4">
            <TaskList />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
