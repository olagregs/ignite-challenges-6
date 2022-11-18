import { v4 as uuidV4 } from 'uuid';

import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { IUsersRepository } from '../../../users/repositories/IUsersRepository';
import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { IStatementsRepository } from '../../repositories/IStatementsRepository';
import { CreateStatementError } from './CreateStatementError';
import { CreateStatementUseCase } from './CreateStatementUseCase';

let inMemoryUsersRepository: IUsersRepository;;
let inMemoryStatementRepository: IStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementRepository);
  });

  it("Should be able to make a deposit", async () => {
    const user = await createUserUseCase.execute({
      name: "User test",
      email: "user@test.com",
      password: "123@test"
    });

    const receipt = await createStatementUseCase.execute({
      user_id: String(user.id),
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "Description Sample"
    });

    expect(receipt).toHaveProperty("id");
    expect(receipt.amount).toBe(100);
  });

  it("Should not be able to make a deposit for a non-existant user", async () => {
    expect(async () => {
      const id = uuidV4();

      await createStatementUseCase.execute({
        user_id: id,
        type: OperationType.DEPOSIT,
        amount: 100,
        description: "Description Sample"
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("Should be able to make a withdraw", async () => {
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

    const withdraw = await createStatementUseCase.execute({
      user_id: String(user.id),
      type: OperationType.WITHDRAW,
      amount: 60,
      description: "Description Sample"
    });

    expect(withdraw.amount).toBe(60);
    expect(withdraw).toHaveProperty("id");
  });

  it("Should not be able to make a withdraw with insufficient founds", async () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: "User test",
        email: "user@test.com",
        password: "123@test"
      });

      await createStatementUseCase.execute({
        user_id: String(user.id),
        type: OperationType.DEPOSIT,
        amount: 50,
        description: "Description Sample"
      });

      await createStatementUseCase.execute({
        user_id: String(user.id),
        type: OperationType.WITHDRAW,
        amount: 60,
        description: "Description Sample"
      });

    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});