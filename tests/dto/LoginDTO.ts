export class LoginDTO {
  private readonly username: string
  private readonly password: string

  constructor(username: string, password: string) {
    this.username = username
    this.password = password
  }

  static createLoginWithCorrectData(): LoginDTO {
    //prettier-ignore
    return new LoginDTO(process.env.USER || '', process.env.PASSWORD || '')
  }

  static createLoginWithIncorrectData(): LoginDTO {
    //prettier-ignore
    return new LoginDTO('', '')
  }
}
