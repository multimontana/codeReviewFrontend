import { SocketStatus } from '@app/shared/socket/socket-connection';
import { GameMessageType } from '@app/modules/game/models/game/game-socket-message.model';

export enum GameSocketMessagesHistoryDirections {
    INCOMING = 'INCOMING',
    OUTGOUING = 'OUTGOUING',
    STATUS = 'STATUS',
}

export interface IGameSocketMessagesHistory {
    type: GameSocketMessagesHistoryDirections;
    date: Date;
    message: GameMessageType | SocketStatus;
}
