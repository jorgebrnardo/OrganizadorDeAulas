import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, addDoc, doc, setDoc, query, where, deleteDoc, getDocs } from 'firebase/firestore';

// Função para converter um objeto de cor para a string CSS
const getGradientString = (color) => `bg-gradient-to-br ${color}`;

// Cores para o gradiente de fundo
const backgroundColors = [
  'from-pink-200 to-pink-300',
  'from-blue-400 to-blue-500',
  'from-purple-400 to-purple-500',
  'from-pink-400 to-pink-500',
  'from-yellow-400 to-yellow-500',
];

const App = () => {
  // Configuração do Firebase usando variáveis de ambiente do Vite

  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };
  
  // As variáveis de ambiente do Vite não funcionam diretamente neste ambiente.
  // Para este ambiente, o projectId é usado como appId
  const appId = "teacher-app-firebase";
  const initialAuthToken = undefined;

  // Estados da aplicação
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [classes, setClasses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [classToDeleteId, setClassToDeleteId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    isRecurring: false,
    recurringDays: [],
  });
  const modalRef = useRef();
  const confirmModalRef = useRef();

  const HOURLY_RATE = 55; // R$55 por hora de aula

  // Inicializa o Firebase e a autenticação
  useEffect(() => {
    const initFirebase = async () => {
      try {
        // Verifica se as chaves de API estão presentes no ambiente local
        if (import.meta.env.VITE_FIREBASE_API_KEY) {
          const app = initializeApp(firebaseConfig);
          const firestore = getFirestore(app);
          const authInstance = getAuth(app);
          setDb(firestore);
          setAuth(authInstance);

          await signInAnonymously(authInstance);
        } else {
            console.error("Erro: A configuração do Firebase está incompleta. Verifique o seu arquivo .env.");
        }
      } catch (e) {
        console.error("Erro ao inicializar o Firebase:", e);
      }
    };
    initFirebase();
  }, [firebaseConfig.apiKey]);

  // Listener para o estado de autenticação
  useEffect(() => {
    if (auth) {
      const unsubscribe = auth.onAuthStateChanged(user => {
        if (user) {
          setUserId(user.uid);
        } else {
          setUserId(null);
        }
        setIsAuthReady(true);
      });
      return () => unsubscribe();
    }
  }, [auth]);

  // Listener para as aulas no Firestore
  useEffect(() => {
    if (!db || !isAuthReady || !userId) return;

    // Acessa a coleção de dados do usuário
    const classesCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/classes`);
    
    const unsubscribe = onSnapshot(classesCollectionRef, (snapshot) => {
      const classList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClasses(classList);
    }, (error) => {
      console.error("Erro ao carregar as aulas:", error);
    });

    return () => unsubscribe();
  }, [db, isAuthReady, appId, userId]);

  // Helpers para o calendário
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getClassesForDay = (day) => {
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dayDateString = dayDate.toISOString().split('T')[0];
    return classes.filter(c => c && c.date === dayDateString);
  };

  const getMonthlyEarnings = () => {
    let totalMinutes = 0;
    const currentMonthClasses = classes.filter(c => {
      const classDate = new Date(c.date + 'T00:00:00');
      return classDate.getMonth() === currentDate.getMonth() && classDate.getFullYear() === currentDate.getFullYear();
    });

    currentMonthClasses.forEach(c => {
      const start = new Date(c.date + 'T' + c.startTime);
      const end = new Date(c.date + 'T' + c.endTime);

      const durationMs = end - start;
      totalMinutes += durationMs / (1000 * 60);
    });

    const totalHours = totalMinutes / 60;
    const totalEarnings = totalHours * HOURLY_RATE;
    return { totalHours, totalEarnings };
  };

  const monthlyEarnings = getMonthlyEarnings();

  const handleDateChange = (days) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + days);
    setCurrentDate(newDate);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'recurringDays') {
      const dayIndex = parseInt(value);
      setForm(prevForm => {
        const newDays = checked
          ? [...prevForm.recurringDays, dayIndex]
          : prevForm.recurringDays.filter(d => d !== dayIndex);
        return { ...prevForm, recurringDays: newDays.sort((a, b) => a - b) };
      });
    } else {
      setForm({
        ...form,
        [name]: type === 'checkbox' ? checked : value,
      });
    }
  };

  // Abre o modal para adicionar uma nova aula para o dia clicado
  const handleDayClick = (day) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const formattedDate = newDate.toISOString().split('T')[0];
    setEditingClass(null); // Reseta o estado de edição
    setForm({
      title: '',
      date: formattedDate,
      startTime: '',
      endTime: '',
      isRecurring: false,
      recurringDays: [],
    });
    setShowModal(true);
  };

  // Abre o modal para editar uma aula existente
  const handleEditClass = (cls, e) => {
    e.stopPropagation(); // Impede que o clique no dia também seja acionado
    setEditingClass(cls);
    setForm({
      title: cls.title,
      date: cls.date, // Agora a data já é uma string
      startTime: cls.startTime,
      endTime: cls.endTime,
      isRecurring: false,
      recurringDays: [],
    });
    setShowModal(true);
  };

  // Salva ou atualiza a aula
  const handleSaveClass = async (e) => {
    e.preventDefault();
    if (!db || !userId) return;
    
    const classesCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/classes`);

    if (editingClass) {
      // É uma edição
      const classDocRef = doc(classesCollectionRef, editingClass.id);
      await setDoc(classDocRef, {
        title: form.title,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
      }, { merge: true });
    } else {
      // É uma nova aula
      const recurrenceId = form.isRecurring ? crypto.randomUUID() : null;
      const classDate = new Date(form.date);

      if (form.isRecurring && form.recurringDays.length > 0) {
        const today = new Date(classDate);
        today.setHours(0, 0, 0, 0);

        if (form.recurringDays.includes(today.getDay())) {
           await addDoc(classesCollectionRef, {
            title: form.title,
            date: form.date,
            startTime: form.startTime,
            endTime: form.endTime,
            isRecurring: true,
            recurrenceId: recurrenceId,
          });
        }
        
        for (let i = 1; i <= 84; i++) {
          const nextDate = new Date(classDate);
          nextDate.setDate(nextDate.getDate() + i);
          nextDate.setHours(0, 0, 0, 0);

          if (form.recurringDays.includes(nextDate.getDay())) {
            await addDoc(classesCollectionRef, {
              title: form.title,
              date: nextDate.toISOString().split('T')[0],
              startTime: form.startTime,
              endTime: form.endTime,
              isRecurring: true,
              recurrenceId: recurrenceId,
            });
          }
        }
      } else {
        await addDoc(classesCollectionRef, {
          title: form.title,
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime,
          isRecurring: false,
          recurrenceId: null,
        });
      }
    }
    
    // Reseta o formulário e fecha o modal
    setForm({ title: '', date: '', startTime: '', endTime: '', isRecurring: false, recurringDays: [] });
    setEditingClass(null);
    setShowModal(false);
  };

  const deleteClass = async (id, deleteAll = false) => {
    if (!db || !userId) return;
    
    const classToDelete = classes.find(c => c.id === id);
    if (!classToDelete) return;

    if (deleteAll && classToDelete.recurrenceId) {
      const classesCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/classes`);
      const q = query(classesCollectionRef, where('recurrenceId', '==', classToDelete.recurrenceId));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
    } else {
      const classesCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/classes`);
      await deleteDoc(doc(classesCollectionRef, id));
    }
    
    setEditingClass(null);
    setShowModal(false);
    setShowDeleteConfirm(false); // Fecha o modal de confirmação
    setClassToDeleteId(null);
  };

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setShowModal(false);
      setEditingClass(null); // Reseta o estado de edição
    }
    if (confirmModalRef.current && !confirmModalRef.current.contains(event.target)) {
        setShowDeleteConfirm(false);
        setClassToDeleteId(null);
    }
  };

  useEffect(() => {
    if (showModal || showDeleteConfirm) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModal, showDeleteConfirm]);

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const dayNamesFull = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-all duration-500 ${getGradientString(backgroundColors[0])}`}>
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transform transition-transform scale-100 hover:scale-[1.01] duration-300">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white text-center mb-6">Minhas Aulas de Inglês</h1>
        
        {/* Sumário de ganhos mensais */}
        <div className="mb-8 p-6 rounded-xl bg-gray-100 dark:bg-gray-700 shadow-inner">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 text-center mb-2">
            Ganhos do Mês de {monthNames[currentDate.getMonth()]}
          </h2>
          <div className="flex flex-col sm:flex-row justify-around text-center">
            <div className="p-2">
              <span className="text-lg font-medium text-gray-600 dark:text-gray-300">Horas Totais:</span>
              <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                {monthlyEarnings.totalHours.toFixed(2)}h
              </p>
            </div>
            <div className="p-2">
              <span className="text-lg font-medium text-gray-600 dark:text-gray-300">Total a Receber:</span>
              <p className="text-2xl font-extrabold text-green-600 dark:text-green-400">
                R$ {monthlyEarnings.totalEarnings.toFixed(2)}
              </p>
            </div>
          </div>
          {userId && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
             (ID do Usuário: <code className="bg-gray-200 dark:bg-gray-600 rounded-md px-1">{userId}</code>)
            </p>
          )}
        </div>
        
        {/* Navegação do Calendário */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => handleDateChange(-1)}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={() => handleDateChange(1)}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        {/* Dias da semana */}
        <div className="grid grid-cols-7 text-center font-semibold text-gray-600 dark:text-gray-300 mb-4">
          {dayNames.map(day => (
            <div key={day}>{day}</div>
          ))}
        </div>
        
        {/* Calendário */}
        <div className="grid grid-cols-7 gap-2">
          {emptyDays.map((_, i) => <div key={`empty-${i}`} className="h-32"></div>)}
          {monthDays.map(day => (
            <div 
              key={day} 
              className="h-32 p-1 border border-gray-200 dark:border-gray-600 rounded-lg overflow-y-auto relative hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              onClick={() => handleDayClick(day)}
            >
              <div className="text-sm font-bold text-gray-800 dark:text-white">{day}</div>
              {getClassesForDay(day).map(c => (
                <div 
                  key={c.id} 
                  className="mt-1 p-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 text-xs font-medium rounded-md truncate relative cursor-pointer"
                  onClick={(e) => handleEditClass(c, e)}
                >
                  {c.title}
                </div>
              ))}
            </div>
          ))}
        </div>
        
        {/* Botão para adicionar aula */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => {
              setEditingClass(null);
              setForm({ title: '', date: '', startTime: '', endTime: '', isRecurring: false, recurringDays: [] });
              setShowModal(true);
            }}
            className="py-3 px-6 rounded-full bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            Adicionar Nova Aula
          </button>
        </div>
      </div>
      
      {/* Modal para adicionar/editar aula */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
          <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-lg w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
              {editingClass ? 'Editar Aula' : 'Adicionar Nova Aula'}
            </h3>
            <form onSubmit={handleSaveClass} className="space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300">Título da Aula:</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  className="w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300">Data:</label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleFormChange}
                    className="w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300">Hora de Início:</label>
                  <input
                    type="time"
                    name="startTime"
                    value={form.startTime}
                    onChange={handleFormChange}
                    className="w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300">Hora de Término:</label>
                  <input
                    type="time"
                    name="endTime"
                    value={form.endTime}
                    onChange={handleFormChange}
                    className="w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    required
                  />
                </div>
              </div>
              {!editingClass && (
                <>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isRecurring"
                      name="isRecurring"
                      checked={form.isRecurring}
                      onChange={handleFormChange}
                      className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isRecurring" className="ml-2 text-gray-700 dark:text-gray-300">Aula Recorrente</label>
                  </div>
                  {form.isRecurring && (
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-2">Repetir em:</label>
                      <div className="flex flex-wrap gap-2">
                        {dayNamesFull.map((day, index) => (
                          <div key={index} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`day-${index}`}
                              name="recurringDays"
                              value={index}
                              checked={form.recurringDays.includes(index)}
                              onChange={handleFormChange}
                              className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <label htmlFor={`day-${index}`} className="ml-1 text-sm text-gray-700 dark:text-gray-300">
                              {dayNames[index]}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              <div className="flex justify-end space-x-4 mt-6">
                {editingClass && (
                  <button
                    type="button"
                    onClick={() => {
                        if (editingClass.isRecurring) {
                          setClassToDeleteId(editingClass.id);
                          setShowDeleteConfirm(true);
                          setShowModal(false);
                        } else {
                          deleteClass(editingClass.id);
                        }
                    }}
                    className="py-2 px-4 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
                  >
                    Excluir
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingClass(null);
                  }}
                  className="py-2 px-4 rounded-full bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                >
                  {editingClass ? 'Salvar Alterações' : 'Salvar Aula'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Novo Modal de Confirmação de Exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
          <div ref={confirmModalRef} className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-sm w-full shadow-2xl text-center">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Confirmar Exclusão</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">Deseja apagar apenas esta aula ou toda a série recorrente?</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => deleteClass(classToDeleteId, false)}
                className="py-2 px-4 rounded-full bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
              >
                Apagar Apenas Esta
              </button>
              <button
                onClick={() => deleteClass(classToDeleteId, true)}
                className="py-2 px-4 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
              >
                Apagar Toda a Recorrência
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;