import api from "@/api"


export const login = async (data: any) => {
    return api.post('v1/auth/login', data)
}

export const register = async (data: any) => {
    return api.post('v1/auth/register', data)
}