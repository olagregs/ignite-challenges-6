import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let inMemoryUsersRepository: IUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Authenticate User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
  });

  it("It should be able to authenticate a user", async () => {
    await createUserUseCase.execute({
      name: "User test",
      email: "user@test.com",
      password: "123@test"
    });

    const response = await authenticateUserUseCase.execute({
      email: "user@test.com",
      password: "123@test"
    });

    expect(response.user).toHaveProperty("id");
    expect(response).toHaveProperty("token");
  });

  it("It should not be able to authenticate a non-existant user", async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "user@test.com",
        password: "123@test"
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("It should not be able to authenticate a user with incorrect password", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "User test",
        email: "user@test.com",
        password: "123@test"
      });

      await authenticateUserUseCase.execute({
        email: "user@test.com",
        password: "password"
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
})