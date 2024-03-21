import { create } from "zustand"

type PhoneStore = {
    isLoggedIn: boolean;
    ip: string;
    setIp: (newIP: string) => void
    login: () => void;
    logout: () => void;
}

const usePhoneStore = create<PhoneStore>((set) => ({
    isLoggedIn: false,
    ip: "",
    login: () => {
        set({
            isLoggedIn: true
        })
    },
    logout: () => {
        set({
            isLoggedIn: false,
            ip: ""
        })
    },
    setIp: (newIP) => {
        set({
            ip: newIP
        })
    }
}))

export default usePhoneStore