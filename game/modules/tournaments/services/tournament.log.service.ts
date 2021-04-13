import { Injectable } from '@angular/core';
import { SocketConnectionService } from '@app/auth/socket-connection.service';
import { GameMessageType } from '@app/modules/game/models';
import { delay, filter } from 'rxjs/operators';
import { GameSocketActions } from '@app/modules/game/state/game-socket-actions.enum';
import {
  TournamentLifecycleStepEnum,
  TournamentMessageType,
  UpdateMeEnum,
  UpdateMeResponseInterface
} from '@app/modules/game/modules/tournaments/models';
import { ChessColors } from '@app/modules/game/state/game-chess-colors.model';
import {
  tournamentLifecycleStepExpectation
} from '@app/modules/game/modules/tournaments/models/tournament/tournament-lifecycle-step-expectations';
import { Result } from '@app/broadcast/core/result/result.model';
import { EndReason,
  GameResult } from '@app/modules/game/state/game-result-enum';
import { IGameBoard } from '@app/modules/game/state/game-board.model';
import { of } from 'rxjs';

@Injectable()
export class TournamentLogService {

  private currentBoardId: string;
  private playerColor: ChessColors;
  private playerUid: string;
  private opponentUid: string;
  private currentTournamentLyfecycleStep: TournamentLifecycleStepEnum;
  private navigatedToTournamentBoard: string;

  constructor(
    private socket: SocketConnectionService<GameMessageType | TournamentMessageType, GameMessageType | TournamentMessageType>) {

    this.socket.messages$
      .pipe(
        filter(message => message.action !== GameSocketActions.GAMING_PONG))
      .subscribe((message: GameMessageType) => {
        switch (message.action) {
          case GameSocketActions.TOUR_BOARD_CREATED:
            this.playerUid = message.user_uid;
            if (message.user_uid === message.black_player.uid) {
              this.playerColor = ChessColors.Black;
              this.opponentUid = message.white_player.uid;
            } else {
              this.playerColor = ChessColors.White;
              this.opponentUid = message.black_player.uid;
            }
            this.validationCheck(TournamentLifecycleStepEnum.TOUR_BOARD_CREATED);
            if (message.can_play) {
              this.currentTournamentLyfecycleStep = TournamentLifecycleStepEnum.TOUR_BOARD_CREATED;
              this.currentBoardId = message.board_id;
            } else {
              this.currentTournamentLyfecycleStep = TournamentLifecycleStepEnum.TOUR_GAME_END;
            }
            break;

          case GameSocketActions.BOARD_STARTED:
            this.validationCheck(TournamentLifecycleStepEnum.BOARD_STARTED);
            this.currentBoardId = message.board_id;
            this.currentTournamentLyfecycleStep = TournamentLifecycleStepEnum.BOARD_STARTED;
            break;

          case GameSocketActions.GAMING_SUBSCRIBE_TO_BOARD:
            this.validationCheck(TournamentLifecycleStepEnum.TOUR_BOARD_SUBSCRIBED);
            this.currentTournamentLyfecycleStep = TournamentLifecycleStepEnum.TOUR_BOARD_SUBSCRIBED;
            break;

          case GameSocketActions.GAMING_GAME_STARTED:
            this.validationCheck(TournamentLifecycleStepEnum.TOUR_GAME_STARTED);
            if (this.playerColor === ChessColors.White) {
              this.currentTournamentLyfecycleStep = TournamentLifecycleStepEnum.PLAYER_MOVE_TURN;
            } else {
              this.currentTournamentLyfecycleStep = TournamentLifecycleStepEnum.OPPONENT_MOVE_TURN;
            }
            break;

          case GameSocketActions.GAMING_MOVES:
            const lastMove = message.moves[message.moves.length - 1];
            if (lastMove.is_white_move) {
              if (this.playerColor === ChessColors.White) {
                this.currentTournamentLyfecycleStep = TournamentLifecycleStepEnum.OPPONENT_MOVE_TURN;
              } else {
                this.currentTournamentLyfecycleStep = TournamentLifecycleStepEnum.PLAYER_MOVE_TURN;
              }
            } else {
              if (this.playerColor === ChessColors.White) {
                this.currentTournamentLyfecycleStep = TournamentLifecycleStepEnum.PLAYER_MOVE_TURN;
              } else {
                this.currentTournamentLyfecycleStep = TournamentLifecycleStepEnum.OPPONENT_MOVE_TURN;
              }
            }
            break;

          case GameSocketActions.GAMING_ADD_MOVE:
            if (message.move.is_white_move) {
              if (this.playerColor === ChessColors.White) {
                this.validationCheck(TournamentLifecycleStepEnum.OPPONENT_MOVE_TURN);
                this.currentTournamentLyfecycleStep = TournamentLifecycleStepEnum.OPPONENT_MOVE_TURN;
              } else {
                this.validationCheck(TournamentLifecycleStepEnum.PLAYER_MOVE_TURN);
                this.currentTournamentLyfecycleStep = TournamentLifecycleStepEnum.PLAYER_MOVE_TURN;
              }
            } else {
              if (this.playerColor === ChessColors.White) {
                this.validationCheck(TournamentLifecycleStepEnum.PLAYER_MOVE_TURN);
                this.currentTournamentLyfecycleStep = TournamentLifecycleStepEnum.PLAYER_MOVE_TURN;
              } else {
                this.validationCheck(TournamentLifecycleStepEnum.OPPONENT_MOVE_TURN);
                this.currentTournamentLyfecycleStep = TournamentLifecycleStepEnum.OPPONENT_MOVE_TURN;
              }
            }
            break;
          case GameSocketActions.GAMING_GAME_END:
            if (message.board_id === this.currentBoardId) {
              this.validationCheck(TournamentLifecycleStepEnum.TOUR_GAME_END);
              let gameResult: GameResult;

              if (message.result === Result.WHITE_WIN) {
                gameResult = this.playerColor === ChessColors.White ? GameResult.WON : GameResult.LOST;
              }

              if (message.result === Result.BLACK_WIN) {
                gameResult = this.playerColor === ChessColors.Black ? GameResult.WON : GameResult.LOST;
              }

              if (message.result === Result.DRAW) {
                gameResult = GameResult.DRAW;
              }

              this.currentTournamentLyfecycleStep = TournamentLifecycleStepEnum.TOUR_GAME_END;
            }
            break;

          case GameSocketActions.GAMING_GAME_ABORT:
            this.validationCheck(TournamentLifecycleStepEnum.TOUR_GAME_ABORTED);
            break;
        }
      });
  }

  public loadUpdateMeResponse(response: UpdateMeResponseInterface): void {
    if (response) {
      switch (response.status) {
        case UpdateMeEnum.WAITING_FOR_NEXT_TOUR:
        case UpdateMeEnum.GAME_IN_PROGRESS:
          this.currentTournamentLyfecycleStep = TournamentLifecycleStepEnum.TOUR_BOARD_CREATED;
          this.currentBoardId = response.board_uid;
          this.playerUid = response.uid;
          break;

        case UpdateMeEnum.GAMEOVER:
        case UpdateMeEnum.TOURNAMENT_OVER:
        case UpdateMeEnum.PLAYER_DISQUALIFIED:
          this.currentTournamentLyfecycleStep = TournamentLifecycleStepEnum.TOUR_GAME_END;
          break;
      }
    }
  }

  public loadBoardInfo(board: IGameBoard): void {
    if (board && board.black_player && board.white_player) {
      if (this.playerUid === board.black_player.uid) {
        this.playerColor = ChessColors.Black;
        this.opponentUid = board.white_player.uid;
      } else {
        this.playerColor = ChessColors.White;
        this.opponentUid = board.black_player.uid;
      }
    }
  }

  public setNavigatedToTournamentBoard(boardId: string) {
    this.navigatedToTournamentBoard = boardId;
  }

  private validationCheck(newStep: TournamentLifecycleStepEnum): boolean {
    if (!this.currentTournamentLyfecycleStep) {
      return true;
    }

    const lastTourStepExpected = tournamentLifecycleStepExpectation[newStep];
    if (!lastTourStepExpected.includes(this.currentTournamentLyfecycleStep)) {
      this.generateUnexpectedLifeCycleStepException(this.currentTournamentLyfecycleStep, lastTourStepExpected);
      return false;
    }

    return true;
  }

  private generateUnexpectedLifeCycleStepException(
    lastStep: TournamentLifecycleStepEnum,
    expectedLastSteps: TournamentLifecycleStepEnum[]
  ): void {}
}
