export function removeElementFromArray(arr, ind) {
  if (ind == undefined || ind === -1) return arr;
  const arrBefore = arr.slice(0, ind);
  const arrAfter = arr.slice(ind + 1);
  return arrBefore.concat(arrAfter);
}

export function changeElementPosition(proxArr, source, dest) {
  let arr = Array.from(proxArr);
  const [movedEl] = arr.splice(source, 1);
  arr.splice(dest, 0, movedEl);
  return arr;
}
