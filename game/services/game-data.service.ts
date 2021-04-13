import { CheckStateEnum, GameMoveIterface } from '@app/modules/game/models';
import { EndReason, GameResult } from '@app/modules/game/state/game-result-enum';
import { GameBadgeNotificationEnum, GetBottomBadgeNotifyType, GetTopBadgeNotifyType } from '@app/modules/game/models';
import { ChessgroundAudioService, SoundType } from '@app/shared/widgets/chessground/chessground.audio.service';

import { Injectable } from '@angular/core';
import { TranslateBadgeNotificationInterface } from '@app/modules/game/models';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class GameDataService {
  public showMtsBanner$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private audioService: ChessgroundAudioService) {}

  private endGameAlreadyPlayed: boolean = false;

  private getMsgMap(messages: Array<TranslateBadgeNotificationInterface>, code: string, defaultMsg: string = ''): string {
    const message = messages.find(message => {
      return message.key === code;
    });
    return (message) ? message.translate : defaultMsg;
  }

  /**
   * @returns GetTopBadgeNotifyType
   */
  public getTopBadgeNotify(): GetTopBadgeNotifyType {
    return ([some, endReason, gameResult, opponentName, messages]) => {
      const [
        isResultShown,
        isCheck,
        playerOfferedDraw,
        playerReadyToOfferDraw,
        opponentOfferedDraw,
        isLetsPlayNotification,
        selectedMove,
      ] = some;
      if (!!selectedMove) {
        return {
          notificationType: GameBadgeNotificationEnum.Info,
          notification: this.getMsgMap(messages, 'GAME_REVIEW', 'Game Review'),
        };
      }
      if (playerOfferedDraw) {
        return {
          notificationType: GameBadgeNotificationEnum.OfferedDraw,
          notification: this.getMsgMap(messages, 'OFFERED_DRAW', 'You offered a draw'),
        };
      }
      if (playerReadyToOfferDraw) {
        return {
          notificationType: GameBadgeNotificationEnum.ReadyToOfferDraw,
          notification: this.getMsgMap(messages, 'OFFERING_DRAW', 'Offering a draw'),
        };
      }

      if (isLetsPlayNotification) {
        this.audioService.playSound(SoundType.drawdecl);
        return {
          notificationType: GameBadgeNotificationEnum.Message,
          notification: this.getMsgMap(messages, 'LET_PLAY', 'Let’s play'),
        };
      }
      /*if (endReason === EndReason.FOLD_REPETITION) {
        return {
          notificationType: ameBadgeNotificationEnum.OfferedDraw,
          notification: 'because of 5 repetitions',
        };
      }*/
      if (isResultShown) {
        if (endReason === EndReason.CLASSIC && gameResult === GameResult.LOST) {
          return {
            notificationType: GameBadgeNotificationEnum.Message,
            notification: this.getMsgMap(messages, 'CHECKMATE', 'Checkmate!'),
          };
        }
        if (endReason === EndReason.RESIGN && gameResult === GameResult.WON) {
          this.audioService.playSound(SoundType.win);
          return {
            notificationType: GameBadgeNotificationEnum.Info,
            notification: `${opponentName} ${this.getMsgMap(messages, 'OPPONENT_RESIGNED', 'resigned')}`,
          };
        }
      }

      if (isCheck === CheckStateEnum.OpponentChecks) {
        return {
          notificationType: GameBadgeNotificationEnum.Message,
          notification: this.getMsgMap(messages, 'CHECK', 'Check!'),
        };
      }

      if (opponentOfferedDraw) {
        this.audioService.playSound(SoundType.drawoffer);
        return {
          notificationType: GameBadgeNotificationEnum.Message,
          notification: this.getMsgMap(messages, 'A_DRAW', 'A draw?'),
        };
      }
    };
  }
  /**
   * @returns GetBottomBadgeNotifyType
   */
  public getBottomBadgeNotify(): GetBottomBadgeNotifyType {
    return ([some, endReason, gameResult, isThreefoldRepetition, messages]) => {
      const [isResultShown, isCheck, opponentOfferedDraw] = some;
      if (!isResultShown && this.endGameAlreadyPlayed) {
        this.endGameAlreadyPlayed = false;
      }

      if (isResultShown) {
        switch (endReason) {
          case EndReason.CLASSIC: {
            if (gameResult === GameResult.WON) {
              if (!this.endGameAlreadyPlayed) {
                this.endGameAlreadyPlayed = true;
                this.audioService.playSound(SoundType.win);
              }

              return {
                notificationType: GameBadgeNotificationEnum.Message,
                notification: this.getMsgMap(messages, 'CHECKMATE', 'Checkmate!'),
              };
            } else if (gameResult === GameResult.LOST) {
              if (!this.endGameAlreadyPlayed) {
                this.endGameAlreadyPlayed = true;
                this.audioService.playSound(SoundType.def);
              }

              return {
                notificationType: GameBadgeNotificationEnum.Info,
                notification: this.getMsgMap(messages, 'YOU_LOST', 'You lost'),
              };
            } else if (gameResult === GameResult.DRAW) {
              return {
                notificationType: GameBadgeNotificationEnum.Info,
                notification: this.getMsgMap(messages, 'STALEMATE_DRAW', 'Stalemate. Draw'),
              };
            }
            break;
          }

          case EndReason.TIME_CONTROL: {
            if (gameResult === GameResult.LOST) {
              this.audioService.playSound(SoundType.def);
              return {
                notificationType: GameBadgeNotificationEnum.Info,
                notification: this.getMsgMap(messages, 'YOU_LOST_TIME', 'You lost on time'),
              };
            } else if (gameResult === GameResult.WON) {
              this.audioService.playSound(SoundType.win);
              return {
                notificationType: GameBadgeNotificationEnum.Info,
                notification: this.getMsgMap(messages, 'YOU_WIN_TIME', 'You win on time'),
              };
            } else if (gameResult === GameResult.DRAW) {
              return {
                notificationType: GameBadgeNotificationEnum.Info,
                notification: this.getMsgMap(messages, 'DRAW', 'Draw'),
              };
            }
            break;
          }

          case EndReason.RESIGN: {
            if (gameResult === GameResult.LOST) {
              this.audioService.playSound(SoundType.def);
              return {
                notificationType: GameBadgeNotificationEnum.Info,
                notification: this.getMsgMap(messages, 'YOU_RESIGNED', 'You resigned'),
              };
            }
            break;
          }

          case EndReason.FOLD_REPETITION: {
            if (gameResult === GameResult.DRAW) {
              return {
                notificationType: GameBadgeNotificationEnum.Info,
                notification: this.getMsgMap(messages, 'DRAW_BECAUSE', 'Draw: because of 5 repetitions'),
              };
            }
            break;
          }

          default: {
            if (gameResult === GameResult.DRAW || endReason == EndReason.DRAW) {
              if (isThreefoldRepetition === false) {
                this.audioService.playSound(SoundType.drawacc);
              }

              return {
                notificationType: GameBadgeNotificationEnum.Info,
                notification: this.getMsgMap(messages, 'DRAW', 'Draw'),
              };
            }
          }
        }
      }

      if (opponentOfferedDraw) {
        if (isThreefoldRepetition) {
          return {
            notificationType: GameBadgeNotificationEnum.AcceptDraw,
            notification: this.getMsgMap(messages, 'CLAIM_A_DRAW', 'Claim a draw'),
          };
        } else {
          return {
            notificationType: GameBadgeNotificationEnum.AcceptDraw,
            notification: this.getMsgMap(messages, 'ACCEPT_DRAW', 'Accept a draw'),
          };
        }
      }

      if (isCheck === CheckStateEnum.PlayerChecks) {
        return {
          notificationType: GameBadgeNotificationEnum.Message,
          notification: this.getMsgMap(messages, 'CHECK', 'Check!'),
        };
      }
    };
  }
}
