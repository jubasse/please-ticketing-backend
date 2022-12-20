export class UserCreatedEvent {
  constructor(
    public readonly _id: string,
    public readonly username: string,
    public readonly email: string,
    public readonly password: string,
  ) {}
}
