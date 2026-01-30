import { Request } from 'express';
import { authService } from '../services/auth.service';
import { ValidateAccessRequestDTO, ValidateAccessResponseDTO, GetUserRoleResponseDTO } from '../dtos/auth.dto';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

class AuthController {
    async validateAccess(req: Request): Promise<ValidateAccessResponseDTO> {
        const dto: ValidateAccessRequestDTO = req.body;
        return authService.validateAccess(dto);
    }
    async getUserRole(req: AuthenticatedRequest): Promise<GetUserRoleResponseDTO> {
        const email = req.user?.email;
        if (!email) throw new Error('Email not found in token');
        return authService.getUserRole(email);
    }
}

export const authController = new AuthController();
