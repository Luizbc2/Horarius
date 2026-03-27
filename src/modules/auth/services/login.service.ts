import { LoginInput, LoginResponse } from "../auth.types";
import { UserRepository } from "../repositories/user.repository";
import { comparePassword } from "../utils/password.util";

type ServiceResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      message: string;
      statusCode: number;
    };

export class LoginService {
  constructor(private readonly userRepository: UserRepository) {}

  public async execute(input: LoginInput): Promise<ServiceResult<LoginResponse>> {
    const email = input.email.trim().toLowerCase();
    const password = input.password.trim();

    if (!email || !password) {
      return {
        success: false,
        message: "Email and password are required.",
        statusCode: 400
      };
    }

    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return {
        success: false,
        message: "Invalid email or password.",
        statusCode: 401
      };
    }

    const passwordMatches = await comparePassword(password, user.password);

    if (!passwordMatches) {
      return {
        success: false,
        message: "Invalid email or password.",
        statusCode: 401
      };
    }

    return {
      success: true,
      data: {
        message: "Login successful.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          cpf: user.cpf
        }
      }
    };
  }
}
