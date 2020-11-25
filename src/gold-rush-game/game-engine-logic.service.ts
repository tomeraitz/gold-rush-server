import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PF = require('pathfinding');
@Injectable()
export class GameEngineLogicService {
  private subRow = 8;
  private subColum = 8;

  checkMatrix(grid: any, indexObj) {
    const answer = {
      isCoin: false,
      isContinue: true,
    };
    const itemObj = grid[indexObj.nextIndex];
    if (!itemObj) answer.isContinue = false;
    else if (
      itemObj.value === 'block' ||
      itemObj.value === 'player1' ||
      indexObj.nextMatrixRowColum < 0 ||
      indexObj.nextMatrixRowColum === this.subColum
    )
      answer.isContinue = false;
    else if (itemObj.value === 'coin') answer.isCoin = true;
    return answer;
  }

  aStarMatrix(client: any) {
    const copyState = JSON.parse(JSON.stringify(client.state));
    let index = 0;
    const gridPath = new PF.Grid(this.subRow, this.subColum);
    for (let i = 0; i < this.subRow; i++) {
      for (let j = 0; j < this.subColum; j++) {
        if (copyState.gridArray[index].value === 'block')
          gridPath.setWalkableAt(i, j, false);
        index++;
      }
    }
    client.gridPath = gridPath;
  }

  findCoins(
    grid: any,
    directionObj: any,
    playerIndex: number,
    coins: any,
    gridPath: any,
  ) {
    if (coins.length === 0)
      coins = [...grid].filter((item) => item.value === 'coin');
    const player = grid[playerIndex];
    const closestCoin = { index: -1, disValue: 1000 };
    coins.forEach((coin, index) => {
      const disI = coin.i > player.i ? coin.i - player.i : player.i - coin.i;
      const disJ = coin.j > player.j ? coin.j - player.j : player.j - coin.j;
      if (disI + disJ < closestCoin.disValue) {
        closestCoin.index = index;
        closestCoin.disValue = disI + disJ;
      }
    });
    const coinTarget = coins.splice(closestCoin.index, 1)[0];
    // console.log('coinTarget : ', coinTarget);
    if (!coinTarget)
      return ['moveUp', 'moveDown', 'moveLeft', 'moveRight'][
        Math.floor(Math.random() * 4)
      ];
    const gridBackup = gridPath.clone();
    const finder = new PF.AStarFinder({
      allowDiagonal: false,
    });
    const pathOriginal = finder.findPath(
      player.i,
      player.j,
      coinTarget.i,
      coinTarget.j,
      gridBackup,
    );
    // this.logger.log(pathOriginal);
    if (pathOriginal.length === 0)
      return this.findCoins(grid, directionObj, playerIndex, coins, gridPath);
    const path =
      pathOriginal[0][0] === player.i && pathOriginal[0][1] === player.j
        ? pathOriginal[1]
        : pathOriginal[0];
    // eslint-disable-next-line prettier/prettier
    if (path[1] === player.j && path[0] < player.i && directionObj.up.isContinue) return 'moveUp';
    // eslint-disable-next-line prettier/prettier
    if (path[1] === player.j && path[0] > player.i && directionObj.down.isContinue)  return 'moveDown';
    // eslint-disable-next-line prettier/prettier
    if (path[0] === player.i && path[1] < player.j && directionObj.left.isContinue) return 'moveLeft';
    // eslint-disable-next-line prettier/prettier
    if (path[0] === player.i && path[1] > player.j && directionObj.right.isContinue) return 'moveRight';
    return ['moveUp', 'moveDown', 'moveLeft', 'moveRight'][
      Math.floor(Math.random() * 4)
    ];
  }

  findPath(client: any) {
    const copyState = JSON.parse(JSON.stringify(client.state));
    const grid = copyState.gridArray;
    const playerIndex = copyState.player2.index;
    const up = this.checkMatrix(grid, {
      nextIndex: playerIndex - this.subColum,
      nextMatrixRowColum: grid[playerIndex].i - 1,
    });
    const down = this.checkMatrix(grid, {
      nextIndex: playerIndex + this.subColum,
      nextMatrixRowColum: grid[playerIndex].i + 1,
    });
    const right = this.checkMatrix(grid, {
      nextIndex: playerIndex + 1,
      nextMatrixRowColum: grid[playerIndex].j + 1,
    });
    const left = this.checkMatrix(grid, {
      nextIndex: playerIndex - 1,
      nextMatrixRowColum: grid[playerIndex].j - 1,
    });
    let moveMent = '';
    if (up.isCoin) moveMent = 'moveUp';
    else if (down.isCoin) moveMent = 'moveDown';
    else if (right.isCoin) moveMent = 'moveRight';
    else if (left.isCoin) moveMent = 'moveLeft';
    else
      moveMent = this.findCoins(
        grid,
        { up, down, right, left },
        playerIndex,
        [],
        client.gridPath,
      );
    return moveMent;
  }
}
