import { LoginInput, LoginResponse } from "../auth.types";
import { UserRepository } from "../repositories/user.repository";
import { comparePassword } from "../utils/password.util";
import { generateAccessToken } from "../utils/jwt.util";
import { isValidEmail } from "../../../shared/utils/email.util";

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

    if (!isValidEmail(email)) {
      return {
        success: false,
        message: "Invalid email format.",
        statusCode: 400
      };
    }

    let user;

    try {
      user = await this.userRepository.findByEmail(email);
    } catch {
      return {
        success: false,
        message: "Authentication service is unavailable right now.",
        statusCode: 503
      };
    }

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
        token: generateAccessToken(user),
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
