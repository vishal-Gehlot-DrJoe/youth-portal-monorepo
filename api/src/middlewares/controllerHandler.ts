import { Request, Response, NextFunction } from 'express';
import { _respo } from '../utils/response';

type ControllerFn<T> = (req: Request) => Promise<T>;

export function controllerHandler<T>(controllerFn: ControllerFn<T>) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await controllerFn(req);
            _respo(res, { data: result, status: 200 });
        } catch (error) {
            next(error);
        }
    };
}
