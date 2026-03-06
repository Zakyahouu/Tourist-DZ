import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
                {toasts.map(toast => {
                    const icons = {
                        success: <CheckCircle className="text-emerald-500 flex-shrink-0" size={20} />,
                        error: <AlertCircle className="text-red-500 flex-shrink-0" size={20} />,
                        info: <Info className="text-sky-500 flex-shrink-0" size={20} />
                    };
                    const bgColors = {
                        success: 'bg-emerald-50 border-emerald-100',
                        error: 'bg-red-50 border-red-100',
                        info: 'bg-sky-50 border-sky-100'
                    };

                    return (
                        <div
                            key={toast.id}
                            className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg shadow-black/5 pointer-events-auto transform transition-all duration-300 animate-slide-up ${bgColors[toast.type] || bgColors.info} min-w-[300px] max-w-md`}
                        >
                            {icons[toast.type] || icons.info}
                            <p className="text-sm font-medium text-slate-700 flex-1 pt-0.5">{toast.message}</p>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
};
