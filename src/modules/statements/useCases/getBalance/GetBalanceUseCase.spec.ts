import { v4 as uuidV4 } from "uuid";

import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from './GetBalanceUseCase';

let inMemoryUsersRepository: IUsersRepository;
let inMemoryStatementsRepository: IStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw'
}

describe("Get balance", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);
  });

  it("Should be able to get balance from the user", async () => {
    const user = await createUserUseCase.execute({
      name: "User test",
      email: "user@test.com",
      password: "123@test"
    });

    await createStatementUseCase.execute({
      user_id: String(user.id),
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "Description Sample"
    });

    await createStatementUseCase.execute({
      user_id: String(user.id),
      type: OperationType.WITHDRAW,
      amount: 60,
      description: "Description Sample"
    });

    const balance = await getBalanceUseCase.execute({
      user_id: String(user.id)
    });

    expect(balance.statement).toHaveLength(2);
    expect(balance.balance).toBe(40);
  });

  it("Should not be able to get balance from a non-existant user", async () => {
    expect(async () => {
      const id = uuidV4();

      await getBalanceUseCase.execute({
        user_id: id
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});