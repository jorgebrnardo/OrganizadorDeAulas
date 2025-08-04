import React, { useState } from 'react';
import { Calendar, Clock, DollarSign, Plus, Edit, Trash2, User, BookOpen } from 'lucide-react';

const TeacherScheduleManager = () => {
  const [classes, setClasses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('calendar');

  const [formData, setFormData] = useState({
    student: '',
    subject: 'Inglês',
    date: '',
    startTime: '',
    endTime: '',
    hourlyRate: 55,
    notes: '',
    isRecurring: false,
    recurringDays: [],
    recurringEndDate: ''
  });

  const calculateDuration = (startTime, endTime) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return (end - start) / (1000 * 60 * 60);
  };

  const handleSubmit = () => {
    if (!formData.student || !formData.date || !formData.startTime || !formData.endTime) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const duration = calculateDuration(formData.startTime, formData.endTime);
    const classValue = duration * formData.hourlyRate;

    if (formData.isRecurring && !editingClass) {
      // Create recurring classes
      const startDate = new Date(formData.date + 'T12:00:00');
      const endDate = new Date((formData.recurringEndDate || '2024-12-31') + 'T12:00:00');
      const classesToAdd = [];

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        if (formData.recurringDays.includes(dayOfWeek)) {
          const classDate = new Date(d);
          const newClass = {
            id: Date.now() + Math.random(),
            student: formData.student,
            subject: formData.subject,
            date: classDate.toISOString().split('T')[0],
            startTime: formData.startTime,
            endTime: formData.endTime,
            hourlyRate: formData.hourlyRate,
            notes: formData.notes,
            duration,
            value: classValue,
            isRecurring: true
          };
          classesToAdd.push(newClass);
        }
      }
      
      setClasses([...classes, ...classesToAdd]);
    } else {
      // Create single class or update existing
      const newClass = {
        id: editingClass ? editingClass.id : Date.now(),
        ...formData,
        duration,
        value: classValue
      };

      if (editingClass) {
        setClasses(classes.map(c => c.id === editingClass.id ? newClass : c));
        setEditingClass(null);
      } else {
        setClasses([...classes, newClass]);
      }
    }

    setFormData({
      student: '',
      subject: 'Inglês',
      date: '',
      startTime: '',
      endTime: '',
      hourlyRate: 55,
      notes: '',
      isRecurring: false,
      recurringDays: [],
      recurringEndDate: ''
    });
    setShowAddForm(false);
  };

  const handleEdit = (classItem) => {
    setFormData(classItem);
    setEditingClass(classItem);
    setShowAddForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja deletar esta aula?')) {
      setClasses(classes.filter(c => c.id !== id));
    }
  };

  const getClassesForDate = (date) => {
    return classes.filter(c => c.date === date).sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const getMonthlyEarnings = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return classes
      .filter(c => {
        const classDate = new Date(c.date + 'T12:00:00');
        return classDate.getMonth() === currentMonth && classDate.getFullYear() === currentYear;
      })
      .reduce((total, c) => total + c.value, 0);
  };

  const getWeeklySchedule = () => {
    const today = new Date(selectedDate + 'T12:00:00');
    const currentWeek = [];
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      currentWeek.push(date.toISOString().split('T')[0]);
    }

    return currentWeek;
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const weekDaysLong = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <BookOpen className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Organizador de Aulas</h1>
                <p className="text-gray-600">Gerencie seus horários e ganhos</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 font-semibold">
                    R$ {getMonthlyEarnings().toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-green-600">Este mês</p>
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Nova Aula</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                viewMode === 'calendar' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Calendário</span>
            </button>
            <button
              onClick={() => setViewMode('summary')}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                viewMode === 'summary' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <DollarSign className="h-4 w-4" />
              <span>Resumo</span>
            </button>
          </div>
        </div>

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">
                  {editingClass ? 'Editar Aula' : 'Nova Aula'}
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Aluno *
                    </label>
                    <input
                      type="text"
                      value={formData.student}
                      onChange={(e) => setFormData({...formData, student: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Nome do aluno"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Matéria
                    </label>
                    <input
                      type="text"
                      value="Inglês"
                      disabled
                      className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Início *
                      </label>
                      <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fim *
                      </label>
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor por hora (R$)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.hourlyRate}
                      onChange={(e) => setFormData({...formData, hourlyRate: parseFloat(e.target.value) || 0})}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Observações
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      rows="2"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Observações opcionais"
                    />
                  </div>

                  {/* Recurring Classes Section */}
                  <div className="border-t pt-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <input
                        type="checkbox"
                        id="isRecurring"
                        checked={formData.isRecurring}
                        onChange={(e) => setFormData({...formData, isRecurring: e.target.checked})}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        disabled={editingClass}
                      />
                      <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">
                        Aula recorrente {editingClass && '(não editável)'}
                      </label>
                    </div>

                    {formData.isRecurring && !editingClass && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Dias da semana
                          </label>
                          <div className="grid grid-cols-7 gap-2">
                            {weekDaysLong.map((day, index) => (
                              <label key={index} className="flex flex-col items-center">
                                <input
                                  type="checkbox"
                                  checked={formData.recurringDays.includes(index)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFormData({
                                        ...formData,
                                        recurringDays: [...formData.recurringDays, index]
                                      });
                                    } else {
                                      setFormData({
                                        ...formData,
                                        recurringDays: formData.recurringDays.filter(d => d !== index)
                                      });
                                    }
                                  }}
                                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mb-1"
                                />
                                <span className="text-xs text-gray-600">{weekDays[index]}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Repetir até (opcional)
                          </label>
                          <input
                            type="date"
                            value={formData.recurringEndDate}
                            onChange={(e) => setFormData({...formData, recurringEndDate: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Se não especificado, criará aulas até o final do ano
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-6 border-t">
                <div className="flex space-x-3">
                  <button
                    onClick={handleSubmit}
                    className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    {editingClass ? 'Atualizar' : 'Adicionar'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingClass(null);
                      setFormData({
                        student: '',
                        subject: 'Inglês',
                        date: '',
                        startTime: '',
                        endTime: '',
                        hourlyRate: 55,
                        notes: '',
                        isRecurring: false,
                        recurringDays: [],
                        recurringEndDate: ''
                      });
                    }}
                    className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Calendário Semanal</h2>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-7 gap-4">
              {getWeeklySchedule().map((date, index) => {
                const dayClasses = getClassesForDate(date);
                const isToday = date === new Date().toISOString().split('T')[0];
                
                return (
                  <div key={date} className={`border rounded-lg p-3 min-h-32 ${isToday ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}>
                    <div className="text-center mb-2">
                      <div className="text-sm font-medium text-gray-600">{weekDays[index]}</div>
                      <div className={`text-lg font-bold ${isToday ? 'text-purple-600' : 'text-gray-800'}`}>
                        {new Date(date + 'T12:00:00').getDate()}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      {dayClasses.map((classItem) => (
                        <div
                          key={classItem.id}
                          className={`p-2 rounded text-xs cursor-pointer transition-colors ${
                            classItem.isRecurring 
                              ? 'bg-blue-100 hover:bg-blue-200' 
                              : 'bg-purple-100 hover:bg-purple-200'
                          }`}
                          onClick={() => handleEdit(classItem)}
                        >
                          <div className={`font-medium ${classItem.isRecurring ? 'text-blue-800' : 'text-purple-800'}`}>
                            {classItem.student} {classItem.isRecurring && '🔄'}
                          </div>
                          <div className={classItem.isRecurring ? 'text-blue-600' : 'text-purple-600'}>
                            {classItem.startTime} - {classItem.endTime}
                          </div>
                          <div className={classItem.isRecurring ? 'text-blue-600' : 'text-purple-600'}>
                            R$ {classItem.value.toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Summary View */}
        {viewMode === 'summary' && (
          <div className="space-y-6">
            {/* Monthly Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ganhos do Mês</p>
                    <p className="text-2xl font-bold text-green-600">
                      R$ {getMonthlyEarnings().toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Horas do Mês</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {classes
                        .filter(c => {
                          const classDate = new Date(c.date + 'T12:00:00');
                          const currentMonth = new Date().getMonth();
                          const currentYear = new Date().getFullYear();
                          return classDate.getMonth() === currentMonth && classDate.getFullYear() === currentYear;
                        })
                        .reduce((total, c) => total + c.duration, 0)
                        .toFixed(1)}h
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <User className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Aulas do Mês</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {classes.filter(c => {
                        const classDate = new Date(c.date + 'T12:00:00');
                        const currentMonth = new Date().getMonth();
                        const currentYear = new Date().getFullYear();
                        return classDate.getMonth() === currentMonth && classDate.getFullYear() === currentYear;
                      }).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Classes List */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Próximas Aulas</h3>
              <div className="space-y-3">
                {classes
                  .filter(c => new Date(c.date + 'T12:00:00') >= new Date())
                  .sort((a, b) => new Date(a.date + 'T' + a.startTime) - new Date(b.date + 'T' + b.startTime))
                  .slice(0, 10)
                  .map((classItem) => (
                    <div key={classItem.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium text-gray-800">
                              {classItem.student} {classItem.isRecurring && <span className="text-blue-500">🔄</span>}
                            </p>
                            <p className="text-sm text-gray-600">
                              {classItem.subject} {classItem.isRecurring && <span className="text-blue-500 text-xs">(Recorrente)</span>}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              {new Date(classItem.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                            </p>
                            <p className="text-sm text-gray-600">
                              {classItem.startTime} - {classItem.endTime}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-green-600">
                              R$ {classItem.value.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {classItem.duration}h
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(classItem)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(classItem.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                {classes.filter(c => new Date(c.date + 'T12:00:00') >= new Date()).length === 0 && (
                  <p className="text-gray-500 text-center py-8">Nenhuma aula agendada</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

;

function App() {
  return <TeacherScheduleManager />;
}

export default App;