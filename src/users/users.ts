export class Users {
  constructor(
    public readonly userId: number,
    public readonly username: string,
    public readonly password: string,
  ) {

  }

  static fromJson(json: any): Users {
    return new Users(json.userId, json.username, json.password);
  }

  toJson(): any {
    return {
      userId: this.userId,
      username: this.username,
      password: this.password,
    };
  }

}
