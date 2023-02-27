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
  let prevRowPoint;
  items.forEach((item, index) => {
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
    // if (prevRowPoint && items[index].isFixedRow && !items[index].isFixedColumn) {
    //     // explicitly set row position but not set column position to be placed before any other similarly positioned item in that specific row
    //     currentColumn = prevRowPoint.columnStart;
    //     currentRow = prevPoint.rowStart;
    //     console.log(`\u001b[1;31m auto placement start, current is fixed row but not fixed column update point to (${currentRow}, ${currentColumn})`);
    //   }
    let nextPoint = putItem(JSON.parse(JSON.stringify(result)), item, { currentColumn, currentRow }, sizing)
    // if (!isFixedColumn || (isFixedColumn && currentColumn === columnStart)) {
    //   // move point
    //   currentColumn = nextPoint.pointColumnStart;
    // }
    // if (!isFixedRow || (isFixedRow && currentRow === rowStart)) {
    //   // move point
    //   currentRow = nextPoint.pointRowStart;
    // }
    result = nextPoint.result;
    if (!isFixedColumn && !isFixedRow) {
      currentColumn = nextPoint.pointColumnStart;
      currentRow = nextPoint.pointRowStart;
      console.info(`\u001b[1;31m auto placement end, update point to (${currentRow}, ${currentColumn}) by fixed both`);
    } else if (!isFixedRow) {
      currentColumn = nextPoint.pointColumnStart;
      console.info(`\u001b[1;31m auto placement end, update point to (${currentRow}, ${currentColumn}) by not fixed row`);
    } else if (isFixedRow) {
      prevRowPoint = {
        rowStart: nextPoint.pointRowStart,
        columnStart: nextPoint.pointColumnStart
      };
    }
    if (nextPoint.pointColumnStart === columns && !isFixedColumn) {
      currentRow = nextPoint.pointRowStart + 1;
      currentColumn = 1;
      console.info(`\u001b[1;31m auto placement end, update point to (${currentRow}, ${currentColumn}) by column end`);
    }
  });
  // fill 0
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      if (!result[row][column]) {
        result[row][column] = 0;
      } else {
        result[row][column] = result[row][column].id;
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
    rowEnd = gridRowEnd - 1;
    if (isNaN(gridRowStart)) {
      rowStart = gridRowEnd - rowSpan;
    } else {
      rowSpan = gridRowEnd - gridRowStart;
    }
  } else {
    rowEnd = rowStart + rowSpan - 1;
  }
  if (!isNaN(gridColumnEnd)) {
    columnEnd = gridColumnEnd - 1;
    if (isNaN(gridColumnStart)) {
      columnStart = gridColumnEnd - columnSpan;
    } else {
      columnSpan = gridColumnEnd - gridColumnStart
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

function putItem(result, item, currentPosition, sizing, inRecursion = 0, forceUpate) {
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
  let pointColumnEnd = pointColumnStart + columnSpan - 1;
  let pointRowEnd = pointRowStart + rowSpan - 1;
  console.group(item.id);
  console.info(`auto placement, try to put `, item, ` at ${pointRowStart}, ${pointColumnStart}, and sizing is`, sizing,
    `in while (${pointRowStart}, ${pointRowEnd}), (${pointColumnStart}, ${pointColumnEnd})`);
  let resultCopy = JSON.parse(JSON.stringify(result));
  let isFirst = true;
  if (pointColumnEnd > columns && !isFixedColumn && !isFixedRow) {
    let newPoint = {
      currentColumn: 1,
      currentRow: pointRowStart + 1
    };
    console.info(`\u001b[1;35m auto placement before while, not enough placement, move to right is first`, isFirst, item, newPoint, `recursion ${inRecursion}`);
    let resultDeep = putItem(!isFirst ? result : resultCopy, item, newPoint, sizing, inRecursion++);
    console.groupEnd();
    return resultDeep;
  } else {

    while(pointRowStart <= pointRowEnd) {
      while(pointColumnStart <= pointColumnEnd && pointColumnEnd <= columns) {
        if (result[pointRowStart - 1][pointColumnStart - 1] && !forceUpate) {
          // will move point
          if (!isFixedColumn) {
            if (!isFixedRow) {
              // auto
              let newPoint = {
                currentColumn: pointColumnStart === columns ? 1 : pointColumnStart + 1,
                currentRow: pointColumnStart === columns ? pointRowStart + 1 : pointRowStart,
              };
              if (!isFirst) {
                newPoint = {
                  ...currentPosition,
                  currentColumn: currentPosition.currentColumn + 1
                };
              }
              console.info(`\u001b[1;33m auto placement, not enough placement, move to right is first`,
                isFirst,
                item,
                newPoint,
                `recursion ${inRecursion}`,
                `in while (${pointRowStart}, ${pointRowEnd}), (${pointColumnStart}, ${pointColumnEnd})`
                );
              
              let resultDeep = putItem(!isFirst ? result : resultCopy, item, newPoint, sizing, inRecursion + 1);
              console.groupEnd();
              return resultDeep;
            } else {
              // fixed row
              let cantMoveRight = pointColumnStart + columnSpan - 1 === columns;
              let newPoint = {
                currentColumn: pointColumnStart === columns && !cantMoveRight ? 1 : pointColumnStart + 1,
                currentRow: pointRowStart,
              };
              if (!isFirst) {
                newPoint = {
                  ...currentPosition,
                  currentColumn: currentPosition.currentColumn + 1
                };;
              }
              console.info(`auto placement, not enough placement, move to right`, item, cantMoveRight, newPoint);
              let resultDeep = putItem(!isFirst ? result : resultCopy, item, newPoint, sizing, true);
              console.groupEnd();
              return resultDeep;
            }
          } else if (!isFixedRow) {
            let newPoint = {
              currentColumn: pointColumnStart,
              currentRow: ++pointRowStart,
            };
            if (!isFirst) {
              newPoint = {
                ...currentPosition,
                currentColumn: currentPosition.currentColumn + 1
              };;
            }
            console.info(`auto placement, not enough placement, move to down`, item, newPoint);
            let resultDeep = putItem(!isFirst ? result : resultCopy, item, newPoint, sizing, true);
            console.groupEnd();
            return resultDeep;
          }
        } else {
          isFirst = false;
          resultCopy[pointRowStart - 1][pointColumnStart - 1] = item;
          console.log(`putitem, `, item, `at ${pointRowStart}, ${pointColumnStart} of `, JSON.parse(JSON.stringify(resultCopy)), `recursion ${inRecursion}`);
          pointColumnStart++;
        }
      }
      pointRowStart++;
      pointColumnStart = pointColumnStart - columnSpan;
    }
  }
  console.info(`auto placement, end next point ${pointRowEnd}, ${pointColumnEnd}`);
  console.groupEnd();
  return {
    result: resultCopy,
    pointRowStart: currentRow,
    pointColumnStart: pointColumnEnd,
  }
}

console.log(layout(
  4,
  4,
  [
    {
      id: 1,
      style: {
        gridRowEnd: 'span 2',
      },
    },
    {
      id: 2,
      style: {
        gridRowStart: 2,
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
      style: {
        gridRowStart:  'span 2',
      },
    },
    {
      id: 6,
    },
    {
      id: 7,
      style: {
        gridColumnStart:  'span 3'
      }
    },
    {
      id: 8,
    },
  ]
));

