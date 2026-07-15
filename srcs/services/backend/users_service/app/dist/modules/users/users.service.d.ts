export declare function hashPassword(password: string): Promise<string>;
export declare function verifyPassword(storedHash: string, password: string): Promise<boolean>;
export declare function getAllUsers(): Promise<{
    id: number;
    mail: string;
    pseudo: string;
    role: "admin" | "user";
}[]>;
export declare function getUserById(id: number): Promise<{
    id: number;
    mail: string;
    pseudo: string;
    role: "admin" | "user";
}>;
export declare function verifyCredentials(login: string, password: string): Promise<{
    id: number;
    pseudo: string;
} | null>;
export declare function createUser(mail: string, pseudo: string, password: string): Promise<{
    id: number;
    mail: string;
    pseudo: string;
    role: "admin" | "user";
}>;
export declare function updateUser(id: number, data: {
    mail?: string;
    pseudo?: string;
    password?: string;
}): Promise<{
    id: number;
    mail: string;
    pseudo: string;
    role: "admin" | "user";
} | null>;
export declare function deleteUser(id: number): Promise<boolean>;
