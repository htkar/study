// ref: https://bigfrontend.dev/problem/css-grid-auto-layoutcss-sparse

/**
* @typedef {Object} Item
* @property {number} id
* @property {number | string } [gridRowStart]
* @property {number | string } [gridRowEnd]
* @property {number | string } [gridColumnStart]
* @property {number | string } [gridColumnEnd]
*/

/**
* @param {number} rows
* @param {number} columns
* @param {Array<Item>} items
* @returns {number[][]}
*/
function layout(rows, columns, items) {
  // your code here
  let result = [];
  for(let row = 0; row < rows; row++) {
    result[row] = [];
  }
  // render
  let currentColumn = 1;
  let currentRow = 1;
  items.forEach(item => {
    let sizing = getSizing(item, {
      currentRow, currentColumn, rows, columns
    });
    if (!sizing) {
      console.log(`render, item error ignore it`, item.id);
      return;
    }

    let {
      rowStart,
      columnStart,
      rowEnd,
      columnEnd,
      columnSpan,
      rowSpan,
      isFixedRow,
      isFixedColumn,
    } = sizing;
    putItem(result, item, { currentColumn, currentRow }, sizing)
    if (!isFixedColumn || (isFixedColumn && currentColumn === columnStart)) {
      // move point
      currentColumn = columnEnd;
    }
    if (!isFixedRow || (isFixedRow && currentRow === rowStart)) {
      // move point
      currentRow = rowEnd;
    }
  });
  // fill 0
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      if (typeof result[row][column] === "undefined") {
        result[row][column] = 0;
      }
    }
  }
  return result;
}

function getSpan(spanString) {
  if (typeof spanString === "string" && spanString.startsWith("span")) {
    return Number(spanString.replace(/\D/g, ""));
  }
  return 1;
}

function getSizing(item, { currentRow, currentColumn, rows, columns }) {
  let rowStart;
  let columnStart;
  let rowEnd;
  let columnEnd;
  let {
    gridRowStart,
    gridRowEnd,
    gridColumnStart,
    gridColumnEnd,
  } = item.style || {};
  if (currentColumn === columns) {
    //wrap next row
    console.info(`sizing, wrap next row current row is,`, currentRow);
    currentColumn = 1;
    currentRow++;
  }
  let rowSpan = Math.max(getSpan(gridRowStart), getSpan(gridRowEnd));
  let columnSpan = Math.max(getSpan(gridColumnStart), getSpan(gridColumnEnd));
  rowStart = !isNaN(gridRowStart) ? gridRowStart : currentRow;
  columnStart = !isNaN(gridColumnStart) ? gridColumnStart : currentColumn;
  if (!isNaN(gridRowEnd)) {
    if (isNaN(gridRowStart)) {
      rowStart = gridRowEnd - rowSpan - 1;
    } else if (rowSpan > 1) {
      console.warn(`sizing, explict row start and end, ignore row span setting`);
    }
  } else {
    rowEnd = rowStart + rowSpan;
  }
  if (!isNaN(gridColumnEnd)) {
    if (isNaN(gridColumnStart)) {
      columnStart = gridColumnEnd - columnSpan - 1;
    } else if (columnSpan > 1) {
      console.warn(`sizing, explict column start and end, ignore column span setting`);
    }
  } else {
    columnEnd = columnStart + columnSpan - 1;
  }
  // if (columnStart > columns) {
  //   console.warn(`sizing, column span start from center cant arrange it`);
  //   return ;
  // }
  // if (rowEnd > rows) {
  //   console.warn(`sizing, during error row over out`, rowEnd, " > ", rows);
  //   return ;
  // }
  return {
    rowStart,
    columnStart,
    rowEnd,
    columnEnd,
    columnSpan,
    rowSpan,
    rows,
    columns,
    isFixedRow: !isNaN(gridRowStart) || !isNaN(gridRowEnd),
    isFixedColumn: !isNaN(gridColumnStart) || !isNaN(gridColumnEnd)
  }
}

function putItem(result, item, currentPosition, sizing, forceUpate) {
  let {
    currentColumn,
    currentRow
  } = currentPosition;
  let {
    rowStart,
    columnStart,
    rowEnd,
    columnEnd,
    columnSpan,
    rowSpan,
    rows,
    columns,
    isFixedRow,
    isFixedColumn,
  } = sizing;
  let pointColumnStart = currentColumn;
  let pointRowStart = currentRow;
  if (isFixedColumn) {
    pointColumnStart = columnStart;
  }
  if (isFixedRow) {
    pointRowStart = rowStart;
  }
  pointColumnEnd = pointColumnStart + columnSpan - 1;
  pointRowEnd = pointRowStart + rowSpan - 1;
  while(pointRowStart <= pointRowEnd) {
    while(pointColumnStart <= pointColumnEnd && pointColumnEnd <= columns) {
      if (result[rowStart - 1][columnStart - 1] && !forceUpate) {

        if (!isFixedColumn) {
          if (!isFixedRow) {
            console.info(`auto placement, not enough placement, move to right`, item);
            putItem(result, item, {
              currentColumn: pointColumnStart === columns ? 1 : ++pointColumnStart,
              currentRow: pointColumnStart === columns ? ++pointRowStart : pointRowStart,
            }, sizing);
            return; // break;
          } else {
            // fixed row
            let cantMoveRight = pointColumnStart + columnSpan - 1 === columns;
            console.info(`auto placement, not enough placement, move to right`, item, cantMoveRight);
            putItem(result, item, {
              currentColumn: pointColumnStart === columns && !cantMoveRight ? 1 : ++pointColumnStart,
              currentRow: pointRowStart,
            }, sizing, cantMoveRight);
            return; // break;
          }
        } else if (!isFixedRow) {
          console.info(`auto placement, not enough placement, move to down`, item);
          putItem(result, item, {
            currentColumn: pointColumnStart,
            currentRow: ++pointRowStart,
          }, sizing);
          return; //break;
        }
      } else {

        console.log(`putitem, `, item, `at ${pointRowStart - 1}, ${pointColumnStart - 1} of `, result);
        result[pointRowStart - 1][pointColumnStart - 1] = item;
        pointColumnStart++;
      }
    }
    pointRowStart++
  }
}

console.log(JSON.stringify(layout(
  3,
  3,
  [
    {
      id: 1,
      style: {
        gridRowStart: 2,
      },
    },
    {
      id: 2,
      style: {
        gridColumnStart: 'span 2',
        gridRowEnd: 'span 2',
      },
    },
    {
      id: 3,
    },
    {
      id: 4,
    },
    {
      id: 5,
    },
  ]
)))