import { v4 as uuidV4 } from "uuid";

import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryUsersRepository: IUsersRepository;
let inMemoryStatementsRepository: IStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw'
}

describe("", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  });

  it("Should be able to get an operation statement", async () => {
    const user = await createUserUseCase.execute({
      name: "User test",
      email: "user@test.com",
      password: "123@test"
    });

    const operation = await createStatementUseCase.execute({
      user_id: String(user.id),
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "Description Sample"
    });

    const statement = await getStatementOperationUseCase.execute({
      user_id: String(user.id),
      statement_id: String(operation.id)
    });

    expect(statement.id).toBe(operation.id);
    expect(statement.amount).toBe(100);
  });

  it("Should not be able to show an operation statement from a non-existant user", async () => {
    expect(async () => {
      const id = uuidV4();

      await getStatementOperationUseCase.execute({
        user_id: String(id),
        statement_id: String("operation_id")
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("Should not be able to show an operation statement from a non-existant statement", async () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: "User test",
        email: "user@test.com",
        password: "123@test"
      });

      await getStatementOperationUseCase.execute({
        user_id: String(user.id),
        statement_id: String("operation_id")
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});