import { IUsersRepository } from "../../repositories/IUsersRepository";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { CreateUserError } from "./CreateUserError";

let inMemoryUsersRepository: IUsersRepository;
let createUserUsecase: CreateUserUseCase;

describe("Create user", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUsecase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("Should be able to create a new user", async () => {
    const user = await createUserUsecase.execute({
      name: "User test",
      email: "user@test.com",
      password: "123@test"
    });

    expect(user).toHaveProperty("id");
  });

  it("Should not be able to create a user that already exists", () => {
    expect(async () => {
      await createUserUsecase.execute({
        name: "User Test",
        email: "user@test.com",
        password: "123@test"
      });

      await createUserUsecase.execute({
        name: "User Test",
        email: "user@test.com",
        password: "123@test"
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});