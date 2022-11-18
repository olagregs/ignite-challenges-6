import { v4 as uuidV4 } from "uuid";

import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersRepository: IUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfile: ShowUserProfileUseCase;

describe("Show user profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository;
    showUserProfile = new ShowUserProfileUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("Should be able to show a user profile", async () => {
    const user = await createUserUseCase.execute({
      name: "User test",
      email: "user@test.com",
      password: "123@test"
    });

    const id = String(user.id);

    const profile = await showUserProfile.execute(id);

    expect(profile).toHaveProperty("id");
  });

  it("Should not be able to show a non-existant profile", async () => {
    expect(async () => {
      const id = uuidV4();

      await showUserProfile.execute(id);
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});