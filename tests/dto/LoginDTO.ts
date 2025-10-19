export class LoginDTO {
  private readonly username: string
  private readonly password: string

  constructor(username: string, password: string) {
    this.username = username
    this.password = password
  }

  static createLoginWithCorrectData(): LoginDTO {
    return new LoginDTO(process.env.USER || "", process.env.PASSWORD || "")
  }

  static createLoginWithIncorrectData(): LoginDTO {
    return new LoginDTO("", "")
  }
}