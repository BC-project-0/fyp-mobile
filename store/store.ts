import { create } from "zustand"

type PhoneStore = {
    isLoggedIn: boolean;
    login: () => void;
    logout: () => void;
}

const usePhoneStore = create<PhoneStore>((set) => ({
    isLoggedIn: false,
    login: () => {
        set({
            isLoggedIn: true
        })
    },
    logout: () => {
        set({
            isLoggedIn: false
        })
    },

}))

export default usePhoneStore