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
  // sort first
  items = sortItems(rows, columns, items);
  console.dir(`items after sorted`, JSON.stringify(items));
  // render
  let currentColumn = 1;
  let currentRow = 1;
  items.forEach(item => {
    // if (columnStart > columns) {
    //   columnStart = 1;
    //   rowStart++;
    // }
    // if (item.style) {
    //   let {
    //     gridRowStart,
    //     gridRowEnd,
    //     gridColumnStart,
    //     gridColumnEnd,
    //   } = item.style;
    //   let colSpan = Math.max(getSpan(gridColumnStart), getSpan(gridColumnEnd))
    //   if (colSpan > 1 && columnStart + colSpan > columns) {
    //     columnStart = 1;
    //     rowStart++;
    //   }

    //   // row
    //   if (typeof gridRowStart === "string" && gridRowStart.startsWith("span")) {
    //     let { currentStart, currentEnd } = startSpan({
    //       gridStart: gridRowStart,
    //       gridEnd: gridRowEnd,
    //       currentStart: rowStart,
    //       currentEnd: rowEnd,
    //       max: rows
    //     });
    //     rowStart = currentStart;
    //     rowEnd = currentEnd;
    //   } else if (typeof gridRowEnd === "string" && gridRowEnd.startsWith("span")) {
    //     let { currentStart, currentEnd } = endSpan({
    //       gridStart: gridRowStart,
    //       gridEnd: gridRowEnd,
    //       currentStart: rowStart,
    //       currentEnd: rowEnd,
    //       max: rows
    //     });
    //     rowStart = currentStart;
    //     rowEnd = currentEnd;
    //   } else {
    //     rowStart = gridRowStart ? gridRowStart : rowStart;
    //     rowEnd = gridRowEnd ? gridRowEnd: rowEnd;
    //   }
    //   // console.log(`end row calculate will update row from ${rowStart} to ${rowEnd}`);
    //   // column
    //   if (typeof gridColumnStart === "string" && gridColumnStart.startsWith("span")) {
    //     let span = Number(gridColumnStart.replace(/\D/g, ""));
    //     if (columnStart + span - 1 > columns) {
    //       columnStart = 1;
    //       rowStart++;
    //     }
    //     let { currentStart, currentEnd } = startSpan({
    //       gridStart: gridColumnStart,
    //       gridEnd: gridColumnEnd,
    //       currentStart: columnStart,
    //       currentEnd: columnEnd,
    //       max: rows
    //     });
    //     columnStart = currentStart;
    //     columnEnd = currentEnd;
    //   } else if (typeof gridColumnEnd === "string" && gridColumnEnd.startsWith("span")) {
    //     let { currentStart, currentEnd } = endSpan({
    //       gridStart: gridColumnStart,
    //       gridEnd: gridColumnEnd,
    //       currentStart: columnStart,
    //       currentEnd: columnEnd,
    //       max: rows
    //     });
    //     columnStart = currentStart;
    //     columnEnd = currentEnd;
    //   } else {
    //     columnStart = gridColumnStart ? gridColumnStart : columnStart;
    //     columnEnd = gridColumnEnd ? gridColumnEnd: columnEnd;
    //   }
    //   // console.log(`end column calculate will update column from ${columnStart} to ${columnEnd}`);
    //   console.info(`will update ${item.id} from (${rowStart}, ${columnStart}) to (${rowEnd}, ${columnEnd})`, result);
    //   // while(rowStart <= rowEnd) {
    //     while(columnStart <= columnEnd) {
    //       result[rowStart - 1][columnStart - 1] = item.id;
    //       columnStart++;
    //     }
    //     // if (!isNaN(gridColumnStart)) {
    //     //   columnStart = gridColumnStart;
    //     // }
    //   // }
    //   console.info(`update doen ${item.id} from (${rowStart}, ${columnStart}) to (${rowEnd}, ${columnEnd})`, result);

    // } else {
    //   console.info(`will update ${item.id} from (${rowStart}, ${columnStart}) to (${rowEnd}, ${columnEnd})`, result);
    //   result[rowStart - 1][columnStart - 1] = item.id;
    //   columnStart++;
    // }
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
    } = sizing;
    while(rowStart <= rowEnd) {
      while(columnStart <= columnEnd) {
        if (item.gridColumnStart === columnStart) {
          result[rowStart - 1][columnStart - 1] = item.id;
        }
        columnStart++;
      }
      rowStart++
    }

    currentRow = rowEnd;
    currentColumn = columnEnd;
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

function sortItems(rows, columns, items) {
  let currentRow = 1;
  let currentColumn = 1;

  // autoplacement
  items = items.map((item, index) => {
    let expectColumn = currentColumn;
    let columnSpan = 1;

    let expectRow = currentRow;
    let rowSpan = 1;
    let {
      gridRowStart,
      gridRowEnd,
      gridColumnStart,
      gridColumnEnd,
    } = item.style || {};
    if (item.style) {

      expectColumn = !isNaN(gridColumnStart) ? gridColumnStart : currentColumn % columns;
      columnSpan = Math.max(getSpan(gridColumnStart), getSpan(gridColumnEnd));

      expectRow = !isNaN(gridRowStart) ? gridRowStart : currentRow;
      rowSpan = Math.max(getSpan(gridRowStart), getSpan(gridRowEnd));
    }
    console.log(`indexing, current row is`, expectRow, `current column is `, expectColumn);
    // next
    currentColumn = expectColumn + columnSpan;
    if (currentColumn > columns) {
      currentColumn = 1;
      currentRow = expectRow + rowSpan;
    } else if (rowSpan > 1) {
      currentRow = expectRow + rowSpan;
    } else {
      currentRow = expectRow;
    }
    console.log(`indexing, next row is `, currentRow, `next column is `, currentColumn);
    return {
      ...item,
      expectColumn,
      expectRow,
      rowSpan,
      columnSpan,
      fixedRow: !isNaN(gridRowStart) || !isNaN(gridRowEnd),
      fixedColumn: !isNaN(gridColumnStart) || !isNaN(gridColumnStart)
    }
  });
  console.log(`indexing, items after autoplacement`, JSON.stringify(items, (key, value) => typeof value === "object" && !Array.isArray(value) ? value.id : value));
  // reflow
  let currentIndex = 0;
  let currentPlacementColumn = 1;
  let newItems = [];
  currentRow = 1;
  currentColumn = 1;

  while (currentIndex < items.length) {
    let item = items[currentIndex];

    let targetItem = item;
    if (currentRow < item.expectRow && item.fixedRow) { // has empty cell row
      let emptyCells = (item.expectRow - currentRow) * columns - currentColumn + 1;

      console.info(`re-sorting, has empty cells`, emptyCells, ` before `, currentIndex);
      while(emptyCells > 0 && currentIndex < items.length) { // fill full
        currentIndex++;
        item = items[currentIndex];
        if (!item.fixedRow && item.columnSpan < emptyCells) {
          if (item.rowSpan > 1 && (targetItem.expectColumn || 1 + targetItem.columnSpan - 1) > columns) {

            emptyCells = 0;
            console.info(`re-sorting, not enough space put item ignore empty cells, `, emptyCells);
          } else {
            item.gridColumnStart = targetItem.expectColumn + targetItem.columnSpan;
            item.gridRowStart = currentRow;
            let willFillCells = item.gridColumnStart + item.columnSpan;
            newItems.push(item);
            emptyCells -= willFillCells;
            currentColumn = item.gridColumnStart + item.columnSpan - 1;
            currentRow = item.gridRowStart + item.rowSpan - 1;
            console.info(`re-sorting, fill item`, item, ` at`, currentIndex);
          }
        } else {
          emptyCells = 0;
        }
      }
    } else {
      if (currentColumn > columns) {
        currentColumn = 1;
        currentRow++;
      }
      if (targetItem.gridColumnStart) {
        currentIndex++;
        continue;
      }
      targetItem.gridColumnStart = currentColumn;
      targetItem.gridRowStart = currentRow;
      // for next
      currentColumn = targetItem.gridColumnStart + targetItem.columnSpan - 1;
      currentRow = targetItem.gridRowStart + targetItem.rowSpan - 1;
      currentIndex++;
    }

    newItems.push(targetItem);

  }
  // for (let row = 1; row <= rows; row++) {
  //   for (let column = 1; column <= columns; column++) {
      
  //   }
  // }

  // console.log(`items after reflow`, newItems);
  // // sort
  // let sortedItems = items.sort((a, b) => {
  //   let { expectColumn, expectRow } = a;
  //   if (a.style) {
  //     if (!isNaN(a.style.gridColumnStart)) {
  //       return expectColumn < a.style.gridColumnStart ? -1 : 1;
  //     } else if (!isNaN(a.style.gridRowStart)) {
  //       return expectRow < a.style.gridRowStart ? -1 : 1;
  //     }
  //   }
  //   return 1;
  // });
  return newItems;
}


function startSpan({
  gridStart,
  gridEnd,
  currentStart,
  currentEnd,
  max
}) {
  
  if (typeof gridStart === "string" && gridStart.startsWith("span")) {
    let startSpan = Number(gridStart.replace(/\D/g, ""))
    if (isNaN(gridEnd)) { // end with auto
      gridEnd = currentStart + startSpan - 1;
    }

    if (gridEnd > max) { // more than max
      currentEnd = max;
      currentStart = currentEnd - startSpan + 1;
    } else {
      currentEnd = gridEnd;
    }
    // console.log(`in start span(${startSpan}) will update ${currentStart}, ${currentEnd}`);
  }
  return {
    currentStart,
    currentEnd
  }
}

function endSpan({
  gridStart,
  gridEnd,
  currentStart,
  currentEnd,
  max
}) {
  if (typeof gridEnd === "string" && gridEnd.startsWith("span")) {
    let endSpan = Number(gridEnd.replace(/\D/g, ""));
    if (!isNaN(gridStart)) { // start with number
      gridEnd = gridStart + endSpan;
      currentStart = gridStart;
    } else {
      gridEnd = currentStart + endSpan - 1;
    }
    if (gridEnd > max) { // more than max
      currentEnd = max;
      currentStart = currentEnd - endSpan + 1;
    } else {
      currentEnd = gridEnd;
    }
  }
  return {
    currentStart,
    currentEnd
  }
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
    columnEnd = columnStart + columnSpan;
  }
  if (columnStart > columns) {
    console.warn(`sizing, column span start from center cant arrange it`);
    return ;
  }
  if (rowEnd > rows) {
    console.warn(`sizing, during error row over out`, rowEnd, " > ", rows);
    return ;
  }
  return {
    rowStart,
    columnStart,
    rowEnd,
    columnEnd,
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