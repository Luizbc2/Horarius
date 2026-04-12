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
        message: "E-mail e senha sao obrigatorios.",
        statusCode: 400
      };
    }

    if (!isValidEmail(email)) {
      return {
        success: false,
        message: "Formato de e-mail invalido.",
        statusCode: 400
      };
    }

    let user;

    try {
      user = await this.userRepository.findByEmail(email);
    } catch {
      return {
        success: false,
        message: "O serviço de autenticacao esta indisponível no momento.",
        statusCode: 503
      };
    }

    if (!user) {
      return {
        success: false,
        message: "E-mail ou senha invalidos.",
        statusCode: 401
      };
    }

    const passwordMatches = await comparePassword(password, user.password);

    if (!passwordMatches) {
      return {
        success: false,
        message: "E-mail ou senha invalidos.",
        statusCode: 401
      };
    }

    return {
      success: true,
      data: {
        message: "Login realizado com sucesso.",
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



