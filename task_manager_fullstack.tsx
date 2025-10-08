import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, Calendar, Tag } from 'lucide-react';

// Mock Backend API
class TaskAPI {
  constructor() {
    this.tasks = [
      { id: 1, title: 'Complete project proposal', description: 'Write and submit Q4 proposal', status: 'todo', priority: 'high', dueDate: '2025-10-15', tags: ['work'] },
      { id: 2, title: 'Review code changes', description: 'Review PRs from team', status: 'in-progress', priority: 'medium', dueDate: '2025-10-10', tags: ['code', 'review'] },
      { id: 3, title: 'Update documentation', description: 'Add API docs', status: 'completed', priority: 'low', dueDate: '2025-10-08', tags: ['docs'] }
    ];
    this.nextId = 4;
  }

  async getAllTasks() {
    return new Promise(resolve => {
      setTimeout(() => resolve([...this.tasks]), 100);
    });
  }

  async createTask(task) {
    return new Promise(resolve => {
      setTimeout(() => {
        const newTask = { ...task, id: this.nextId++ };
        this.tasks.push(newTask);
        resolve(newTask);
      }, 150);
    });
  }

  async updateTask(id, updates) {
    return new Promise(resolve => {
      setTimeout(() => {
        const idx = this.tasks.findIndex(t => t.id === id);
        if (idx !== -1) {
          this.tasks[idx] = { ...this.tasks[idx], ...updates };
          resolve(this.tasks[idx]);
        }
      }, 150);
    });
  }

  async deleteTask(id) {
    return new Promise(resolve => {
      setTimeout(() => {
        this.tasks = this.tasks.filter(t => t.id !== id);
        resolve(true);
      }, 100);
    });
  }
}

const api = new TaskAPI();

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    tags: ''
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    const data = await api.getAllTasks();
    setTasks(data);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) return;
    const taskData = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    };

    if (editingTask) {
      await api.updateTask(editingTask.id, taskData);
    } else {
      await api.createTask(taskData);
    }

    await loadTasks();
    resetForm();
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      tags: task.tags.join(', ')
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    await api.deleteTask(id);
    await loadTasks();
  };

  const handleStatusChange = async (id, newStatus) => {
    await api.updateTask(id, { status: newStatus });
    await loadTasks();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: '',
      tags: ''
    });
    setEditingTask(null);
    setShowForm(false);
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const getStatusColor = (status) => {
    const colors = {
      'todo': 'bg-slate-100 text-slate-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      'completed': 'bg-green-100 text-green-700'
    };
    return colors[status];
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'text-green-600',
      'medium': 'text-yellow-600',
      'high': 'text-red-600'
    };
    return colors[priority];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-xl text-slate-600">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Task Manager</h1>
            <p className="text-slate-600">Organize and track your work efficiently</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            New Task
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="work, urgent, review"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSubmit}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Check size={18} />
                  {editingTask ? 'Update' : 'Create'}
                </button>
                <button
                  onClick={resetForm}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <X size={18} />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 mb-6">
          {['all', 'todo', 'in-progress', 'completed'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status === 'all' ? 'All' : status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </button>
          ))}
        </div>

        <div className="grid gap-4">
          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-12 text-center">
              <p className="text-slate-500 text-lg">No tasks found</p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <div key={task.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-slate-800">{task.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </span>
                      <span className={`text-sm font-semibold ${getPriorityColor(task.priority)}`}>
                        {task.priority.toUpperCase()}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-slate-600 mb-3">{task.description}</p>
                    )}
                    <div className="flex gap-4 text-sm text-slate-500">
                      {task.dueDate && (
                        <div className="flex items-center gap-1">
                          <Calendar size={16} />
                          {task.dueDate}
                        </div>
                      )}
                      {task.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag size={16} />
                          {task.tags.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(task)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  {task.status !== 'todo' && (
                    <button
                      onClick={() => handleStatusChange(task.id, 'todo')}
                      className="px-3 py-1 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                    >
                      To Do
                    </button>
                  )}
                  {task.status !== 'in-progress' && (
                    <button
                      onClick={() => handleStatusChange(task.id, 'in-progress')}
                      className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                    >
                      In Progress
                    </button>
                  )}
                  {task.status !== 'completed' && (
                    <button
                      onClick={() => handleStatusChange(task.id, 'completed')}
                      className="px-3 py-1 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-8 text-center text-slate-500 text-sm">
          Total Tasks: {tasks.length} | Completed: {tasks.filter(t => t.status === 'completed').length}
        </div>
      </div>
    </div>
  );
}