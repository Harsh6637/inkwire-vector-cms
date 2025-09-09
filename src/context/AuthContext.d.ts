import React, { ReactNode } from 'react';
interface User {
    email: string;
}
interface LoginCredentials {
    email: string;
    password: string;
}
interface LoginResult {
    success: boolean;
    message?: string;
}
interface AuthContextType {
    user: User | null;
    login: (credentials: LoginCredentials) => LoginResult;
    logout: () => void;
    validateEmail: (email: string) => boolean;
    checkExistingLogin: () => boolean;
}
interface AuthProviderProps {
    children: ReactNode;
}
export declare const AuthContext: React.Context<AuthContextType>;
export declare function AuthProvider({ children }: AuthProviderProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=AuthContext.d.ts.map