export type userRegisterType = {
    name: string,
    email: string,
    password: string
    // passwordConfirmation?: string
}
export type userLoginType = {
    email: string,
    password: string
    rememberMe?: boolean
    }