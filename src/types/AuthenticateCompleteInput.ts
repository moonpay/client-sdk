import { AuthenticateStartResponse } from './AuthenticateStartResponse';

export interface AuthenticateCompleteInput extends AuthenticateStartResponse {
    signature: string;
}
