// prettire-ignore // "0" | "1" | ... | "99" | "100"
type RenownLevel = `${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}${"" | "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"}` | "100"

// prettier-ignore
export type RenownRank = "wood" | "stone" | "copper" | "ruby" | "iron" | "sapphire" | "silver" | "emerald" | "gold" | "diamond" | "mistril"

type RenownLevels = { [level in RenownLevel]: { rank: RenownRank; individual: number; cumulative: number } }

export const renownLevels: RenownLevels = {
  "1": { rank: "wood", individual: 20, cumulative: 20 },
  "2": { rank: "wood", individual: 22, cumulative: 42 },
  "3": { rank: "wood", individual: 25, cumulative: 67 },
  "4": { rank: "wood", individual: 27, cumulative: 94 },
  "5": { rank: "wood", individual: 30, cumulative: 124 },
  "6": { rank: "wood", individual: 33, cumulative: 157 },
  "7": { rank: "wood", individual: 35, cumulative: 192 },
  "8": { rank: "wood", individual: 38, cumulative: 230 },
  "9": { rank: "wood", individual: 41, cumulative: 271 },
  "10": { rank: "stone", individual: 44, cumulative: 315 },
  "11": { rank: "stone", individual: 47, cumulative: 362 },
  "12": { rank: "stone", individual: 50, cumulative: 412 },
  "13": { rank: "stone", individual: 53, cumulative: 465 },
  "14": { rank: "stone", individual: 56, cumulative: 521 },
  "15": { rank: "stone", individual: 59, cumulative: 580 },
  "16": { rank: "stone", individual: 62, cumulative: 642 },
  "17": { rank: "stone", individual: 65, cumulative: 707 },
  "18": { rank: "stone", individual: 68, cumulative: 775 },
  "19": { rank: "stone", individual: 72, cumulative: 847 },
  "20": { rank: "copper", individual: 75, cumulative: 922 },
  "21": { rank: "copper", individual: 78, cumulative: 1000 },
  "22": { rank: "copper", individual: 81, cumulative: 1081 },
  "23": { rank: "copper", individual: 84, cumulative: 1165 },
  "24": { rank: "copper", individual: 87, cumulative: 1252 },
  "25": { rank: "copper", individual: 91, cumulative: 1343 },
  "26": { rank: "copper", individual: 94, cumulative: 1437 },
  "27": { rank: "copper", individual: 97, cumulative: 1534 },
  "28": { rank: "copper", individual: 100, cumulative: 1634 },
  "29": { rank: "copper", individual: 104, cumulative: 1738 },
  "30": { rank: "ruby", individual: 107, cumulative: 1845 },
  "31": { rank: "ruby", individual: 110, cumulative: 1955 },
  "32": { rank: "ruby", individual: 114, cumulative: 2069 },
  "33": { rank: "ruby", individual: 117, cumulative: 2168 },
  "34": { rank: "ruby", individual: 120, cumulative: 2306 },
  "35": { rank: "ruby", individual: 124, cumulative: 2430 },
  "36": { rank: "ruby", individual: 127, cumulative: 2557 },
  "37": { rank: "ruby", individual: 130, cumulative: 2687 },
  "38": { rank: "ruby", individual: 134, cumulative: 2821 },
  "39": { rank: "ruby", individual: 137, cumulative: 2958 },
  "40": { rank: "iron", individual: 141, cumulative: 3099 },
  "41": { rank: "iron", individual: 144, cumulative: 3243 },
  "42": { rank: "iron", individual: 147, cumulative: 3390 },
  "43": { rank: "iron", individual: 151, cumulative: 3541 },
  "44": { rank: "iron", individual: 154, cumulative: 3695 },
  "45": { rank: "iron", individual: 158, cumulative: 3853 },
  "46": { rank: "iron", individual: 161, cumulative: 4014 },
  "47": { rank: "iron", individual: 165, cumulative: 4179 },
  "48": { rank: "iron", individual: 168, cumulative: 4347 },
  "49": { rank: "iron", individual: 172, cumulative: 4519 },
  "50": { rank: "sapphire", individual: 175, cumulative: 4694 },
  "51": { rank: "sapphire", individual: 178, cumulative: 4872 },
  "52": { rank: "sapphire", individual: 182, cumulative: 5054 },
  "53": { rank: "sapphire", individual: 185, cumulative: 5239 },
  "54": { rank: "sapphire", individual: 189, cumulative: 5428 },
  "55": { rank: "sapphire", individual: 192, cumulative: 5620 },
  "56": { rank: "sapphire", individual: 196, cumulative: 5816 },
  "57": { rank: "sapphire", individual: 200, cumulative: 6016 },
  "58": { rank: "sapphire", individual: 203, cumulative: 6219 },
  "59": { rank: "sapphire", individual: 207, cumulative: 6426 },
  "60": { rank: "silver", individual: 210, cumulative: 6636 },
  "61": { rank: "silver", individual: 214, cumulative: 6850 },
  "62": { rank: "silver", individual: 217, cumulative: 7067 },
  "63": { rank: "silver", individual: 221, cumulative: 7288 },
  "64": { rank: "silver", individual: 224, cumulative: 7612 },
  "65": { rank: "silver", individual: 228, cumulative: 7740 },
  "66": { rank: "silver", individual: 232, cumulative: 7972 },
  "67": { rank: "silver", individual: 235, cumulative: 8207 },
  "68": { rank: "silver", individual: 239, cumulative: 8446 },
  "69": { rank: "silver", individual: 242, cumulative: 8688 },
  "70": { rank: "emerald", individual: 246, cumulative: 8934 },
  "71": { rank: "emerald", individual: 249, cumulative: 9183 },
  "72": { rank: "emerald", individual: 253, cumulative: 9436 },
  "73": { rank: "emerald", individual: 257, cumulative: 9693 },
  "74": { rank: "emerald", individual: 260, cumulative: 9953 },
  "75": { rank: "emerald", individual: 264, cumulative: 10217 },
  "76": { rank: "emerald", individual: 268, cumulative: 10485 },
  "77": { rank: "emerald", individual: 271, cumulative: 10756 },
  "78": { rank: "emerald", individual: 275, cumulative: 11031 },
  "79": { rank: "emerald", individual: 278, cumulative: 11309 },
  "80": { rank: "gold", individual: 282, cumulative: 11591 },
  "81": { rank: "gold", individual: 286, cumulative: 11877 },
  "82": { rank: "gold", individual: 289, cumulative: 12166 },
  "83": { rank: "gold", individual: 293, cumulative: 12459 },
  "84": { rank: "gold", individual: 297, cumulative: 12756 },
  "85": { rank: "gold", individual: 300, cumulative: 13056 },
  "86": { rank: "gold", individual: 304, cumulative: 13360 },
  "87": { rank: "gold", individual: 308, cumulative: 13668 },
  "88": { rank: "gold", individual: 311, cumulative: 13979 },
  "89": { rank: "gold", individual: 315, cumulative: 14294 },
  "90": { rank: "diamond", individual: 319, cumulative: 14613 },
  "91": { rank: "diamond", individual: 323, cumulative: 14936 },
  "92": { rank: "diamond", individual: 326, cumulative: 15262 },
  "93": { rank: "diamond", individual: 330, cumulative: 15592 },
  "94": { rank: "diamond", individual: 334, cumulative: 15926 },
  "95": { rank: "diamond", individual: 337, cumulative: 16263 },
  "96": { rank: "diamond", individual: 341, cumulative: 16604 },
  "97": { rank: "diamond", individual: 345, cumulative: 16949 },
  "98": { rank: "diamond", individual: 349, cumulative: 17298 },
  "99": { rank: "diamond", individual: 352, cumulative: 17650 },
  "100": { rank: "mistril", individual: 356, cumulative: 18006 }
}

// TODO: There seems to be some inconsistencies with the in-game values !?
export function translateRenown(renown: number) {
  let isExact = false
  const level = Object.keys(renownLevels).find((level) => {
    if (renownLevels[level as RenownLevel].cumulative === renown) {
      isExact = true
    }

    return renownLevels[level as RenownLevel].cumulative >= renown
  })

  if (!level) {
    const isAboveMistril = renown > renownLevels["100"].cumulative
    if (isAboveMistril) return { level: 100, ...renownLevels["100"] }

    return null
  }

  let currentLevel = +level

  // Except when the cumulative is the same as the renown value, the `level` points to the next level, that's why we do currentLevel - 1
  if (!isExact) currentLevel -= 1

  return { level: currentLevel, ...renownLevels[currentLevel.toString() as RenownLevel] }
}
