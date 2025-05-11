import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { auth } from '@/app/(root)/prooperties/firebaseConfig'; // або будь-який інший метод для отримання користувача

interface UserContextType {
    user: { id: string | null };
    setUser: React.Dispatch<React.SetStateAction<{ id: string | null }>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<{ id: string | null }>({ id: null });

    useEffect(() => {
        // При ініціалізації перевіряємо чи є автентифікований користувач
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUser({ id: user.uid });
            } else {
                setUser({ id: null });
            }
        });

        return () => unsubscribe(); // Очищаємо підписку при розмонтуванні компонента
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
