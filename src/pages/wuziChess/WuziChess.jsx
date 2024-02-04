import { useState } from "react";

export function WuziChess(props) {
  const [grids, setGrids] = useState(new Array(100).fill(null));
  const [side, setSide] = useState(0);

  const checkWin = (pos) => {
    // ignore placed pieces
    if (grids[pos] != null) return;

    const newGrids = [...grids];
    newGrids[pos] = side;

    // check horizontal
    let rowCount = 1;
    const rowStart = Math.floor(pos / 10) * 10;
    const rowEnd = Math.ceil(pos / 10) * 10 - 1;
    for (let i = 1; pos - i >= rowStart && newGrids[pos - i] == side; i++) {
      rowCount += 1;
    }
    for (let i = 1; pos + i <= rowEnd && newGrids[pos + i] == side; i++) {
      rowCount += 1;
    }

    // check vertical
    let colCount = 1;
    for (let i = 10; pos - i >= 0 && newGrids[pos - i] == side; i += 10) {
      colCount += 1;
    }
    for (let i = 10; pos + i < 100 && newGrids[pos + i] == side; i += 10) {
      colCount += 1;
    }

    // check diagonal
    let diagCountOne = 1;
    for (
      let i = 11;
      pos - i >= 0 && (pos - i) % 10 < pos % 10 && newGrids[pos - i] == side;
      i += 11
    ) {
      diagCountOne += 1;
    }
    for (
      let i = 11;
      pos + i < 100 && (pos + i) % 10 > pos % 10 && newGrids[pos + i] == side;
      i += 11
    ) {
      diagCountOne += 1;
    }

    let diagCountTwo = 1;
    for (
      let i = 9;
      pos - i >= 0 && (pos - i) % 10 > pos % 10 && newGrids[pos - i] == side;
      i += 9
    ) {
      diagCountTwo += 1;
    }
    for (
      let i = 9;
      pos + i < 100 && (pos + i) % 10 < pos % 10 && newGrids[pos + i] == side;
      i += 9
    ) {
      diagCountTwo += 1;
    }

    setGrids(newGrids);
    setSide((side + 1) % 2);

    if (
      rowCount >= 5 ||
      colCount >= 5 ||
      diagCountOne >= 5 ||
      diagCountTwo >= 5
    ) {
      console.log(side + " win!");
    }
  };

  const resetGame = () => {
    setGrids(new Array(100).fill(null));
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center">
      <button onClick={resetGame}>reset</button>
      <div className="h-3/5 p-2 grid grid-rows-10 grid-cols-10 aspect-square">
        {[
          grids.map((_, i) => {
            console.log(i);

            return (
              <div
                key={i}
                className="bg-white flex items-center justify-center"
                onClick={() => checkWin(i)}
              >
                <svg className="w-full h-full stroke-2 stroke-black">
                  {i >= 10 && i < 90 && (
                    <line x1="50%" x2="50%" y1="-50%" y2="150%" stroke="grey" />
                  )}
                  {i < 10 && (
                    <line x1="50%" x2="50%" y1="50%" y2="150%" stroke="grey" />
                  )}
                  {i >= 90 && (
                    <line x1="50%" x2="50%" y1="-50%" y2="50%" stroke="grey" />
                  )}

                  {i % 10 == 0 && (
                    <line x1="50%" x2="150%" y1="50%" y2="50%" stroke="grey" />
                  )}
                  {i % 10 > 0 && i % 10 < 9 && (
                    <line x1="-50%" x2="150%" y1="50%" y2="50%" stroke="grey" />
                  )}
                  {i % 10 == 9 && (
                    <line x1="-50%" x2="50%" y1="50%" y2="50%" stroke="grey" />
                  )}

                  {grids[i] == 0 && <circle r="40%" cx="50%" cy="50%" />}
                  {grids[i] == 1 && (
                    <circle r="40%" cx="50%" cy="50%" stroke="grey" fill="white" />
                  )}
                </svg>
              </div>
            );
          }),
        ]}
      </div>
    </div>
  );
}
