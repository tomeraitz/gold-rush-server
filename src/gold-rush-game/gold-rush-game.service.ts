import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { GameEngineLogicService } from './game-engine-logic.service';

@Injectable()
export class GoldRushGameService extends GameEngineLogicService {
  private logger: Logger = new Logger('gold-rush-game');
  private row = 8;
  private colum = 8;
  private max = this.row * this.colum;
  checkIfGameEnded = (state: any) => state.numberOfCoins === 0;

  endGameStatus(state: any): any {
    const { player1, player2 } = state;
    if (player1.score > player2.score) return { endGameStatus: 'you won!' };
    if (player1.score < player2.score) return { endGameStatus: 'you lost!' };
    else return { endGameStatus: `it's a draw` };
  }

  checkIfCanGoRight(playerIndex: number, index: number): boolean {
    return (
      (playerIndex + 1) % this.row === 0 &&
      index % this.row === 0 &&
      index === playerIndex + 1
    );
  }

  checkIfCanGoLeft(playerIndex: number, index: number): boolean {
    return (
      playerIndex % this.row === 0 &&
      index % this.row === 7 &&
      index === playerIndex - 1
    );
  }

  checkBoard(state: any, plyer: string, index: number) {
    const copyState = JSON.parse(JSON.stringify(state));
    const playerObj = copyState[plyer];
    if (this.checkIfCanGoRight(playerObj.index, index)) return copyState;
    if (this.checkIfCanGoLeft(playerObj.index, index)) return copyState;
    if (
      index > this.max - 1 ||
      index < 0 ||
      copyState.gridArray[index].value === 'block' ||
      copyState.gridArray[index].value === 'player2' ||
      copyState.gridArray[index].value === 'player1'
    )
      return copyState;
    if (copyState.gridArray[index].value === 'coin') {
      playerObj.score += 10;
      copyState.numberOfCoins--;
    }
    copyState.gridArray[playerObj.index].value = '';
    copyState.gridArray[index].value = plyer;
    playerObj.index = index;
    state = copyState;
    return copyState;
  }

  moveRight(state: any, plyer: string): any {
    return this.checkBoard(state, plyer, state[plyer].index + 1);
  }

  moveLeft(state: any, plyer: string): any {
    return this.checkBoard(state, plyer, state[plyer].index - 1);
  }

  moveUp(state: any, plyer: string): any {
    return this.checkBoard(state, plyer, state[plyer].index - this.colum);
  }

  moveDown(state: any, plyer: string): any {
    return this.checkBoard(state, plyer, state[plyer].index + this.colum);
  }

  cancelateByLevel(level: number, startNumber: number): number {
    if (this.max / 2 <= startNumber + level) return this.max / 2 - 1;
    else return startNumber + level;
  }
  // eslint-disable-next-line prettier/prettier
  checkForNearBlocks(firstIndex: number, secondIndex: number, gridArray: any[]) : boolean {
    let isAllowed = true;
    [firstIndex, secondIndex].forEach((index) => {
      if (
        gridArray[index + 1] &&
        gridArray[index + 1].value === 'block' &&
        index + 1 !== firstIndex &&
        index + 1 !== secondIndex
      )
        isAllowed = false;
      if (
        gridArray[index - 1] &&
        gridArray[index - 1].value === 'block' &&
        index - 1 !== firstIndex &&
        index - 1 !== secondIndex
      )
        isAllowed = false;
      if (
        gridArray[index - this.colum] &&
        gridArray[index - this.colum].value === 'block' &&
        index - this.colum !== firstIndex &&
        index - this.colum !== secondIndex
      )
        isAllowed = false;
      if (
        gridArray[index + this.colum] &&
        gridArray[index + this.colum].value === 'block' &&
        index + this.colum !== firstIndex &&
        index + this.colum !== secondIndex
      )
        isAllowed = false;
    });
    return isAllowed;
  }
  // eslint-disable-next-line prettier/prettier
  generateBlockersVerticalOrHorizontal(isFreeSpace: boolean, gridArray: any, rowOrCol: number) {
    const copyArray = [...gridArray];
    if (isFreeSpace) return copyArray;
    const randomIndex = Math.floor(
      Math.random() * Math.floor(this.max - 2) + 1,
    );
    let nextIndex = 0;
    for (let i = 0; i < 2; i++) {
      nextIndex = i === 0 ? randomIndex + rowOrCol : randomIndex - rowOrCol;
      if (
        copyArray[randomIndex] &&
        copyArray[randomIndex].value === '' &&
        copyArray[nextIndex] &&
        copyArray[nextIndex].value === '' &&
        nextIndex < this.max &&
        this.checkForNearBlocks(randomIndex, nextIndex, copyArray) &&
        nextIndex > 0
      ) {
        copyArray[randomIndex].value = 'block';
        copyArray[nextIndex].value = 'block';
        isFreeSpace = true;
      }
    }
    return this.generateBlockersVerticalOrHorizontal(
      isFreeSpace,
      copyArray,
      rowOrCol,
    );
  }

  generateBlockers(numberOfBlockers: number, gridArray: any) {
    let copyArray = [...gridArray];
    if (numberOfBlockers <= 0) return copyArray;
    const rowOrCol = [1, this.colum][Math.floor(Math.random() * 2)];
    copyArray = this.generateBlockersVerticalOrHorizontal(
      false,
      copyArray,
      rowOrCol,
    );
    numberOfBlockers -= 2;
    return this.generateBlockers(numberOfBlockers, copyArray);
  }

  generateCoins(numberOfCoins: number, gridArray: any) {
    const copyArray = [...gridArray];
    if (numberOfCoins === 0) return copyArray;
    const randomIndex = Math.floor(
      Math.random() * Math.floor(this.max - 2) + 1,
    );
    if (copyArray[randomIndex].value === '') {
      copyArray[randomIndex].value = 'coin';
      numberOfCoins--;
    }
    return this.generateCoins(numberOfCoins, copyArray);
  }

  generateGameGridMatrix(gridArray: any) {
    let index = 0;
    for (let i = 0; i < this.row; i++) {
      for (let j = 0; j < this.colum; j++) {
        gridArray[index] = { i, j, value: '' };
        index++;
      }
    }
    return gridArray;
  }
  // eslint-disable-next-line prettier/prettier
  generateGameGridArray(gameState: any, numberOfBlockers: number, numberOfCoins: number,): any {
    let gridArray = [...Array(this.max)];
    gridArray = this.generateGameGridMatrix(gridArray);
    gridArray[gameState.player1.index]['value'] = 'player1';
    gridArray[gameState.player2.index]['value'] = 'player2';
    gridArray = this.generateCoins(numberOfCoins, gridArray);
    gridArray = this.generateBlockers(numberOfBlockers, gridArray);
    return gridArray;
  }

  initializeState(level: number): any {
    const numberOfBlockers = Math.floor(
      this.cancelateByLevel(level - 1, 3) / 3,
    );
    const numberOfCoins = this.cancelateByLevel(level - 1, 7);
    const gameState = {
      player1: {
        score: 0,
        index: 0,
      },
      player2: {
        score: 0,
        index: this.max - 1,
      },
      numberOfCoins,
    };
    gameState['gridArray'] = this.generateGameGridArray(
      gameState,
      numberOfBlockers,
      numberOfCoins,
    );
    return gameState;
  }
}
