import React, { createContext, useState, useContext, ReactNode } from 'react';

interface UserContextType {
    user: { id: string | null };
    setUser: React.Dispatch<React.SetStateAction<{ id: string | null }>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<{ id: string | null }>({ id: null });

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