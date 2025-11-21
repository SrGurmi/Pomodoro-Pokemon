import { useState } from 'react';
import { Settings } from 'lucide-react';

interface PomodoroSettingsProps {
  workMinutes: number;
  breakMinutes: number;
  onSave: (workMinutes: number, breakMinutes: number) => void;
}

const PomodoroSettings: React.FC<PomodoroSettingsProps> = ({ 
  workMinutes, 
  breakMinutes, 
  onSave 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localWorkMinutes, setLocalWorkMinutes] = useState(workMinutes);
  const [localBreakMinutes, setLocalBreakMinutes] = useState(breakMinutes);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localWorkMinutes, localBreakMinutes);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setLocalWorkMinutes(workMinutes);
          setLocalBreakMinutes(breakMinutes);
          setIsOpen(!isOpen);
        }}
        className="p-2 rounded-full bg-white/80 dark:bg-gray-700/80 hover:bg-white dark:hover:bg-gray-600 transition-all shadow-md"
        aria-label="Configuración"
      >
        <Settings className="w-6 h-6 text-gray-700 dark:text-gray-200" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          <div className="p-5">
            <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Configuración
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Minutos de trabajo:
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={localWorkMinutes}
                  onChange={(e) => setLocalWorkMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Minutos de descanso:
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={localBreakMinutes}
                  onChange={(e) => setLocalBreakMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PomodoroSettings;